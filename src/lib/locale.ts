import { cookies } from "next/headers";
import { SITE, type Locale } from "./site-config";
import { isLocale } from "./i18n";

export const LOCALE_COOKIE = "pm_locale";

/** Server-side: resolve current locale from cookie (RU default). */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  if (value && isLocale(value)) return value;
  return SITE.defaultLocale;
}

/** Pick a localized field, falling back to the RU value. */
export function pick<T extends Record<string, unknown>>(
  obj: T,
  locale: Locale
): string {
  if (locale === "en") {
    return (obj.en as string) ?? (obj.ru as string) ?? "";
  }
  return (obj.ru as string) ?? "";
}
