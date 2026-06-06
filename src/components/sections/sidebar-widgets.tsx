import Link from "next/link";
import type { Locale } from "@/lib/site-config";
import { t } from "@/lib/i18n";
import type { ArticleCard } from "@/lib/queries";
import { SectionHeading } from "@/components/ui/section-heading";

export function PopularList({
  articles,
  locale,
}: {
  articles: ArticleCard[];
  locale: Locale;
}) {
  if (articles.length === 0) return null;
  return (
    <section>
      <SectionHeading title={t(locale, "home.popular")} />
      <ol className="space-y-3">
        {articles.map((a, i) => (
          <li key={a.id} className="flex gap-3 border-b hairline pb-3">
            <span className="font-serif text-2xl font-bold leading-none text-brand-600/80">
              {String(i + 1).padStart(2, "0")}
            </span>
            <Link
              href={`/article/${a.slug}`}
              className="text-sm font-semibold leading-snug headline-hover"
            >
              {a.title}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function TrendsWidget({
  tags,
  locale,
}: {
  tags: { slug: string; title: string }[];
  locale: Locale;
}) {
  if (tags.length === 0) return null;
  return (
    <section>
      <SectionHeading title={t(locale, "home.trends")} />
      <div className="flex flex-wrap gap-2">
        {tags.map((tg) => (
          <Link
            key={tg.slug}
            href={`/tag/${tg.slug}`}
            className="rounded-full border hairline px-3 py-1 text-sm text-ink-700 transition-colors hover:border-brand hover:text-brand-600 dark:text-ink-300"
          >
            #{tg.title}
          </Link>
        ))}
      </div>
    </section>
  );
}

export function ReadingNowWidget({
  articles,
  locale,
}: {
  articles: ArticleCard[];
  locale: Locale;
}) {
  if (articles.length === 0) return null;
  return (
    <section>
      <SectionHeading title={t(locale, "home.readingNow")} />
      <ul className="space-y-3">
        {articles.map((a) => (
          <li key={a.id} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
            <Link href={`/article/${a.slug}`} className="text-sm leading-snug headline-hover">
              {a.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
