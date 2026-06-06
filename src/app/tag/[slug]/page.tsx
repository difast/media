import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/locale";
import { ArticleCard } from "@/components/article/article-card";
import { EmptyState } from "@/components/ui/empty-state";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({ where: { slug } });
  return { title: tag ? `#${tag.title}` : "Тег", alternates: { canonical: `/tag/${slug}` } };
}

export default async function TagPage({ params }: Params) {
  const { slug } = await params;
  const locale = await getLocale();
  const tag = await prisma.tag.findUnique({ where: { slug } });
  if (!tag) notFound();

  const rows = await prisma.articleTag.findMany({
    where: { tag: { slug }, article: { status: "PUBLISHED", publishedAt: { lte: new Date() } } },
    orderBy: { article: { publishedAt: "desc" } },
    take: 30,
    select: {
      article: {
        select: {
          id: true, slug: true, title: true, subtitle: true, excerpt: true,
          coverImage: true, readingMinutes: true, publishedAt: true, isBreaking: true, locale: true,
          category: { select: { slug: true, title: true, titleEn: true, kind: true } },
          author: { select: { name: true, slug: true, position: true, image: true } },
        },
      },
    },
  });
  const articles = rows.map((r) => r.article);

  return (
    <div className="container-page py-8">
      <header className="mb-8 border-b-2 border-ink-950 pb-4 dark:border-ink-100">
        <div className="kicker">{locale === "ru" ? "Тег" : "Tag"}</div>
        <h1 className="mt-1 font-serif text-4xl font-bold">#{tag.title}</h1>
      </header>
      {articles.length === 0 ? (
        <EmptyState title={locale === "ru" ? "Нет материалов по этому тегу" : "No articles for this tag"} />
      ) : (
        <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} locale={locale} variant="standard" />
          ))}
        </div>
      )}
    </div>
  );
}
