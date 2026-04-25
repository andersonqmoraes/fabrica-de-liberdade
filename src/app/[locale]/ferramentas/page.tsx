import type { Metadata } from "next";
import { ToolsContent } from "./ToolsContent";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fabricadeliberdade.com.br";
  const localePath = locale === "pt-BR" ? "" : `/${locale}`;
  const titles: Record<string, string> = {
    "pt-BR": "Ferramentas recomendadas — Fábrica de Liberdade",
    en: "Recommended Tools — Freedom Factory",
    es: "Herramientas recomendadas — Fábrica de Libertad",
  };
  const descriptions: Record<string, string> = {
    "pt-BR": "Ferramentas de IA, produtividade e automação testadas e aprovadas pela equipe da Fábrica de Liberdade.",
    en: "AI, productivity and automation tools tested and approved by the Freedom Factory team.",
    es: "Herramientas de IA, productividad y automatización probadas y aprobadas por el equipo de Fábrica de Libertad.",
  };
  return {
    title: titles[locale] || titles["pt-BR"],
    description: descriptions[locale] || descriptions["pt-BR"],
    alternates: {
      canonical: `${siteUrl}${localePath}/ferramentas`,
      languages: {
        "pt-BR": `${siteUrl}/ferramentas`,
        en: `${siteUrl}/en/ferramentas`,
        es: `${siteUrl}/es/ferramentas`,
      },
    },
  };
}

export default async function ToolsPage({ params }: Props) {
  const { locale } = await params;
  return <ToolsContent locale={locale} />;
}
