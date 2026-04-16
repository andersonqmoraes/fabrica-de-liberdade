import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { AdSenseUnit } from "@/components/monetization/AdSenseUnit";
import { AffiliateBox } from "@/components/monetization/AffiliateBox";
import { getArticleBySlug, getRelatedArticles, incrementViews } from "@/lib/firebase/articles";
import { formatDate, calculateReadTime } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Clock,
  Eye,
  Calendar,
  Tag,
  Share2,
  Bot,
  ChevronRight,
  Home,
} from "lucide-react";
import type { Locale } from "@/types";
import { Link } from "@/i18n/routing";

interface ArticlePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticleBySlug(slug).catch(() => null);
  if (!article) return {};

  const l = locale as Locale;
  const translation = article.translations[l] || article.translations["pt-BR"];
  if (!translation) return {};

  const title = translation.metaTitle || translation.title;
  const description = translation.metaDescription || translation.excerpt;

  return {
    title,
    description,
    keywords: article.tags.join(", "),
    openGraph: {
      title,
      description,
      images: article.featuredImage ? [article.featuredImage] : [],
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.featuredImage ? [article.featuredImage] : [],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/${l !== "pt-BR" ? l + "/" : ""}blog/${slug}`,
    },
  };
}

const categoryLabels: Record<string, Record<string, string>> = {
  "ai-tools": { "pt-BR": "Ferramentas de IA", en: "AI Tools", es: "IA Tools" },
  productivity: { "pt-BR": "Produtividade", en: "Productivity", es: "Productividad" },
  "tech-reviews": { "pt-BR": "Reviews", en: "Reviews", es: "Reviews" },
  "make-money": { "pt-BR": "Ganhar Dinheiro", en: "Make Money", es: "Ganar Dinero" },
  automation: { "pt-BR": "Automação", en: "Automation", es: "Automatización" },
  software: { "pt-BR": "Software", en: "Software", es: "Software" },
};

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { locale, slug } = await params;
  const l = locale as Locale;

  let article;
  try {
    article = await getArticleBySlug(slug);
  } catch {
    notFound();
  }

  if (!article || article.status !== "published") notFound();

  const translation = article.translations[l] || article.translations["pt-BR"];
  if (!translation) notFound();

  // Incrementa views (fire & forget)
  incrementViews(article.id).catch(() => {});

  // Artigos relacionados
  let related: Awaited<ReturnType<typeof getRelatedArticles>> = [];
  try {
    related = await getRelatedArticles(article.id, article.category, 3);
  } catch {}

  const t = await getTranslations({ locale, namespace: "blog" });

  const categoryLabel = categoryLabels[article.category]?.[l] || article.category;
  const readTime = article.readTime || calculateReadTime(translation.content);

  // JSON-LD Article schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: translation.title,
    description: translation.excerpt,
    image: article.featuredImage,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Organization",
      name: "Fábrica de Liberdade",
      url: "https://fabricadeliberdade.com.br",
    },
    publisher: {
      "@type": "Organization",
      name: "Fábrica de Liberdade",
      logo: {
        "@type": "ImageObject",
        url: "https://fabricadeliberdade.com.br/images/logo.png",
      },
    },
    keywords: article.tags.join(", "),
  };

  return (
    <>
      <Header />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <main className="pt-20 min-h-screen">
        <article className="container-main py-10 max-w-4xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-gray-600 mb-8">
            <Link href="/" className="hover:text-gray-400 transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              Início
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/blog" className="hover:text-gray-400 transition-colors">
              Blog
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-400 line-clamp-1">{translation.title}</span>
          </nav>

          {/* Article header */}
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="badge badge-brand">
                <Tag className="w-3 h-3" />
                {categoryLabel}
              </span>
              {article.generatedByAI && (
                <span className="badge bg-gold-500/20 text-gold-400 border border-gold-500/30">
                  <Bot className="w-3 h-3" />
                  AI Enhanced
                </span>
              )}
              {article.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="badge bg-dark-500 text-gray-500 border border-dark-400 text-xs">
                  #{tag}
                </span>
              ))}
            </div>

            <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-5">
              {translation.title}
            </h1>

            <p className="text-gray-400 text-lg leading-relaxed mb-6">
              {translation.excerpt}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-dark-400">
              <div className="flex items-center gap-5 text-gray-600 text-sm">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(article.publishedAt, l)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {readTime} {t("minRead")}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  {article.views.toLocaleString()} views
                </span>
              </div>
              <button
                className="flex items-center gap-1.5 text-gray-500 hover:text-brand-400 text-sm transition-colors"
                onClick={() => {
                  if (navigator?.share) {
                    navigator.share({
                      title: translation.title,
                      url: window.location.href,
                    });
                  }
                }}
              >
                <Share2 className="w-4 h-4" />
                {t("share")}
              </button>
            </div>
          </header>

          {/* Featured image */}
          {article.featuredImage && (
            <div className="relative w-full h-64 sm:h-80 lg:h-[450px] rounded-2xl overflow-hidden mb-10 shadow-card">
              <Image
                src={article.featuredImage}
                alt={translation.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Top AdSense */}
          <div className="mb-8">
            <AdSenseUnit slot="article-top" format="horizontal" />
          </div>

          {/* Article content */}
          <div className="article-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => (
                  <h2 className="font-display font-bold text-2xl text-white mt-10 mb-4 pb-2 border-b border-dark-400">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="font-display font-semibold text-xl text-gray-100 mt-8 mb-3">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-300 leading-relaxed mb-6">{children}</p>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-400 hover:text-brand-300 underline decoration-brand-500/40 transition-colors"
                  >
                    {children}
                  </a>
                ),
                code: ({ children, className }) => {
                  const isBlock = className?.includes("language-");
                  if (isBlock) {
                    return (
                      <pre className="bg-dark-700 border border-dark-400 rounded-xl p-4 overflow-x-auto my-6">
                        <code className="text-brand-400 text-sm font-mono">{children}</code>
                      </pre>
                    );
                  }
                  return (
                    <code className="bg-dark-600 text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">
                      {children}
                    </code>
                  );
                },
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-brand-500 bg-dark-600 rounded-r-xl pl-6 pr-4 py-4 my-8 italic text-gray-400">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {translation.content}
            </ReactMarkdown>
          </div>

          {/* Affiliate links */}
          {article.affiliateLinks && article.affiliateLinks.length > 0 && (
            <AffiliateBox links={article.affiliateLinks} variant="cards" />
          )}

          {/* Bottom AdSense */}
          <div className="mt-8 mb-10">
            <AdSenseUnit slot="article-bottom" format="rectangle" />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 py-6 border-t border-dark-400">
            <span className="text-gray-600 text-sm">Tags:</span>
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="badge bg-dark-600 text-gray-400 border border-dark-400 text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        </article>

        {/* Related articles */}
        {related.length > 0 && (
          <section className="bg-dark-700 border-t border-dark-400 py-14">
            <div className="container-main max-w-4xl">
              <h2 className="font-display font-bold text-2xl text-white mb-8">
                {t("relatedArticles")}
              </h2>
              <div className="articles-grid">
                {related.map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
