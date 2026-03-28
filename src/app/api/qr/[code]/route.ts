import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? `https://${request.headers.get("host")}`;
  const url = `${baseUrl}/slot/${code}`;

  const pngBuffer = await QRCode.toBuffer(url, {
    type: "png",
    width: 300,
    margin: 2,
    color: { dark: "#1f2937", light: "#ffffff" },
  });

  return new NextResponse(new Uint8Array(pngBuffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
