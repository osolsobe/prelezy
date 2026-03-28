import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createSlotsSchema = z.object({
  wallId: z.string(),
  prefix: z.string().min(1).max(5),
  from: z.number().int().min(1),
  to: z.number().int().min(1),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallId = searchParams.get("wallId");

  const slots = await prisma.slot.findMany({
    where: wallId ? { wallId } : {},
    include: {
      assignments: {
        where: { removedAt: null },
        include: {
          route: {
            select: { id: true, name: true, grade: true, color: true, archived: true },
          },
        },
        take: 1,
      },
    },
    orderBy: { code: "asc" },
  });

  return NextResponse.json(slots);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createSlotsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { wallId, prefix, from, to } = parsed.data;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const created = [];
  for (let i = from; i <= to; i++) {
    const code = `${prefix}${i}`;
    const slot = await prisma.slot.upsert({
      where: { code },
      update: {},
      create: {
        wallId,
        code,
        label: `${prefix}${i}`,
        qrUrl: `${baseUrl}/slot/${code}`,
      },
    });
    created.push(slot);
  }

  return NextResponse.json(created, { status: 201 });
}
