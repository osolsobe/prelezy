import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import "../globals.css";

export const metadata: Metadata = {
  title: "Přelezy – Lezecká stěna",
  description: "Digitální logbook pro lezeckou stěnu",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "cs" | "en")) {
    notFound();
  }

  const messages = await getMessages();
  const session = await auth();

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <SessionProvider session={session}>
          <NextIntlClientProvider messages={messages}>
            <Navbar locale={locale} />
            <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
