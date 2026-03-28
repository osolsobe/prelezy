"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Slot {
  id: string;
  code: string;
}

export default function QrPrintPage() {
  const params = useParams();
  const locale = params.locale as string;
  const cs = locale === "cs";
  const [slots, setSlots] = useState<Slot[]>([]);

  useEffect(() => {
    fetch("/api/slots")
      .then((r) => r.json())
      .then(setSlots);
  }, []);

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

      <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 print:grid-cols-5 print:gap-2">
        {slots.map((slot) => (
          <div
            key={slot.id}
            className="border border-gray-300 rounded-lg p-3 text-center print:border print:p-2 print:rounded"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/qr/${slot.code}?v=2`}
              alt={`QR ${slot.code}`}
              width={120}
              height={120}
              className="mx-auto"
            />
            <div className="font-bold text-lg mt-1">{slot.code}</div>
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
