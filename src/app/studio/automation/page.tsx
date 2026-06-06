import { prisma } from "@/lib/prisma";
import { getIngestConfig, startOfDayInTz } from "@/lib/ingest/config";
import { saveAutomation, runIngestNow } from "@/lib/actions/studio";
import { telegramConfigured } from "@/lib/telegram";

const inputCls = "w-full rounded-md border hairline bg-transparent px-3 py-2 text-sm outline-none focus:border-brand";
const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-500";

export default async function AutomationPage() {
  const cfg = await getIngestConfig();
  const dayStart = startOfDayInTz(cfg.timezone);
  const [createdToday, drafts, lastItems] = await Promise.all([
    prisma.article.count({ where: { isAiGenerated: true, createdAt: { gte: dayStart } } }),
    prisma.article.count({ where: { isAiGenerated: true, status: "DRAFT" } }),
    prisma.ingestedItem.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  const hasAi = Boolean(process.env.AITUNNEL_API_KEY);
  const hasGnews = Boolean(process.env.GNEWS_API_KEY);
  const hasTg = telegramConfigured();

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold">Автоматизация (ИИ-бот)</h1>
      <p className="mt-1 text-sm text-ink-500">
        Настройки сбора новостей и автогенерации. Изменения применяются без передеплоя.
      </p>

      {/* Status */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Сегодня создано" value={`${createdToday} / ${cfg.postsPerDay}`} />
        <Stat label="Черновиков ИИ" value={String(drafts)} />
        <Stat label="Окно" value={`${cfg.windowStart}:00–${cfg.windowEnd}:00`} />
        <Stat label="Статус" value={cfg.enabled ? "Включён" : "Выключен"} accent={cfg.enabled} />
      </div>

      {/* Integration checklist */}
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <Badge ok={hasAi} label="aitunnel (генерация)" />
        <Badge ok={hasGnews} label="GNews (опц.)" optional />
        <Badge ok={hasTg} label="Telegram" />
      </div>

      {/* Settings form */}
      <form action={saveAutomation} className="mt-6 max-w-2xl space-y-5 rounded-lg border hairline p-5">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="enabled" defaultChecked={cfg.enabled} /> Включить автоматический запуск
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>Постов в день (макс.)</label>
            <input name="postsPerDay" type="number" min={1} max={100} defaultValue={cfg.postsPerDay} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Начало окна (час)</label>
            <input name="windowStart" type="number" min={0} max={23} defaultValue={cfg.windowStart} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Конец окна (час)</label>
            <input name="windowEnd" type="number" min={1} max={24} defaultValue={cfg.windowEnd} className={inputCls} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>Интервал, мин (мин. 15)</label>
            <input name="intervalMinutes" type="number" min={15} max={720} defaultValue={cfg.intervalMinutes} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Часовой пояс</label>
            <input name="timezone" defaultValue={cfg.timezone} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Модель ИИ</label>
            <input name="model" defaultValue={cfg.model} className={inputCls} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="autoPublish" defaultChecked={cfg.autoPublish} />
          Публиковать сразу (иначе — черновики на проверку)
        </label>
        <p className="text-xs text-ink-400">
          Срочность («breaking») всегда отмечается вручную. При публикации материал автоматически уходит в Telegram-канал со ссылкой на сайт.
        </p>

        <button className="rounded-full bg-brand px-6 py-2.5 font-semibold text-white hover:bg-brand-700">
          Сохранить настройки
        </button>
      </form>

      <form action={runIngestNow} className="mt-4">
        <button className="rounded-full border hairline px-5 py-2 font-semibold hover:border-brand">
          🤖 Запустить сейчас (вручную)
        </button>
      </form>

      {/* Recent log */}
      <section className="mt-8">
        <h2 className="mb-2 font-serif text-lg font-bold">Последние обработанные источники</h2>
        <ul className="divide-y hairline rounded-lg border hairline text-sm">
          {lastItems.map((it) => (
            <li key={it.id} className="flex items-center justify-between gap-3 px-4 py-2">
              <span className="min-w-0 truncate">{it.title}</span>
              <span className="shrink-0 text-xs text-ink-400">{it.source} · {it.status}</span>
            </li>
          ))}
          {lastItems.length === 0 && <li className="px-4 py-3 text-ink-400">Пока пусто</li>}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border hairline p-3">
      <div className={"font-serif text-2xl font-bold " + (accent ? "text-emerald-600" : "")}>{value}</div>
      <div className="mt-1 text-xs text-ink-500">{label}</div>
    </div>
  );
}

function Badge({ ok, label, optional }: { ok: boolean; label: string; optional?: boolean }) {
  return (
    <span className={"rounded-full px-3 py-1 font-medium " + (ok ? "bg-emerald-100 text-emerald-700" : optional ? "bg-ink-100 text-ink-500 dark:bg-ink-800" : "bg-amber-100 text-amber-700")}>
      {ok ? "✓" : "—"} {label}
    </span>
  );
}
