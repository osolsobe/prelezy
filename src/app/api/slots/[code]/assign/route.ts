import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const assignSchema = z.object({
  routeId: z.string(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code } = await params;
  const body = await request.json();
  const parsed = assignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const slot = await prisma.slot.findUnique({ where: { code } });
  if (!slot) return NextResponse.json({ error: "Slot not found" }, { status: 404 });

  // Uzavrie aktuálne aktívne priradenie
  await prisma.slotAssignment.updateMany({
    where: { slotId: slot.id, removedAt: null },
    data: { removedAt: new Date() },
  });

  // Vytvorí nové priradenie
  const assignment = await prisma.slotAssignment.create({
    data: {
      slotId: slot.id,
      routeId: parsed.data.routeId,
    },
    include: { route: true },
  });

  return NextResponse.json(assignment, { status: 201 });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code } = await params;
  const slot = await prisma.slot.findUnique({ where: { code } });
  if (!slot) return NextResponse.json({ error: "Slot not found" }, { status: 404 });

  await prisma.slotAssignment.updateMany({
    where: { slotId: slot.id, removedAt: null },
    data: { removedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
