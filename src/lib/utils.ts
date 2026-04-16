import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { ptBR, enUS, es } from "date-fns/locale";
import slugifyLib from "slugify";
import type { Locale } from "@/types";

// --- Tailwind ---
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Slugify ---
export function slugify(text: string): string {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    locale: "pt",
  });
}

// --- Dates ---
const dateFnsLocales = {
  "pt-BR": ptBR,
  en: enUS,
  es: es,
};

export function formatDate(
  date: string | Date,
  locale: Locale = "pt-BR",
  formatStr = "dd 'de' MMMM 'de' yyyy"
): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, formatStr, { locale: dateFnsLocales[locale] });
}

export function formatRelativeDate(
  date: string | Date,
  locale: Locale = "pt-BR"
): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, {
    addSuffix: true,
    locale: dateFnsLocales[locale],
  });
}

// --- Reading time ---
export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// --- Text utils ---
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/`{1,3}(.*?)`{1,3}/g, "$1")
    .replace(/>\s/g, "")
    .replace(/\n/g, " ")
    .trim();
}

// --- SEO ---
export function generateOgImageUrl(title: string, category: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fabricadeliberdade.com.br";
  const encoded = encodeURIComponent(title);
  return `${siteUrl}/api/og?title=${encoded}&category=${category}`;
}

// --- Number formatting ---
export function formatNumber(num: number, locale: Locale = "pt-BR"): string {
  const localeMap = { "pt-BR": "pt-BR", en: "en-US", es: "es-ES" };
  return new Intl.NumberFormat(localeMap[locale]).format(num);
}

export function formatCurrency(
  value: number,
  currency = "BRL",
  locale: Locale = "pt-BR"
): string {
  const localeMap = { "pt-BR": "pt-BR", en: "en-US", es: "es-ES" };
  return new Intl.NumberFormat(localeMap[locale], {
    style: "currency",
    currency,
  }).format(value);
}

// --- URL ---
export function buildArticleUrl(slug: string, locale: Locale): string {
  if (locale === "pt-BR") return `/blog/${slug}`;
  return `/${locale}/blog/${slug}`;
}

// --- Category colors ---
export const categoryColors: Record<string, string> = {
  "ai-tools": "brand",
  productivity: "blue",
  "tech-reviews": "purple",
  "make-money": "gold",
  automation: "cyan",
  software: "pink",
};

export function getCategoryColor(category: string): string {
  return categoryColors[category] || "brand";
}
