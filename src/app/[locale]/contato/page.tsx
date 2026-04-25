import type { Metadata } from "next";
import { ContatoContent } from "./ContatoContent";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fabricadeliberdade.com.br";
  const localePath = locale === "pt-BR" ? "" : `/${locale}`;
  const titles: Record<string, string> = {
    "pt-BR": "Contato — Fábrica de Liberdade",
    en: "Contact — Freedom Factory",
    es: "Contacto — Fábrica de Libertad",
  };
  const descriptions: Record<string, string> = {
    "pt-BR": "Entre em contato com a equipe da Fábrica de Liberdade. Parcerias, sugestões de pauta ou dúvidas gerais.",
    en: "Get in touch with the Freedom Factory team. Partnerships, story suggestions, or general questions.",
    es: "Ponte en contacto con el equipo de Fábrica de Libertad. Asociaciones, sugerencias o consultas generales.",
  };
  return {
    title: titles[locale] || titles["pt-BR"],
    description: descriptions[locale] || descriptions["pt-BR"],
    alternates: {
      canonical: `${siteUrl}${localePath}/contato`,
      languages: {
        "pt-BR": `${siteUrl}/contato`,
        en: `${siteUrl}/en/contato`,
        es: `${siteUrl}/es/contato`,
      },
    },
  };
}

export default function ContactPage() {
  return <ContatoContent />;
}
