import { getPublishedArticles } from "@/lib/firebase/articles";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fabricadeliberdade.com.br";
const SITE_TITLE = "Fábrica de Liberdade";
const SITE_DESCRIPTION = "Guia definitivo de IA, tecnologia e produtividade para conquistar liberdade financeira e de tempo.";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  let articles: Awaited<ReturnType<typeof getPublishedArticles>> = [];
  try {
    articles = await getPublishedArticles(50);
  } catch {
    // Firebase not configured, return empty feed
  }

  const items = articles
    .map((article) => {
      const translation = article.translations["pt-BR"] || article.translations.en;
      if (!translation?.title) return "";

      const title = escapeXml(translation.title);
      const description = escapeXml(translation.excerpt || translation.metaDescription || "");
      const link = `${SITE_URL}/blog/${article.slug}`;
      const pubDate = new Date(article.publishedAt).toUTCString();
      const category = escapeXml(article.category);

      return `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${link}</guid>
      <category>${category}</category>
      ${article.featuredImage ? `<enclosure url="${escapeXml(article.featuredImage)}" type="image/jpeg" length="0"/>` : ""}
    </item>`.trim();
    })
    .filter(Boolean)
    .join("\n    ");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${SITE_TITLE}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>pt-BR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/images/logo.png</url>
      <title>${SITE_TITLE}</title>
      <link>${SITE_URL}</link>
    </image>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=7200",
    },
  });
}
