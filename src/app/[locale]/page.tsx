import { prisma } from "@/lib/prisma";
import RouteCard from "@/components/RouteCard";
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {locale === "cs" ? "Aktivní cesty" : "Active Routes"}
        </h1>
        <span className="text-sm text-gray-500">
          {filteredRoutes.length} {locale === "cs" ? "cest" : "routes"}
        </span>
      </div>

      {/* Filtre */}
      <form method="GET" className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <select
            name="sector"
            defaultValue={sp.sector ?? ""}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">{locale === "cs" ? "Všechny sektory" : "All sectors"}</option>
            {sectors.map((s) => (
              <option key={s} value={s}>
                {locale === "cs" ? "Sektor" : "Sector"} {s}
              </option>
            ))}
          </select>

          <select
            name="gradeMin"
            defaultValue={sp.gradeMin ?? ""}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">{locale === "cs" ? "Od obtížnosti" : "Grade from"}</option>
            {GRADES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <select
            name="gradeMax"
            defaultValue={sp.gradeMax ?? ""}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">{locale === "cs" ? "Do obtížnosti" : "Grade to"}</option>
            {GRADES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <select
            name="sort"
            defaultValue={sort}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="setDate">{locale === "cs" ? "Datum osazení" : "Set date"}</option>
            <option value="grade">{locale === "cs" ? "Obtížnost" : "Grade"}</option>
            <option value="ascents">{locale === "cs" ? "Počet přelezů" : "Ascents"}</option>
          </select>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            {locale === "cs" ? "Filtrovat" : "Filter"}
          </button>
          <a
            href={`/${locale}`}
            className="text-gray-500 px-4 py-2 rounded-lg text-sm hover:bg-gray-100"
          >
            {locale === "cs" ? "Resetovat" : "Reset"}
          </a>
        </div>
      </form>

      {/* Zoznam ciest */}
      {filteredRoutes.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          {locale === "cs" ? "Žádné aktivní cesty" : "No active routes"}
        </p>
      ) : (
        <div className="grid gap-3">
          {filteredRoutes.map((route) => (
            <RouteCard key={route.id} route={route as Parameters<typeof RouteCard>[0]["route"]} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
