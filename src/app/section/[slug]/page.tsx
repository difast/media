import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getPublishedArticles, countPublished } from "@/lib/queries";
import { getLocale } from "@/lib/locale";
import { sectionBySlug, SITE } from "@/lib/site-config";
import { pick } from "@/lib/locale";
import { ArticleCard } from "@/components/article/article-card";
import { EmptyState } from "@/components/ui/empty-state";

type Params = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> };

const PAGE_SIZE = 12;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const section = sectionBySlug(slug);
  const cat = await prisma.category.findUnique({ where: { slug } });
  const title = section ? section.title.ru : cat?.title ?? slug;
  return {
    title,
    description: cat?.description || `${title} — ${SITE.name}`,
    alternates: { canonical: `/section/${slug}` },
  };
}

export default async function SectionPage({ params, searchParams }: Params) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const locale = await getLocale();

  const cat = await prisma.category.findUnique({ where: { slug } });
  const section = sectionBySlug(slug);
  if (!cat && !section) notFound();

  const title = section ? pick(section.title, locale) : cat?.title ?? slug;

  // "Новости" is the global feed — every published material appears here,
  // regardless of its own category. Other sections filter by their category.
  const isNewsFeed = slug === "news";
  const filterSlug = isNewsFeed ? undefined : slug;

  const [articles, total] = await Promise.all([
    getPublishedArticles({ categorySlug: filterSlug, take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE }),
    countPublished(filterSlug),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="container-page py-8">
      <header className="mb-8 border-b-2 border-ink-950 pb-4 dark:border-ink-100">
        <div className="kicker">{SITE.name}</div>
        <h1 className="mt-1 font-serif text-4xl font-bold tracking-tight">{title}</h1>
        {cat?.description && <p className="mt-2 max-w-2xl text-ink-500">{cat.description}</p>}
      </header>

      {articles.length === 0 ? (
        <EmptyState title={locale === "ru" ? "В этом разделе пока нет материалов" : "No articles in this section yet"} />
      ) : (
        <>
          {/* Lead story */}
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ArticleCard article={articles[0]} locale={locale} variant="lead" />
            </div>
            <div className="space-y-0">
              {articles.slice(1, 5).map((a) => (
                <ArticleCard key={a.id} article={a} locale={locale} variant="headline" />
              ))}
            </div>
          </div>

          {articles.length > 5 && (
            <div className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {articles.slice(5).map((a) => (
                <ArticleCard key={a.id} article={a} locale={locale} variant="standard" />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-12 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/section/${slug}?page=${p}`}
                  className={
                    "h-9 w-9 rounded-md text-center text-sm leading-9 " +
                    (p === page
                      ? "bg-ink-950 text-white dark:bg-white dark:text-ink-950"
                      : "border hairline hover:border-brand")
                  }
                >
                  {p}
                </Link>
              ))}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
