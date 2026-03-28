import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createAttemptSchema = z.object({
  routeId: z.string(),
  success: z.boolean(),
  flash: z.boolean().default(false),
  tryCount: z.number().int().min(1).default(1),
  note: z.string().max(1000).optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createAttemptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { routeId, success, flash, tryCount, note } = parsed.data;

  const route = await prisma.route.findUnique({ where: { id: routeId } });
  if (!route || route.archived) {
    return NextResponse.json({ error: "Route not found" }, { status: 404 });
  }

  const attempt = await prisma.attempt.create({
    data: {
      userId: session.user.id,
      routeId,
      success,
      flash: success && flash,
      tryCount,
      note,
    },
  });

  return NextResponse.json(attempt, { status: 201 });
}
