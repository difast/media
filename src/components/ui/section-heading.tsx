import Link from "next/link";

export function SectionHeading({
  title,
  href,
  moreLabel,
}: {
  title: string;
  href?: string;
  moreLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-baseline justify-between border-b-2 border-ink-950 pb-2 dark:border-ink-100">
      <h2 className="font-serif text-xl font-bold tracking-tight">{title}</h2>
      {href && (
        <Link href={href} className="text-xs font-semibold uppercase tracking-wider text-brand-600 hover:underline">
          {moreLabel ?? "→"}
        </Link>
      )}
    </div>
  );
}
