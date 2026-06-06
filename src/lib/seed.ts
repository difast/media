import bcrypt from "bcryptjs";
import type { ArticleStatus } from "@prisma/client";
import { prisma } from "./prisma";

// Idempotent database seeding (all upserts). Shared by `prisma/seed.ts` (CLI)
// and the protected /api/admin/seed endpoint so the production DB can be
// populated without external psql access.

const SECTIONS = [
  { slug: "news", ru: "Новости", en: "News", kind: "ARTICLE" },
  { slug: "analytics", ru: "Аналитика", en: "Analytics", kind: "ARTICLE" },
  { slug: "interviews", ru: "Интервью", en: "Interviews", kind: "INTERVIEW" },
  { slug: "podcasts", ru: "Подкасты", en: "Podcasts", kind: "PODCAST" },
  { slug: "columns", ru: "Колонки", en: "Columns", kind: "ARTICLE" },
  { slug: "technology", ru: "Технологии", en: "Technology", kind: "ARTICLE" },
  { slug: "ai", ru: "ИИ", en: "AI", kind: "ARTICLE" },
  { slug: "startups", ru: "Стартапы", en: "Startups", kind: "ARTICLE" },
  { slug: "investment", ru: "Инвестиции", en: "Investment", kind: "ARTICLE" },
  { slug: "business", ru: "Бизнес", en: "Business", kind: "ARTICLE" },
  { slug: "geopolitics", ru: "Геополитика", en: "Geopolitics", kind: "ARTICLE" },
  { slug: "opinions", ru: "Мнения", en: "Opinions", kind: "ARTICLE" },
  { slug: "investigations", ru: "Расследования", en: "Investigations", kind: "ARTICLE" },
  { slug: "ratings", ru: "Рейтинги", en: "Ratings", kind: "RATING" },
  { slug: "special", ru: "Спецпроекты", en: "Special projects", kind: "SPECIAL" },
  { slug: "video", ru: "Видео", en: "Video", kind: "VIDEO" },
] as const;

const TAGS = [
  "Искусственный интеллект", "Венчур", "Финтех", "Полупроводники",
  "Криптовалюты", "Энергетика", "Макроэкономика", "Кибербезопасность",
  "Космос", "Биотех", "ESG", "Регулирование",
];

const PHOTOS = [
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=70",
];
const PORTRAITS = [
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=70",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=70",
  "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=400&q=70",
];

const BODY = `
<p>Этот материал подготовлен редакцией <strong>Pyatakov Media</strong>. Мы анализируем процессы, которые определяют будущее мировой экономики, технологий и геополитики.</p>
<h2>Контекст</h2>
<p>Рынок переживает структурную трансформацию. Инвесторы и предприниматели пересматривают стратегии на фоне ускоренного внедрения искусственного интеллекта и переоценки рисков.</p>
<blockquote>«Скорость изменений сегодня — это и есть главное конкурентное преимущество», — отмечают участники рынка.</blockquote>
<h2>Что это значит</h2>
<p>Мы выделяем три ключевых фактора: динамику капитала, регуляторную среду и технологическую зрелость. Каждый из них способен изменить расстановку сил в отрасли.</p>
<ul><li>Перераспределение венчурного капитала в пользу инфраструктурных проектов.</li><li>Усиление требований к прозрачности и управлению данными.</li><li>Рост спроса на вычислительные мощности.</li></ul>
<p>Редакция продолжит следить за развитием событий и представит детальную аналитику в ближайших выпусках.</p>
`;

const TITLES = [
  "Глобальные фонды наращивают ставки на инфраструктуру искусственного интеллекта",
  "Полупроводниковая гонка: кто контролирует цепочки поставок в 2026 году",
  "Венчурный рынок восстанавливается: где сосредоточен капитал",
  "Энергопереход и центры обработки данных: новая экономика мощности",
  "Финтех нового поколения: банки против необанков",
  "Геополитика технологий: как санкции меняют карту инноваций",
  "Криптоиндустрия после регулирования: зрелость вместо хайпа",
  "Стартапы deep tech привлекают рекордные раунды",
  "Макроэкономический прогноз: ставки, инфляция и рынки",
  "Кибербезопасность как фактор национальной устойчивости",
  "Космическая экономика: частный капитал выходит на орбиту",
  "Биотех на пороге прорыва: инвестиции в долголетие",
  "ESG-повестка: от деклараций к измеримым результатам",
  "Искусственный интеллект в корпоративном управлении",
  "Рейтинг самых влиятельных технологических компаний",
];

export type SeedResult = { articles: number; authors: number; categories: number; admin: string };

export async function seedDatabase(): Promise<SeedResult> {
  // ── Categories ──
  const categories = [];
  for (let i = 0; i < SECTIONS.length; i++) {
    const s = SECTIONS[i];
    const c = await prisma.category.upsert({
      where: { slug: s.slug },
      update: { title: s.ru, titleEn: s.en, kind: s.kind as never, order: i },
      create: { slug: s.slug, title: s.ru, titleEn: s.en, kind: s.kind as never, order: i },
    });
    categories.push(c);
  }

  // ── Tags ──
  const tags = [];
  for (const title of TAGS) {
    const slug = title.toLowerCase().replace(/[^a-zа-я0-9]+/gi, "-").replace(/(^-|-$)/g, "");
    tags.push(await prisma.tag.upsert({ where: { slug }, update: {}, create: { slug, title } }));
  }

  // ── Users ──
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "editor@pyatakov.media";
  const adminPass = process.env.SEED_ADMIN_PASSWORD || "ChangeMe!2026";
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "EDITOR" },
    create: {
      email: adminEmail, name: "Главная редакция", slug: "editorial",
      position: "Главный редактор", role: "EDITOR",
      passwordHash: await bcrypt.hash(adminPass, 10), bio: "Редакция Pyatakov Media.",
    },
  });

  const journalists = await Promise.all(
    [
      { email: "a.volkova@pyatakov.media", name: "Анна Волкова", position: "Обозреватель по технологиям", slug: "anna-volkova" },
      { email: "i.petrov@pyatakov.media", name: "Игорь Петров", position: "Редактор отдела финансов", slug: "igor-petrov" },
      { email: "m.sokolova@pyatakov.media", name: "Мария Соколова", position: "Корреспондент по геополитике", slug: "maria-sokolova" },
    ].map((j, idx) =>
      prisma.user.upsert({
        where: { email: j.email },
        update: {},
        create: {
          ...j, role: "JOURNALIST", image: PORTRAITS[idx % PORTRAITS.length],
          passwordHash: bcrypt.hashSync("Journalist!2026", 10),
          bio: `${j.name} — ${j.position} в Pyatakov Media.`,
        },
      })
    )
  );
  const authors = [admin, ...journalists];

  // ── Articles ──
  const now = Date.now();
  const articleCatSlugs = ["news", "analytics", "technology", "ai", "startups", "investment", "business", "geopolitics", "opinions", "columns", "investigations", "ratings"];
  let created = 0;
  for (let i = 0; i < TITLES.length; i++) {
    const catSlug = articleCatSlugs[i % articleCatSlugs.length];
    const category = categories.find((c) => c.slug === catSlug)!;
    const author = authors[i % authors.length];
    const slug = `material-${i + 1}-${catSlug}`;
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) { created++; continue; }

    const article = await prisma.article.create({
      data: {
        slug, status: "PUBLISHED" as ArticleStatus, title: TITLES[i],
        subtitle: "Деловой разбор: ключевые факты, цифры и прогнозы рынка.",
        excerpt: "Редакция Pyatakov Media анализирует главные тренды и объясняет, что они означают для инвесторов и предпринимателей.",
        body: BODY, authorTitle: author.position,
        coverImage: PHOTOS[i % PHOTOS.length], coverCaption: "Фото: Pyatakov Media",
        readingMinutes: 4 + (i % 5),
        sources: [{ title: "Pyatakov Media research", url: "https://pyatakov.media" }],
        footnotes: [], isFeatured: i < 5, isBreaking: i < 6, isEditorPick: i % 4 === 0,
        viewCount: Math.floor(Math.random() * 9000) + 500, publishedAt: new Date(now - i * 7 * 3600 * 1000),
        authorId: author.id, categoryId: category.id,
        tags: { create: [{ tagId: tags[i % tags.length].id }, { tagId: tags[(i + 3) % tags.length].id }] },
      },
    });
    created++;
    await prisma.articleRevision.create({
      data: { articleId: article.id, editorId: author.id, title: article.title, subtitle: article.subtitle, body: article.body, status: "PUBLISHED", note: "Первая публикация" },
    }).catch(() => {});
  }

  // ── Interviews ──
  const interviewCat = categories.find((c) => c.slug === "interviews")!;
  const interviewData = [
    { guest: "Дмитрий Орлов", title: "генеральный директор технологического холдинга", t: "«Будущее за компаниями, которые умеют управлять данными»" },
    { guest: "Елена Кузнецова", title: "управляющий партнёр венчурного фонда", t: "«Венчур возвращается к фундаментальным метрикам»" },
    { guest: "Артур Гасанов", title: "основатель AI-стартапа", t: "«Искусственный интеллект меняет саму природу труда»" },
  ];
  for (let i = 0; i < interviewData.length; i++) {
    const d = interviewData[i];
    const slug = `interview-${i + 1}`;
    if (await prisma.article.findUnique({ where: { slug } })) continue;
    await prisma.article.create({
      data: {
        slug, status: "PUBLISHED", title: d.t, subtitle: `Интервью с ${d.guest}`,
        excerpt: `Большой разговор о технологиях, рынке и стратегии. Гость — ${d.guest}, ${d.title}.`,
        body: BODY, coverImage: PORTRAITS[i % PORTRAITS.length], readingMinutes: 12,
        isFeatured: i === 0, viewCount: Math.floor(Math.random() * 5000) + 1000,
        publishedAt: new Date(now - (i + 1) * 2 * 24 * 3600 * 1000),
        authorId: authors[i % authors.length].id, categoryId: interviewCat.id,
        interview: {
          create: {
            guestName: d.guest, guestTitle: d.title, guestPhoto: PORTRAITS[i % PORTRAITS.length],
            guestBio: `${d.guest} — ${d.title}. Более 15 лет опыта в технологической индустрии и инвестициях.`,
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            transcript: "<p>— Расскажите, как вы пришли в индустрию?</p><p>— Это был долгий путь...</p>",
            timecodes: [{ time: "00:00", label: "Вступление" }, { time: "05:30", label: "О рынке" }, { time: "18:40", label: "Прогнозы" }],
            keyQuotes: [d.t.replace(/[«»]/g, ""), "Скорость изменений — главное преимущество."],
            relatedSlugs: ["material-1-news", "material-2-analytics"],
          },
        },
      },
    });
  }

  // ── Podcasts ──
  const podcastCat = categories.find((c) => c.slug === "podcasts")!;
  for (let i = 0; i < 3; i++) {
    const slug = `podcast-${i + 1}`;
    if (await prisma.article.findUnique({ where: { slug } })) continue;
    await prisma.article.create({
      data: {
        slug, status: "PUBLISHED", title: `Выпуск №${i + 1}: разговоры о деньгах и технологиях`,
        subtitle: "Подкаст Pyatakov Media", excerpt: "Еженедельный подкаст о бизнесе, инвестициях и технологиях.",
        body: BODY, coverImage: PHOTOS[(i + 5) % PHOTOS.length], readingMinutes: 1,
        publishedAt: new Date(now - (i + 1) * 3 * 24 * 3600 * 1000), authorId: admin.id, categoryId: podcastCat.id,
        podcast: {
          create: {
            episodeNumber: i + 1, duration: `${40 + i}:1${i}`, seriesName: "Деньги и технологии",
            links: [
              { platform: "YouTube", url: "https://youtube.com/@pyatakovmedia" },
              { platform: "Spotify", url: "https://spotify.com" },
              { platform: "Apple Podcasts", url: "https://podcasts.apple.com" },
              { platform: "Яндекс Музыка", url: "https://music.yandex.ru" },
            ],
          },
        },
      },
    });
  }

  // ── Ads ──
  await prisma.ad.upsert({
    where: { id: "seed-ad-sidebar" }, update: {},
    create: { id: "seed-ad-sidebar", title: "Реклама в Pyatakov Media", slot: "SIDEBAR", targetUrl: "/advertising", html: "<div>Ваша реклама здесь</div>", isActive: true },
  });

  // ── Masthead placeholders ──
  const masthead: Record<string, string> = {
    "masthead.registration": "Свидетельство о регистрации СМИ — в процессе оформления",
    "masthead.founder": "ООО «Пятаков Медиа» (реквизиты вносятся после регистрации)",
    "masthead.editorInChief": "Главный редактор — будет указан после назначения",
    "masthead.contacts": "editorial@pyatakov.media",
    "masthead.legalEntity": "ИНН/ОГРН — будут внесены после регистрации",
    "masthead.ageRating": "18+",
  };
  for (const [key, value] of Object.entries(masthead)) {
    await prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }

  return { articles: created, authors: authors.length, categories: categories.length, admin: adminEmail };
}
