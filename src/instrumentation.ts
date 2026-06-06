// Runs once when the Node server starts. Launches an in-process scheduler for
// the AI ingestion bot. All behaviour (on/off, frequency, time window, daily
// limit) is read from the DB config on every tick, so changes made in the CMS
// (/studio/automation) take effect WITHOUT a redeploy.

let lastRunAt = 0;

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  // Hard kill-switch via env (optional). If set to "false" the scheduler never starts.
  if (process.env.INGEST_SCHEDULER === "false") return;

  const TICK_MS = 5 * 60 * 1000; // evaluate every 5 minutes

  const tick = async () => {
    try {
      const { getIngestConfig } = await import("@/lib/ingest/config");
      const cfg = await getIngestConfig();
      if (!cfg.enabled) return;

      // Respect the configured frequency between actual runs.
      const sinceMin = (Date.now() - lastRunAt) / 60000;
      if (sinceMin < cfg.intervalMinutes) return;

      const { runIngest } = await import("@/lib/ingest");
      const summary = await runIngest({ trigger: "scheduler" });
      // Only advance the clock when a run actually did work in-window.
      if (!summary.note?.startsWith("outside window")) lastRunAt = Date.now();
      console.log(`[ingest] ${new Date().toISOString()}`, summary);
    } catch (e) {
      console.error("[ingest] tick failed", e);
    }
  };

  setTimeout(tick, 30_000); // first evaluation shortly after boot
  setInterval(tick, TICK_MS);
  console.log("[ingest] scheduler active (config-driven, evaluated every 5 min)");
}
