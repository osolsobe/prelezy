import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CreateSlotsForm from "@/components/CreateSlotsForm";

export default async function AdminSlotsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cs = locale === "cs";

  const wall = await prisma.wall.findFirst();

  const slots = await prisma.slot.findMany({
    where: wall ? { wallId: wall.id } : {},
    include: {
      assignments: {
        where: { removedAt: null },
        include: {
          route: { select: { id: true, name: true, grade: true, color: true } },
        },
        take: 1,
      },
    },
    orderBy: { code: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">
          {cs ? "Správa slotů" : "Slot Management"}
        </h1>
        <div className="flex gap-2">
          <Link
            href={`/${locale}/admin/slots/qr-print`}
            className="border border-gray-300 text-sm px-3 py-1.5 rounded-lg hover:bg-gray-50"
          >
            🖨️ {cs ? "Tisknout QR" : "Print QR"}
          </Link>
        </div>
      </div>

      {/* Formulár na vytvorenie slotov */}
      {wall && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="font-semibold mb-4">
            {cs ? "Vytvořit nové sloty" : "Create new slots"}
          </h2>
          <CreateSlotsForm wallId={wall.id} locale={locale} />
        </div>
      )}

      {/* Zoznam slotov */}
      <div className="grid gap-2">
        {slots.map((slot) => {
          const activeRoute = slot.assignments[0]?.route;
          return (
            <div
              key={slot.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-lg text-blue-600 w-12">
                  {slot.code}
                </span>
                {activeRoute ? (
                  <div>
                    <span className="text-sm font-medium">{activeRoute.name}</span>
                    <span className="ml-2 text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                      {activeRoute.grade}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">
                    {cs ? "Prázdný slot" : "Empty slot"}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/${locale}/admin/slots/${slot.code}/assign`}
                  className="text-xs border border-blue-300 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50"
                >
                  {cs ? "Přiřadit" : "Assign"}
                </Link>
                <a
                  href={`/api/qr/${slot.code}`}
                  target="_blank"
                  className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50"
                >
                  QR
                </a>
              </div>
            </div>
          );
        })}

        {slots.length === 0 && (
          <p className="text-gray-400 text-center py-12">
            {cs ? "Žádné sloty. Vytvořte je výše." : "No slots yet. Create them above."}
          </p>
        )}
      </div>
    </div>
  );
}
