import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { SITE } from "@/lib/site-config";
import { getMasthead } from "@/lib/settings";

export const metadata: Metadata = { title: "О редакции", alternates: { canonical: "/about" } };

export default async function AboutPage() {
  const [team, masthead] = await Promise.all([
    prisma.user.findMany({ where: { role: { in: ["EDITOR", "JOURNALIST"] }, isActive: true }, orderBy: { role: "asc" } }),
    getMasthead(),
  ]);

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold">О редакции</h1>
        <div className="prose-editorial mt-6">
          <p><strong>{SITE.name}</strong> — независимое международное деловое медиа и платформа для интервью, аналитики и исследований на стыке технологий, искусственного интеллекта, инвестиций, предпринимательства и геополитики.</p>
          <p>Наша миссия — объяснять, как устроена новая экономика, и давать предпринимателям, инвесторам и руководителям точную, проверенную и независимую картину мира.</p>
          <h2>Что мы делаем</h2>
          <ul>
            <li>Глубокая аналитика и расследования о рынках и технологиях.</li>
            <li>Интервью с предпринимателями, инвесторами и экспертами.</li>
            <li>Подкасты, видео и спецпроекты о бизнесе и инновациях.</li>
          </ul>
        </div>

        <section className="mt-10">
          <h2 className="font-serif text-2xl font-bold">Команда</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {team.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-lg border hairline p-3">
                {m.image && <Image src={m.image} alt={m.name ?? ""} width={48} height={48} className="h-12 w-12 rounded-full object-cover" />}
                <div>
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-xs text-ink-500">{m.position}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-lg border hairline bg-ink-50 p-5 text-sm dark:bg-ink-900/40">
          <h2 className="font-serif text-lg font-bold">Выходные данные</h2>
          <dl className="mt-3 space-y-1 text-ink-600 dark:text-ink-300">
            <div><dt className="inline font-semibold">Регистрация СМИ: </dt><dd className="inline">{masthead.registration}</dd></div>
            <div><dt className="inline font-semibold">Учредитель: </dt><dd className="inline">{masthead.founder}</dd></div>
            <div><dt className="inline font-semibold">Главный редактор: </dt><dd className="inline">{masthead.editorInChief}</dd></div>
            <div><dt className="inline font-semibold">Контакты: </dt><dd className="inline">{masthead.contacts}</dd></div>
          </dl>
        </section>
      </div>
    </div>
  );
}
