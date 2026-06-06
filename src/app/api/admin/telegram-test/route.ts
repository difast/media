import { NextResponse } from "next/server";

// Telegram diagnostics. Verifies the bot token and whether the bot can post to
// TELEGRAM_CHANNEL_ID. Protected by AUTH_SECRET. Open in a browser:
//   /api/admin/telegram-test?token=<AUTH_SECRET>
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const secret = process.env.AUTH_SECRET;
  const token = new URL(req.url).searchParams.get("token");
  if (!secret || token !== secret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHANNEL_ID;
  if (!botToken) return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 400 });

  const out: Record<string, unknown> = {};

  // 1. Who is the bot?
  try {
    const me = await fetch(`https://api.telegram.org/bot${botToken}/getMe`).then((r) => r.json());
    out.bot = me.ok ? { username: me.result.username, name: me.result.first_name } : me;
  } catch (e) {
    out.bot = { error: String(e) };
  }

  // 2. Can it post to the channel?
  if (!chatId) {
    out.channel = "TELEGRAM_CHANNEL_ID not set — add the bot to your channel as admin and set its @username or -100… id";
    return NextResponse.json(out);
  }
  try {
    const send = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "✅ Pyatakov Media: тестовое сообщение. Бот настроен и может публиковать в канал.",
      }),
    }).then((r) => r.json());
    out.channel = send.ok
      ? { ok: true, postedTo: chatId }
      : { ok: false, error: send.description, code: send.error_code, hint: hintFor(send.description) };
  } catch (e) {
    out.channel = { ok: false, error: String(e) };
  }

  return NextResponse.json(out);
}

function hintFor(desc?: string): string {
  const d = (desc || "").toLowerCase();
  if (d.includes("chat not found")) return "Неверный TELEGRAM_CHANNEL_ID. Для публичного канала используйте @username, для приватного — числовой -100…";
  if (d.includes("not enough rights") || d.includes("administrator")) return "Сделайте бота администратором канала с правом «Публикация сообщений».";
  if (d.includes("bot is not a member") || d.includes("member")) return "Добавьте бота в канал и назначьте администратором.";
  return "Проверьте, что бот добавлен в канал и является администратором.";
}
