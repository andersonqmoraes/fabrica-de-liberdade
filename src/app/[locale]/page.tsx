import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { AdSenseUnit } from "@/components/monetization/AdSenseUnit";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { SidebarNewsletter } from "@/components/home/SidebarNewsletter";
import { getPublishedArticles, getFeaturedArticles } from "@/lib/firebase/articles";
import { Link } from "@/i18n/routing";
import { ArrowRight, Bot, Zap, Code2, DollarSign, Settings2, Star, Flame } from "lucide-react";
import type { ElementType } from "react";
import type { Locale } from "@/types";
import { CATEGORIES } from "@/lib/categories";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.homePage" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

const CATEGORY_ICONS: Record<string, ElementType> = {
  "ai-tools": Bot,
  productivity: Zap,
  "tech-reviews": Star,
  "make-money": DollarSign,
  automation: Settings2,
  software: Code2,
};

const MASTHEAD: Record<Locale, string> = {
  "pt-BR": "IA · Tecnologia · Liberdade Financeira",
  en: "AI · Technology · Financial Freedom",
  es: "IA · Tecnología · Libertad Financiera",
};

const LABELS: Record<string, Record<Locale, string>> = {
  latest:  { "pt-BR": "Mais recentes", en: "Latest articles", es: "Más recientes" },
  popular: { "pt-BR": "Mais lidos",    en: "Most read",       es: "Más leídos"    },
  viewAll: { "pt-BR": "Ver todos os artigos", en: "View all articles", es: "Ver todos los artículos" },
  all:     { "pt-BR": "Todos",         en: "All",             es: "Todos"         },
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const l = locale as Locale;
  const tNav = await getTranslations({ locale, namespace: "nav" });

  let featuredArticles: Awaited<ReturnType<typeof getFeaturedArticles>> = [];
  let latestArticles: Awaited<ReturnType<typeof getPublishedArticles>> = [];

  try {
    [featuredArticles, latestArticles] = await Promise.all([
      getFeaturedArticles(3),
      getPublishedArticles(9),
    ]);
  } catch {
    // Firebase not configured
  }

  const featuredIds = new Set(featuredArticles.map((a) => a.id));
  const gridArticles = latestArticles.filter((a) => !featuredIds.has(a.id));
  const fallbackGrid = gridArticles.length > 0 ? gridArticles : latestArticles;

  const dateStr = new Date().toLocaleDateString(
    locale === "pt-BR" ? "pt-BR" : locale === "en" ? "en-US" : "es-ES",
    { day: "numeric", month: "long", year: "numeric" }
  );

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen">

        {/* MASTHEAD */}
        <div className="bg-dark-800 border-b border-dark-400">
          <div className="container-main py-2.5 flex items-center justify-between gap-4">
            <span className="text-gray-600 text-xs uppercase tracking-widest hidden sm:block">
              {dateStr}
            </span>
            <span className="text-brand-400 text-xs font-semibold uppercase tracking-widest mx-auto sm:mx-0">
              {MASTHEAD[l]}
            </span>
            <Link
              href="/blog"
              className="text-gray-600 hover:text-brand-400 text-xs uppercase tracking-widest transition-colors hidden sm:block whitespace-nowrap"
            >
              Blog →
            </Link>
          </div>
        </div>

        {/* HERO EDITORIAL — destaque + 2 secundários */}
        {featuredArticles.length > 0 && (
          <section className="container-main py-8 border-b border-dark-400">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ArticleCard article={featuredArticles[0]} variant="featured" />
              </div>
              <div className="flex flex-col gap-6">
                {featuredArticles.slice(1).map((article) => (
                  <ArticleCard key={article.id} article={article} variant="horizontal" />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CATEGORY BAR */}
        <div className="bg-dark-700 border-b border-dark-400">
          <div className="container-main">
            <div className="flex items-center gap-1.5 overflow-x-auto py-3 scrollbar-none">
              <Link
                href="/blog"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap text-gray-400 hover:text-white hover:bg-dark-500 transition-all border border-dark-400 hover:border-dark-300 flex-shrink-0"
              >
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                {LABELS.all[l]}
              </Link>
              {CATEGORIES.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.slug] || Bot;
                return (
                  <Link
                    key={cat.slug}
                    href={`/blog?categoria=${cat.slug}` as any}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border flex-shrink-0 ${cat.bg} ${cat.text} ${cat.border} hover:opacity-80`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.label[l]}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* CONTEÚDO PRINCIPAL + SIDEBAR */}
        <div className="container-main py-12">
          <div className="grid lg:grid-cols-12 gap-10">

            {/* Artigos recentes */}
            <div className="lg:col-span-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display font-bold text-2xl text-white">
                  {LABELS.latest[l]}
                </h2>
                <Link href="/blog" className="btn-ghost text-sm hidden sm:flex">
                  {tNav("allArticles")} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {fallbackGrid.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-6">
                  {fallbackGrid.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 py-8 text-sm">
                  {l === "pt-BR"
                    ? "Nenhum artigo publicado ainda."
                    : l === "en"
                    ? "No articles published yet."
                    : "Aún no hay artículos publicados."}
                </p>
              )}

              {/* AdSense entre artigos */}
              <div className="my-8">
                <AdSenseUnit slot="homepage-mid" format="horizontal" />
              </div>

              <div className="text-center">
                <Link href="/blog" className="btn-secondary">
                  {LABELS.viewAll[l]} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-8 lg:self-start lg:sticky lg:top-24">
              <SidebarNewsletter />

              <AdSenseUnit slot="homepage-sidebar" format="rectangle" />

              {featuredArticles.length > 0 && (
                <div>
                  <h3 className="font-display font-bold text-base text-white mb-1 pb-3 border-b border-dark-400">
                    {LABELS.popular[l]}
                  </h3>
                  <div className="space-y-1 -mx-2">
                    {featuredArticles.map((article) => (
                      <ArticleCard key={article.id} article={article} variant="compact" />
                    ))}
                  </div>
                </div>
              )}
            </aside>

          </div>
        </div>

        {/* NEWSLETTER FULL */}
        <NewsletterSection />

      </main>
      <Footer />
    </>
  );
}
