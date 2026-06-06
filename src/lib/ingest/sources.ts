// Sources for the AI ingestion bot. One aggregator (GNews, free tier) plus a
// set of free RSS feeds. All free except the already-paid aitunnel LLM.

export type RssSource = {
  name: string;
  url: string;
  defaultCategory: string; // category slug fallback
  locale: "ru" | "en";
};

export const RSS_SOURCES: RssSource[] = [
  // ── Russian business / general ──
  { name: "РБК", url: "https://rssexport.rbc.ru/rbcnews/news/30/full.rss", defaultCategory: "business", locale: "ru" },
  { name: "Коммерсантъ", url: "https://www.kommersant.ru/RSS/news.xml", defaultCategory: "business", locale: "ru" },
  { name: "ТАСС Экономика", url: "https://tass.ru/rss/v2.xml", defaultCategory: "business", locale: "ru" },
  // ── RU tech / startups ──
  { name: "Habr", url: "https://habr.com/ru/rss/articles/?fl=ru", defaultCategory: "technology", locale: "ru" },
  { name: "vc.ru", url: "https://vc.ru/rss", defaultCategory: "startups", locale: "ru" },
  // ── World tech / AI ──
  { name: "TechCrunch", url: "https://techcrunch.com/feed/", defaultCategory: "technology", locale: "en" },
  { name: "The Verge", url: "https://www.theverge.com/rss/index.xml", defaultCategory: "technology", locale: "en" },
  { name: "Hacker News", url: "https://hnrss.org/frontpage", defaultCategory: "technology", locale: "en" },
  { name: "arXiv AI", url: "http://export.arxiv.org/rss/cs.AI", defaultCategory: "ai", locale: "en" },
];

// GNews aggregator (https://gnews.io) — set GNEWS_API_KEY to enable.
export const GNEWS_QUERIES: { q: string; category: string }[] = [
  { q: "искусственный интеллект OR нейросети", category: "ai" },
  { q: "стартап OR венчур OR инвестиции", category: "startups" },
  { q: "экономика OR рынки OR инфляция", category: "investment" },
  { q: "технологии OR полупроводники", category: "technology" },
  { q: "геополитика OR санкции", category: "geopolitics" },
];

// Keyword → category slug mapping (applied to title/description to refine the
// section beyond a feed's default category).
export const CATEGORY_KEYWORDS: { slug: string; words: string[] }[] = [
  { slug: "ai", words: ["искусственн", "нейросет", " ии ", " ai ", "openai", "llm", "chatgpt", "machine learning", "artificial intelligence"] },
  { slug: "startups", words: ["стартап", "startup", "венчур", "venture", "раунд", "seed", "series a", "акселератор"] },
  { slug: "investment", words: ["инвест", "invest", "акци", "облигац", "фонд", "биржа", "капитал", "ipo", "трейд"] },
  { slug: "technology", words: ["технолог", "tech", "гаджет", "чип", "полупровод", "semiconductor", "software", "hardware"] },
  { slug: "geopolitics", words: ["геополит", "санкци", "sanction", "дипломат", "war", "конфликт", "правительств"] },
  { slug: "business", words: ["бизнес", "business", "компани", "company", "корпораци", "выручк", "прибыл", "рынок"] },
];

export function pickCategory(text: string, fallback: string): string {
  const lc = ` ${text.toLowerCase()} `;
  for (const { slug, words } of CATEGORY_KEYWORDS) {
    if (words.some((w) => lc.includes(w))) return slug;
  }
  return fallback;
}
