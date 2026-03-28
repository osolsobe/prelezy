import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cs = locale === "cs";

  const [routeCount, slotCount, userCount, attemptCount] = await Promise.all([
    prisma.route.count({ where: { archived: false } }),
    prisma.slot.count(),
    prisma.user.count(),
    prisma.attempt.count(),
  ]);

  const topRoutes = await prisma.route.findMany({
    where: { archived: false },
    include: { _count: { select: { attempts: true } } },
    orderBy: { attempts: { _count: "desc" } },
    take: 5,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {cs ? "Admin dashboard" : "Admin Dashboard"}
      </h1>

      {/* Štatistiky */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label={cs ? "Aktivních cest" : "Active routes"} value={routeCount} />
        <StatCard label={cs ? "Slotů" : "Slots"} value={slotCount} />
        <StatCard label={cs ? "Uživatelů" : "Users"} value={userCount} />
        <StatCard label={cs ? "Pokusů" : "Attempts"} value={attemptCount} />
      </div>

      {/* Rýchle akcie */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        <Link
          href={`/${locale}/admin/routes/new`}
          className="bg-blue-600 text-white rounded-xl p-4 text-center hover:bg-blue-700"
        >
          <div className="text-2xl mb-1">➕</div>
          <div className="text-sm font-medium">{cs ? "Nová cesta" : "New route"}</div>
        </Link>
        <Link
          href={`/${locale}/admin/slots`}
          className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-md"
        >
          <div className="text-2xl mb-1">🎯</div>
          <div className="text-sm font-medium">{cs ? "Správa slotů" : "Manage slots"}</div>
        </Link>
        <Link
          href={`/${locale}/admin/slots/qr-print`}
          className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-md"
        >
          <div className="text-2xl mb-1">🖨️</div>
          <div className="text-sm font-medium">{cs ? "Tisknout QR" : "Print QR"}</div>
        </Link>
        <Link
          href={`/${locale}/admin/routes`}
          className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-md"
        >
          <div className="text-2xl mb-1">🗂️</div>
          <div className="text-sm font-medium">{cs ? "Všechny cesty" : "All routes"}</div>
        </Link>
      </div>

      {/* Top cesty */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold mb-4">
          {cs ? "Nejpopulárnější cesty" : "Most popular routes"}
        </h2>
        <div className="space-y-2">
          {topRoutes.map((r, i) => (
            <div key={r.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 w-5">{i + 1}.</span>
                <Link
                  href={`/${locale}/admin/routes/${r.id}/edit`}
                  className="hover:text-blue-600"
                >
                  {r.name}
                </Link>
                <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                  {r.grade}
                </span>
              </div>
              <span className="text-gray-500">
                {r._count.attempts} {cs ? "pokusů" : "attempts"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}
