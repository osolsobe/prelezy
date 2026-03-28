import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
