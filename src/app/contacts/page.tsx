import type { Metadata } from "next";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = { title: "Контакты", alternates: { canonical: "/contacts" } };

export default function ContactsPage() {
  const contacts = [
    { label: "Редакция", value: `editorial@${SITE.domain}` },
    { label: "Реклама и партнёрства", value: `ads@${SITE.domain}` },
    { label: "Лицензирование материалов", value: `rights@${SITE.domain}` },
    { label: "Для пресс-релизов", value: `press@${SITE.domain}` },
  ];
  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold">Контакты</h1>
        <p className="mt-3 text-ink-500">Свяжитесь с редакцией {SITE.name}.</p>
        <dl className="mt-8 divide-y hairline rounded-lg border hairline">
          {contacts.map((c) => (
            <div key={c.label} className="flex items-center justify-between px-4 py-3">
              <dt className="text-sm text-ink-500">{c.label}</dt>
              <dd><a href={`mailto:${c.value}`} className="font-medium text-brand-600 hover:underline">{c.value}</a></dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex gap-3">
          <a href={SITE.social.telegram} className="rounded-full border hairline px-4 py-1.5 text-sm hover:border-brand">Telegram</a>
          <a href={SITE.social.twitter} className="rounded-full border hairline px-4 py-1.5 text-sm hover:border-brand">X</a>
          <a href={SITE.social.youtube} className="rounded-full border hairline px-4 py-1.5 text-sm hover:border-brand">YouTube</a>
        </div>
      </div>
    </div>
  );
}
