"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Props {
  ascentsByGrade: Record<string, number>;
  monthlyActivity: { label: string; count: number }[];
  locale: string;
}

export default function UserStatsCharts({
  ascentsByGrade,
  monthlyActivity,
  locale,
}: Props) {
  const cs = locale === "cs";

  const gradeData = Object.entries(ascentsByGrade).map(([grade, count]) => ({
    grade,
    count,
  }));

  const hasMonthlyData = monthlyActivity.some((m) => m.count > 0);

  return (
    <div className="space-y-6">
      {/* Stĺpcový graf: prelezy podľa obtížnosti */}
      <div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={gradeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="grade" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line chart: aktivita po mesiacoch */}
      {hasMonthlyData && (
        <div>
          <p className="text-sm text-gray-500 mb-2">
            {cs ? "Aktivita (12 měsíců)" : "Activity (12 months)"}
          </p>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart
              data={monthlyActivity}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
