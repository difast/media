import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { runIngest } from "@/lib/ingest";

// AI ingestion trigger. Call on a schedule (Railway Cron / cron-job.org) or
// manually from the CMS. Protected by CRON_SECRET (falls back to AUTH_SECRET).
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

async function handle(req: Request) {
  const secret = process.env.CRON_SECRET || process.env.AUTH_SECRET;
  const token = new URL(req.url).searchParams.get("token") ?? req.headers.get("x-cron-token");

  if (!secret) return NextResponse.json({ error: "Secret not configured" }, { status: 500 });
  if (token !== secret) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const summary = await runIngest({ trigger: "scheduler" });
    if (summary.published > 0 || summary.created > 0) {
      revalidatePath("/");
      revalidatePath("/section/news");
    }
    return NextResponse.json({ ok: true, ...summary });
  } catch (e) {
    return NextResponse.json(
      { error: "Ingest failed", detail: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

export const GET = handle;
export const POST = handle;
