import Link from "next/link";
import {
  SITE,
  PRIMARY_SECTIONS,
  INFO_PAGES,
  LEGAL_PAGES,
  type Locale,
} from "@/lib/site-config";
import { pick } from "@/lib/locale";
import { t } from "@/lib/i18n";
import { NewsletterForm } from "@/components/ui/newsletter-form";
import { getMasthead } from "@/lib/settings";

export async function SiteFooter({ locale }: { locale: Locale }) {
  const masthead = await getMasthead();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t hairline bg-ink-50 dark:bg-ink-900/40">
      {/* Newsletter band */}
      <div id="newsletter" className="scroll-mt-28 border-b hairline">
        <div className="container-page grid gap-6 py-10 md:grid-cols-2 md:items-center">
          <div>
            <h3 className="font-serif text-xl font-bold">{t(locale, "newsletter.title")}</h3>
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{t(locale, "newsletter.desc")}</p>
          </div>
          <NewsletterForm
            placeholder={t(locale, "newsletter.placeholder")}
            cta={t(locale, "newsletter.cta")}
            successMsg={t(locale, "newsletter.success")}
            locale={locale}
          />
        </div>
      </div>

      {/* Link columns */}
      <div className="container-page grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
        <div>
          <div className="font-serif text-lg font-bold">{SITE.name}</div>
          <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">{pick(SITE.tagline, locale)}</p>
          <div className="mt-4 flex gap-3 text-ink-500">
            <a href={SITE.social.telegram} aria-label="Telegram" className="hover:text-brand-600">TG</a>
            <a href={SITE.social.twitter} aria-label="X" className="hover:text-brand-600">X</a>
            <a href={SITE.social.youtube} aria-label="YouTube" className="hover:text-brand-600">YT</a>
            <a href="/rss.xml" aria-label="RSS" className="hover:text-brand-600">RSS</a>
          </div>
        </div>

        <nav>
          <h4 className="kicker mb-3">{t(locale, "footer.sections")}</h4>
          <ul className="space-y-2 text-sm">
            {PRIMARY_SECTIONS.slice(0, 8).map((s) => (
              <li key={s.slug}>
                <Link href={`/section/${s.slug}`} className="text-ink-600 hover:text-brand-600 dark:text-ink-300">
                  {pick(s.title, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav>
          <h4 className="kicker mb-3">{t(locale, "footer.about")}</h4>
          <ul className="space-y-2 text-sm">
            {INFO_PAGES.map((p) => (
              <li key={p.slug}>
                <Link href={`/${p.slug}`} className="text-ink-600 hover:text-brand-600 dark:text-ink-300">
                  {pick(p.title, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav>
          <h4 className="kicker mb-3">{t(locale, "footer.legal")}</h4>
          <ul className="space-y-2 text-sm">
            {LEGAL_PAGES.map((p) => (
              <li key={p.slug}>
                <Link href={`/legal/${p.slug}`} className="text-ink-600 hover:text-brand-600 dark:text-ink-300">
                  {pick(p.title, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Masthead / выходные данные СМИ */}
      <div className="border-t hairline">
        <div className="container-page py-8">
          <h4 className="kicker mb-3">{t(locale, "footer.masthead")}</h4>
          <div className="grid gap-x-8 gap-y-2 text-xs text-ink-500 dark:text-ink-400 sm:grid-cols-2 lg:grid-cols-3">
            <div><span className="font-semibold text-ink-700 dark:text-ink-200">Регистрация СМИ: </span>{masthead.registration}</div>
            <div><span className="font-semibold text-ink-700 dark:text-ink-200">Учредитель: </span>{masthead.founder}</div>
            <div><span className="font-semibold text-ink-700 dark:text-ink-200">Главный редактор: </span>{masthead.editorInChief}</div>
            <div><span className="font-semibold text-ink-700 dark:text-ink-200">Редакция: </span>{masthead.contacts}</div>
            <div><span className="font-semibold text-ink-700 dark:text-ink-200">Юридическая информация: </span>{masthead.legalEntity}</div>
            <div><span className="font-semibold text-ink-700 dark:text-ink-200">Возрастная маркировка: </span>{masthead.ageRating}</div>
          </div>
        </div>
      </div>

      <div className="border-t hairline">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink-400 sm:flex-row">
          <span>© {year} {SITE.name}. {t(locale, "footer.rights")}</span>
          <span>{SITE.domain}</span>
        </div>
      </div>
    </footer>
  );
}
