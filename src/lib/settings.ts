import { prisma } from "./prisma";

// Masthead / "выходные данные СМИ" — placeholder values until official
// media-registration documents are issued. Stored in SiteSetting (key/value)
// and editable from the CMS; falls back to these defaults.
const MASTHEAD_DEFAULTS = {
  registration: "Свидетельство о регистрации СМИ — в процессе оформления",
  founder: "ООО «Пятаков Медиа» (реквизиты будут внесены после регистрации)",
  editorInChief: "Главный редактор — будет указан после назначения",
  contacts: "editorial@pyatakov.media",
  legalEntity: "Юридическое лицо и ИНН будут внесены после регистрации",
  ageRating: "18+",
};

export type Masthead = typeof MASTHEAD_DEFAULTS;

export async function getMasthead(): Promise<Masthead> {
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { startsWith: "masthead." } },
    });
    const map = Object.fromEntries(rows.map((r) => [r.key.replace("masthead.", ""), r.value]));
    return { ...MASTHEAD_DEFAULTS, ...map } as Masthead;
  } catch {
    return MASTHEAD_DEFAULTS;
  }
}

export async function getSetting(key: string): Promise<string | null> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    return row?.value ?? null;
  } catch {
    return null;
  }
}

export async function setSetting(key: string, value: string) {
  await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}
