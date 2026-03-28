import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const decoded = decodeURIComponent(rawId);
  const decoded2 = decodeURIComponent(decoded);

  const byRaw = await prisma.route.findUnique({ where: { id: rawId } }).catch(() => null);
  const byDecoded = await prisma.route.findUnique({ where: { id: decoded } }).catch(() => null);
  const byDecoded2 = await prisma.route.findUnique({ where: { id: decoded2 } }).catch(() => null);

  return NextResponse.json({
    rawId,
    decoded,
    decoded2,
    foundByRaw: !!byRaw,
    foundByDecoded: !!byDecoded,
    foundByDecoded2: !!byDecoded2,
  });
}
