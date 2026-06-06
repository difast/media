import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, canWrite } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/studio";
import { SITE } from "@/lib/site-config";

const NAV = [
  { href: "/studio", label: "Дашборд", editorOnly: false },
  { href: "/studio/articles", label: "Публикации", editorOnly: false },
  { href: "/studio/articles/new", label: "Создать материал", editorOnly: false },
  { href: "/studio/automation", label: "Автоматизация (ИИ-бот)", editorOnly: true },
  { href: "/studio/comments", label: "Комментарии", editorOnly: true },
  { href: "/studio/taxonomy", label: "Рубрики и теги", editorOnly: true },
  { href: "/studio/users", label: "Пользователи и авторы", editorOnly: true },
  { href: "/studio/ads", label: "Реклама", editorOnly: true },
  { href: "/studio/media", label: "Медиа-библиотека", editorOnly: true },
  { href: "/studio/settings", label: "Выходные данные", editorOnly: true },
];

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || !canWrite(session.user.role)) {
    redirect("/login?callbackUrl=/studio");
  }
  const isEditor = session.user.role === "EDITOR";
  const items = NAV.filter((n) => !n.editorOnly || isEditor);

  return (
    <div className="container-page grid gap-8 py-8 lg:grid-cols-[240px_1fr]">
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="mb-4">
          <Link href="/" className="font-serif text-lg font-bold">{SITE.name}</Link>
          <div className="text-xs text-ink-400">CMS · {session.user.role === "EDITOR" ? "Главный редактор" : "Журналист"}</div>
        </div>
        <nav className="space-y-1">
          {items.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <form action={logoutAction} className="mt-6">
          <button className="text-sm text-brand-600 hover:underline">Выйти</button>
        </form>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
