"use client";

export default function EditRouteError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div className="max-w-lg mx-auto mt-10 bg-red-50 border border-red-200 rounded-xl p-6">
      <h2 className="font-bold text-red-700 text-lg mb-2">Chyba při načítání stránky</h2>
      <p className="text-red-600 text-sm font-mono break-all">{error.message}</p>
      {error.digest && (
        <p className="text-red-400 text-xs mt-2">Digest: {error.digest}</p>
      )}
    </div>
  );
}
