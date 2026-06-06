import type { Locale } from "@/lib/site-config";
import { t } from "@/lib/i18n";

type Podcast = {
  episodeNumber: number | null;
  duration: string | null;
  audioUrl: string | null;
  links: unknown;
  seriesName: string | null;
};

export function PodcastBlock({ podcast, locale }: { podcast: Podcast; locale: Locale }) {
  const links = (podcast.links as { platform: string; url: string }[] | null) ?? [];

  return (
    <section className="mt-6 rounded-lg border hairline bg-ink-50 p-5 dark:bg-ink-900/40">
      <div className="flex flex-wrap items-center gap-2 text-sm text-ink-500">
        {podcast.seriesName && <span className="font-semibold text-ink-700 dark:text-ink-200">{podcast.seriesName}</span>}
        {podcast.episodeNumber != null && <span>· {t(locale, "podcast.episode")} №{podcast.episodeNumber}</span>}
        {podcast.duration && <span>· {podcast.duration}</span>}
      </div>

      {podcast.audioUrl && (
        <audio controls className="mt-4 w-full">
          <source src={podcast.audioUrl} />
        </audio>
      )}

      {links.length > 0 && (
        <div className="mt-4">
          <div className="kicker mb-2">{t(locale, "podcast.listen")}</div>
          <div className="flex flex-wrap gap-2">
            {links.map((l) => (
              <a
                key={l.platform}
                href={l.url}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-full border hairline px-4 py-1.5 text-sm font-medium transition-colors hover:border-brand hover:text-brand-600"
              >
                {l.platform} ↗
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
