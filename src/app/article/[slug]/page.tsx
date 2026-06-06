import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getArticleBySlug, getRelated, incrementViews } from "@/lib/queries";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";
import { formatDateTime, absoluteUrl } from "@/lib/utils";
import { ArticleCard } from "@/components/article/article-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { InterviewBlock } from "@/components/article/interview-block";
import { PodcastBlock } from "@/components/article/podcast-block";
import { CommentsSection } from "@/components/article/comments-section";
import { ShareBar } from "@/components/article/share-bar";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Материал не найден" };

  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.excerpt || article.subtitle || undefined;
  const ogImage = article.ogImage || article.coverImage || undefined;
  const url = absoluteUrl(`/article/${article.slug}`);

  return {
    title,
    description,
    alternates: { canonical: article.canonicalUrl || url },
    robots: article.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      title: article.ogTitle || title,
      description: article.ogDescription || description,
      url,
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: article.author?.name ? [article.author.name] : undefined,
      section: article.category?.title,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.ogTitle || title,
      description: article.ogDescription || description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const locale = await getLocale();
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  // Fire-and-forget view counter (don't await on render path semantics)
  void incrementViews(article.id);

  const related = await getRelated(article.id, article.categoryId, 4);
  const cat = article.category;
  const catTitle = locale === "en" ? cat.titleEn ?? cat.title : cat.title;
  const sources = (article.sources as { title: string; url: string }[] | null) ?? [];
  const footnotes = (article.footnotes as { marker: string; text: string }[] | null) ?? [];

  // JSON-LD structured data (Google / Yandex / Bing rich results)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": article.interview ? "Article" : "NewsArticle",
    headline: article.title,
    description: article.excerpt || article.subtitle,
    image: article.coverImage ? [article.coverImage] : undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: article.author?.name
      ? { "@type": "Person", name: article.author.name, jobTitle: article.authorTitle }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "Pyatakov Media",
      logo: { "@type": "ImageObject", url: absoluteUrl("/icons/icon.svg") },
    },
    mainEntityOfPage: absoluteUrl(`/article/${article.slug}`),
    articleSection: catTitle,
  };

  return (
    <article className="container-page py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-3xl">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-2 text-xs text-ink-400">
          <Link href="/" className="hover:text-brand-600">Главная</Link>
          <span>/</span>
          <Link href={`/section/${cat.slug}`} className="kicker">{catTitle}</Link>
        </nav>

        <h1 className="font-serif text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          {article.title}
        </h1>
        {article.subtitle && (
          <p className="mt-4 font-serif text-xl text-ink-600 dark:text-ink-300">{article.subtitle}</p>
        )}

        {/* Byline */}
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-y hairline py-3 text-sm">
          {article.author && (
            <div className="flex items-center gap-2">
              {article.author.image && (
                <Image src={article.author.image} alt="" width={36} height={36} className="rounded-full object-cover" />
              )}
              <div className="leading-tight">
                <Link
                  href={article.author.slug ? `/author/${article.author.slug}` : "#"}
                  className="font-semibold headline-hover"
                >
                  {article.author.name}
                </Link>
                {article.authorTitle && <div className="text-xs text-ink-400">{article.authorTitle}</div>}
              </div>
            </div>
          )}
          <div className="ml-auto flex items-center gap-3 text-ink-400">
            {article.publishedAt && <time>{formatDateTime(article.publishedAt, locale)}</time>}
            {article.readingMinutes ? (
              <span>· {article.readingMinutes} {t(locale, "article.minutes")}</span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Cover */}
      {article.coverImage && (
        <figure className="mx-auto mt-6 max-w-4xl">
          <div className="relative aspect-[16/9] overflow-hidden rounded-sm bg-ink-100 dark:bg-ink-800">
            <Image src={article.coverImage} alt={article.title} fill sizes="(max-width:1024px) 100vw, 896px" className="object-cover" priority />
          </div>
          {article.coverCaption && (
            <figcaption className="mt-2 text-xs text-ink-400">{article.coverCaption}</figcaption>
          )}
        </figure>
      )}

      <div className="mx-auto mt-8 max-w-3xl">
        <ShareBar title={article.title} url={absoluteUrl(`/article/${article.slug}`)} label={t(locale, "article.share")} />

        {/* Podcast / interview extensions */}
        {article.podcast && <PodcastBlock podcast={article.podcast} locale={locale} />}

        {/* Body */}
        <div className="prose-editorial mt-8" dangerouslySetInnerHTML={{ __html: article.body }} />

        {/* Video embed */}
        {article.videoUrl && !article.interview && (
          <div className="mt-8 aspect-video overflow-hidden rounded-sm">
            <iframe src={article.videoUrl} title={article.title} allowFullScreen className="h-full w-full" />
          </div>
        )}

        {/* Interview extension */}
        {article.interview && <InterviewBlock interview={article.interview} locale={locale} />}

        {/* Footnotes */}
        {footnotes.length > 0 && (
          <section className="mt-10 border-t hairline pt-4">
            <h3 className="kicker mb-2">{t(locale, "article.footnotes")}</h3>
            <ol className="space-y-1 text-sm text-ink-500">
              {footnotes.map((f, i) => (
                <li key={i}><sup>{f.marker || i + 1}</sup> {f.text}</li>
              ))}
            </ol>
          </section>
        )}

        {/* Sources */}
        {sources.length > 0 && (
          <section className="mt-8 rounded-sm border hairline bg-ink-50 p-4 dark:bg-ink-900/40">
            <h3 className="kicker mb-2">{t(locale, "article.sources")}</h3>
            <ul className="space-y-1 text-sm">
              {sources.map((s, i) => (
                <li key={i}>
                  <a href={s.url} target="_blank" rel="noreferrer noopener" className="text-brand-600 hover:underline">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Tags */}
        {article.tags.length > 0 && (
          <section className="mt-8">
            <h3 className="kicker mb-2">{t(locale, "article.tags")}</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map(({ tag }) => (
                <Link key={tag.id} href={`/tag/${tag.slug}`} className="rounded-full border hairline px-3 py-1 text-sm hover:border-brand hover:text-brand-600">
                  #{tag.title}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Comments */}
        <CommentsSection articleId={article.id} locale={locale} />
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <SectionHeading title={t(locale, "article.related")} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} locale={locale} variant="standard" />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
