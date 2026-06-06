import { prisma } from "@/lib/prisma";

// Ingestion / automation configuration, stored in SiteSetting (editable from
// the CMS at /studio/automation). Falls back to env, then to safe defaults.

export type IngestConfig = {
  enabled: boolean;
  postsPerDay: number;
  windowStart: number; // hour 0-23 (inclusive)
  windowEnd: number; // hour 0-23 (exclusive)
  intervalMinutes: number;
  autoPublish: boolean;
  timezone: string;
  model: string;
};

const KEYS = [
  "enabled", "postsPerDay", "windowStart", "windowEnd",
  "intervalMinutes", "autoPublish", "timezone", "model",
] as const;

function defaults(): IngestConfig {
  return {
    enabled: process.env.INGEST_ENABLED === "true",
    postsPerDay: parseInt(process.env.INGEST_POSTS_PER_DAY ?? "12", 10) || 12,
    windowStart: parseInt(process.env.INGEST_WINDOW_START ?? "10", 10),
    windowEnd: parseInt(process.env.INGEST_WINDOW_END ?? "22", 10),
    intervalMinutes: parseInt(process.env.INGEST_INTERVAL_MINUTES ?? "60", 10) || 60,
    autoPublish: process.env.INGEST_AUTO_PUBLISH === "true",
    timezone: process.env.INGEST_TIMEZONE || "Europe/Moscow",
    model: process.env.AITUNNEL_MODEL || "gpt-4o-mini",
  };
}

export async function getIngestConfig(): Promise<IngestConfig> {
  const base = defaults();
  try {
    const rows = await prisma.siteSetting.findMany({ where: { key: { startsWith: "ingest." } } });
    const map = Object.fromEntries(rows.map((r) => [r.key.replace("ingest.", ""), r.value]));
    return {
      enabled: map.enabled != null ? map.enabled === "true" : base.enabled,
      postsPerDay: map.postsPerDay != null ? parseInt(map.postsPerDay, 10) || base.postsPerDay : base.postsPerDay,
      windowStart: map.windowStart != null ? parseInt(map.windowStart, 10) : base.windowStart,
      windowEnd: map.windowEnd != null ? parseInt(map.windowEnd, 10) : base.windowEnd,
      intervalMinutes: map.intervalMinutes != null ? parseInt(map.intervalMinutes, 10) || base.intervalMinutes : base.intervalMinutes,
      autoPublish: map.autoPublish != null ? map.autoPublish === "true" : base.autoPublish,
      timezone: map.timezone || base.timezone,
      model: map.model || base.model,
    };
  } catch {
    return base;
  }
}

export async function saveIngestConfig(partial: Partial<IngestConfig>): Promise<void> {
  const entries = KEYS.filter((k) => partial[k] !== undefined).map((k) => ({
    key: `ingest.${k}`,
    value: String(partial[k]),
  }));
  for (const e of entries) {
    await prisma.siteSetting.upsert({ where: { key: e.key }, update: { value: e.value }, create: e });
  }
}

/** Current hour (0-23) in the configured timezone. */
export function hourInTz(tz: string, now = new Date()): number {
  const h = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hour12: false, timeZone: tz }).format(now);
  return parseInt(h, 10) % 24;
}

/** Start of "today" in the configured timezone, as a Date (UTC instant). */
export function startOfDayInTz(tz: string, now = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric", month: "2-digit", day: "2-digit", timeZone: tz,
  }).format(now); // YYYY-MM-DD
  // Interpret that local midnight. Good enough for a daily counter boundary.
  return new Date(`${parts}T00:00:00`);
}
