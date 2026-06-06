import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/lib/site-config";
import { t } from "@/lib/i18n";

type Interview = {
  guestName: string;
  guestPhoto: string | null;
  guestBio: string | null;
  guestTitle: string | null;
  videoUrl: string | null;
  transcript: string | null;
  timecodes: unknown;
  keyQuotes: unknown;
  relatedSlugs: unknown;
};

export function InterviewBlock({ interview, locale }: { interview: Interview; locale: Locale }) {
  const timecodes = (interview.timecodes as { time: string; label: string }[] | null) ?? [];
  const quotes = (interview.keyQuotes as string[] | null) ?? [];
  const related = (interview.relatedSlugs as string[] | null) ?? [];

  return (
    <div className="mt-10 space-y-10">
      {/* Guest profile */}
      <section className="flex flex-col gap-4 rounded-lg border hairline bg-ink-50 p-5 dark:bg-ink-900/40 sm:flex-row sm:items-center">
        {interview.guestPhoto && (
          <Image src={interview.guestPhoto} alt={interview.guestName} width={96} height={96} className="h-24 w-24 rounded-full object-cover" />
        )}
        <div>
          <div className="kicker">{t(locale, "interview.guest")}</div>
          <h3 className="font-serif text-xl font-bold">{interview.guestName}</h3>
          {interview.guestTitle && <p className="text-sm text-ink-500">{interview.guestTitle}</p>}
          {interview.guestBio && <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">{interview.guestBio}</p>}
        </div>
      </section>

      {/* Video */}
      {interview.videoUrl && (
        <section>
          <div className="aspect-video overflow-hidden rounded-sm">
            <iframe src={interview.videoUrl} title={interview.guestName} allowFullScreen className="h-full w-full" />
          </div>
        </section>
      )}

      {/* Key quotes */}
      {quotes.length > 0 && (
        <section>
          <h3 className="kicker mb-3">{t(locale, "interview.quotes")}</h3>
          <div className="space-y-3">
            {quotes.map((q, i) => (
              <blockquote key={i} className="border-l-4 border-brand pl-4 font-serif text-lg italic text-ink-700 dark:text-ink-200">
                «{q}»
              </blockquote>
            ))}
          </div>
        </section>
      )}

      {/* Timecodes */}
      {timecodes.length > 0 && (
        <section>
          <h3 className="kicker mb-3">{t(locale, "interview.timecodes")}</h3>
          <ul className="divide-y hairline rounded-sm border hairline">
            {timecodes.map((tc, i) => (
              <li key={i} className="flex gap-3 px-4 py-2 text-sm">
                <span className="font-mono font-semibold text-brand-600">{tc.time}</span>
                <span>{tc.label}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Transcript */}
      {interview.transcript && (
        <section>
          <h3 className="kicker mb-3">{t(locale, "interview.transcript")}</h3>
          <div className="prose-editorial" dangerouslySetInnerHTML={{ __html: interview.transcript }} />
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section>
          <h3 className="kicker mb-3">{t(locale, "article.related")}</h3>
          <ul className="space-y-1 text-sm">
            {related.map((slug) => (
              <li key={slug}>
                <Link href={`/article/${slug}`} className="text-brand-600 hover:underline">/article/{slug}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
