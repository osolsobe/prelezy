import Link from "next/link";
import GradeBadge from "./GradeBadge";
import type { Route } from "@prisma/client";

interface RouteWithStats extends Route {
  _count: { attempts: number };
  successCount: number;
}

export default function RouteCard({
  route,
  locale,
  slotCode,
}: {
  route: RouteWithStats;
  locale: string;
  slotCode?: string;
}) {
  const href = slotCode
    ? `/${locale}/slot/${slotCode}`
    : `/${locale}/routes/${route.id}`;

  const successRate =
    route._count.attempts > 0
      ? Math.round((route.successCount / route._count.attempts) * 100)
      : 0;

  const colorHex = colorToHex(route.color);

  return (
    <Link href={href} className="block group">
      <div className="bg-white rounded-xl overflow-hidden border border-stone-200 hover:border-orange-300 hover:shadow-md transition-all">
        <div className="flex">
          {/* Farebný pruh podľa farby chytov */}
          <div
            className="w-1.5 flex-shrink-0"
            style={{ backgroundColor: colorHex }}
          />
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-stone-900 truncate text-base group-hover:text-orange-600 transition-colors">
                  {route.name}
                </h3>
                <div className="flex items-center gap-2 mt-0.5 text-sm text-stone-400">
                  {route.sector && (
                    <span className="font-medium text-stone-500">
                      Sektor {route.sector}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full border border-stone-300"
                      style={{ backgroundColor: colorHex }}
                    />
                    {route.color}
                  </span>
                </div>
              </div>
              <GradeBadge grade={route.grade} size="md" />
            </div>

            <div className="flex items-center gap-4 mt-3 text-xs text-stone-400 border-t border-stone-100 pt-2.5">
              <span>
                <span className="font-semibold text-stone-600">{route._count.attempts}</span> pokusů
              </span>
              <span>
                <span className="font-semibold text-stone-600">{route.successCount}</span> přelezů
              </span>
              {route._count.attempts > 0 && (
                <span>
                  <span className="font-semibold text-orange-500">{successRate}%</span> úspěšnost
                </span>
              )}
              <span className="ml-auto">
                {new Date(route.setDate).toLocaleDateString("cs-CZ")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function colorToHex(color: string): string {
  const map: Record<string, string> = {
    červená: "#ef4444", red: "#ef4444",
    modrá: "#3b82f6", blue: "#3b82f6",
    zelená: "#22c55e", green: "#22c55e",
    žltá: "#eab308", yellow: "#eab308",
    čierna: "#1f2937", black: "#1f2937",
    biela: "#e5e7eb", white: "#e5e7eb",
    oranžová: "#f97316", orange: "#f97316",
    fialová: "#a855f7", purple: "#a855f7",
    ružová: "#ec4899", pink: "#ec4899",
  };
  return map[color.toLowerCase()] ?? "#9ca3af";
}
