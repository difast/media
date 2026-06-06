import type { Metadata } from "next";
import { LEGAL_CONTENT } from "@/lib/legal-content";
import { formatDate } from "@/lib/utils";

const doc = LEGAL_CONTENT["editorial-policy"];

export const metadata: Metadata = {
  title: doc.title,
  alternates: { canonical: "/editorial-policy" },
};

export default function EditorialPolicyPage() {
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
