import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import GradeBadge from "@/components/GradeBadge";
import UserStatsCharts from "@/components/UserStatsCharts";
import { GRADES } from "@/lib/grades";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/${locale}/login`);

  const cs = locale === "cs";
  const userId = session.user.id;

  const attempts = await prisma.attempt.findMany({
    where: { userId },
    include: {
      route: { select: { name: true, grade: true, id: true } },
    },
    orderBy: { date: "desc" },
  });

  const successAttempts = attempts.filter((a) => a.success);
  const flashCount = attempts.filter((a) => a.flash).length;

  // Unikátne cesty (prelezené)
  const uniqueRoutesClimbed = new Set(successAttempts.map((a) => a.routeId)).size;
  // Unikátne cesty s pokusom
  const uniqueRoutesTried = new Set(attempts.map((a) => a.routeId)).size;

  // Úspešnosť %
  const successRate =
    attempts.length > 0 ? Math.round((successAttempts.length / attempts.length) * 100) : 0;

  // Priemerný počet pokusov na prelez (len u prelezených ciest)
  const avgAttemptsPerAscent =
    uniqueRoutesClimbed > 0
      ? (attempts.length / uniqueRoutesClimbed).toFixed(1)
      : "—";

  // Najťažší prelez
  const hardestAscent = successAttempts.reduce<(typeof successAttempts)[0] | null>(
    (best, a) => {
      if (!best) return a;
      return GRADES.indexOf(a.route.grade as (typeof GRADES)[number]) >
        GRADES.indexOf(best.route.grade as (typeof GRADES)[number])
        ? a
        : best;
    },
    null
  );

  // Prelezy podľa obtížnosti (pre graf)
  const ascentsByGrade = GRADES.reduce<Record<string, number>>((acc, g) => {
    const count = successAttempts.filter((a) => a.route.grade === g).length;
    if (count > 0) acc[g] = count;
    return acc;
  }, {});

  // Aktivita po mesiacoch (posledných 12 mesiacov)
  const now = new Date();
  const monthlyActivity = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const label = d.toLocaleDateString(cs ? "cs-CZ" : "en-US", { month: "short", year: "2-digit" });
    const count = attempts.filter((a) => {
      const ad = new Date(a.date);
      return ad.getFullYear() === d.getFullYear() && ad.getMonth() === d.getMonth();
    }).length;
    return { label, count };
  });

  // Posledných 30 dní
  const last30 = new Date();
  last30.setDate(last30.getDate() - 30);
  const recentAttempts = attempts.filter((a) => new Date(a.date) >= last30);
  const recentAscents = recentAttempts.filter((a) => a.success).length;

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-stone-900 rounded-2xl px-6 py-6 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_80%_50%,#f97316,transparent_60%)]" />
        <div className="relative">
          <h1 className="text-xl font-bold text-white">{session.user.name}</h1>
          <p className="text-sm text-stone-400">{session.user.email}</p>
        </div>
      </div>

      {/* Hlavné štatistiky */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <StatCard label={cs ? "Přelezů" : "Ascents"} value={successAttempts.length} accent />
        <StatCard label="Flash" value={flashCount} />
        <StatCard label={cs ? "Pokusů" : "Attempts"} value={attempts.length} />
        <StatCard label={cs ? "Úspěšnost" : "Success rate"} value={`${successRate}%`} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <StatCard label={cs ? "Unikát. cest" : "Unique routes"} value={uniqueRoutesClimbed} />
        <StatCard label={cs ? "Vyzkoušeno" : "Tried"} value={uniqueRoutesTried} />
        <StatCard label={cs ? "Ø pokusů/přelez" : "Avg att./ascent"} value={avgAttemptsPerAscent} />
      </div>

      {/* Posledných 30 dní */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-stone-500">{cs ? "Posledních 30 dní" : "Last 30 days"}</p>
          <p className="font-semibold text-stone-800 mt-0.5">
            {recentAttempts.length} {cs ? "pokusů" : "attempts"},{" "}
            <span className="text-orange-500">{recentAscents}</span>{" "}
            {cs ? "přelezů" : "ascents"}
          </p>
        </div>
        <div className="text-3xl opacity-30">🔥</div>
      </div>

      {/* Nejtěžší přelez */}
      {hardestAscent && (
        <div className="bg-white rounded-xl border border-stone-200 p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-500 mb-1">
              {cs ? "Nejtěžší přelez" : "Hardest ascent"}
            </p>
            <p className="font-medium text-stone-800">{hardestAscent.route.name}</p>
          </div>
          <GradeBadge grade={hardestAscent.route.grade} size="lg" />
        </div>
      )}

      {/* Grafy */}
      {Object.keys(ascentsByGrade).length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 mb-6">
          <h2 className="font-semibold mb-4 text-stone-800">
            {cs ? "Přelezy podle obtížnosti" : "Ascents by grade"}
          </h2>
          <UserStatsCharts
            ascentsByGrade={ascentsByGrade}
            monthlyActivity={monthlyActivity}
            locale={locale}
          />
        </div>
      )}

      {/* Odkaz na všetky pokusy */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 flex items-center justify-between">
        <span className="text-sm text-stone-600">
          {cs ? "Všechny záznamy" : "All records"}
        </span>
        <Link
          href={`/${locale}/profile/attempts`}
          className="text-sm text-orange-500 hover:underline font-medium"
        >
          {cs ? "Zobrazit →" : "View →"}
        </Link>
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
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-3 text-center">
      <div className={`text-2xl font-bold ${accent ? "text-orange-500" : "text-stone-900"}`}>
        {value}
      </div>
      <div className="text-xs text-stone-500 mt-1 leading-tight">{label}</div>
    </div>
  );
}
