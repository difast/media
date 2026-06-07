import type { Metadata } from "next";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = { title: "Рекламодателям", alternates: { canonical: "/advertising" } };

export default function AdvertisingPage() {
  const formats = [
    { title: "Баннерная реклама", desc: "Премиальные позиции в шапке, сайдбаре и внутри материалов." },
    { title: "Спецпроекты", desc: "Брендированный контент и нативные форматы с командой редакции." },
    { title: "Подкасты и видео", desc: "Интеграции в выпуски и спонсорство серий." },
    { title: "Рассылки", desc: "Размещение в деловой e-mail рассылке для аудитории руководителей." },
  ];
  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold">Рекламодателям</h1>
        <p className="mt-3 text-ink-500">
          {SITE.name} — аудитория предпринимателей, инвесторов и руководителей. Мы предлагаем форматы,
          сохраняющие доверие читателя и редакционные стандарты.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {formats.map((f) => (
            <div key={f.title} className="rounded-lg border hairline p-5">
              <h2 className="font-serif text-lg font-bold">{f.title}</h2>
              <p className="mt-1 text-sm text-ink-500">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-lg bg-brand p-6 text-white">
          <h2 className="font-serif text-xl font-bold">Запросить медиакит</h2>
          <p className="mt-1 text-sm text-white/80">Напишите нам — пришлём статистику аудитории и прайс.</p>
          <a href={`mailto:ads@${SITE.domain}`} className="mt-3 inline-block rounded-full bg-white px-5 py-2 text-sm font-semibold text-brand-700">
            ads@{SITE.domain}
          </a>
        </div>
        <p className="mt-6 text-xs text-ink-400">
          Вся реклама маркируется в соответствии с законодательством РФ о рекламе.
        </p>
      </div>
    </div>
  );
}
