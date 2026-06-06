import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { changeArticleStatus, deleteArticle } from "@/lib/actions/studio";
import type { ArticleStatus } from "@prisma/client";

const STATUS_LABEL: Record<ArticleStatus, string> = {
  DRAFT: "Черновик",
  IN_REVIEW: "На согласовании",
  APPROVED: "Одобрено",
  SCHEDULED: "Запланировано",
  PUBLISHED: "Опубликовано",
  ARCHIVED: "В архиве",
};

const STATUS_COLOR: Record<ArticleStatus, string> = {
  DRAFT: "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300",
  IN_REVIEW: "bg-amber-100 text-amber-700",
  APPROVED: "bg-blue-100 text-blue-700",
  SCHEDULED: "bg-purple-100 text-purple-700",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  ARCHIVED: "bg-ink-100 text-ink-400",
};

export default async function ArticlesListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const session = await auth();
  const isEditor = session?.user?.role === "EDITOR";
  const statusFilter = sp.status as ArticleStatus | undefined;

  const articles = await prisma.article.findMany({
    where: {
      ...(isEditor ? {} : { authorId: session!.user.id }),
      ...(statusFilter ? { status: statusFilter } : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: {
      id: true, slug: true, title: true, status: true, updatedAt: true,
      author: { select: { name: true } },
      category: { select: { title: true } },
    },
  });

  const filters: (ArticleStatus | "ALL")[] = ["ALL", "DRAFT", "IN_REVIEW", "APPROVED", "SCHEDULED", "PUBLISHED", "ARCHIVED"];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold">Публикации</h1>
        <Link href="/studio/articles/new" className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          + Создать
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link
            key={f}
            href={f === "ALL" ? "/studio/articles" : `/studio/articles?status=${f}`}
            className={
              "rounded-full border hairline px-3 py-1 text-xs font-medium " +
              ((statusFilter ?? "ALL") === f ? "bg-ink-950 text-white dark:bg-white dark:text-ink-950" : "")
            }
          >
            {f === "ALL" ? "Все" : STATUS_LABEL[f]}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border hairline">
        <table className="w-full text-sm">
          <thead className="border-b hairline bg-ink-50 text-left text-xs uppercase text-ink-500 dark:bg-ink-900/40">
            <tr>
              <th className="px-4 py-2">Заголовок</th>
              <th className="px-4 py-2">Рубрика</th>
              {isEditor && <th className="px-4 py-2">Автор</th>}
              <th className="px-4 py-2">Статус</th>
              <th className="px-4 py-2">Обновлено</th>
              <th className="px-4 py-2">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y hairline">
            {articles.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-2">
                  <Link href={`/studio/articles/${a.id}/edit`} className="font-medium headline-hover">{a.title}</Link>
                </td>
                <td className="px-4 py-2 text-ink-500">{a.category.title}</td>
                {isEditor && <td className="px-4 py-2 text-ink-500">{a.author.name}</td>}
                <td className="px-4 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[a.status]}`}>
                    {STATUS_LABEL[a.status]}
                  </span>
                </td>
                <td className="px-4 py-2 text-ink-400">{formatDate(a.updatedAt)}</td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap items-center gap-1">
                    {/* Journalist: submit for review */}
                    {a.status === "DRAFT" && (
                      <form action={changeArticleStatus}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="status" value="IN_REVIEW" />
                        <button className="rounded border hairline px-2 py-0.5 text-xs hover:border-brand">На согласование</button>
                      </form>
                    )}
                    {/* Editor workflow */}
                    {isEditor && a.status === "IN_REVIEW" && (
                      <form action={changeArticleStatus}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="status" value="APPROVED" />
                        <button className="rounded border hairline px-2 py-0.5 text-xs hover:border-brand">Одобрить</button>
                      </form>
                    )}
                    {isEditor && (a.status === "APPROVED" || a.status === "DRAFT") && (
                      <form action={changeArticleStatus}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="status" value="PUBLISHED" />
                        <button className="rounded bg-brand px-2 py-0.5 text-xs font-semibold text-white">Опубликовать</button>
                      </form>
                    )}
                    {isEditor && a.status === "PUBLISHED" && (
                      <form action={changeArticleStatus}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="status" value="ARCHIVED" />
                        <button className="rounded border hairline px-2 py-0.5 text-xs hover:border-brand">В архив</button>
                      </form>
                    )}
                    {a.status === "PUBLISHED" && (
                      <Link href={`/article/${a.slug}`} className="rounded border hairline px-2 py-0.5 text-xs hover:border-brand">↗</Link>
                    )}
                    {isEditor && (
                      <form action={deleteArticle}>
                        <input type="hidden" name="id" value={a.id} />
                        <button className="rounded border border-brand-200 px-2 py-0.5 text-xs text-brand-600 hover:bg-brand-50">Удалить</button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-ink-400">Материалов нет</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
