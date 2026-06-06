"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/site-config";

type CommentUser = { name: string | null; image: string | null };
type CommentNode = {
  id: string;
  body: string;
  createdAt: string;
  user: CommentUser;
  replies?: CommentNode[];
};

const txt = {
  ru: {
    title: "Комментарии",
    placeholder: "Поделитесь мнением…",
    submit: "Отправить",
    login: "Войдите, чтобы оставить комментарий",
    empty: "Пока нет комментариев. Будьте первым.",
    moderation: "Комментарий отправлен на модерацию.",
  },
  en: {
    title: "Comments",
    placeholder: "Share your opinion…",
    submit: "Post",
    login: "Sign in to comment",
    empty: "No comments yet. Be the first.",
    moderation: "Your comment was sent for moderation.",
  },
};

function CommentItem({ c }: { c: CommentNode }) {
  return (
    <li className="border-b hairline py-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        {c.user.name ?? "Аноним"}
        <span className="text-xs font-normal text-ink-400">
          {new Date(c.createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className="mt-1 whitespace-pre-wrap text-sm text-ink-700 dark:text-ink-200">{c.body}</p>
      {c.replies && c.replies.length > 0 && (
        <ul className="ml-6 mt-3 border-l hairline pl-4">
          {c.replies.map((r) => (
            <CommentItem key={r.id} c={r} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function CommentsSection({ articleId, locale }: { articleId: string; locale: Locale }) {
  const tr = txt[locale] ?? txt.ru;
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/comments?articleId=${articleId}`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments ?? []))
      .catch(() => {});
  }, [articleId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, body }),
    });
    setLoading(false);
    if (res.status === 401) {
      setMsg(tr.login);
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setBody("");
      if (data.status === "APPROVED") {
        const refreshed = await fetch(`/api/comments?articleId=${articleId}`).then((r) => r.json());
        setComments(refreshed.comments ?? []);
      } else {
        setMsg(tr.moderation);
      }
    }
  }

  return (
    <section className="mt-12 border-t-2 border-ink-950 pt-6 dark:border-ink-100">
      <h2 className="font-serif text-xl font-bold">{tr.title} · {comments.length}</h2>

      <form onSubmit={submit} className="mt-4">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={tr.placeholder}
          rows={3}
          required
          className="w-full rounded-md border hairline bg-transparent p-3 text-sm outline-none focus:border-brand"
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-brand px-5 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {tr.submit}
          </button>
          {msg && <span className="text-sm text-ink-500">{msg}</span>}
        </div>
      </form>

      {comments.length === 0 ? (
        <p className="mt-6 text-sm text-ink-400">{tr.empty}</p>
      ) : (
        <ul className="mt-4">
          {comments.map((c) => (
            <CommentItem key={c.id} c={c} />
          ))}
        </ul>
      )}
    </section>
  );
}
