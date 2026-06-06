import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/locale";
import { ArticleCard } from "@/components/article/article-card";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const author = await prisma.user.findUnique({ where: { slug } });
  return { title: author?.name ?? "Автор", alternates: { canonical: `/author/${slug}` } };
}

export default async function AuthorPage({ params }: Params) {
  const { slug } = await params;
  const locale = await getLocale();
  const author = await prisma.user.findUnique({ where: { slug } });
  if (!author) notFound();

  const articles = await prisma.article.findMany({
    where: { authorId: author.id, status: "PUBLISHED", publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    take: 24,
    select: {
      id: true, slug: true, title: true, subtitle: true, excerpt: true,
      coverImage: true, readingMinutes: true, publishedAt: true, isBreaking: true, locale: true,
      category: { select: { slug: true, title: true, titleEn: true, kind: true } },
      author: { select: { name: true, slug: true, position: true, image: true } },
    },
  });

  return (
    <div className="container-page py-8">
      <header className="mb-8 flex items-center gap-4 border-b-2 border-ink-950 pb-6 dark:border-ink-100">
        {author.image && (
          <Image src={author.image} alt={author.name ?? ""} width={80} height={80} className="h-20 w-20 rounded-full object-cover" />
        )}
        <div>
          <h1 className="font-serif text-3xl font-bold">{author.name}</h1>
          {author.position && <p className="text-ink-500">{author.position}</p>}
          {author.bio && <p className="mt-2 max-w-2xl text-sm text-ink-600 dark:text-ink-300">{author.bio}</p>}
        </div>
      </header>
      <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <ArticleCard key={a.id} article={a} locale={locale} variant="standard" />
        ))}
      </div>
    </div>
  );
}
