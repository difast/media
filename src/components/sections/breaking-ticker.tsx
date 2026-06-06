import { getBreaking } from "@/lib/queries";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/site-config";
import { BreakingTickerClient } from "./breaking-ticker-client";

export async function BreakingTicker({ locale }: { locale: Locale }) {
  const items = await getBreaking(8).catch(() => []);
  if (items.length === 0) return null;

  return <BreakingTickerClient items={items} label={t(locale, "home.breaking")} />;
}
