import { GRADES, gradeIndex } from "@/lib/grades";

interface Props {
  routes: { grade: string }[];
  locale: string;
}

const GRADE_COLORS: Record<string, string> = {
  "3": "#22c55e", "4": "#22c55e", "4+": "#22c55e",
  "5a": "#22c55e", "5a+": "#22c55e",
  "5b": "#eab308", "5b+": "#eab308", "5c": "#eab308", "5c+": "#eab308",
  "6a": "#f97316", "6a+": "#f97316", "6b": "#f97316", "6b+": "#f97316", "6c": "#f97316", "6c+": "#f97316",
  "7a": "#ef4444", "7a+": "#ef4444", "7b": "#ef4444", "7b+": "#ef4444", "7c": "#ef4444", "7c+": "#ef4444",
  "8a": "#a855f7", "8a+": "#a855f7", "8b": "#a855f7", "8b+": "#a855f7", "8c": "#a855f7", "8c+": "#a855f7",
};

function getColor(grade: string): string {
  return GRADE_COLORS[grade] ?? "#9ca3af";
}

export default function GradeDistributionBar({ routes, locale }: Props) {
  const cs = locale === "cs";

  // Spočítej koľko ciest je na každom gradu
  const counts: Record<string, number> = {};
  for (const r of routes) {
    counts[r.grade] = (counts[r.grade] ?? 0) + 1;
  }

  // Len grady ktoré sa reálne vyskytujú, zoradené
  const usedGrades = GRADES.filter((g) => counts[g] > 0);
  if (usedGrades.length === 0) return null;

  const max = Math.max(...usedGrades.map((g) => counts[g]));

  return (
    <div>
      <h2 className="font-semibold text-stone-700 mb-3 text-sm uppercase tracking-wide">
        {cs ? "Rozložení obtížností" : "Grade Distribution"}
      </h2>
      <div className="space-y-1.5">
        {usedGrades.map((grade) => {
          const count = counts[grade];
          const pct = Math.round((count / max) * 100);
          return (
            <div key={grade} className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold w-8 text-right text-stone-600">
                {grade}
              </span>
              <div className="flex-1 bg-stone-200 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: getColor(grade) }}
                />
              </div>
              <span className="text-xs text-stone-500 w-4 text-right">{count}</span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-stone-400 mt-2">
        {routes.length} {cs ? "aktivních cest celkem" : "active routes total"}
      </p>
    </div>
  );
}
