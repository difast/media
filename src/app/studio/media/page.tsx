import Image from "next/image";
import { prisma } from "@/lib/prisma";

export default async function MediaLibraryPage() {
  const assets = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold">Медиа-библиотека</h1>
      <p className="mt-1 text-sm text-ink-500">
        Каталог изображений, видео и аудио. Внешние ассеты можно вставлять по URL прямо в редакторе материала.
      </p>

      {assets.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed hairline p-10 text-center text-sm text-ink-400">
          Библиотека пуста. В текущей версии медиа подключаются по внешним URL (CDN/Unsplash) в форме материала.
          Загрузка файлов будет добавлена после подключения объектного хранилища.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {assets.map((a) => (
            <figure key={a.id} className="overflow-hidden rounded-lg border hairline">
              {a.type === "image" && (
                <div className="relative aspect-[4/3] bg-ink-100 dark:bg-ink-800">
                  <Image src={a.url} alt={a.alt ?? ""} fill sizes="200px" className="object-cover" />
                </div>
              )}
              <figcaption className="truncate p-2 text-xs text-ink-500">{a.caption ?? a.url}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
