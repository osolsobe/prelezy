import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured");
  return new Resend(key);
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  lang: string = "cs"
) {
  const resend = getResend();
  const subject = lang === "en" ? "Password Reset" : "Obnovenie hesla";

  const htmlCs = `
    <p>Požiadali ste o obnovenie hesla. Kliknite na odkaz nižšie:</p>
    <p><a href="${resetUrl}">Obnoviť heslo</a></p>
    <p>Odkaz platí 1 hodinu. Ak ste o reset nepožiadali, ignorujte tento e-mail.</p>
  `;

  const htmlEn = `
    <p>You requested a password reset. Click the link below:</p>
    <p><a href="${resetUrl}">Reset Password</a></p>
    <p>The link expires in 1 hour. If you didn't request this, please ignore this email.</p>
  `;

  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "noreply@prelezy.sk",
    to,
    subject,
    html: lang === "en" ? htmlEn : htmlCs,
  });
}
