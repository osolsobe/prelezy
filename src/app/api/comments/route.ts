import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createCommentSchema = z.object({
  routeId: z.string(),
  text: z.string().min(1).max(500),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      userId: session.user.id,
      routeId: parsed.data.routeId,
      text: parsed.data.text,
    },
    include: { user: { select: { displayName: true, id: true } } },
  });

  return NextResponse.json(comment, { status: 201 });
}
