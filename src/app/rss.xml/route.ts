import { prisma } from "@/lib/prisma";
import { SITE } from "@/lib/site-config";

export const revalidate = 600;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  let articles: Awaited<ReturnType<typeof fetchArticles>> = [];
  try {
    articles = await fetchArticles();
  } catch {
    /* DB unavailable */
  }

  const items = articles
    .map((a) => {
      const url = `${SITE.url}/article/${a.slug}`;
      return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(a.excerpt ?? a.subtitle ?? "")}</description>
      ${a.category ? `<category>${escapeXml(a.category.title)}</category>` : ""}
      ${a.author?.name ? `<author>${escapeXml(a.author.name)}</author>` : ""}
      <pubDate>${a.publishedAt?.toUTCString() ?? new Date().toUTCString()}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.name)}</title>
    <link>${SITE.url}</link>
    <atom:link href="${SITE.url}/rss.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(SITE.description.ru)}</description>
    <language>ru</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=600",
    },
  });
}

function fetchArticles() {
  return prisma.article.findMany({
    where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    take: 50,
    select: {
      slug: true, title: true, excerpt: true, subtitle: true, publishedAt: true,
      category: { select: { title: true } },
      author: { select: { name: true } },
    },
  });
}
