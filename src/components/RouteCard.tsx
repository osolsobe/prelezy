import Link from "next/link";
import GradeBadge from "./GradeBadge";
import type { Route } from "@prisma/client";

interface RouteWithStats extends Route {
  _count: {
    attempts: number;
  };
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

  return (
    <Link href={href} className="block">
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{route.name}</h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              {route.sector && <span>Sektor {route.sector}</span>}
              <span
                className="inline-block w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: colorToHex(route.color) }}
                title={route.color}
              />
              <span>{route.color}</span>
            </div>
          </div>
          <GradeBadge grade={route.grade} size="lg" />
        </div>

        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span>{route._count.attempts} pokusů</span>
          <span>{route.successCount} přelezů</span>
          {route._count.attempts > 0 && <span>{successRate}% úspěšnost</span>}
          <span>{new Date(route.setDate).toLocaleDateString("cs-CZ")}</span>
        </div>
      </div>
    </Link>
  );
}

function colorToHex(color: string): string {
  const map: Record<string, string> = {
    červená: "#ef4444",
    red: "#ef4444",
    modrá: "#3b82f6",
    blue: "#3b82f6",
    zelená: "#22c55e",
    green: "#22c55e",
    žltá: "#eab308",
    yellow: "#eab308",
    čierna: "#1f2937",
    black: "#1f2937",
    biela: "#f9fafb",
    white: "#f9fafb",
    oranžová: "#f97316",
    orange: "#f97316",
    fialová: "#a855f7",
    purple: "#a855f7",
    ružová: "#ec4899",
    pink: "#ec4899",
  };
  return map[color.toLowerCase()] ?? "#9ca3af";
}
