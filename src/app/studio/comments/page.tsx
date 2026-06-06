import { prisma } from "@/lib/prisma";
import { moderateComment } from "@/lib/actions/studio";
import { formatDateTime } from "@/lib/utils";

export default async function CommentsModerationPage() {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
      article: { select: { title: true, slug: true } },
    },
  });

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold">Управление комментариями</h1>
      <p className="mt-1 text-sm text-ink-500">Модерация и публикация комментариев читателей.</p>

      <ul className="mt-6 space-y-3">
        {comments.map((c) => (
          <li key={c.id} className="rounded-lg border hairline p-4">
            <div className="flex items-center justify-between text-xs text-ink-400">
              <span>{c.user.name ?? c.user.email} · {formatDateTime(c.createdAt)}</span>
              <span className={
                "rounded-full px-2 py-0.5 font-medium " +
                (c.status === "APPROVED" ? "bg-emerald-100 text-emerald-700"
                  : c.status === "REJECTED" ? "bg-brand-50 text-brand-600"
                  : "bg-amber-100 text-amber-700")
              }>{c.status}</span>
            </div>
            <p className="mt-2 text-sm">{c.body}</p>
            <div className="mt-2 text-xs text-ink-400">К материалу: {c.article.title}</div>
            <div className="mt-3 flex gap-2">
              {c.status !== "APPROVED" && (
                <form action={moderateComment}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="status" value="APPROVED" />
                  <button className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">Одобрить</button>
                </form>
              )}
              {c.status !== "REJECTED" && (
                <form action={moderateComment}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="status" value="REJECTED" />
                  <button className="rounded border hairline px-3 py-1 text-xs">Отклонить</button>
                </form>
              )}
            </div>
          </li>
        ))}
        {comments.length === 0 && <li className="text-sm text-ink-400">Комментариев нет</li>}
      </ul>
    </div>
  );
}
