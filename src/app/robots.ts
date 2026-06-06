import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/studio", "/api/", "/login", "/register", "/search"],
      },
      // Explicit allowances for major engines (Google, Yandex, Bing)
      { userAgent: "Googlebot", allow: "/" },
      { userAgent: "Yandex", allow: "/" },
      { userAgent: "Bingbot", allow: "/" },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
