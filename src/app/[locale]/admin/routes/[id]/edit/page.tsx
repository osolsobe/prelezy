import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RouteForm from "@/components/RouteForm";

export default async function EditRoutePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const cs = locale === "cs";

  const route = await prisma.route.findUnique({ where: { id } });
  if (!route) notFound();

  const wall = await prisma.wall.findFirst();
  if (!wall) notFound();

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-6">
        {cs ? "Upravit cestu" : "Edit Route"}: {route.name}
      </h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <RouteForm
          locale={locale}
          wallId={wall.id}
          initialData={{
            id: route.id,
            name: route.name,
            sector: route.sector,
            color: route.color,
            grade: route.grade,
            setDate: route.setDate.toISOString(),
            description: route.description,
            photoUrl: route.photoUrl,
          }}
        />
      </div>

      {/* Archivovanie */}
      {!route.archived && (
        <ArchiveButton routeId={id} locale={locale} />
      )}
    </div>
  );
}

function ArchiveButton({ routeId, locale }: { routeId: string; locale: string }) {
  const cs = locale === "cs";
  return (
    <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">
        {cs ? "Archivace" : "Archive"}
      </h3>
      <p className="text-xs text-gray-500 mb-3">
        {cs
          ? "Archivovaná cesta se nebude zobrazovat v aktivním seznamu, ale statistiky zůstanou zachovány."
          : "Archived routes won't appear in the active list, but statistics are preserved."}
      </p>
      <form
        action={`/api/routes/${routeId}`}
        method="DELETE"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!confirm(cs ? "Archivovat tuto cestu?" : "Archive this route?")) return;
          await fetch(`/api/routes/${routeId}`, { method: "DELETE" });
          window.location.href = `/${locale}/admin/routes`;
        }}
      >
        <button
          type="submit"
          className="text-sm text-red-500 border border-red-300 px-4 py-2 rounded-lg hover:bg-red-50"
        >
          {cs ? "Archivovat cestu" : "Archive route"}
        </button>
      </form>
    </div>
  );
}
