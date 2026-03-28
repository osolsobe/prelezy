"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { GRADES } from "@/lib/grades";
import Image from "next/image";

interface RouteFormProps {
  locale: string;
  wallId: string;
  initialData?: {
    id: string;
    name: string;
    sector: string | null;
    color: string;
    grade: string;
    setDate: string;
    description: string | null;
    photoUrl: string | null;
  };
}

export default function RouteForm({ locale, wallId, initialData }: RouteFormProps) {
  const router = useRouter();
  const cs = locale === "cs";
  const isEdit = !!initialData;
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialData?.name ?? "");
  const [sector, setSector] = useState(initialData?.sector ?? "");
  const [color, setColor] = useState(initialData?.color ?? "");
  const [grade, setGrade] = useState(initialData?.grade ?? "6a");
  const [setDate, setSetDate] = useState(
    initialData?.setDate
      ? initialData.setDate.slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  );
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [photoUrl, setPhotoUrl] = useState(initialData?.photoUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    setUploading(false);

    if (res.ok) {
      const data = await res.json();
      setPhotoUrl(data.url);
    } else {
      setError(cs ? "Chyba při nahrávání fotografie" : "Photo upload failed");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const body = { wallId, name, sector, color, grade, setDate, description, photoUrl };

    const res = isEdit
      ? await fetch(`/api/routes/${initialData!.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      : await fetch("/api/routes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

    setLoading(false);

    if (res.ok) {
      router.push(`/${locale}/admin/routes`);
      router.refresh();
    } else {
      setError(cs ? "Chyba při ukládání" : "Save failed");
    }
  }

  const COLORS = [
    { value: "červená", label: cs ? "Červená" : "Red", hex: "#ef4444" },
    { value: "modrá", label: cs ? "Modrá" : "Blue", hex: "#3b82f6" },
    { value: "zelená", label: cs ? "Zelená" : "Green", hex: "#22c55e" },
    { value: "žltá", label: cs ? "Žlutá" : "Yellow", hex: "#eab308" },
    { value: "čierna", label: cs ? "Černá" : "Black", hex: "#1f2937" },
    { value: "biela", label: cs ? "Bílá" : "White", hex: "#e5e7eb" },
    { value: "oranžová", label: cs ? "Oranžová" : "Orange", hex: "#f97316" },
    { value: "fialová", label: cs ? "Fialová" : "Purple", hex: "#a855f7" },
    { value: "ružová", label: cs ? "Růžová" : "Pink", hex: "#ec4899" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {cs ? "Název cesty" : "Route name"} *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {cs ? "Sektor" : "Sector"}
          </label>
          <input
            type="text"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            placeholder="A, B, C..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {cs ? "Obtížnost" : "Grade"} *
          </label>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {GRADES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {cs ? "Barva chytů" : "Hold color"} *
        </label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border-2 transition-colors ${
                color === c.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: c.hex }}
              />
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {cs ? "Datum osazení" : "Set date"} *
        </label>
        <input
          type="date"
          value={setDate}
          onChange={(e) => setSetDate(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {cs ? "Popis / poznámky" : "Description / notes"}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Foto upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {cs ? "Fotografie" : "Photo"}
        </label>
        {photoUrl && (
          <div className="relative w-full h-40 rounded-lg overflow-hidden mb-2">
            <Image src={photoUrl} alt="Route photo" fill className="object-cover" />
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="border border-dashed border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 w-full"
        >
          {uploading
            ? cs ? "Nahrávám..." : "Uploading..."
            : cs ? "📷 Nahrát fotografii" : "📷 Upload photo"}
        </button>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading || !color}
          className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading
            ? cs ? "Ukládám..." : "Saving..."
            : isEdit
              ? cs ? "Uložit změny" : "Save changes"
              : cs ? "Vytvořit cestu" : "Create route"}
        </button>
        <a
          href={`/${locale}/admin/routes`}
          className="px-4 py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          {cs ? "Zrušit" : "Cancel"}
        </a>
      </div>
    </form>
  );
}
