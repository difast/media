import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ArticleForm } from "@/components/studio/article-form";
import { formatDateTime } from "@/lib/utils";

type Params = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

export default async function EditArticlePage({ params, searchParams }: Params) {
  const { id } = await params;
  const sp = await searchParams;
  const session = await auth();

  const [article, categories, revisions] = await Promise.all([
    prisma.article.findUnique({
      where: { id },
      include: { tags: { include: { tag: true } } },
    }),
    prisma.category.findMany({ orderBy: { order: "asc" }, select: { id: true, title: true } }),
    prisma.articleRevision.findMany({
      where: { articleId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { editor: { select: { name: true } } },
    }),
  ]);

  if (!article) notFound();
  // Journalists may only edit their own drafts.
  const isEditor = session?.user?.role === "EDITOR";
  if (!isEditor && article.authorId !== session?.user?.id) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold">Редактирование</h1>
        <span className="rounded-full bg-ink-100 px-3 py-1 text-xs font-medium dark:bg-ink-800">{article.status}</span>
      </div>

      {sp.saved && (
        <p className="mb-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">Сохранено ✓</p>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <ArticleForm article={article} categories={categories} />

        {/* История изменений */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="mb-3 font-serif text-lg font-bold">История изменений</h2>
          <ol className="space-y-3 border-l hairline pl-4">
            {revisions.map((r) => (
              <li key={r.id} className="relative text-sm">
                <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-brand" />
                <div className="font-medium">{r.note ?? r.status}</div>
                <div className="text-xs text-ink-400">
                  {r.editor.name} · {formatDateTime(r.createdAt)}
                </div>
              </li>
            ))}
            {revisions.length === 0 && <li className="text-sm text-ink-400">Нет записей</li>}
          </ol>
        </aside>
      </div>
    </div>
  );
}
