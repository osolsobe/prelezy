import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createRouteSchema = z.object({
  wallId: z.string(),
  name: z.string().min(1).max(100),
  sector: z.string().optional(),
  color: z.string().min(1),
  grade: z.string().min(1),
  setDate: z.string(),
  description: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallId = searchParams.get("wallId");
  const sector = searchParams.get("sector");
  const gradeMin = searchParams.get("gradeMin");
  const gradeMax = searchParams.get("gradeMax");
  const sort = searchParams.get("sort") ?? "setDate";
  const archived = searchParams.get("archived") === "true";

  const routes = await prisma.route.findMany({
    where: {
      ...(wallId ? { wallId } : {}),
      archived,
      ...(sector ? { sector } : {}),
    },
    include: {
      _count: { select: { attempts: true } },
      attempts: { select: { success: true } },
    },
    orderBy:
      sort === "grade"
        ? { grade: "asc" }
        : sort === "name"
          ? { name: "asc" }
          : { setDate: "desc" },
  });

  const routesWithStats = routes.map((r) => ({
    ...r,
    successCount: r.attempts.filter((a) => a.success).length,
    attempts: undefined,
  }));

  return NextResponse.json(routesWithStats);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createRouteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { wallId, name, sector, color, grade, setDate, description, photoUrl } =
    parsed.data;

  const route = await prisma.route.create({
    data: {
      wallId,
      name,
      sector,
      color,
      grade,
      setDate: new Date(setDate),
      description,
      photoUrl: photoUrl || null,
    },
  });

  return NextResponse.json(route, { status: 201 });
}
