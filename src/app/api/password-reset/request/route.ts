import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/resend";
import crypto from "crypto";
import { z } from "zod";

const schema = z.object({ email: z.string().email(), lang: z.string().default("cs") });

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const { email, lang } = parsed.data;

  // Vždy vrátime OK — nesmieme prezradiť, či e-mail existuje
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ ok: true });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hodina

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const resetUrl = `${baseUrl}/${lang}/reset-password?token=${token}`;

  await sendPasswordResetEmail(email, resetUrl, lang);

  return NextResponse.json({ ok: true });
}
