"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SlotSearch({ locale }: { locale: string }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const cs = locale === "cs";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    setError(false);

    const res = await fetch(`/api/slots/${trimmed}`);
    setLoading(false);

    if (res.ok) {
      router.push(`/${locale}/slot/${trimmed}`);
    } else {
      setError(true);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={code}
        onChange={(e) => {
          setCode(e.target.value.toUpperCase());
          setError(false);
        }}
        placeholder={cs ? "Kód slotu, např. A3" : "Slot code, e.g. A3"}
        className={`flex-1 border rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-orange-400 ${
          error ? "border-red-400 bg-red-50" : "border-stone-300 bg-stone-50"
        }`}
        maxLength={10}
      />
      <button
        type="submit"
        disabled={loading || !code.trim()}
        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        {loading ? "..." : cs ? "Otevřít slot" : "Open slot"}
      </button>
      {error && (
        <span className="absolute mt-10 text-xs text-red-500">
          {cs ? "Slot nenalezen" : "Slot not found"}
        </span>
      )}
    </form>
  );
}
