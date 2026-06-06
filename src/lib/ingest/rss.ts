import { XMLParser } from "fast-xml-parser";
import type { RssSource } from "./sources";

export type RawItem = {
  title: string;
  link: string;
  description: string;
  publishedAt: Date | null;
  image?: string;
  source: string;
  defaultCategory: string;
  locale: "ru" | "en";
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
});

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim();
}

function text(node: unknown): string {
  if (node == null) return "";
  if (typeof node === "string") return node;
  if (typeof node === "object" && "#text" in (node as Record<string, unknown>)) {
    return String((node as Record<string, unknown>)["#text"] ?? "");
  }
  return String(node);
}

function pickLink(item: Record<string, unknown>): string {
  // RSS: <link>url</link>; Atom: <link href="url"/> (possibly array)
  const link = item.link;
  if (typeof link === "string") return link;
  if (Array.isArray(link)) {
    const alt = link.find((l) => (l as Record<string, unknown>)["@_rel"] === "alternate") ?? link[0];
    return String((alt as Record<string, unknown>)?.["@_href"] ?? "");
  }
  if (link && typeof link === "object") {
    return String((link as Record<string, unknown>)["@_href"] ?? text(link));
  }
  return String(item.guid ? text(item.guid) : "");
}

function pickImage(item: Record<string, unknown>): string | undefined {
  const enclosure = item.enclosure as Record<string, unknown> | undefined;
  if (enclosure?.["@_url"] && String(enclosure["@_type"] ?? "").startsWith("image")) {
    return String(enclosure["@_url"]);
  }
  const media = (item["media:content"] || item["media:thumbnail"]) as Record<string, unknown> | undefined;
  if (media?.["@_url"]) return String(media["@_url"]);
  // Try to find an <img> inside the description/content
  const html = String(text(item.description) || text(item["content:encoded"]) || "");
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m?.[1];
}

export function parseFeed(xml: string, source: RssSource, limit = 8): RawItem[] {
  const data = parser.parse(xml);

  // RSS 2.0: rss.channel.item[] ; Atom: feed.entry[]
  const channel = data?.rss?.channel ?? data?.feed ?? {};
  const rawItems = channel.item ?? channel.entry ?? [];
  const items = Array.isArray(rawItems) ? rawItems : [rawItems];

  return items
    .slice(0, limit)
    .map((it: Record<string, unknown>): RawItem => {
      const title = stripHtml(text(it.title));
      const description = stripHtml(text(it.description) || text(it.summary) || text(it["content:encoded"]));
      const dateStr = text(it.pubDate) || text(it.published) || text(it.updated);
      const d = dateStr ? new Date(dateStr) : null;
      return {
        title,
        link: pickLink(it),
        description: description.slice(0, 1200),
        publishedAt: d && !isNaN(d.getTime()) ? d : null,
        image: pickImage(it),
        source: source.name,
        defaultCategory: source.defaultCategory,
        locale: source.locale,
      };
    })
    .filter((i: RawItem) => i.title && i.link);
}

export async function fetchRss(source: RssSource, limit = 8): Promise<RawItem[]> {
  try {
    const res = await fetch(source.url, {
      headers: { "User-Agent": "PyatakovMediaBot/1.0 (+https://pyatakov.media)" },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    if (xml.length < 100) return []; // proxy/block stub
    return parseFeed(xml, source, limit);
  } catch {
    return [];
  }
}
