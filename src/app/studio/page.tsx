import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export default async function StudioDashboard() {
  const session = await auth();
  const isEditor = session?.user?.role === "EDITOR";
  const authorFilter = isEditor ? {} : { authorId: session!.user.id };

  const [total, published, drafts, inReview, scheduled, comments, pendingComments, subscribers, topArticles] =
    await Promise.all([
      prisma.article.count({ where: authorFilter }),
      prisma.article.count({ where: { ...authorFilter, status: "PUBLISHED" } }),
      prisma.article.count({ where: { ...authorFilter, status: "DRAFT" } }),
      prisma.article.count({ where: { ...authorFilter, status: "IN_REVIEW" } }),
      prisma.article.count({ where: { ...authorFilter, status: "SCHEDULED" } }),
      prisma.comment.count(),
      prisma.comment.count({ where: { status: "PENDING" } }),
      prisma.subscriber.count(),
      prisma.article.findMany({
        where: { ...authorFilter, status: "PUBLISHED" },
        orderBy: { viewCount: "desc" },
        take: 5,
        select: { id: true, slug: true, title: true, viewCount: true },
      }),
    ]);

  const stats = [
    { label: "Всего материалов", value: total },
    { label: "Опубликовано", value: published },
    { label: "Черновики", value: drafts },
    { label: "На согласовании", value: inReview },
    { label: "Запланировано", value: scheduled },
    ...(isEditor
      ? [
          { label: "Комментарии", value: comments },
          { label: "На модерации", value: pendingComments },
          { label: "Подписчики", value: subscribers },
        ]
      : []),
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold">Дашборд</h1>
      <p className="mt-1 text-sm text-ink-500">Добро пожаловать, {session?.user?.name}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border hairline p-4">
            <div className="font-serif text-3xl font-bold">{s.value}</div>
            <div className="mt-1 text-xs text-ink-500">{s.label}</div>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="mb-3 font-serif text-xl font-bold">Статистика публикаций · топ по просмотрам</h2>
        <ul className="divide-y hairline rounded-lg border hairline">
          {topArticles.map((a) => (
            <li key={a.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <Link href={`/studio/articles/${a.id}/edit`} className="headline-hover font-medium">{a.title}</Link>
              <span className="text-ink-400">{a.viewCount.toLocaleString()} просм.</span>
            </li>
          ))}
          {topArticles.length === 0 && <li className="px-4 py-3 text-sm text-ink-400">Нет данных</li>}
        </ul>
      </section>

      <div className="mt-8">
        <Link href="/studio/articles/new" className="inline-block rounded-full bg-brand px-5 py-2 font-semibold text-white hover:bg-brand-700">
          + Новый материал
        </Link>
      </div>
    </div>
  );
}
