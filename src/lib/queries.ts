import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";

// Common include for article cards
const cardSelect = {
  id: true,
  slug: true,
  title: true,
  subtitle: true,
  excerpt: true,
  coverImage: true,
  readingMinutes: true,
  publishedAt: true,
  isBreaking: true,
  locale: true,
  category: { select: { slug: true, title: true, titleEn: true, kind: true } },
  author: { select: { name: true, slug: true, position: true, image: true } },
} satisfies Prisma.ArticleSelect;

export type ArticleCard = Prisma.ArticleGetPayload<{ select: typeof cardSelect }>;

// IMPORTANT: must be a function — evaluating `new Date()` once at module load
// would freeze "now" at server-boot time and hide everything published later.
function publishedWhere(): Prisma.ArticleWhereInput {
  return {
    status: "PUBLISHED",
    publishedAt: { lte: new Date() },
  };
}

export async function getPublishedArticles(opts: {
  take?: number;
  skip?: number;
  categorySlug?: string;
  kind?: Prisma.EnumSectionKindFilter["equals"];
  locale?: string;
} = {}): Promise<ArticleCard[]> {
  return prisma.article.findMany({
    where: {
      ...publishedWhere(),
      ...(opts.categorySlug ? { category: { slug: opts.categorySlug } } : {}),
      ...(opts.kind ? { category: { kind: opts.kind } } : {}),
      ...(opts.locale ? { locale: opts.locale } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: opts.take ?? 12,
    skip: opts.skip ?? 0,
    select: cardSelect,
  });
}

export async function getFeatured(take = 5): Promise<ArticleCard[]> {
  return prisma.article.findMany({
    where: { ...publishedWhere(), isFeatured: true },
    orderBy: { publishedAt: "desc" },
    take,
    select: cardSelect,
  });
}

export async function getBreaking(take = 8) {
  return prisma.article.findMany({
    where: { ...publishedWhere(), isBreaking: true },
    orderBy: { publishedAt: "desc" },
    take,
    select: { slug: true, title: true },
  });
}

export async function getPopular(take = 6): Promise<ArticleCard[]> {
  return prisma.article.findMany({
    where: publishedWhere(),
    orderBy: [{ viewCount: "desc" }, { publishedAt: "desc" }],
    take,
    select: cardSelect,
  });
}

export async function getEditorPicks(take = 4): Promise<ArticleCard[]> {
  return prisma.article.findMany({
    where: { ...publishedWhere(), isEditorPick: true },
    orderBy: { publishedAt: "desc" },
    take,
    select: cardSelect,
  });
}

export async function getLatestInterviews(take = 3): Promise<ArticleCard[]> {
  return prisma.article.findMany({
    where: { ...publishedWhere(), category: { kind: "INTERVIEW" } },
    orderBy: { publishedAt: "desc" },
    take,
    select: cardSelect,
  });
}

export async function getTrendingTags(take = 10) {
  const tags = await prisma.tag.findMany({
    take,
    orderBy: { articles: { _count: "desc" } },
    select: { slug: true, title: true, _count: { select: { articles: true } } },
  });
  return tags.filter((tg) => tg._count.articles > 0);
}

export async function getArticleBySlug(slug: string) {
  return prisma.article.findFirst({
    where: { slug, ...publishedWhere() },
    include: {
      category: true,
      author: true,
      tags: { include: { tag: true } },
      interview: true,
      podcast: true,
    },
  });
}

export async function incrementViews(id: string) {
  await prisma.article.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => {});
}

export async function getRelated(articleId: string, categoryId: string, take = 4) {
  return prisma.article.findMany({
    where: { ...publishedWhere(), categoryId, NOT: { id: articleId } },
    orderBy: { publishedAt: "desc" },
    take,
    select: cardSelect,
  });
}

export async function countPublished(categorySlug?: string) {
  return prisma.article.count({
    where: { ...publishedWhere(), ...(categorySlug ? { category: { slug: categorySlug } } : {}) },
  });
}
