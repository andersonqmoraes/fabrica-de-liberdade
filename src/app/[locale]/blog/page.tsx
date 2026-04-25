import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { AdSenseUnit } from "@/components/monetization/AdSenseUnit";
import { getPublishedArticles } from "@/lib/firebase/articles";
import { Link } from "@/i18n/routing";
import { Search, Filter, Rss } from "lucide-react";
import type { Locale, ArticleCategory } from "@/types";
import { CATEGORIES } from "@/lib/categories";

interface BlogPageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ categoria?: string }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fabricadeliberdade.com.br";
  const localePath = locale === "pt-BR" ? "" : `/${locale}`;
  const t = await getTranslations({ locale, namespace: "seo.blogPage" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `${siteUrl}${localePath}/blog`,
      languages: {
        "pt-BR": `${siteUrl}/blog`,
        en: `${siteUrl}/en/blog`,
        es: `${siteUrl}/es/blog`,
      },
      types: {
        "application/rss+xml": "/feed.xml",
      },
    },
  };
}

const categoryMeta: Record<
  string,
  { label: Record<Locale, string>; desc: Record<Locale, string>; color: string; textColor: string; borderColor: string }
> = {
  all: {
    label: { "pt-BR": "Todos", en: "All", es: "Todos" },
    desc: { "pt-BR": "Todo o conteúdo", en: "All content", es: "Todo el contenido" },
    color: "bg-dark-500",
    textColor: "text-gray-300",
    borderColor: "border-dark-400",
  },
  ...Object.fromEntries(
    CATEGORIES.map((cat) => [
      cat.slug,
      {
        label: cat.label,
        desc: cat.desc,
        color: cat.bg,
        textColor: cat.text,
        borderColor: cat.border.replace("/20", "/30"),
      },
    ])
  ),
};

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const { locale } = await params;
  const sp = await searchParams;
  const l = locale as Locale;
  const categoria = sp?.categoria || "all";

  const t = await getTranslations({ locale, namespace: "blog" });

  let articles: Awaited<ReturnType<typeof getPublishedArticles>> = [];
  try {
    articles = await getPublishedArticles(50);
  } catch {
    // Firebase não configurado
  }

  const filtered =
    categoria === "all"
      ? articles
      : articles.filter((a) => a.category === categoria);

  const activeMeta = categoryMeta[categoria] || categoryMeta.all;

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen">
        {/* Page header */}
        <section className="py-14 bg-dark-700 border-b border-dark-400">
          <div className="container-main">
            <div className="flex items-center justify-between gap-6 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`badge border ${activeMeta.color} ${activeMeta.textColor} ${activeMeta.borderColor}`}>
                    {activeMeta.label[l]}
                  </span>
                  <span className="text-gray-600 text-sm">
                    {filtered.length} {t("latest").toLowerCase()}
                  </span>
                </div>
                <h1 className="font-display font-bold text-4xl lg:text-5xl text-white">
                  {t("title")}
                </h1>
                <p className="text-gray-500 mt-2">{t("description")}</p>
              </div>
              <a
                href="/feed.xml"
                className="btn-ghost text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Rss className="w-4 h-4 text-orange-400" />
                RSS Feed
              </a>
            </div>
          </div>
        </section>

        <div className="container-main py-10">
          {/* Category filters */}
          <div className="flex gap-2 flex-wrap mb-10">
            {Object.entries(categoryMeta).map(([key, meta]) => (
              <Link
                key={key}
                href={key === "all" ? "/blog" : (`/blog?categoria=${key}` as any)}
                className={`badge border text-sm py-1.5 px-4 transition-all ${
                  categoria === key
                    ? `${meta.color} ${meta.textColor} ${meta.borderColor}`
                    : "bg-dark-600 text-gray-400 border-dark-400 hover:border-dark-300"
                }`}
              >
                {meta.label[l]}
              </Link>
            ))}
          </div>

          {/* AdSense Top */}
          <div className="mb-8">
            <AdSenseUnit slot="blog-top" format="horizontal" />
          </div>

          {/* Articles grid */}
          {filtered.length > 0 ? (
            <>
              <div className="articles-grid">
                {filtered.slice(0, 6).map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>

              {/* Mid AdSense */}
              {filtered.length > 6 && (
                <div className="my-10">
                  <AdSenseUnit slot="blog-mid" format="horizontal" />
                </div>
              )}

              {filtered.length > 6 && (
                <div className="articles-grid mt-6">
                  {filtered.slice(6).map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-dark-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-500">{t("noArticles")}</p>
            </div>
          )}

          {/* Bottom AdSense */}
          <div className="mt-12">
            <AdSenseUnit slot="blog-bottom" format="horizontal" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
