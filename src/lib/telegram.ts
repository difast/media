import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/utils";

// Cross-post a short version of a published article to the Telegram channel,
// always including a link back to the full article on the site.
// Configure: TELEGRAM_BOT_TOKEN, TELEGRAM_CHANNEL_ID (e.g. "@pyatakovmedia" or "-100...").

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function telegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHANNEL_ID);
}

/** Returns true if the post was sent. Idempotent: skips if already posted. */
export async function postArticleToTelegram(articleId: string, force = false): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHANNEL_ID;
  if (!token || !chatId) return false;

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: { tags: { include: { tag: true } }, category: true },
  });
  if (!article) return false;
  if (article.status !== "PUBLISHED") return false;
  if (article.telegramPostedAt && !force) return false;

  const url = absoluteUrl(`/article/${article.slug}`);
  const short = (article.excerpt || article.subtitle || "").trim();
  const hashtags = article.tags
    .slice(0, 3)
    .map((t) => "#" + t.tag.title.replace(/[^\p{L}\p{N}]+/gu, ""))
    .join(" ");

  const lines = [
    `<b>${escapeHtml(article.title)}</b>`,
    short ? `\n${escapeHtml(short)}` : "",
    `\n🔗 <a href="${url}">Читать на сайте</a>`,
    hashtags ? `\n${escapeHtml(hashtags)}` : "",
  ].filter(Boolean);
  const caption = lines.join("\n");

  try {
    let ok = false;
    if (article.coverImage) {
      // Telegram needs an absolute, publicly reachable URL. Uploaded covers are
      // stored as relative /api/media/<id> paths — make them absolute.
      const photo = article.coverImage.startsWith("http")
        ? article.coverImage
        : absoluteUrl(article.coverImage);
      // sendPhoto caption limit is 1024 chars
      const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          photo,
          caption: caption.slice(0, 1024),
          parse_mode: "HTML",
        }),
        signal: AbortSignal.timeout(15000),
      });
      ok = res.ok;
      if (!ok) {
        // Fall back to a text message if the photo URL is rejected
        ok = await sendText(token, chatId, caption);
      }
    } else {
      ok = await sendText(token, chatId, caption);
    }

    if (ok) {
      await prisma.article.update({ where: { id: article.id }, data: { telegramPostedAt: new Date() } });
    }
    return ok;
  } catch {
    return false;
  }
}

async function sendText(token: string, chatId: string, text: string): Promise<boolean> {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text.slice(0, 4096),
      parse_mode: "HTML",
      disable_web_page_preview: false,
    }),
    signal: AbortSignal.timeout(15000),
  });
  return res.ok;
}
