"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { Clock, Eye, ArrowRight, Tag } from "lucide-react";
import { cn, formatDate, formatNumber } from "@/lib/utils";
import type { Article, Locale } from "@/types";

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "featured" | "compact" | "horizontal";
}

const categoryColors: Record<string, string> = {
  "ai-tools": "bg-brand-500/20 text-brand-400 border-brand-500/30",
  productivity: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "tech-reviews": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "make-money": "bg-gold-500/20 text-gold-400 border-gold-500/30",
  automation: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  software: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

const categoryLabels: Record<string, Record<string, string>> = {
  "ai-tools": { "pt-BR": "IA Tools", en: "AI Tools", es: "IA Tools" },
  productivity: { "pt-BR": "Produtividade", en: "Productivity", es: "Productividad" },
  "tech-reviews": { "pt-BR": "Reviews", en: "Reviews", es: "Reviews" },
  "make-money": { "pt-BR": "Ganhe $", en: "Make Money", es: "Ganar $" },
  automation: { "pt-BR": "Automação", en: "Automation", es: "Automatización" },
  software: { "pt-BR": "Software", en: "Software", es: "Software" },
};

export function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("blog");

  const translation = article.translations[locale] || article.translations["pt-BR"];
  if (!translation) return null;

  const categoryColor = categoryColors[article.category] || categoryColors["ai-tools"];
  const categoryLabel = categoryLabels[article.category]?.[locale] || article.category;

  if (variant === "featured") {
    return (
      <Link
        href={{ pathname: "/blog/[slug]", params: { slug: article.slug } }}
        className="group block"
      >
        <article className="relative h-[500px] rounded-2xl overflow-hidden card">
          {/* Image */}
          <div className="absolute inset-0">
            <Image
              src={article.featuredImage || "/images/placeholder.jpg"}
              alt={translation.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/60 to-transparent" />
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className={cn("badge border", categoryColor)}>
                <Tag className="w-3 h-3" />
                {categoryLabel}
              </span>
              {article.generatedByAI && (
                <span className="badge bg-gold-500/20 text-gold-400 border border-gold-500/30">
                  ✨ AI Generated
                </span>
              )}
            </div>
            <h2 className="font-display font-bold text-2xl lg:text-3xl text-white mb-3 line-clamp-2 group-hover:text-brand-300 transition-colors">
              {translation.title}
            </h2>
            <p className="text-gray-400 line-clamp-2 mb-5">{translation.excerpt}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-gray-500 text-sm">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {article.readTime} {t("minRead")}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  {formatNumber(article.views, locale)}
                </span>
              </div>
              <span className="text-brand-400 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                {t("readMore")} <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={{ pathname: "/blog/[slug]", params: { slug: article.slug } }}
        className="group flex items-center gap-4 p-4 rounded-xl hover:bg-dark-600 transition-colors"
      >
        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
          <Image
            src={article.featuredImage || "/images/placeholder.jpg"}
            alt={translation.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <span className={cn("badge border text-xs mb-2", categoryColor)}>
            {categoryLabel}
          </span>
          <h3 className="font-semibold text-gray-200 text-sm line-clamp-2 group-hover:text-brand-400 transition-colors">
            {translation.title}
          </h3>
          <div className="flex items-center gap-3 text-gray-600 text-xs mt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readTime} min
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatNumber(article.views, locale)}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "horizontal") {
    return (
      <Link
        href={{ pathname: "/blog/[slug]", params: { slug: article.slug } }}
        className="group block"
      >
        <article className="card flex gap-0 overflow-hidden">
          <div className="relative w-48 lg:w-64 flex-shrink-0">
            <Image
              src={article.featuredImage || "/images/placeholder.jpg"}
              alt={translation.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="p-6 flex flex-col justify-between">
            <div>
              <span className={cn("badge border text-xs mb-3", categoryColor)}>
                {categoryLabel}
              </span>
              <h3 className="font-display font-bold text-lg text-gray-100 line-clamp-2 group-hover:text-brand-400 transition-colors mb-2">
                {translation.title}
              </h3>
              <p className="text-gray-500 text-sm line-clamp-2">{translation.excerpt}</p>
            </div>
            <div className="flex items-center gap-4 text-gray-600 text-sm mt-4">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {article.readTime} {t("minRead")}
              </span>
              <span>{formatDate(article.publishedAt, locale, "dd MMM yyyy")}</span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // Default card
  return (
    <Link
      href={{ pathname: "/blog/[slug]", params: { slug: article.slug } }}
      className="group block h-full"
    >
      <article className="card h-full flex flex-col">
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          <Image
            src={article.featuredImage || "/images/placeholder.jpg"}
            alt={translation.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-600/60 to-transparent" />
          <div className="absolute top-4 left-4">
            <span className={cn("badge border", categoryColor)}>
              {categoryLabel}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1">
          <h3 className="font-display font-bold text-lg text-gray-100 line-clamp-2 group-hover:text-brand-400 transition-colors mb-3 flex-1">
            {translation.title}
          </h3>
          <p className="text-gray-500 text-sm line-clamp-3 mb-5">
            {translation.excerpt}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-dark-400">
            <div className="flex items-center gap-3 text-gray-600 text-xs">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {article.readTime} {t("minRead")}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {formatNumber(article.views, locale)}
              </span>
            </div>
            <span className="text-brand-500 text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
              {t("readMore")}
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
