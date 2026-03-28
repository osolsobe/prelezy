"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Route {
  id: string;
  name: string;
  grade: string;
  color: string;
  sector: string | null;
}

export default function AssignRouteForm({
  slotCode,
  routes,
  locale,
}: {
  slotCode: string;
  routes: Route[];
  locale: string;
}) {
  const router = useRouter();
  const cs = locale === "cs";
  const [routeId, setRouteId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!routeId) return;
    setLoading(true);
    setError("");

    const res = await fetch(`/api/slots/${slotCode}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routeId }),
    });

    setLoading(false);

    if (res.ok) {
      router.push(`/${locale}/admin/slots`);
      router.refresh();
    } else {
      setError(cs ? "Chyba při přiřazení" : "Assignment failed");
    }
  }

  async function handleUnassign() {
    if (!confirm(cs ? "Odebrat přiřazení?" : "Remove assignment?")) return;
    await fetch(`/api/slots/${slotCode}/assign`, { method: "DELETE" });
    router.push(`/${locale}/admin/slots`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {cs ? "Vyberte cestu" : "Select route"}
        </label>
        <select
          value={routeId}
          onChange={(e) => setRouteId(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{cs ? "-- Vyberte cestu --" : "-- Select a route --"}</option>
          {routes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.grade} | {r.name}{r.sector ? ` (${r.sector})` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading || !routeId}
          className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {cs ? "Přiřadit" : "Assign"}
        </button>
        <button
          type="button"
          onClick={handleUnassign}
          className="px-4 py-2.5 border border-red-300 text-red-500 rounded-lg hover:bg-red-50 text-sm"
        >
          {cs ? "Odebrat" : "Remove"}
        </button>
        <a
          href={`/${locale}/admin/slots`}
          className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm"
        >
          {cs ? "Zrušit" : "Cancel"}
        </a>
      </div>
    </form>
  );
}
