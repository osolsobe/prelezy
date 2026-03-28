import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const host = request.headers.get("host") ?? "prelezy.vercel.app";
  const proto = host.startsWith("localhost") ? "http" : "https";
  const url = `${proto}://${host}/cs/slot/${code}`;

  const pngBuffer = await QRCode.toBuffer(url, {
    type: "png",
    width: 600,
    margin: 3,
    errorCorrectionLevel: "H",
    color: { dark: "#000000", light: "#ffffff" },
  });

  return new NextResponse(new Uint8Array(pngBuffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
