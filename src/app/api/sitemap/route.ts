import { NextResponse } from "next/server";
import { getPublishedArticles } from "@/lib/firebase/articles";
import type { Article } from "@/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fabricadeliberdade.com.br";

export async function GET() {
  let articles: Article[] = [];
  try {
    articles = await getPublishedArticles(200);
  } catch {
    articles = [];
  }

  const staticPages = [
    { path: "", priority: "1.0", changefreq: "daily" },
    { path: "/blog", priority: "0.9", changefreq: "daily" },
    { path: "/ferramentas", priority: "0.8", changefreq: "weekly" },
    { path: "/sobre", priority: "0.5", changefreq: "monthly" },
    { path: "/contato", priority: "0.5", changefreq: "monthly" },
    { path: "/privacidade", priority: "0.3", changefreq: "yearly" },
    { path: "/termos", priority: "0.3", changefreq: "yearly" },
    { path: "/en", priority: "0.9", changefreq: "daily" },
    { path: "/en/blog", priority: "0.8", changefreq: "daily" },
    { path: "/en/ferramentas", priority: "0.7", changefreq: "weekly" },
    { path: "/en/sobre", priority: "0.4", changefreq: "monthly" },
    { path: "/en/contato", priority: "0.4", changefreq: "monthly" },
    { path: "/es", priority: "0.9", changefreq: "daily" },
    { path: "/es/blog", priority: "0.7", changefreq: "daily" },
    { path: "/es/ferramentas", priority: "0.7", changefreq: "weekly" },
    { path: "/es/sobre", priority: "0.4", changefreq: "monthly" },
    { path: "/es/contato", priority: "0.4", changefreq: "monthly" },
  ];

  const articleEntries = articles.map((article) => `
  <url>
    <loc>${SITE_URL}/blog/${article.slug}</loc>
    <lastmod>${article.updatedAt || article.publishedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${article.featuredImage}</image:loc>
      <image:title>${article.translations["pt-BR"]?.title || ""}</image:title>
    </image:image>
  </url>
  <url>
    <loc>${SITE_URL}/en/blog/${article.slug}</loc>
    <lastmod>${article.updatedAt || article.publishedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/es/blog/${article.slug}</loc>
    <lastmod>${article.updatedAt || article.publishedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join("");

  const staticEntries = staticPages
    .map(
      ({ path, priority, changefreq }) => `
  <url>
    <loc>${SITE_URL}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticEntries}
${articleEntries}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
