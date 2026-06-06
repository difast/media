import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seed";

// One-time (idempotent) database seeding endpoint for production bootstrap.
// Protected by a token that must equal AUTH_SECRET. Safe to call repeatedly —
// all operations are upserts / existence-checked inserts.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function handle(req: Request) {
  const secret = process.env.AUTH_SECRET;
  const token = new URL(req.url).searchParams.get("token");

  if (!secret) {
    return NextResponse.json({ error: "AUTH_SECRET is not configured" }, { status: 500 });
  }
  if (!token || token !== secret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const result = await seedDatabase();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      { error: "Seeding failed", detail: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

export const GET = handle;
export const POST = handle;
