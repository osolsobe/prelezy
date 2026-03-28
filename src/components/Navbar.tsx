"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { signOut, useSession } from "next-auth/react";

export default function Navbar({ locale }: { locale: string }) {
  const t = useTranslations("nav");
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  const otherLocale = locale === "cs" ? "en" : "cs";
  const otherLocalePath = pathname.replace(`/${locale}`, `/${otherLocale}`);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href={`/${locale}`} className="font-bold text-lg text-blue-600">
          🧗 Přelezy
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link
            href={`/${locale}`}
            className="text-gray-600 hover:text-gray-900"
          >
            {t("routes")}
          </Link>

          {session ? (
            <>
              <Link
                href={`/${locale}/profile`}
                className="text-gray-600 hover:text-gray-900"
              >
                {t("profile")}
              </Link>
              {isAdmin && (
                <Link
                  href={`/${locale}/admin`}
                  className="text-gray-600 hover:text-gray-900"
                >
                  {t("admin")}
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: `/${locale}` })}
                className="text-gray-500 hover:text-gray-900"
              >
                {t("logout")}
              </button>
            </>
          ) : (
            <>
              <Link
                href={`/${locale}/login`}
                className="text-gray-600 hover:text-gray-900"
              >
                {t("login")}
              </Link>
              <Link
                href={`/${locale}/register`}
                className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
              >
                {t("register")}
              </Link>
            </>
          )}

          <Link
            href={otherLocalePath}
            className="text-xs border border-gray-300 px-2 py-1 rounded hover:bg-gray-100"
          >
            {otherLocale.toUpperCase()}
          </Link>
        </div>
      </div>
    </nav>
  );
}
