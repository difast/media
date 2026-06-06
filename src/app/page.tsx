import Link from "next/link";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";
import {
  getFeatured,
  getPublishedArticles,
  getPopular,
  getEditorPicks,
  getLatestInterviews,
  getTrendingTags,
} from "@/lib/queries";
import { getAiRecommendations } from "@/lib/ai-recommendations";
import { ArticleCard } from "@/components/article/article-card";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  PopularList,
  TrendsWidget,
  ReadingNowWidget,
} from "@/components/sections/sidebar-widgets";
import { EmptyState } from "@/components/ui/empty-state";

export const revalidate = 120; // ISR — refresh homepage every 2 minutes

export default async function HomePage() {
  const locale = await getLocale();
  const [featured, latest, popular, picks, interviews, tags, ai] = await Promise.all([
    getFeatured(5),
    getPublishedArticles({ take: 10 }),
    getPopular(6),
    getEditorPicks(4),
    getLatestInterviews(3),
    getTrendingTags(10),
    getAiRecommendations(4),
  ]);

  const hero = featured[0] ?? latest[0];
  const secondary = featured.slice(1, 5);

  if (!hero) {
    return (
      <div className="container-page py-20">
        <EmptyState
          title={locale === "ru" ? "Скоро здесь появятся материалы" : "Content is coming soon"}
          description={
            locale === "ru"
              ? "База данных подключена, но публикаций пока нет. Запустите наполнение через CMS или сидер."
              : "The database is connected but there are no articles yet."
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      {/* ── Top: hero + important events ── */}
      <section className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ArticleCard article={hero} locale={locale} variant="hero" />
        </div>
        <aside className="flex flex-col">
          <SectionHeading title={t(locale, "home.important")} href="/section/news" moreLabel={t(locale, "common.all")} />
          <div className="space-y-0">
            {secondary.length > 0
              ? secondary.map((a) => <ArticleCard key={a.id} article={a} locale={locale} variant="headline" />)
              : latest.slice(1, 5).map((a) => <ArticleCard key={a.id} article={a} locale={locale} variant="headline" />)}
          </div>
        </aside>
      </section>

      {/* ── Editor's picks rail ── */}
      {picks.length > 0 && (
        <section className="mt-12">
          <SectionHeading title={t(locale, "home.editorPicks")} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {picks.map((a) => (
              <ArticleCard key={a.id} article={a} locale={locale} variant="standard" />
            ))}
          </div>
        </section>
      )}

      {/* ── Main grid: latest + sidebar ── */}
      <div className="mt-12 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionHeading title={t(locale, "home.latest")} href="/section/news" moreLabel={t(locale, "common.all")} />
          <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
            {latest.slice(0, 8).map((a) => (
              <ArticleCard key={a.id} article={a} locale={locale} variant="standard" />
            ))}
          </div>
        </div>

        <aside className="space-y-10">
          <PopularList articles={popular} locale={locale} />

          {/* AI recommendations */}
          {ai.articles.length > 0 && (
            <section>
              <SectionHeading title={t(locale, "home.aiPicks")} />
              {ai.poweredByAi && (
                <p className="-mt-2 mb-3 text-xs text-ink-400">
                  {locale === "ru" ? "Подобрано искусственным интеллектом" : "Curated by AI"}
                </p>
              )}
              <div className="space-y-0">
                {ai.articles.map((a) => (
                  <ArticleCard key={a.id} article={a} locale={locale} variant="compact" />
                ))}
              </div>
            </section>
          )}

          <TrendsWidget tags={tags} locale={locale} />
          <ReadingNowWidget articles={popular.slice(0, 5)} locale={locale} />
        </aside>
      </div>

      {/* ── Latest interviews ── */}
      {interviews.length > 0 && (
        <section className="mt-12">
          <SectionHeading title={t(locale, "home.latestInterviews")} href="/section/interviews" moreLabel={t(locale, "common.all")} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {interviews.map((a) => (
              <ArticleCard key={a.id} article={a} locale={locale} variant="lead" />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mt-16 rounded-lg border hairline bg-ink-50 p-8 text-center dark:bg-ink-900/40">
        <h2 className="font-serif text-2xl font-bold">{t(locale, "newsletter.title")}</h2>
        <p className="mx-auto mt-2 max-w-xl text-ink-500 dark:text-ink-400">{t(locale, "newsletter.desc")}</p>
        <Link href="/#newsletter" className="mt-4 inline-block rounded-full bg-brand px-6 py-2.5 font-semibold text-white hover:bg-brand-700">
          {t(locale, "nav.subscribe")}
        </Link>
      </section>
    </div>
  );
}
