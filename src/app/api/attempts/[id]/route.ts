import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  success: z.boolean().optional(),
  flash: z.boolean().optional(),
  tryCount: z.number().int().min(1).optional(),
  note: z.string().max(1000).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const attempt = await prisma.attempt.findUnique({ where: { id } });
  if (!attempt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (attempt.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.attempt.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const attempt = await prisma.attempt.findUnique({ where: { id } });
  if (!attempt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (
    attempt.userId !== session.user.id &&
    (session.user as { role?: string }).role !== "ADMIN"
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.attempt.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
