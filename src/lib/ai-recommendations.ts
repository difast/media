import { getPopular, getEditorPicks, type ArticleCard } from "./queries";

// AI-powered recommendations. When AITUNNEL_API_KEY is provided (later), this
// module will rank candidate articles via the aitunnel LLM endpoint. Until
// then it falls back to a deterministic editor-picks + popularity blend so the
// "Рекомендации ИИ" block always renders meaningful content.

export async function getAiRecommendations(take = 4): Promise<{
  articles: ArticleCard[];
  poweredByAi: boolean;
}> {
  const apiKey = process.env.AITUNNEL_API_KEY;

  // Candidate pool
  const [picks, popular] = await Promise.all([getEditorPicks(8), getPopular(12)]);
  const pool: ArticleCard[] = [];
  const seen = new Set<string>();
  for (const a of [...picks, ...popular]) {
    if (!seen.has(a.id)) {
      seen.add(a.id);
      pool.push(a);
    }
  }

  if (!apiKey || pool.length === 0) {
    return { articles: pool.slice(0, take), poweredByAi: false };
  }

  try {
    const baseUrl = process.env.AITUNNEL_BASE_URL || "https://api.aitunnel.ru/v1";
    const candidates = pool.map((a) => ({ id: a.id, title: a.title, excerpt: a.excerpt }));
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Ты редактор делового медиа. Из списка материалов выбери самые интересные и разнообразные. Верни JSON-массив id в порядке приоритета.",
          },
          { role: "user", content: JSON.stringify(candidates) },
        ],
        temperature: 0.3,
      }),
      // Keep homepage fast; don't block forever on the AI call.
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error("ai error");
    const data = await res.json();
    const text: string = data.choices?.[0]?.message?.content ?? "[]";
    const ids: string[] = JSON.parse(text.match(/\[.*\]/s)?.[0] ?? "[]");
    const byId = new Map(pool.map((a) => [a.id, a]));
    const ranked = ids.map((id) => byId.get(id)).filter(Boolean) as ArticleCard[];
    const result = ranked.length ? ranked : pool;
    return { articles: result.slice(0, take), poweredByAi: ranked.length > 0 };
  } catch {
    return { articles: pool.slice(0, take), poweredByAi: false };
  }
}
