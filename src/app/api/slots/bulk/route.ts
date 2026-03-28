import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const bulkSchema = z.object({
  codes: z.array(z.string()).min(1),
  action: z.enum(["delete", "unassign"]),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { codes, action } = parsed.data;

  const slots = await prisma.slot.findMany({
    where: { code: { in: codes } },
    select: { id: true, code: true },
  });
  const slotIds = slots.map((s) => s.id);

  if (action === "unassign") {
    await prisma.slotAssignment.updateMany({
      where: { slotId: { in: slotIds }, removedAt: null },
      data: { removedAt: new Date() },
    });
  } else if (action === "delete") {
    await prisma.slotAssignment.deleteMany({ where: { slotId: { in: slotIds } } });
    await prisma.slot.deleteMany({ where: { id: { in: slotIds } } });
  }

  return NextResponse.json({ ok: true, affected: slotIds.length });
}
