import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AssignRouteForm from "@/components/AssignRouteForm";

export default async function AssignRoutePage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale, code } = await params;
  const cs = locale === "cs";

  const slot = await prisma.slot.findUnique({
    where: { code },
    include: {
      assignments: {
        where: { removedAt: null },
        include: { route: { select: { name: true, grade: true } } },
        take: 1,
      },
    },
  });

  if (!slot) notFound();

  const wall = await prisma.wall.findFirst();
  const routes = await prisma.route.findMany({
    where: { archived: false, ...(wall ? { wallId: wall.id } : {}) },
    orderBy: { setDate: "desc" },
    select: { id: true, name: true, grade: true, color: true, sector: true },
  });

  const activeRoute = slot.assignments[0]?.route;

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-2">
        {cs ? "Přiřadit cestu" : "Assign Route"} → Slot {code}
      </h1>

      {activeRoute && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm">
          {cs ? "Aktuální cesta: " : "Current route: "}
          <strong>{activeRoute.name}</strong> ({activeRoute.grade})
          <br />
          <span className="text-xs text-yellow-600">
            {cs
              ? "Přiřazením nové cesty se tato uzavře (statistiky zůstanou)."
              : "Assigning a new route will close this one (stats are preserved)."}
          </span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <AssignRouteForm slotCode={code} routes={routes} locale={locale} />
      </div>
    </div>
  );
}
