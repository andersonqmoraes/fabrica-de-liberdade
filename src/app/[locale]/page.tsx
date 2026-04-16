import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { AdSenseUnit } from "@/components/monetization/AdSenseUnit";
import { getPublishedArticles, getFeaturedArticles } from "@/lib/firebase/articles";
import { Link } from "@/i18n/routing";
import {
  Bot,
  Zap,
  TrendingUp,
  Code2,
  DollarSign,
  Settings2,
  ArrowRight,
  Star,
} from "lucide-react";
import type { Locale } from "@/types";

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

const categories = [
  {
    slug: "ai-tools",
    icon: Bot,
    label: { "pt-BR": "Ferramentas de IA", en: "AI Tools", es: "IA Tools" },
    desc: {
      "pt-BR": "As melhores IAs do mercado",
      en: "The best AI tools",
      es: "Las mejores IAs",
    },
    color: "brand",
    bg: "bg-brand-500/10",
    border: "border-brand-500/20",
    text: "text-brand-400",
  },
  {
    slug: "productivity",
    icon: Zap,
    label: { "pt-BR": "Produtividade", en: "Productivity", es: "Productividad" },
    desc: {
      "pt-BR": "Faça mais em menos tempo",
      en: "Do more in less time",
      es: "Haz más en menos tiempo",
    },
    color: "blue",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-400",
  },
  {
    slug: "tech-reviews",
    icon: Star,
    label: { "pt-BR": "Reviews", en: "Reviews", es: "Reviews" },
    desc: {
      "pt-BR": "Análises honestas",
      en: "Honest reviews",
      es: "Análisis honestos",
    },
    color: "purple",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    text: "text-purple-400",
  },
  {
    slug: "make-money",
    icon: DollarSign,
    label: { "pt-BR": "Ganhe Dinheiro", en: "Make Money", es: "Ganar Dinero" },
    desc: {
      "pt-BR": "Renda real na internet",
      en: "Real income online",
      es: "Ingresos reales online",
    },
    color: "gold",
    bg: "bg-gold-500/10",
    border: "border-gold-500/20",
    text: "text-gold-400",
  },
  {
    slug: "automation",
    icon: Settings2,
    label: { "pt-BR": "Automação", en: "Automation", es: "Automatización" },
    desc: {
      "pt-BR": "Automatize sua vida",
      en: "Automate your life",
      es: "Automatiza tu vida",
    },
    color: "cyan",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    text: "text-cyan-400",
  },
  {
    slug: "software",
    icon: Code2,
    label: { "pt-BR": "Software & Apps", en: "Software & Apps", es: "Software & Apps" },
    desc: {
      "pt-BR": "Apps que mudam sua vida",
      en: "Apps that change your life",
      es: "Apps que cambian tu vida",
    },
    color: "pink",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    text: "text-pink-400",
  },
];

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const l = locale as Locale;
  const t = await getTranslations({ locale, namespace: "blog" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  // Busca artigos do Firebase
  let featuredArticles: Awaited<ReturnType<typeof getFeaturedArticles>> = [];
  let latestArticles: Awaited<ReturnType<typeof getPublishedArticles>> = [];

  try {
    [featuredArticles, latestArticles] = await Promise.all([
      getFeaturedArticles(3),
      getPublishedArticles(6),
    ]);
  } catch {
    // Firebase ainda não configurado — exibe layout vazio
  }

  return (
    <>
      <Header />
      <main>
        {/* HERO */}
        <HeroSection />

        {/* CATEGORIAS */}
        <section className="section bg-dark-700">
          <div className="container-main">
            <div className="text-center mb-12">
              <h2 className="font-display font-bold text-3xl lg:text-4xl text-white mb-4">
                Explore por <span className="gradient-text">categoria</span>
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto">
                Conteúdo organizado para você encontrar exatamente o que precisa
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.slug}
                    href={`/blog?categoria=${cat.slug}` as any}
                    className={`group p-5 rounded-2xl border ${cat.bg} ${cat.border} hover:scale-105 transition-all duration-200 text-center`}
                  >
                    <div className={`w-12 h-12 ${cat.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                      <Icon className={`w-6 h-6 ${cat.text}`} />
                    </div>
                    <h3 className={`font-semibold text-sm ${cat.text} mb-1`}>
                      {cat.label[l]}
                    </h3>
                    <p className="text-gray-600 text-xs">{cat.desc[l]}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ARTIGOS EM DESTAQUE */}
        {featuredArticles.length > 0 && (
          <section className="section">
            <div className="container-main">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="font-display font-bold text-3xl text-white">
                    {t("featured")}
                  </h2>
                  <p className="text-gray-500 mt-1">Os mais lidos do momento</p>
                </div>
                <Link
                  href="/blog"
                  className="btn-ghost hidden sm:flex"
                >
                  {tNav("allArticles")} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {featuredArticles[0] && (
                  <div className="lg:col-span-2">
                    <ArticleCard article={featuredArticles[0]} variant="featured" />
                  </div>
                )}
                <div className="flex flex-col gap-6">
                  {featuredArticles.slice(1).map((article) => (
                    <ArticleCard key={article.id} article={article} variant="horizontal" />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* AD UNIT — entre seções */}
        <div className="container-main py-4">
          <AdSenseUnit slot="homepage-mid" format="horizontal" />
        </div>

        {/* ARTIGOS RECENTES */}
        {latestArticles.length > 0 && (
          <section className="section-sm">
            <div className="container-main">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="font-display font-bold text-3xl text-white">
                    {t("latest")}
                  </h2>
                  <p className="text-gray-500 mt-1">Conteúdo fresco toda semana</p>
                </div>
                <Link href="/blog" className="btn-ghost hidden sm:flex">
                  {tNav("allArticles")} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="articles-grid">
                {latestArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>

              <div className="text-center mt-10">
                <Link href="/blog" className="btn-secondary">
                  {tNav("allArticles")} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* NEWSLETTER */}
        <NewsletterSection />

        {/* TRUST BAR */}
        <section className="py-10 bg-dark-700 border-y border-dark-400">
          <div className="container-main">
            <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
              {[
                { label: "Conteúdo gratuito", icon: "✅" },
                { label: "Sem paywalls", icon: "🔓" },
                { label: "Atualizado com IA", icon: "🤖" },
                { label: "Reviews honestos", icon: "⭐" },
                { label: "Comunidade ativa", icon: "💬" },
              ].map(({ label, icon }) => (
                <div key={label} className="flex items-center gap-2 text-gray-500 text-sm">
                  <span>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
