import { prisma } from "@/lib/prisma";
import { upsertAd } from "@/lib/actions/studio";

const SLOTS = ["HEADER", "SIDEBAR", "IN_ARTICLE", "FOOTER", "HOMEPAGE_HERO"];
const inputCls = "w-full rounded-md border hairline bg-transparent px-3 py-2 text-sm outline-none focus:border-brand";

export default async function AdsPage() {
  const ads = await prisma.ad.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold">Управление рекламой</h1>

      <div className="mt-6 grid gap-3">
        {ads.map((ad) => (
          <div key={ad.id} className="flex items-center justify-between rounded-lg border hairline p-4 text-sm">
            <div>
              <div className="font-medium">{ad.title}</div>
              <div className="text-xs text-ink-400">{ad.slot} · {ad.targetUrl}</div>
            </div>
            <div className="text-right text-xs text-ink-400">
              <div>{ad.impressions} показов · {ad.clicks} кликов</div>
              <span className={ad.isActive ? "text-emerald-600" : "text-ink-400"}>{ad.isActive ? "Активна" : "Выключена"}</span>
            </div>
          </div>
        ))}
        {ads.length === 0 && <p className="text-sm text-ink-400">Рекламных блоков нет</p>}
      </div>

      <form action={upsertAd} className="mt-6 grid gap-3 rounded-lg border hairline p-4 sm:grid-cols-2">
        <h2 className="col-span-full font-serif text-lg font-bold">Новый рекламный блок</h2>
        <input name="title" placeholder="Название" required className={inputCls} />
        <select name="slot" className={inputCls}>{SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}</select>
        <input name="targetUrl" placeholder="Ссылка перехода" required className={inputCls} />
        <input name="imageUrl" placeholder="URL изображения" className={inputCls} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked /> Активна</label>
        <button className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white">Создать</button>
      </form>
    </div>
  );
}
