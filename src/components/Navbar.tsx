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
    <nav className="bg-stone-900 sticky top-0 z-50 shadow-lg">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <span className="text-2xl">🧗</span>
          <span className="font-condensed font-700 text-xl tracking-wide text-orange-400 uppercase">
            Přelezy
          </span>
        </Link>

        <div className="flex items-center gap-1 text-sm">
          <Link
            href={`/${locale}`}
            className="text-stone-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-stone-700 transition-colors"
          >
            {t("routes")}
          </Link>

          {session ? (
            <>
              <Link
                href={`/${locale}/profile`}
                className="text-stone-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-stone-700 transition-colors"
              >
                {t("profile")}
              </Link>
              {isAdmin && (
                <Link
                  href={`/${locale}/admin`}
                  className="text-orange-400 hover:text-orange-300 px-3 py-1.5 rounded-md hover:bg-stone-700 transition-colors font-semibold"
                >
                  {t("admin")}
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: `/${locale}` })}
                className="text-stone-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-stone-700 transition-colors"
              >
                {t("logout")}
              </button>
            </>
          ) : (
            <>
              <Link
                href={`/${locale}/login`}
                className="text-stone-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-stone-700 transition-colors"
              >
                {t("login")}
              </Link>
              <Link
                href={`/${locale}/register`}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-md font-semibold transition-colors"
              >
                {t("register")}
              </Link>
            </>
          )}

          <Link
            href={otherLocalePath}
            className="text-xs border border-stone-600 text-stone-400 px-2 py-1 rounded hover:bg-stone-700 hover:text-white transition-colors ml-1"
          >
            {otherLocale.toUpperCase()}
          </Link>
        </div>
      </div>
    </nav>
  );
}
