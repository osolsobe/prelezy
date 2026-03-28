import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateRouteSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  sector: z.string().optional(),
  color: z.string().optional(),
  grade: z.string().optional(),
  setDate: z.string().optional(),
  stripDate: z.string().optional().nullable(),
  description: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal("")).nullable(),
  archived: z.boolean().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const route = await prisma.route.findUnique({
    where: { id },
    include: {
      _count: { select: { attempts: true } },
      attempts: { select: { success: true, flash: true } },
      comments: {
        include: { user: { select: { displayName: true, id: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!route) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const successCount = route.attempts.filter((a) => a.success).length;
  const flashCount = route.attempts.filter((a) => a.flash).length;

  return NextResponse.json({ ...route, successCount, flashCount, attempts: undefined });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateRouteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const route = await prisma.route.update({
    where: { id },
    data: {
      ...data,
      setDate: data.setDate ? new Date(data.setDate) : undefined,
      stripDate: data.stripDate ? new Date(data.stripDate) : data.stripDate,
    },
  });

  return NextResponse.json(route);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.route.update({ where: { id }, data: { archived: true } });

  return NextResponse.json({ ok: true });
}
