import Link from "next/link";
import { auth } from "@/lib/auth";
import { PRIMARY_SECTIONS, SECTIONS, INFO_PAGES, SITE, type Locale } from "@/lib/site-config";
import { pick } from "@/lib/locale";
import { t } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { MobileNav } from "@/components/layout/mobile-nav";
import { BreakingTicker } from "@/components/sections/breaking-ticker";

export async function SiteHeader({ locale }: { locale: Locale }) {
  const session = await auth();
  const role = session?.user?.role;

  const allNav = [
    ...SECTIONS.map((s) => ({ href: `/section/${s.slug}`, label: pick(s.title, locale) })),
    ...INFO_PAGES.map((p) => ({ href: `/${p.slug}`, label: pick(p.title, locale) })),
  ];

  return (
    <header className="sticky top-0 z-40 border-b hairline bg-paper/95 backdrop-blur dark:bg-paper-dark/95">
      {/* Utility bar */}
      <div className="border-b hairline">
        <div className="container-page flex h-9 items-center justify-between text-xs text-ink-500 dark:text-ink-400">
          <span className="hidden sm:block">{formatDate(new Date(), locale)}</span>
          <div className="flex items-center gap-3">
            <LocaleSwitcher current={locale} />
            <ThemeToggle label={t(locale, "theme.toggle")} />
            {role ? (
              <Link href="/studio" className="font-semibold text-ink-800 hover:text-brand-600 dark:text-ink-200">
                {t(locale, "nav.account")}
              </Link>
            ) : (
              <Link href="/login" className="font-semibold text-ink-800 hover:text-brand-600 dark:text-ink-200">
                {t(locale, "nav.login")}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Masthead */}
      <div className="container-page flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <MobileNav items={allNav} menuLabel={t(locale, "nav.menu")} />
          <Link href="/" className="group flex flex-col leading-none">
            <span className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">
              {SITE.name}
            </span>
            <span className="mt-1 hidden text-[11px] uppercase tracking-[0.18em] text-ink-500 sm:block">
              {pick(SITE.tagline, locale)}
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/search"
            aria-label={t(locale, "nav.search")}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          </Link>
          <Link
            href="/#newsletter"
            className="hidden rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 sm:inline-block"
          >
            {t(locale, "nav.subscribe")}
          </Link>
        </div>
      </div>

      {/* Primary nav */}
      <nav className="hidden border-t hairline lg:block">
        <div className="container-page flex items-center gap-1 overflow-x-auto no-scrollbar">
          {PRIMARY_SECTIONS.map((s) => (
            <Link
              key={s.slug}
              href={`/section/${s.slug}`}
              className="whitespace-nowrap px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:text-brand-600 dark:text-ink-300 dark:hover:text-brand-400"
            >
              {pick(s.title, locale)}
            </Link>
          ))}
          <Link href="/archive" className="ml-auto whitespace-nowrap px-3 py-2.5 text-sm font-medium text-ink-500 hover:text-brand-600">
            {locale === "ru" ? "Все разделы" : "All sections"}
          </Link>
        </div>
      </nav>

      <BreakingTicker locale={locale} />
    </header>
  );
}
