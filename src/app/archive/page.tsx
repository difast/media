import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/locale";
import { SECTIONS, INFO_PAGES } from "@/lib/site-config";
import { pick } from "@/lib/locale";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Архив", alternates: { canonical: "/archive" } };

export default async function ArchivePage() {
  const locale = await getLocale();
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    take: 200,
    select: { slug: true, title: true, publishedAt: true, category: { select: { title: true, titleEn: true, slug: true } } },
  });

  // Group by year-month
  const groups = new Map<string, typeof articles>();
  for (const a of articles) {
    if (!a.publishedAt) continue;
    const key = `${a.publishedAt.getFullYear()}-${String(a.publishedAt.getMonth() + 1).padStart(2, "0")}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(a);
  }

  return (
    <div className="container-page py-8">
      <h1 className="mb-2 font-serif text-3xl sm:text-4xl font-bold">{locale === "ru" ? "Архив" : "Archive"}</h1>
      <p className="mb-8 text-ink-500">{locale === "ru" ? "Полный каталог материалов и разделов." : "Full catalogue of articles and sections."}</p>

      {/* Sections index */}
      <section className="mb-10">
        <h2 className="kicker mb-3">{locale === "ru" ? "Разделы" : "Sections"}</h2>
        <div className="flex flex-wrap gap-2">
          {[...SECTIONS, ...INFO_PAGES.map((p) => ({ slug: p.slug, title: p.title, info: true }))].map((s: any) => (
            <Link
              key={s.slug}
              href={s.info ? `/${s.slug}` : `/section/${s.slug}`}
              className="rounded-full border hairline px-3 py-1 text-sm hover:border-brand hover:text-brand-600"
            >
              {pick(s.title, locale)}
            </Link>
          ))}
        </div>
      </section>

      {/* Chronological archive */}
      {[...groups.entries()].map(([key, items]) => (
        <section key={key} className="mb-8">
          <h2 className="mb-2 border-b hairline pb-1 font-serif text-lg font-bold">{key}</h2>
          <ul className="space-y-1">
            {items.map((a) => (
              <li key={a.slug} className="flex flex-wrap items-baseline gap-2 text-sm">
                <time className="w-28 shrink-0 text-ink-400">{a.publishedAt && formatDate(a.publishedAt, locale)}</time>
                <Link href={`/article/${a.slug}`} className="headline-hover">{a.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
