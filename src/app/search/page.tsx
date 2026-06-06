import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/locale";
import { ArticleCard } from "@/components/article/article-card";
import { SearchBox } from "@/components/ui/search-box";

export const metadata: Metadata = { title: "Поиск", robots: { index: false } };

type Params = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Params) {
  const { q } = await searchParams;
  const locale = await getLocale();
  const query = (q ?? "").trim();

  const articles = query
    ? await prisma.article.findMany({
        where: {
          status: "PUBLISHED",
          publishedAt: { lte: new Date() },
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { subtitle: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
            { body: { contains: query, mode: "insensitive" } },
          ],
        },
        orderBy: { publishedAt: "desc" },
        take: 30,
        select: {
          id: true, slug: true, title: true, subtitle: true, excerpt: true,
          coverImage: true, readingMinutes: true, publishedAt: true, isBreaking: true, locale: true,
          category: { select: { slug: true, title: true, titleEn: true, kind: true } },
          author: { select: { name: true, slug: true, position: true, image: true } },
        },
      })
    : [];

  return (
    <div className="container-page py-8">
      <h1 className="font-serif text-3xl font-bold">{locale === "ru" ? "Поиск по сайту" : "Search"}</h1>
      <div className="mt-4 max-w-xl">
        <SearchBox defaultValue={query} placeholder={locale === "ru" ? "Введите запрос…" : "Type your query…"} />
      </div>

      {query && (
        <p className="mt-6 text-sm text-ink-500">
          {locale === "ru" ? "Найдено" : "Found"}: {articles.length}
        </p>
      )}

      <div className="mt-6 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <ArticleCard key={a.id} article={a} locale={locale} variant="standard" />
        ))}
      </div>
    </div>
  );
}
