import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const slot = await prisma.slot.findUnique({
    where: { code },
    include: {
      assignments: {
        where: { removedAt: null },
        include: {
          route: {
            include: {
              _count: { select: { attempts: true } },
              attempts: { select: { success: true, flash: true } },
              comments: {
                include: { user: { select: { displayName: true, id: true } } },
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
        take: 1,
      },
    },
  });

  if (!slot) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const assignment = slot.assignments[0] ?? null;
  const route = assignment?.route ?? null;

  let routeWithStats = null;
  if (route) {
    const successCount = route.attempts.filter((a) => a.success).length;
    const flashCount = route.attempts.filter((a) => a.flash).length;
    routeWithStats = { ...route, successCount, flashCount, attempts: undefined };
  }

  return NextResponse.json({ slot: { ...slot, assignments: undefined }, route: routeWithStats });
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
  if (!slot) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.slotAssignment.deleteMany({ where: { slotId: slot.id } });
  await prisma.slot.delete({ where: { code } });

  return NextResponse.json({ ok: true });
}
