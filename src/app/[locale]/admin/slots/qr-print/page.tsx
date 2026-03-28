import { prisma } from "@/lib/prisma";

export default async function QrPrintPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cs = locale === "cs";

  const wall = await prisma.wall.findFirst();
  const slots = await prisma.slot.findMany({
    where: wall ? { wallId: wall.id } : {},
    orderBy: { code: "asc" },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div>
      <div className="print:hidden flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">
          {cs ? "Tisk QR kódů" : "Print QR Codes"}
        </h1>
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          🖨️ {cs ? "Tisknout" : "Print"}
        </button>
      </div>

      <p className="print:hidden text-sm text-gray-500 mb-6">
        {cs
          ? "Každý QR kód odkazuje na URL slotu. Vytiskněte a nalepte/zaminujte na stěnu."
          : "Each QR code links to the slot URL. Print and laminate on the wall."}
      </p>

      {/* Mriežka QR kódov — optimalizovaná pre tlač */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 print:grid-cols-5 print:gap-2">
        {slots.map((slot) => (
          <div
            key={slot.id}
            className="border border-gray-300 rounded-lg p-3 text-center print:border print:p-2 print:rounded"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/qr/${slot.code}`}
              alt={`QR ${slot.code}`}
              width={120}
              height={120}
              className="mx-auto"
            />
            <div className="font-bold text-lg mt-1">{slot.code}</div>
            <div className="text-xs text-gray-400 break-all">
              {baseUrl}/slot/{slot.code}
            </div>
          </div>
        ))}
      </div>

      {slots.length === 0 && (
        <p className="text-gray-400 text-center py-12">
          {cs ? "Žádné sloty k tisku." : "No slots to print."}
        </p>
      )}

      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { margin: 0; }
          nav { display: none !important; }
          main { max-width: 100% !important; padding: 0.5cm !important; }
        }
      `}</style>
    </div>
  );
}
