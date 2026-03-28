import { gradeIndex } from "@/lib/grades";

function getBadgeColor(grade: string): string {
  const idx = gradeIndex(grade);
  if (idx < 0) return "bg-gray-200 text-gray-700";
  if (idx <= 4) return "bg-green-100 text-green-800"; // 3–5a+
  if (idx <= 9) return "bg-yellow-100 text-yellow-800"; // 5b–6a
  if (idx <= 14) return "bg-orange-100 text-orange-800"; // 6a+–6c
  if (idx <= 19) return "bg-red-100 text-red-800"; // 7a–7c
  return "bg-purple-100 text-purple-800"; // 8a+
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
      ? "text-xs px-1.5 py-0.5"
      : size === "lg"
        ? "text-2xl px-4 py-2 font-bold"
        : "text-sm px-2 py-1 font-semibold";

  return (
    <span
      className={`inline-block rounded-full ${sizeClass} ${getBadgeColor(grade)}`}
    >
      {grade}
    </span>
  );
}
