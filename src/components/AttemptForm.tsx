"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface AttemptFormProps {
  routeId: string;
  locale: string;
  onSuccess?: () => void;
}

export default function AttemptForm({ routeId, locale, onSuccess }: AttemptFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [success, setSuccess] = useState(true);
  const [flash, setFlash] = useState(false);
  const [tryCount, setTryCount] = useState(1);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const cs = locale === "cs";

  if (!session) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
        <p className="text-blue-700 mb-3">
          {cs ? "Pro záznam pokusu se přihlaste" : "Log in to record an attempt"}
        </p>
        <a
          href={`/${locale}/login?callbackUrl=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`}
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
        >
          {cs ? "Přihlásit se" : "Log in"}
        </a>
      </div>
    );
  }

  if (saved) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <p className="text-green-700 font-medium">
          {cs ? "✓ Pokus uložen!" : "✓ Attempt saved!"}
        </p>
        <button
          onClick={() => { setSaved(false); setShowForm(false); }}
          className="mt-2 text-sm text-green-600 hover:underline"
        >
          {cs ? "Zaznamenat další" : "Record another"}
        </button>
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 active:scale-95 transition-transform"
      >
        {cs ? "Zaznamenat pokus" : "Log attempt"}
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routeId, success, flash: success && flash, tryCount, note }),
    });

    setLoading(false);

    if (res.ok) {
      setSaved(true);
      onSuccess?.();
      router.refresh();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-xl p-5 space-y-5"
    >
      <h3 className="font-semibold text-lg">
        {cs ? "Zaznamenat pokus" : "Log attempt"}
      </h3>

      {/* Výsledok */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          {cs ? "Výsledek" : "Result"}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSuccess(true)}
            className={`py-3 rounded-xl font-medium border-2 transition-colors ${
              success
                ? "bg-green-600 border-green-600 text-white"
                : "border-gray-300 text-gray-600 hover:border-green-400"
            }`}
          >
            ✓ {cs ? "Přelezeno" : "Sent"}
          </button>
          <button
            type="button"
            onClick={() => { setSuccess(false); setFlash(false); }}
            className={`py-3 rounded-xl font-medium border-2 transition-colors ${
              !success
                ? "bg-red-500 border-red-500 text-white"
                : "border-gray-300 text-gray-600 hover:border-red-400"
            }`}
          >
            ✗ {cs ? "Nepřelezeno" : "Not sent"}
          </button>
        </div>
      </div>

      {/* Flash (len ak úspech) */}
      {success && (
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={flash}
            onChange={(e) => setFlash(e.target.checked)}
            className="w-5 h-5 rounded accent-blue-600"
          />
          <div>
            <span className="font-medium">Flash</span>
            <p className="text-xs text-gray-500">
              {cs
                ? "První kontakt s cestou bez předchozího zhlédnutí"
                : "First contact without prior inspection"}
            </p>
          </div>
        </label>
      )}

      {/* Počet pokusov */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {cs ? "Počet pokusů" : "Number of attempts"}
        </label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setTryCount(Math.max(1, tryCount - 1))}
            className="w-12 h-12 rounded-full bg-gray-100 text-xl font-bold hover:bg-gray-200"
          >
            −
          </button>
          <span className="text-3xl font-bold w-10 text-center">{tryCount}</span>
          <button
            type="button"
            onClick={() => setTryCount(tryCount + 1)}
            className="w-12 h-12 rounded-full bg-gray-100 text-xl font-bold hover:bg-gray-200"
          >
            +
          </button>
        </div>
      </div>

      {/* Poznámka */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {cs ? "Poznámka (volitelně)" : "Note (optional)"}
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={1000}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (cs ? "Ukládám..." : "Saving...") : (cs ? "Uložit pokus" : "Save attempt")}
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="px-4 py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          {cs ? "Zrušit" : "Cancel"}
        </button>
      </div>
    </form>
  );
}
