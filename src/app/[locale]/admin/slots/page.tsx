"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CreateSlotsForm from "@/components/CreateSlotsForm";

interface RouteInfo {
  id: string;
  name: string;
  grade: string;
  color: string;
}

interface Slot {
  id: string;
  code: string;
  label: string;
  assignments: { route: RouteInfo }[];
}

export default function AdminSlotsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const cs = locale === "cs";

  const [slots, setSlots] = useState<Slot[]>([]);
  const [wallId, setWallId] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  async function loadSlots() {
    const res = await fetch("/api/slots");
    const data = await res.json();
    setSlots(data);
    if (data[0]?.wallId) setWallId(data[0].wallId);
  }

  useEffect(() => {
    loadSlots();
    // Get wallId from wall API
    fetch("/api/routes?archived=false")
      .then((r) => r.json())
      .then((routes) => {
        if (routes[0]?.wallId) setWallId(routes[0].wallId);
      });
  }, []);

  function toggleSelect(code: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === slots.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(slots.map((s) => s.code)));
    }
  }

  async function bulkAction(action: "delete" | "unassign") {
    if (selected.size === 0) return;
    const confirmMsg =
      action === "delete"
        ? cs
          ? `Trvale smazat ${selected.size} slot(ů)? Nevratné.`
          : `Permanently delete ${selected.size} slot(s)? Irreversible.`
        : cs
          ? `Odebrat přiřazení z ${selected.size} slot(ů)?`
          : `Remove assignment from ${selected.size} slot(s)?`;

    if (!confirm(confirmMsg)) return;
    setLoading(true);

    await fetch("/api/slots/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codes: Array.from(selected), action }),
    });

    setSelected(new Set());
    await loadSlots();
    setLoading(false);
  }

  const allSelected = slots.length > 0 && selected.size === slots.length;
  const anySelected = selected.size > 0;

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
      {wallId && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="font-semibold mb-4">
            {cs ? "Vytvořit nové sloty" : "Create new slots"}
          </h2>
          <CreateSlotsForm wallId={wallId} locale={locale} onCreated={loadSlots} />
        </div>
      )}

      {/* Bulk akcie */}
      {anySelected && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 flex items-center gap-3 flex-wrap">
          <span className="text-sm text-blue-700 font-medium">
            {cs ? `Vybráno: ${selected.size}` : `Selected: ${selected.size}`}
          </span>
          <button
            onClick={() => bulkAction("unassign")}
            disabled={loading}
            className="text-sm border border-orange-300 text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-50 disabled:opacity-50"
          >
            {cs ? "Odebrat přiřazení" : "Remove assignments"}
          </button>
          <button
            onClick={() => bulkAction("delete")}
            disabled={loading}
            className="text-sm border border-red-300 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50"
          >
            {cs ? "Smazat vybrané" : "Delete selected"}
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-sm text-gray-500 hover:text-gray-700 ml-auto"
          >
            {cs ? "Zrušit výběr" : "Deselect all"}
          </button>
        </div>
      )}

      {/* Hlavička tabuľky */}
      {slots.length > 0 && (
        <div className="flex items-center gap-3 px-4 mb-2">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="w-4 h-4 accent-blue-600"
          />
          <span className="text-xs text-gray-500">
            {cs ? "Vybrat vše" : "Select all"}
          </span>
        </div>
      )}

      {/* Zoznam slotov */}
      <div className="grid gap-2">
        {slots.map((slot) => {
          const activeRoute = slot.assignments[0]?.route;
          const isSelected = selected.has(slot.code);
          return (
            <div
              key={slot.id}
              className={`bg-white rounded-xl border p-4 flex items-center gap-3 transition-colors ${
                isSelected ? "border-blue-400 bg-blue-50" : "border-gray-200"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelect(slot.code)}
                className="w-4 h-4 accent-blue-600 flex-shrink-0"
              />
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="font-mono font-bold text-lg text-blue-600 w-12 flex-shrink-0">
                  {slot.code}
                </span>
                {activeRoute ? (
                  <div className="min-w-0">
                    <span className="text-sm font-medium truncate">{activeRoute.name}</span>
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
              <div className="flex gap-2 flex-shrink-0">
                <Link
                  href={`/${locale}/admin/slots/${slot.code}/assign`}
                  className="text-xs border border-blue-300 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50"
                >
                  {cs ? "Přiřadit" : "Assign"}
                </Link>
                <a
                  href={`/api/qr/${slot.code}?v=2`}
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
