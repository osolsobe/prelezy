import { prisma } from "@/lib/prisma";
import Link from "next/link";
import GradeBadge from "@/components/GradeBadge";

export default async function AdminRoutesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ archived?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const showArchived = sp.archived === "true";
  const cs = locale === "cs";

  const routes = await prisma.route.findMany({
    where: { archived: showArchived },
    include: {
      _count: { select: { attempts: true } },
      assignments: {
        where: { removedAt: null },
        include: { slot: { select: { code: true } } },
        take: 1,
      },
    },
    orderBy: { setDate: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">
          {cs ? "Správa cest" : "Route Management"}
        </h1>
        <div className="flex gap-2">
          <Link
            href={`/${locale}/admin/routes${showArchived ? "" : "?archived=true"}`}
            className="text-sm text-gray-500 hover:text-gray-700 border border-gray-300 px-3 py-1.5 rounded-lg"
          >
            {showArchived
              ? cs ? "Aktivní" : "Active"
              : cs ? "Archivované" : "Archived"}
          </Link>
          <Link
            href={`/${locale}/admin/routes/new`}
            className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700"
          >
            + {cs ? "Nová cesta" : "New route"}
          </Link>
        </div>
      </div>

      <div className="space-y-2">
        {routes.map((r) => {
          const slotCode = r.assignments[0]?.slot.code;
          return (
            <div
              key={r.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/${locale}/admin/routes/${r.id}/edit`}
                    className="font-medium hover:text-blue-600 truncate"
                  >
                    {r.name}
                  </Link>
                  {slotCode && (
                    <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                      {slotCode}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {r.sector && `Sektor ${r.sector} · `}
                  {r.color} · {r._count.attempts} {cs ? "pokusů" : "attempts"}
                </div>
              </div>
              <GradeBadge grade={r.grade} size="sm" />
              <Link
                href={`/${locale}/admin/routes/${r.id}/edit`}
                className="text-sm text-gray-400 hover:text-gray-600 ml-2"
              >
                {cs ? "Upravit" : "Edit"}
              </Link>
            </div>
          );
        })}

        {routes.length === 0 && (
          <p className="text-gray-400 text-center py-12">
            {showArchived
              ? cs ? "Žádné archivované cesty" : "No archived routes"
              : cs ? "Žádné aktivní cesty" : "No active routes"}
          </p>
        )}
      </div>
    </div>
  );
}
