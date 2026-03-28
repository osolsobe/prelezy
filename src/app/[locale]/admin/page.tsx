import { prisma } from "@/lib/prisma";
import Link from "next/link";
import GradeDistributionBar from "@/components/GradeDistributionBar";

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cs = locale === "cs";

  const last30 = new Date();
  last30.setDate(last30.getDate() - 30);

  const [routeCount, slotCount, userCount, attemptCount, recentAttemptCount] = await Promise.all([
    prisma.route.count({ where: { archived: false } }),
    prisma.slot.count(),
    prisma.user.count(),
    prisma.attempt.count(),
    prisma.attempt.count({ where: { date: { gte: last30 } } }),
  ]);

  const [topRoutes, activeRoutes, zeroAttemptRoutes, topUsers] = await Promise.all([
    // Najpopulárnejšie cesty
    prisma.route.findMany({
      where: { archived: false },
      include: { _count: { select: { attempts: true } } },
      orderBy: { attempts: { _count: "desc" } },
      take: 5,
    }),
    // Aktívne cesty pre grade distribution
    prisma.route.findMany({
      where: { archived: false },
      select: { grade: true },
    }),
    // Cesty bez pokusov
    prisma.route.findMany({
      where: { archived: false, attempts: { none: {} } },
      select: { id: true, name: true, grade: true, setDate: true },
      orderBy: { setDate: "asc" },
      take: 5,
    }),
    // Najaktívnejší používatelia (posledných 30 dní)
    prisma.user.findMany({
      select: {
        id: true,
        displayName: true,
        email: true,
        _count: { select: { attempts: true } },
        attempts: {
          where: { date: { gte: last30 } },
          select: { id: true },
        },
      },
      orderBy: { attempts: { _count: "desc" } },
      take: 5,
    }),
  ]);

  return (
    <div>
      <h1 className="font-condensed font-black text-3xl text-stone-900 uppercase tracking-wide mb-6">
        {cs ? "Admin" : "Admin"}
      </h1>

      {/* Základné štatistiky */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <StatCard label={cs ? "Aktivních cest" : "Active routes"} value={routeCount} />
        <StatCard label={cs ? "Slotů" : "Slots"} value={slotCount} />
        <StatCard label={cs ? "Uživatelů" : "Users"} value={userCount} />
        <StatCard label={cs ? "Pokusů celkem" : "Total attempts"} value={attemptCount} />
        <StatCard label={cs ? "Pokusů / 30 dní" : "Attempts / 30d"} value={recentAttemptCount} accent />
      </div>

      {/* Rýchle akcie */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Link
          href={`/${locale}/admin/routes/new`}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl p-4 text-center transition-colors"
        >
          <div className="text-2xl mb-1">➕</div>
          <div className="text-sm font-semibold">{cs ? "Nová cesta" : "New route"}</div>
        </Link>
        <Link
          href={`/${locale}/admin/slots`}
          className="bg-white border border-stone-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow"
        >
          <div className="text-2xl mb-1">🎯</div>
          <div className="text-sm font-medium text-stone-700">{cs ? "Správa slotů" : "Manage slots"}</div>
        </Link>
        <Link
          href={`/${locale}/admin/slots/qr-print`}
          className="bg-white border border-stone-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow"
        >
          <div className="text-2xl mb-1">🖨️</div>
          <div className="text-sm font-medium text-stone-700">{cs ? "Tisknout QR" : "Print QR"}</div>
        </Link>
        <Link
          href={`/${locale}/admin/routes`}
          className="bg-white border border-stone-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow"
        >
          <div className="text-2xl mb-1">🗂️</div>
          <div className="text-sm font-medium text-stone-700">{cs ? "Všechny cesty" : "All routes"}</div>
        </Link>
      </div>

      {/* Dvojstĺpcový layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Grade distribution */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <GradeDistributionBar routes={activeRoutes} locale={locale} />
        </div>

        {/* Cesty bez pokusov */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h2 className="font-semibold text-stone-700 mb-3 text-sm uppercase tracking-wide">
            {cs ? "Cesty bez pokusů" : "Routes with 0 attempts"}
          </h2>
          {zeroAttemptRoutes.length === 0 ? (
            <p className="text-sm text-stone-400">{cs ? "Všechny cesty mají alespoň 1 pokus 💪" : "All routes have at least 1 attempt 💪"}</p>
          ) : (
            <div className="space-y-2">
              {zeroAttemptRoutes.map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm">
                  <Link
                    href={`/${locale}/admin/routes/${encodeURIComponent(r.id)}/edit`}
                    className="hover:text-orange-500 text-stone-700 truncate"
                  >
                    {r.name}
                  </Link>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-xs bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded font-mono">
                      {r.grade}
                    </span>
                    <span className="text-xs text-stone-400">
                      {new Date(r.setDate).toLocaleDateString(cs ? "cs-CZ" : "en-US", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>
              ))}
              {zeroAttemptRoutes.length === 5 && (
                <Link href={`/${locale}/admin/routes`} className="text-xs text-orange-500 hover:underline">
                  {cs ? "Zobrazit vše →" : "View all →"}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Najpopulárnejšie cesty */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h2 className="font-semibold text-stone-700 mb-3 text-sm uppercase tracking-wide">
            {cs ? "Nejpopulárnější cesty" : "Most popular routes"}
          </h2>
          <div className="space-y-2">
            {topRoutes.map((r, i) => (
              <div key={r.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-stone-400 w-5 shrink-0">{i + 1}.</span>
                  <Link
                    href={`/${locale}/admin/routes/${encodeURIComponent(r.id)}/edit`}
                    className="hover:text-orange-500 text-stone-700 truncate"
                  >
                    {r.name}
                  </Link>
                  <span className="text-xs bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded font-mono shrink-0">
                    {r.grade}
                  </span>
                </div>
                <span className="text-stone-500 shrink-0 ml-2">
                  {r._count.attempts} {cs ? "pok." : "att."}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Najaktívnejší používatelia */}
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h2 className="font-semibold text-stone-700 mb-3 text-sm uppercase tracking-wide">
            {cs ? "Nejaktivnější lezci" : "Most active climbers"}
          </h2>
          <div className="space-y-2">
            {topUsers.map((u, i) => (
              <div key={u.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-stone-400 w-5 shrink-0">{i + 1}.</span>
                  <span className="text-stone-700 truncate">{u.displayName || u.email}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-orange-500 font-medium">{u.attempts.length}</span>
                  <span className="text-stone-400 text-xs">{cs ? "/ 30 dní" : "/ 30d"}</span>
                  <span className="text-stone-400">·</span>
                  <span className="text-stone-500">{u._count.attempts}</span>
                  <span className="text-stone-400 text-xs">{cs ? "celkem" : "total"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
      <div className={`text-3xl font-bold ${accent ? "text-orange-500" : "text-stone-900"}`}>
        {value}
      </div>
      <div className="text-xs text-stone-500 mt-1 leading-tight">{label}</div>
    </div>
  );
}
