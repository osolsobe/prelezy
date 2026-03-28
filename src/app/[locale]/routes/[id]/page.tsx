import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import GradeBadge from "@/components/GradeBadge";
import AttemptForm from "@/components/AttemptForm";
import CommentsSection from "@/components/CommentsSection";
import { auth } from "@/lib/auth";

export default async function RouteDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const route = await prisma.route.findUnique({
    where: { id },
    include: {
      _count: { select: { attempts: true } },
      attempts: { select: { success: true, flash: true } },
      comments: {
        include: { user: { select: { displayName: true, id: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!route || route.archived) notFound();

  const session = await auth();
  const successCount = route.attempts.filter((a) => a.success).length;
  const flashCount = route.attempts.filter((a) => a.flash).length;
  const successRate =
    route._count.attempts > 0
      ? Math.round((successCount / route._count.attempts) * 100)
      : 0;

  const cs = locale === "cs";

  return (
    <div className="max-w-lg mx-auto">
      {/* Fotografia */}
      {route.photoUrl && (
        <div className="relative w-full h-64 rounded-xl overflow-hidden mb-5">
          <Image
            src={route.photoUrl}
            alt={route.name}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Hlavička */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{route.name}</h1>
            {route.sector && (
              <p className="text-sm text-gray-500">{cs ? "Sektor" : "Sector"} {route.sector}</p>
            )}
          </div>
          <GradeBadge grade={route.grade} size="lg" />
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span
            className="inline-block w-3 h-3 rounded-full border border-gray-300"
            style={{ backgroundColor: colorToHex(route.color) }}
          />
          <span>{route.color}</span>
          <span className="text-gray-300">·</span>
          <span>{new Date(route.setDate).toLocaleDateString(cs ? "cs-CZ" : "en-US")}</span>
        </div>

        {route.description && (
          <p className="mt-3 text-sm text-gray-600">{route.description}</p>
        )}
      </div>

      {/* Štatistiky */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatCard
          label={cs ? "Pokusů" : "Attempts"}
          value={route._count.attempts}
        />
        <StatCard
          label={cs ? "Přelezů" : "Ascents"}
          value={successCount}
        />
        <StatCard
          label={cs ? "Úspěšnost" : "Success"}
          value={`${successRate}%`}
        />
      </div>

      {flashCount > 0 && (
        <p className="text-sm text-yellow-600 text-center mb-4">
          ⚡ {flashCount} flash{flashCount > 1 ? "e" : ""}
        </p>
      )}

      {/* Formulár pokusu */}
      <div className="mb-6">
        <AttemptForm routeId={route.id} locale={locale} />
      </div>

      {/* Komentáre */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <CommentsSection
          routeId={route.id}
          comments={route.comments.map((c) => ({
            ...c,
            createdAt: c.createdAt.toISOString(),
          }))}
          locale={locale}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function colorToHex(color: string): string {
  const map: Record<string, string> = {
    červená: "#ef4444", red: "#ef4444",
    modrá: "#3b82f6", blue: "#3b82f6",
    zelená: "#22c55e", green: "#22c55e",
    žltá: "#eab308", yellow: "#eab308",
    čierna: "#1f2937", black: "#1f2937",
    biela: "#f9fafb", white: "#f9fafb",
    oranžová: "#f97316", orange: "#f97316",
    fialová: "#a855f7", purple: "#a855f7",
    ružová: "#ec4899", pink: "#ec4899",
  };
  return map[color.toLowerCase()] ?? "#9ca3af";
}
