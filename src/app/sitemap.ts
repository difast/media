import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SECTIONS, INFO_PAGES, LEGAL_PAGES, SITE } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/archive`, changeFrequency: "daily", priority: 0.6 },
    ...SECTIONS.map((s) => ({
      url: `${base}/section/${s.slug}`,
      changeFrequency: "hourly" as const,
      priority: 0.8,
    })),
    ...INFO_PAGES.map((p) => ({ url: `${base}/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.4 })),
    ...LEGAL_PAGES.map((p) => ({ url: `${base}/legal/${p.slug}`, changeFrequency: "yearly" as const, priority: 0.2 })),
  ];

  let articles: { slug: string; updatedAt: Date }[] = [];
  let tags: { slug: string }[] = [];
  try {
    [articles, tags] = await Promise.all([
      prisma.article.findMany({
        where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
        select: { slug: true, updatedAt: true },
        take: 5000,
        orderBy: { publishedAt: "desc" },
      }),
      prisma.tag.findMany({ select: { slug: true }, take: 1000 }),
    ]);
  } catch {
    // DB unavailable at build — return static routes only.
  }

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${base}/article/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
  const tagRoutes: MetadataRoute.Sitemap = tags.map((t) => ({
    url: `${base}/tag/${t.slug}`,
    changeFrequency: "weekly",
    priority: 0.3,
  }));

  return [...staticRoutes, ...articleRoutes, ...tagRoutes];
}
