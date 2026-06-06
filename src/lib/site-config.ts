// Central configuration for Pyatakov Media: identity, sections, navigation, i18n.

export const SITE = {
  name: "Pyatakov Media",
  shortName: "Pyatakov",
  domain: "pyatakov.media",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  tagline: {
    ru: "Независимое международное деловое медиа",
    en: "Independent international business media",
  },
  description: {
    ru: "Pyatakov Media — независимое деловое издание: интервью, аналитика, технологии, искусственный интеллект, инвестиции, стартапы и геополитика.",
    en: "Pyatakov Media — independent business outlet: interviews, analytics, technology, AI, investment, startups and geopolitics.",
  },
  locales: ["ru", "en"] as const,
  defaultLocale: "ru" as const,
  social: {
    telegram: "https://t.me/pyatakovmedia",
    twitter: "https://x.com/pyatakovmedia",
    youtube: "https://youtube.com/@pyatakovmedia",
  },
} as const;

export type Locale = (typeof SITE.locales)[number];

// ─── Sections (mirror DB Category.kind / slug). Order matters for nav. ───
export type SectionDef = {
  slug: string;
  title: { ru: string; en: string };
  kind: "ARTICLE" | "INTERVIEW" | "PODCAST" | "VIDEO" | "RATING" | "SPECIAL";
  /** show in primary top navigation */
  primary?: boolean;
};

export const SECTIONS: SectionDef[] = [
  { slug: "news", title: { ru: "Новости", en: "News" }, kind: "ARTICLE", primary: true },
  { slug: "analytics", title: { ru: "Аналитика", en: "Analytics" }, kind: "ARTICLE", primary: true },
  { slug: "interviews", title: { ru: "Интервью", en: "Interviews" }, kind: "INTERVIEW", primary: true },
  { slug: "podcasts", title: { ru: "Подкасты", en: "Podcasts" }, kind: "PODCAST", primary: true },
  { slug: "columns", title: { ru: "Колонки", en: "Columns" }, kind: "ARTICLE", primary: true },
  { slug: "technology", title: { ru: "Технологии", en: "Technology" }, kind: "ARTICLE", primary: true },
  { slug: "ai", title: { ru: "ИИ", en: "AI" }, kind: "ARTICLE", primary: true },
  { slug: "startups", title: { ru: "Стартапы", en: "Startups" }, kind: "ARTICLE", primary: true },
  { slug: "investment", title: { ru: "Инвестиции", en: "Investment" }, kind: "ARTICLE", primary: true },
  { slug: "business", title: { ru: "Бизнес", en: "Business" }, kind: "ARTICLE", primary: true },
  { slug: "geopolitics", title: { ru: "Геополитика", en: "Geopolitics" }, kind: "ARTICLE", primary: true },
  { slug: "opinions", title: { ru: "Мнения", en: "Opinions" }, kind: "ARTICLE", primary: true },
  { slug: "investigations", title: { ru: "Расследования", en: "Investigations" }, kind: "ARTICLE" },
  { slug: "ratings", title: { ru: "Рейтинги", en: "Ratings" }, kind: "RATING" },
  { slug: "special", title: { ru: "Спецпроекты", en: "Special projects" }, kind: "SPECIAL" },
  { slug: "video", title: { ru: "Видео", en: "Video" }, kind: "VIDEO" },
];

export const PRIMARY_SECTIONS = SECTIONS.filter((s) => s.primary);

// Static informational pages
export const INFO_PAGES = [
  { slug: "about", title: { ru: "О редакции", en: "About" } },
  { slug: "editorial-policy", title: { ru: "Редакционная политика", en: "Editorial policy" } },
  { slug: "contacts", title: { ru: "Контакты", en: "Contacts" } },
  { slug: "advertising", title: { ru: "Рекламодателям", en: "Advertising" } },
  { slug: "support", title: { ru: "Поддержка проекта", en: "Support the project" } },
  { slug: "archive", title: { ru: "Архив", en: "Archive" } },
];

export const LEGAL_PAGES = [
  { slug: "terms", title: { ru: "Пользовательское соглашение", en: "Terms of Use" } },
  { slug: "privacy", title: { ru: "Политика конфиденциальности", en: "Privacy Policy" } },
  { slug: "cookies", title: { ru: "Cookie Policy", en: "Cookie Policy" } },
  { slug: "editorial-policy", title: { ru: "Редакционная политика", en: "Editorial Policy" } },
  { slug: "citation", title: { ru: "Правила цитирования", en: "Citation Rules" } },
  { slug: "usage", title: { ru: "Правила использования материалов", en: "Content Usage Rules" } },
];

export function sectionBySlug(slug: string) {
  return SECTIONS.find((s) => s.slug === slug);
}
