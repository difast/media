import type { RawItem } from "./rss";
import { GNEWS_QUERIES } from "./sources";

// GNews aggregator (free tier). No-op when GNEWS_API_KEY is not set.
export async function fetchGNews(perQuery = 3): Promise<RawItem[]> {
  const key = process.env.GNEWS_API_KEY;
  if (!key) return [];

  const out: RawItem[] = [];
  for (const { q, category } of GNEWS_QUERIES) {
    try {
      const url = new URL("https://gnews.io/api/v4/search");
      url.searchParams.set("q", q);
      url.searchParams.set("lang", "ru");
      url.searchParams.set("max", String(perQuery));
      url.searchParams.set("sortby", "publishedAt");
      url.searchParams.set("apikey", key);

      const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
      if (!res.ok) continue;
      const data = await res.json();
      for (const a of data.articles ?? []) {
        out.push({
          title: String(a.title ?? "").trim(),
          link: String(a.url ?? ""),
          description: String(a.description ?? a.content ?? "").slice(0, 1200),
          publishedAt: a.publishedAt ? new Date(a.publishedAt) : null,
          image: a.image || undefined,
          source: a.source?.name ? `GNews · ${a.source.name}` : "GNews",
          defaultCategory: category,
          locale: "ru",
        });
      }
    } catch {
      // continue with next query
    }
  }
  return out.filter((i) => i.title && i.link);
}
