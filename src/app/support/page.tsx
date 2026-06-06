import type { Metadata } from "next";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";
import { NewsletterForm } from "@/components/ui/newsletter-form";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = { title: "Поддержка проекта", alternates: { canonical: "/support" } };

export default async function SupportPage() {
  const locale = await getLocale();
  const tiers = [
    { name: "Читатель", price: "Бесплатно", features: ["Доступ к материалам", "Комментарии", "Еженедельная рассылка"] },
    { name: "Подписчик", price: "490 ₽/мес", features: ["Все материалы без ограничений", "Эксклюзивная аналитика", "Архив и спецпроекты", "Без рекламы"], featured: true },
    { name: "Партнёр", price: "По запросу", features: ["Корпоративный доступ", "Брифинги редакции", "Приоритетная поддержка"] },
  ];
  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="font-serif text-4xl font-bold">Поддержка проекта</h1>
        <p className="mx-auto mt-3 max-w-2xl text-ink-500">
          {SITE.name} — независимое издание. Поддержка читателей помогает нам сохранять независимость и качество журналистики.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={
              "rounded-xl border p-6 " +
              (tier.featured ? "border-brand shadow-lg" : "hairline")
            }
          >
            {tier.featured && <div className="kicker">Рекомендуем</div>}
            <h2 className="mt-1 font-serif text-2xl font-bold">{tier.name}</h2>
            <div className="mt-1 text-lg font-semibold text-brand-600">{tier.price}</div>
            <ul className="mt-4 space-y-2 text-sm">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-1 text-brand-600">✓</span> {f}
                </li>
              ))}
            </ul>
            <button className={
              "mt-6 w-full rounded-full py-2 font-semibold " +
              (tier.featured ? "bg-brand text-white hover:bg-brand-700" : "border hairline hover:border-brand")
            }>
              Выбрать
            </button>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-12 max-w-xl rounded-lg border hairline p-6 text-center">
        <h2 className="font-serif text-xl font-bold">{t(locale, "newsletter.title")}</h2>
        <p className="mt-1 text-sm text-ink-500">{t(locale, "newsletter.desc")}</p>
        <div className="mt-4">
          <NewsletterForm
            placeholder={t(locale, "newsletter.placeholder")}
            cta={t(locale, "newsletter.cta")}
            successMsg={t(locale, "newsletter.success")}
            locale={locale}
          />
        </div>
      </div>
    </div>
  );
}
