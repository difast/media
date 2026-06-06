import { format } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import type { Locale } from "./site-config";

/** Estimate reading time in minutes from raw text/HTML. */
export function estimateReadingMinutes(text: string): number {
  const words = text.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

/** Transliterate + slugify (supports Cyrillic). */
export function slugify(input: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
    з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
    ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  return input
    .toLowerCase()
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

export function formatDate(date: Date | string, locale: Locale = "ru"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "d MMMM yyyy", { locale: locale === "ru" ? ru : enUS });
}

/** Format a date in a specific timezone (default Europe/Moscow) — for the live header date. */
export function formatDateTz(
  date: Date | string,
  locale: Locale = "ru",
  timeZone = "Europe/Moscow"
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  }).format(d);
}

export function formatDateTime(date: Date | string, locale: Locale = "ru"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "d MMMM yyyy, HH:mm", { locale: locale === "ru" ? ru : enUS });
}

/** Tailwind class merge helper (no clsx dependency). */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}
