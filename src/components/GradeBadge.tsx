import { gradeIndex } from "@/lib/grades";

function getBadgeColor(grade: string): string {
  const idx = gradeIndex(grade);
  if (idx < 0) return "bg-stone-200 text-stone-700";
  if (idx <= 4) return "bg-emerald-500 text-white";       // 3–5a+
  if (idx <= 9) return "bg-yellow-400 text-stone-900";    // 5b–6a
  if (idx <= 14) return "bg-orange-500 text-white";       // 6a+–6c
  if (idx <= 19) return "bg-red-600 text-white";          // 7a–7c
  return "bg-purple-700 text-white";                      // 8a+
}

export default function GradeBadge({
  grade,
  size = "md",
}: {
  grade: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "sm"
      ? "text-xs px-2 py-0.5"
      : size === "lg"
        ? "text-3xl px-4 py-1.5 font-black tracking-tight"
        : "text-sm px-2.5 py-0.5 font-bold";

  return (
    <span
      className={`inline-block rounded font-condensed ${sizeClass} ${getBadgeColor(grade)}`}
    >
      {grade}
    </span>
  );
}
