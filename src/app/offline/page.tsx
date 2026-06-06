import Link from "next/link";

export const metadata = { title: "Нет соединения", robots: { index: false } };

export default function OfflinePage() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <h1 className="font-serif text-3xl font-bold">Нет соединения</h1>
      <p className="mt-2 max-w-md text-ink-500">
        Похоже, вы офлайн. Проверьте подключение к интернету и попробуйте снова.
      </p>
      <Link href="/" className="mt-6 rounded-full bg-brand px-5 py-2 font-semibold text-white hover:bg-brand-700">Обновить</Link>
    </div>
  );
}
