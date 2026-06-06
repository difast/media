import { prisma } from "@/lib/prisma";
import { upsertCategory } from "@/lib/actions/studio";

const inputCls = "w-full rounded-md border hairline bg-transparent px-3 py-2 text-sm outline-none focus:border-brand";

export default async function TaxonomyPage() {
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { articles: true } } } }),
    prisma.tag.findMany({ orderBy: { title: "asc" }, include: { _count: { select: { articles: true } } } }),
  ]);

  return (
    <div className="space-y-12">
      <section>
        <h1 className="font-serif text-3xl font-bold">Рубрики</h1>
        <div className="mt-4 overflow-hidden rounded-lg border hairline">
          <table className="w-full text-sm">
            <thead className="border-b hairline bg-ink-50 text-left text-xs uppercase text-ink-500 dark:bg-ink-900/40">
              <tr><th className="px-4 py-2">Название</th><th className="px-4 py-2">Slug</th><th className="px-4 py-2">Тип</th><th className="px-4 py-2">Материалов</th></tr>
            </thead>
            <tbody className="divide-y hairline">
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-2 font-medium">{c.title}</td>
                  <td className="px-4 py-2 text-ink-500">{c.slug}</td>
                  <td className="px-4 py-2 text-ink-500">{c.kind}</td>
                  <td className="px-4 py-2 text-ink-400">{c._count.articles}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form action={upsertCategory} className="mt-4 grid gap-3 rounded-lg border hairline p-4 sm:grid-cols-4">
          <input name="title" placeholder="Название" required className={inputCls} />
          <input name="slug" placeholder="slug" className={inputCls} />
          <input name="titleEn" placeholder="English title" className={inputCls} />
          <button className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white">Добавить рубрику</button>
        </form>
      </section>

      <section>
        <h2 className="font-serif text-2xl font-bold">Теги</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span key={t.id} className="rounded-full border hairline px-3 py-1 text-sm">
              #{t.title} <span className="text-ink-400">{t._count.articles}</span>
            </span>
          ))}
          {tags.length === 0 && <span className="text-sm text-ink-400">Тегов нет</span>}
        </div>
        <p className="mt-3 text-xs text-ink-400">Теги создаются автоматически при сохранении материалов.</p>
      </section>
    </div>
  );
}
