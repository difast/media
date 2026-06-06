import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Serves binary media stored in the DB.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset?.data) return new Response("Not found", { status: 404 });

  return new Response(Buffer.from(asset.data), {
    headers: {
      "Content-Type": asset.mime || "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
