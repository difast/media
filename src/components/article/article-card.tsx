import Link from "next/link";
import Image from "next/image";
import type { ArticleCard as ArticleCardData } from "@/lib/queries";
import type { Locale } from "@/lib/site-config";
import { pick } from "@/lib/locale";
import { formatDate, cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

type Variant = "hero" | "lead" | "standard" | "compact" | "headline";

function categoryLabel(
  cat: { title: string; titleEn: string | null },
  locale: Locale
) {
  return locale === "en" ? cat.titleEn ?? cat.title : cat.title;
}

export function ArticleCard({
  article,
  locale,
  variant = "standard",
}: {
  article: ArticleCardData;
  locale: Locale;
  variant?: Variant;
}) {
  const href = `/article/${article.slug}`;
  const cat = article.category;
  const date = article.publishedAt ? formatDate(article.publishedAt, locale) : "";

  if (variant === "headline") {
    return (
      <article className="border-b hairline py-3 first:pt-0">
        <Link href={`/section/${cat.slug}`} className="kicker">
          {categoryLabel(cat, locale)}
        </Link>
        <h3 className="mt-1">
          <Link href={href} className="font-serif text-base font-semibold leading-snug headline-hover">
            {article.title}
          </Link>
        </h3>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="flex gap-3 border-b hairline py-3">
        {article.coverImage && (
          <Link href={href} className="relative h-16 w-24 shrink-0 overflow-hidden rounded-sm bg-ink-100 dark:bg-ink-800">
            <Image src={article.coverImage} alt="" fill sizes="96px" className="object-cover" />
          </Link>
        )}
        <div className="min-w-0">
          <Link href={`/section/${cat.slug}`} className="kicker">{categoryLabel(cat, locale)}</Link>
          <h3 className="mt-0.5">
            <Link href={href} className="line-clamp-3 text-sm font-semibold leading-snug headline-hover">
              {article.title}
            </Link>
          </h3>
        </div>
      </article>
    );
  }

  const isHero = variant === "hero";
  const isLead = variant === "lead";

  return (
    <article className={cn("group flex flex-col", isHero && "gap-3")}>
      {article.coverImage && (
        <Link
          href={href}
          className={cn(
            "relative block overflow-hidden rounded-sm bg-ink-100 dark:bg-ink-800",
            isHero ? "aspect-[16/9]" : isLead ? "aspect-[16/10]" : "aspect-[3/2]"
          )}
        >
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            sizes={isHero ? "(max-width:1024px) 100vw, 66vw" : "(max-width:768px) 100vw, 33vw"}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            priority={isHero}
          />
        </Link>
      )}
      <div className={cn("flex flex-col", article.coverImage && "mt-3")}>
        <Link href={`/section/${cat.slug}`} className="kicker">
          {categoryLabel(cat, locale)}
        </Link>
        <h2 className="mt-1.5">
          <Link
            href={href}
            className={cn(
              "font-serif font-bold leading-tight headline-hover",
              isHero ? "text-3xl sm:text-4xl" : isLead ? "text-2xl" : "text-lg"
            )}
          >
            {article.title}
          </Link>
        </h2>
        {(isHero || isLead) && (article.subtitle || article.excerpt) && (
          <p className="mt-2 line-clamp-3 text-ink-600 dark:text-ink-300">
            {article.subtitle || article.excerpt}
          </p>
        )}
        <div className="mt-2 flex items-center gap-2 text-xs text-ink-400">
          {article.author?.name && <span>{article.author.name}</span>}
          {article.author?.name && date && <span>·</span>}
          {date && <time>{date}</time>}
          {article.readingMinutes ? (
            <>
              <span>·</span>
              <span>{article.readingMinutes} {t(locale, "article.minutes")}</span>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}
