import { prisma } from "@/lib/prisma";
import { slugify, estimateReadingMinutes } from "@/lib/utils";
import { RSS_SOURCES, pickCategory } from "./sources";
import { fetchRss, type RawItem } from "./rss";
import { fetchGNews } from "./gnews";
import { generateArticle } from "./generate";
import { postArticleToTelegram } from "@/lib/telegram";

export type IngestSummary = {
  collected: number;
  created: number;
  skipped: number;
  failed: number;
  published: number;
};

// Ensure a dedicated "AI desk" author exists to attribute generated drafts.
async function getAiAuthor() {
  return prisma.user.upsert({
    where: { email: "ai-desk@pyatakov.media" },
    update: {},
    create: {
      email: "ai-desk@pyatakov.media",
      name: "Редакция · AI-desk",
      slug: "ai-desk",
      position: "Автоматический обозреватель",
      role: "JOURNALIST",
      isActive: true,
      bio: "Материалы, подготовленные ИИ-ботом Pyatakov Media на основе открытых источников. Требуют проверки редактором.",
    },
  });
}

async function categoryIdBySlug(slug: string, fallback = "business"): Promise<string> {
  const cat = (await prisma.category.findUnique({ where: { slug } })) ??
    (await prisma.category.findUnique({ where: { slug: fallback } }));
  if (!cat) throw new Error("No categories found — run the seeder first");
  return cat.id;
}

export async function runIngest(opts: { limitPerSource?: number; max?: number } = {}): Promise<IngestSummary> {
  // Hard caps on how many AI calls a single run can make — the main budget lever.
  const limitPerSource = opts.limitPerSource ?? (parseInt(process.env.INGEST_LIMIT_PER_SOURCE ?? "5", 10) || 5);
  const max = opts.max ?? (parseInt(process.env.INGEST_MAX ?? "20", 10) || 20);
  const autoPublish = process.env.INGEST_AUTO_PUBLISH === "true";

  // 1. Collect
  const rssBatches = await Promise.all(RSS_SOURCES.map((s) => fetchRss(s, limitPerSource)));
  const gnews = await fetchGNews(3);
  let items: RawItem[] = [...gnews, ...rssBatches.flat()];

  // newest first, cap total
  items.sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
  items = items.slice(0, max);

  const summary: IngestSummary = { collected: items.length, created: 0, skipped: 0, failed: 0, published: 0 };
  const author = await getAiAuthor();

  for (const item of items) {
    // 2. Dedup by source URL
    const seen = await prisma.ingestedItem.findUnique({ where: { sourceUrl: item.link } });
    if (seen) { summary.skipped++; continue; }

    try {
      // 3. Generate
      const gen = await generateArticle(item);
      const catSlug = pickCategory(`${item.title} ${item.description}`, item.defaultCategory);
      const categoryId = await categoryIdBySlug(catSlug);
      const slug = `${slugify(gen.title) || "material"}-${Date.now().toString(36)}`;

      // 4. Create (DRAFT by default; срочность НЕ выставляется — только вручную)
      const article = await prisma.article.create({
        data: {
          slug,
          status: autoPublish ? "PUBLISHED" : "DRAFT",
          publishedAt: autoPublish ? new Date() : null,
          title: gen.title,
          subtitle: gen.subtitle,
          excerpt: gen.excerpt,
          body: gen.body + `\n<p class="text-sm"><em>По материалам: <a href="${item.link}" rel="nofollow noopener" target="_blank">${item.source}</a></em></p>`,
          coverImage: item.image ?? null,
          coverCaption: item.image ? `Фото: ${item.source}` : null,
          readingMinutes: estimateReadingMinutes(gen.body),
          authorId: author.id,
          authorTitle: author.position,
          categoryId,
          isAiGenerated: gen.byAi,
          sourceUrl: item.link,
          sourceName: item.source,
          locale: item.locale,
          tags: gen.tags.length
            ? {
                create: await Promise.all(
                  gen.tags.map(async (tg) => {
                    const tslug = slugify(tg);
                    const tag = await prisma.tag.upsert({ where: { slug: tslug || tg }, update: {}, create: { slug: tslug || tg, title: tg } });
                    return { tagId: tag.id };
                  })
                ),
              }
            : undefined,
        },
      });

      await prisma.ingestedItem.create({
        data: { sourceUrl: item.link, source: item.source, title: gen.title, articleId: article.id, status: "created" },
      });

      summary.created++;

      // 5. If auto-published, cross-post to Telegram immediately
      if (autoPublish) {
        const posted = await postArticleToTelegram(article.id).catch(() => false);
        if (posted) summary.published++;
      }
    } catch (e) {
      summary.failed++;
      await prisma.ingestedItem.create({
        data: { sourceUrl: item.link, source: item.source, title: item.title, status: "failed", note: e instanceof Error ? e.message.slice(0, 200) : "error" },
      }).catch(() => {});
    }
  }

  return summary;
}
