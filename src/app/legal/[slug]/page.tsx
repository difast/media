import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LEGAL_CONTENT } from "@/lib/legal-content";
import { formatDate } from "@/lib/utils";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(LEGAL_CONTENT).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const doc = LEGAL_CONTENT[slug];
  return { title: doc?.title ?? "Документ", alternates: { canonical: `/legal/${slug}` } };
}

export default async function LegalPage({ params }: Params) {
  const { slug } = await params;
  const doc = LEGAL_CONTENT[slug];
  if (!doc) notFound();

  return (
    <div className="container-page py-10">
      <article className="mx-auto max-w-3xl">
        <h1 className="font-serif text-4xl font-bold">{doc.title}</h1>
        <p className="mt-2 text-sm text-ink-400">Редакция от {formatDate(doc.updated)}</p>
        <div className="prose-editorial mt-8" dangerouslySetInnerHTML={{ __html: doc.html }} />
      </article>
    </div>
  );
}
