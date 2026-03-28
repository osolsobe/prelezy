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

  // Prelezy podľa obtížnosti
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

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h1 className="text-xl font-bold">{session.user.name}</h1>
        <p className="text-sm text-gray-500">{session.user.email}</p>
      </div>

      {/* Súhrnné štatistiky */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label={cs ? "Přelezů" : "Ascents"} value={successAttempts.length} />
        <StatCard label="Flash" value={flashCount} />
        <StatCard label={cs ? "Pokusů" : "Attempts"} value={attempts.length} />
      </div>

      {hardestAscent && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-1">
              {cs ? "Nejtěžší přelez" : "Hardest ascent"}
            </p>
            <p className="font-medium">{hardestAscent.route.name}</p>
          </div>
          <GradeBadge grade={hardestAscent.route.grade} size="lg" />
        </div>
      )}

      {/* Grafy */}
      {Object.keys(ascentsByGrade).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="font-semibold mb-4">
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
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
        <span className="text-sm text-gray-600">
          {cs ? "Všechny záznamy" : "All records"}
        </span>
        <Link
          href={`/${locale}/profile/attempts`}
          className="text-sm text-blue-600 hover:underline"
        >
          {cs ? "Zobrazit →" : "View →"}
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}
