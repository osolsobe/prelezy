import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RouteForm from "@/components/RouteForm";
import ArchiveButton from "@/components/ArchiveButton";

export default async function EditRoutePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id: rawId } = await params;
  // decodeURIComponent handles both %2B and literal + in URL
  const id = decodeURIComponent(rawId);
  const cs = locale === "cs";

  let route;
  let wall;
  try {
    [route, wall] = await Promise.all([
      prisma.route.findUnique({ where: { id } }),
      prisma.wall.findFirst(),
    ]);
  } catch (e) {
    console.error("Edit page DB error:", e);
    throw e;
  }

  if (!route || !wall) notFound();

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

      {!route.archived && (
        <ArchiveButton routeId={route.id} locale={locale} />
      )}
    </div>
  );
}
