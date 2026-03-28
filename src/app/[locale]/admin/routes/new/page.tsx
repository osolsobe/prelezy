import { prisma } from "@/lib/prisma";
import RouteForm from "@/components/RouteForm";

export default async function NewRoutePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cs = locale === "cs";

  const wall = await prisma.wall.findFirst();
  if (!wall) {
    return <p className="text-red-500">Nejdříve vytvořte stěnu v databázi.</p>;
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-6">
        {cs ? "Nová cesta" : "New Route"}
      </h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <RouteForm locale={locale} wallId={wall.id} />
      </div>
    </div>
  );
}
