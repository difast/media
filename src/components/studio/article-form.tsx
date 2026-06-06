import { saveArticle } from "@/lib/actions/studio";

type Category = { id: string; title: string };
type ArticleData = {
  id: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  body: string;
  categoryId: string;
  coverImage: string | null;
  videoUrl: string | null;
  podcastUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  locale: string;
  scheduledAt: Date | null;
  tags: { tag: { slug: string } }[];
  sources: unknown;
} | null;

const inputCls = "w-full rounded-md border hairline bg-transparent px-3 py-2 text-sm outline-none focus:border-brand";
const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-500";

export function ArticleForm({
  article,
  categories,
}: {
  article: ArticleData;
  categories: Category[];
}) {
  const tags = article?.tags.map((t) => t.tag.slug).join(", ") ?? "";
  const sources = article?.sources ? JSON.stringify(article.sources) : "[]";

  return (
    <form action={saveArticle} className="space-y-8">
      {article && <input type="hidden" name="id" value={article.id} />}

      {/* Core */}
      <fieldset className="space-y-4">
        <legend className="font-serif text-lg font-bold">Основное</legend>
        <div>
          <label className={labelCls}>Заголовок *</label>
          <input name="title" required defaultValue={article?.title ?? ""} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Подзаголовок</label>
          <input name="subtitle" defaultValue={article?.subtitle ?? ""} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Лид / анонс</label>
          <textarea name="excerpt" rows={2} defaultValue={article?.excerpt ?? ""} className={inputCls} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Рубрика *</label>
            <select name="categoryId" required defaultValue={article?.categoryId ?? ""} className={inputCls}>
              <option value="" disabled>Выберите…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Язык</label>
            <select name="locale" defaultValue={article?.locale ?? "ru"} className={inputCls}>
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>Теги (через запятую)</label>
          <input name="tags" defaultValue={tags} placeholder="ИИ, венчур, финтех" className={inputCls} />
        </div>
      </fieldset>

      {/* Body */}
      <fieldset className="space-y-4">
        <legend className="font-serif text-lg font-bold">Текст материала *</legend>
        <textarea
          name="body"
          required
          rows={16}
          defaultValue={article?.body ?? "<p></p>"}
          className={`${inputCls} font-mono`}
          placeholder="HTML / форматированный текст…"
        />
        <p className="text-xs text-ink-400">Поддерживается HTML. Время чтения рассчитывается автоматически.</p>
      </fieldset>

      {/* Media */}
      <fieldset className="space-y-4">
        <legend className="font-serif text-lg font-bold">Медиа</legend>
        <div>
          <label className={labelCls}>Обложка (URL)</label>
          <input name="coverImage" defaultValue={article?.coverImage ?? ""} className={inputCls} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Видео (embed URL)</label>
            <input name="videoUrl" defaultValue={article?.videoUrl ?? ""} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Подкаст (URL)</label>
            <input name="podcastUrl" defaultValue={article?.podcastUrl ?? ""} className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Источники (JSON: [{`{"title","url"}`}])</label>
          <input name="sources" defaultValue={sources} className={`${inputCls} font-mono text-xs`} />
        </div>
      </fieldset>

      {/* SEO / OG */}
      <fieldset className="space-y-4">
        <legend className="font-serif text-lg font-bold">SEO и OpenGraph</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>SEO Title</label>
            <input name="seoTitle" defaultValue={article?.seoTitle ?? ""} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>OG Title</label>
            <input name="ogTitle" defaultValue={article?.ogTitle ?? ""} className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>SEO Description</label>
          <textarea name="seoDescription" rows={2} defaultValue={article?.seoDescription ?? ""} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>OG Description</label>
          <textarea name="ogDescription" rows={2} defaultValue={article?.ogDescription ?? ""} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>OG Image (URL)</label>
          <input name="ogImage" defaultValue={article?.ogImage ?? ""} className={inputCls} />
        </div>
      </fieldset>

      {/* Scheduling */}
      <fieldset className="space-y-4">
        <legend className="font-serif text-lg font-bold">Планирование</legend>
        <div>
          <label className={labelCls}>Дата запланированной публикации</label>
          <input
            type="datetime-local"
            name="scheduledAt"
            defaultValue={article?.scheduledAt ? new Date(article.scheduledAt).toISOString().slice(0, 16) : ""}
            className={inputCls}
          />
        </div>
      </fieldset>

      <div className="flex gap-3 border-t hairline pt-6">
        <button type="submit" className="rounded-full bg-brand px-6 py-2.5 font-semibold text-white hover:bg-brand-700">
          Сохранить
        </button>
      </div>
    </form>
  );
}
