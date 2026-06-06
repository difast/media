import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.shortName,
    description: SITE.description.ru,
    start_url: "/",
    display: "standalone",
    background_color: "#fffdf9",
    theme_color: "#9b1c1c",
    lang: "ru",
    categories: ["news", "business", "technology"],
    icons: [
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
