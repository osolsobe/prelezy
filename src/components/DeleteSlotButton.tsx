"use client";

export default function DeleteSlotButton({
  slotCode,
  locale,
}: {
  slotCode: string;
  locale: string;
}) {
  const cs = locale === "cs";

  async function handleDelete() {
    if (!confirm(cs ? `Smazat slot ${slotCode} včetně přiřazení? Pokusy zůstanou zachovány.` : `Delete slot ${slotCode} and its assignments? Attempts are preserved.`)) return;
    const res = await fetch(`/api/slots/${slotCode}`, { method: "DELETE" });
    if (res.ok) window.location.reload();
  }

  return (
    <button
      onClick={handleDelete}
      className="text-xs border border-red-300 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50"
    >
      {cs ? "Smazat" : "Delete"}
    </button>
  );
}
