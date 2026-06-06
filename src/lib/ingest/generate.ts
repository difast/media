import type { RawItem } from "./rss";

export type GeneratedArticle = {
  title: string;
  subtitle: string;
  excerpt: string;
  body: string; // HTML
  tags: string[];
  telegram: string; // short version for Telegram (plain text, <= ~500 chars)
  byAi: boolean;
};

const SYSTEM_PROMPT = `Ты — редактор независимого делового медиа «Pyatakov Media».
На основе исходной новости напиши ОРИГИНАЛЬНЫЙ материал на русском языке (не копируй текст дословно, переформулируй и структурируй).
Верни СТРОГО JSON без markdown-обёрток со схемой:
{
  "title": "ёмкий деловой заголовок",
  "subtitle": "подзаголовок одним предложением",
  "excerpt": "лид 1-2 предложения",
  "body": "HTML: 3-5 абзацев <p>, можно <h2> и <ul>; деловой нейтральный тон",
  "tags": ["3-5 тегов"],
  "telegram": "краткая версия для Telegram, 2-4 предложения, можно 1-2 эмодзи, без ссылок"
}
Не выдумывай конкретные цифры и цитаты, которых нет в источнике.`;

function fallback(item: RawItem): GeneratedArticle {
  const body = `<p>${item.description || item.title}</p><p>Источник: ${item.source}.</p>`;
  return {
    title: item.title,
    subtitle: item.description.slice(0, 140),
    excerpt: item.description.slice(0, 200),
    body,
    tags: [],
    telegram: `${item.title}\n\n${item.description.slice(0, 280)}`,
    byAi: false,
  };
}

export async function generateArticle(item: RawItem): Promise<GeneratedArticle> {
  const apiKey = process.env.AITUNNEL_API_KEY;
  if (!apiKey) return fallback(item);

  try {
    const baseUrl = process.env.AITUNNEL_BASE_URL || "https://api.aitunnel.ru/v1";
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.AITUNNEL_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Источник: ${item.source}\nЗаголовок: ${item.title}\nТекст: ${item.description}`,
          },
        ],
        temperature: 0.5,
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return fallback(item);
    const data = await res.json();
    const content: string = data.choices?.[0]?.message?.content ?? "";
    const json = JSON.parse(content.match(/\{[\s\S]*\}/)?.[0] ?? "{}");

    if (!json.title || !json.body) return fallback(item);
    return {
      title: String(json.title).slice(0, 200),
      subtitle: String(json.subtitle ?? "").slice(0, 300),
      excerpt: String(json.excerpt ?? "").slice(0, 500),
      body: String(json.body),
      tags: Array.isArray(json.tags) ? json.tags.map((t: unknown) => String(t)).slice(0, 5) : [],
      telegram: String(json.telegram ?? json.excerpt ?? json.title).slice(0, 600),
      byAi: true,
    };
  } catch {
    return fallback(item);
  }
}
