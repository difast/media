import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="font-serif text-7xl font-bold text-brand-600">404</div>
      <h1 className="mt-4 font-serif text-2xl font-bold">Страница не найдена</h1>
      <p className="mt-2 max-w-md text-ink-500">
        Возможно, материал перемещён в архив или ссылка устарела.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="rounded-full bg-brand px-5 py-2 font-semibold text-white hover:bg-brand-700">На главную</Link>
        <Link href="/archive" className="rounded-full border hairline px-5 py-2 font-semibold hover:border-brand">Архив</Link>
      </div>
    </div>
  );
}
