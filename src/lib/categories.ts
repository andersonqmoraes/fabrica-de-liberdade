import type { Locale } from "@/types";

export interface CategoryDef {
  slug: string;
  label: Record<Locale, string>;
  desc: Record<Locale, string>;
  color: string;
  bg: string;
  border: string;
  text: string;
}

export const CATEGORIES: CategoryDef[] = [
  {
    slug: "ai-tools",
    label: { "pt-BR": "Ferramentas de IA", en: "AI Tools", es: "IA Tools" },
    desc: { "pt-BR": "As melhores IAs do mercado", en: "The best AI tools", es: "Las mejores IAs" },
    color: "brand",
    bg: "bg-brand-500/10",
    border: "border-brand-500/20",
    text: "text-brand-400",
  },
  {
    slug: "productivity",
    label: { "pt-BR": "Produtividade", en: "Productivity", es: "Productividad" },
    desc: { "pt-BR": "Faça mais em menos tempo", en: "Do more in less time", es: "Haz más en menos tiempo" },
    color: "blue",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-400",
  },
  {
    slug: "tech-reviews",
    label: { "pt-BR": "Reviews", en: "Reviews", es: "Reviews" },
    desc: { "pt-BR": "Análises honestas", en: "Honest reviews", es: "Análisis honestos" },
    color: "purple",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    text: "text-purple-400",
  },
  {
    slug: "make-money",
    label: { "pt-BR": "Ganhe Dinheiro", en: "Make Money", es: "Ganar Dinero" },
    desc: { "pt-BR": "Renda real na internet", en: "Real income online", es: "Ingresos reales online" },
    color: "gold",
    bg: "bg-gold-500/10",
    border: "border-gold-500/20",
    text: "text-gold-400",
  },
  {
    slug: "automation",
    label: { "pt-BR": "Automação", en: "Automation", es: "Automatización" },
    desc: { "pt-BR": "Automatize sua vida", en: "Automate your life", es: "Automatiza tu vida" },
    color: "cyan",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    text: "text-cyan-400",
  },
  {
    slug: "software",
    label: { "pt-BR": "Software & Apps", en: "Software & Apps", es: "Software & Apps" },
    desc: { "pt-BR": "Apps que mudam sua vida", en: "Apps that change your life", es: "Apps que cambian tu vida" },
    color: "pink",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    text: "text-pink-400",
  },
];

export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug);

export function getCategoryBySlug(slug: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
