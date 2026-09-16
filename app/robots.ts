import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/testpage",
          "/testpage/*",
          "/screenshot",
          "/screenshot/*",
          "/old-home",
          "/old-home/*",
          "/font-debug",
          "/font-debug/*",
          "/svg-demo",
          "/svg-demo/*",
          "/api/*"
        ]
      }
    ],
    sitemap: "https://radioapex.com.tr/sitemap.xml"
  };
}
