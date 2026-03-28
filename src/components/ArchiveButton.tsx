"use client";

export default function ArchiveButton({
  routeId,
  locale,
}: {
  routeId: string;
  locale: string;
}) {
  const cs = locale === "cs";

  async function handleArchive() {
    if (!confirm(cs ? "Archivovat tuto cestu?" : "Archive this route?")) return;
    await fetch(`/api/routes/${routeId}`, { method: "DELETE" });
    window.location.href = `/${locale}/admin/routes`;
  }

  async function handleDelete() {
    if (!confirm(cs ? "Trvale smazat tuto cestu včetně všech pokusů? Tato akce je nevratná." : "Permanently delete this route and all attempts? This cannot be undone.")) return;
    await fetch(`/api/routes/${routeId}?hard=1`, { method: "DELETE" });
    window.location.href = `/${locale}/admin/routes`;
  }

  return (
    <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-1">
          {cs ? "Archivace" : "Archive"}
        </h3>
        <p className="text-xs text-gray-500 mb-2">
          {cs
            ? "Cesta se skryje ze seznamu, statistiky zůstanou."
            : "Route is hidden from list, stats are preserved."}
        </p>
        <button
          onClick={handleArchive}
          className="text-sm text-orange-500 border border-orange-300 px-4 py-2 rounded-lg hover:bg-orange-50"
        >
          {cs ? "Archivovat cestu" : "Archive route"}
        </button>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-1">
          {cs ? "Trvalé smazání" : "Permanent delete"}
        </h3>
        <p className="text-xs text-gray-500 mb-2">
          {cs
            ? "Smaže cestu i všechny pokusy a komentáře. Nevratné."
            : "Deletes route and all attempts and comments. Irreversible."}
        </p>
        <button
          onClick={handleDelete}
          className="text-sm text-red-600 border border-red-400 px-4 py-2 rounded-lg hover:bg-red-50"
        >
          {cs ? "Trvale smazat" : "Delete permanently"}
        </button>
      </div>
    </div>
  );
}
