// Runs once when the Node server starts. Optionally launches an in-process
// scheduler for the AI ingestion bot so no external cron is required.
// Enable with INGEST_ENABLED=true; interval via INGEST_INTERVAL_MINUTES (default 60).

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.INGEST_ENABLED !== "true") return;

  const intervalMin = Math.max(15, parseInt(process.env.INGEST_INTERVAL_MINUTES ?? "60", 10) || 60);
  const intervalMs = intervalMin * 60 * 1000;

  const tick = async () => {
    try {
      const { runIngest } = await import("@/lib/ingest");
      const summary = await runIngest();
      console.log(`[ingest] ${new Date().toISOString()}`, summary);
    } catch (e) {
      console.error("[ingest] failed", e);
    }
  };

  // First run shortly after boot, then on the configured interval.
  setTimeout(tick, 30_000);
  setInterval(tick, intervalMs);
  console.log(`[ingest] scheduler enabled, every ${intervalMin} min`);
}
