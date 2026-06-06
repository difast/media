export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed hairline px-6 py-16 text-center">
      <h2 className="font-serif text-xl font-semibold text-ink-700 dark:text-ink-200">{title}</h2>
      {description && <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">{description}</p>}
    </div>
  );
}
