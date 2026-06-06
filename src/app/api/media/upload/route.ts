import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, canWrite } from "@/lib/auth";

// Image upload for editors/journalists. Stores the file in Postgres and returns
// a stable URL (/api/media/<id>) — no external object storage required.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 6 * 1024 * 1024; // 6 MB

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !canWrite(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only images are allowed" }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Файл больше 6 МБ" }, { status: 413 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const asset = await prisma.mediaAsset.create({
    data: { type: "image", mime: file.type, bytes: file.size, data: buf, url: "" },
  });
  const url = `/api/media/${asset.id}`;
  await prisma.mediaAsset.update({ where: { id: asset.id }, data: { url } });

  return NextResponse.json({ url });
}
