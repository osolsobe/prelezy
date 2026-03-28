"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateSlotsForm({
  wallId,
  locale,
  onCreated,
}: {
  wallId: string;
  locale: string;
  onCreated?: () => void;
}) {
  const router = useRouter();
  const cs = locale === "cs";
  const [prefix, setPrefix] = useState("A");
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm(`${cs ? "Vytvořit sloty" : "Create slots"} ${prefix}${from}–${prefix}${to}?`)) return;

    setLoading(true);
    const res = await fetch("/api/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallId, prefix, from, to }),
    });
    setLoading(false);

    if (res.ok) {
      const data = await res.json();
      setResult(
        cs
          ? `Vytvořeno ${data.length} slotů`
          : `Created ${data.length} slots`
      );
      onCreated ? onCreated() : router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-xs text-gray-500 mb-1">
          {cs ? "Prefix" : "Prefix"}
        </label>
        <input
          type="text"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value.toUpperCase().slice(0, 3))}
          maxLength={3}
          required
          className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center font-mono"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">
          {cs ? "Od" : "From"}
        </label>
        <input
          type="number"
          value={from}
          onChange={(e) => setFrom(Number(e.target.value))}
          min={1}
          required
          className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">
          {cs ? "Do" : "To"}
        </label>
        <input
          type="number"
          value={to}
          onChange={(e) => setTo(Number(e.target.value))}
          min={from}
          required
          className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "..." : cs ? "Generovat" : "Generate"}
      </button>
      {result && <span className="text-sm text-green-600">{result}</span>}
    </form>
  );
}
