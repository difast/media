import Link from "next/link";
import { getBreaking } from "@/lib/queries";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/site-config";

export async function BreakingTicker({ locale }: { locale: Locale }) {
  const items = await getBreaking(8).catch(() => []);
  if (items.length === 0) return null;

  // Duplicate the list so the marquee loops seamlessly.
  const loop = [...items, ...items];

  return (
    <div className="border-y hairline bg-ink-950 text-white dark:bg-black">
      <div className="container-page flex items-center gap-3 overflow-hidden py-1.5">
        <span className="z-10 flex shrink-0 items-center gap-1.5 bg-brand px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          {t(locale, "home.breaking")}
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex w-max animate-ticker gap-8 whitespace-nowrap">
            {loop.map((item, i) => (
              <Link
                key={`${item.slug}-${i}`}
                href={`/article/${item.slug}`}
                className="text-sm text-ink-100 transition-colors hover:text-brand-300"
              >
                <span className="mr-2 text-brand-400">•</span>
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
