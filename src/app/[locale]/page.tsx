import { prisma } from "@/lib/prisma";
import RouteCard from "@/components/RouteCard";
import SlotSearch from "@/components/SlotSearch";
import GradeDistributionBar from "@/components/GradeDistributionBar";
import { GRADES } from "@/lib/grades";

interface SearchParams {
  sector?: string;
  gradeMin?: string;
  gradeMax?: string;
  sort?: string;
}

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const sp = await searchParams;

  // Nájdeme prvú stenu (Phase 1 = jedna stena)
  const wall = await prisma.wall.findFirst();

  const routes = await prisma.route.findMany({
    where: {
      ...(wall ? { wallId: wall.id } : {}),
      archived: false,
      ...(sp.sector ? { sector: sp.sector } : {}),
    },
    include: {
      _count: { select: { attempts: true } },
      attempts: { select: { success: true } },
    },
  });

  // Filtrujeme grade range
  const gradeMin = sp.gradeMin ? GRADES.indexOf(sp.gradeMin as (typeof GRADES)[number]) : -1;
  const gradeMax = sp.gradeMax ? GRADES.indexOf(sp.gradeMax as (typeof GRADES)[number]) : 999;

  let filteredRoutes = routes
    .map((r) => ({
      ...r,
      successCount: r.attempts.filter((a) => a.success).length,
      attempts: undefined,
    }))
    .filter((r) => {
      if (gradeMin >= 0 || gradeMax < 999) {
        const idx = GRADES.indexOf(r.grade as (typeof GRADES)[number]);
        if (gradeMin >= 0 && idx < gradeMin) return false;
        if (gradeMax < 999 && idx > gradeMax) return false;
      }
      return true;
    });

  // Radenie
  const sort = sp.sort ?? "setDate";
  if (sort === "grade") {
    filteredRoutes.sort(
      (a, b) =>
        GRADES.indexOf(a.grade as (typeof GRADES)[number]) -
        GRADES.indexOf(b.grade as (typeof GRADES)[number])
    );
  } else if (sort === "ascents") {
    filteredRoutes.sort((a, b) => b.successCount - a.successCount);
  } else {
    filteredRoutes.sort(
      (a, b) => new Date(b.setDate).getTime() - new Date(a.setDate).getTime()
    );
  }

  // Unikátne sektory pre filter
  const sectors = Array.from(
    new Set(routes.map((r) => r.sector).filter(Boolean))
  ).sort() as string[];

  const cs = locale === "cs";

  return (
    <div>
      {/* Hero header */}
      <div className="bg-stone-900 rounded-2xl px-6 py-8 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_20%_50%,#f97316,transparent_60%),radial-gradient(circle_at_80%_20%,#ea580c,transparent_50%)]" />
        <div className="relative">
          <h1 className="font-condensed font-black text-4xl text-white uppercase tracking-wide leading-none mb-1">
            {cs ? "Aktivní cesty" : "Active Routes"}
          </h1>
          <p className="text-stone-400 text-sm mb-5">
            {filteredRoutes.length} {cs ? "cest právě na stěně" : "routes currently on the wall"}
          </p>
          <SlotSearch locale={locale} />
        </div>
      </div>

      {/* Filtre */}
      <form method="GET" className="bg-white rounded-xl border border-stone-200 p-4 mb-5">
        <div className="flex flex-wrap gap-2">
          <select
            name="sector"
            defaultValue={sp.sector ?? ""}
            className="border border-stone-300 rounded-lg px-3 py-2 text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="">{cs ? "Všechny sektory" : "All sectors"}</option>
            {sectors.map((s) => (
              <option key={s} value={s}>{cs ? "Sektor" : "Sector"} {s}</option>
            ))}
          </select>

          <select
            name="gradeMin"
            defaultValue={sp.gradeMin ?? ""}
            className="border border-stone-300 rounded-lg px-3 py-2 text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="">{cs ? "Od obtížnosti" : "Grade from"}</option>
            {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>

          <select
            name="gradeMax"
            defaultValue={sp.gradeMax ?? ""}
            className="border border-stone-300 rounded-lg px-3 py-2 text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="">{cs ? "Do obtížnosti" : "Grade to"}</option>
            {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>

          <select
            name="sort"
            defaultValue={sort}
            className="border border-stone-300 rounded-lg px-3 py-2 text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="setDate">{cs ? "Datum osazení" : "Set date"}</option>
            <option value="grade">{cs ? "Obtížnost" : "Grade"}</option>
            <option value="ascents">{cs ? "Počet přelezů" : "Ascents"}</option>
          </select>

          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            {cs ? "Filtrovat" : "Filter"}
          </button>
          <a
            href={`/${locale}`}
            className="text-stone-500 px-4 py-2 rounded-lg text-sm hover:bg-stone-100 transition-colors"
          >
            {cs ? "Resetovat" : "Reset"}
          </a>
        </div>
      </form>

      {/* Rozložení obtížností + zoznam */}
      {filteredRoutes.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <div className="text-5xl mb-3">🧗</div>
          <p>{cs ? "Žádné aktivní cesty" : "No active routes"}</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Zoznam ciest */}
          <div className="flex-1 grid gap-2.5">
            {filteredRoutes.map((route) => (
              <RouteCard key={route.id} route={route as Parameters<typeof RouteCard>[0]["route"]} locale={locale} />
            ))}
          </div>

          {/* Grade distribution sidebar */}
          <div className="lg:w-56 bg-white rounded-xl border border-stone-200 p-4 self-start lg:sticky lg:top-6">
            <GradeDistributionBar routes={routes} locale={locale} />
          </div>
        </div>
      )}
    </div>
  );
}
