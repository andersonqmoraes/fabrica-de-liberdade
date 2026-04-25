import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Link } from "@/i18n/routing";
import { Zap, Target, Users, TrendingUp, ArrowRight, Bot, BookOpen, Shield } from "lucide-react";
import { getSobreData } from "@/lib/firebase/sobre";
import type { Locale } from "@/types";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fabricadeliberdade.com.br";
  const titles: Record<string, string> = {
    "pt-BR": "Sobre nós — Fábrica de Liberdade",
    en: "About Us — Freedom Factory",
    es: "Sobre nosotros — Fábrica de Libertad",
  };
  const descriptions: Record<string, string> = {
    "pt-BR": "Conheça a Fábrica de Liberdade: nossa missão, nossa história e como ajudamos pessoas a conquistar liberdade financeira com IA e tecnologia.",
    en: "Learn about Freedom Factory: our mission, our story, and how we help people achieve financial freedom with AI and technology.",
    es: "Conoce la Fábrica de Libertad: nuestra misión, historia y cómo ayudamos a las personas a lograr la libertad financiera con IA y tecnología.",
  };
  const localePath = locale === "pt-BR" ? "" : `/${locale}`;
  return {
    title: titles[locale] || titles["pt-BR"],
    description: descriptions[locale] || descriptions["pt-BR"],
    alternates: {
      canonical: `${siteUrl}${localePath}/sobre`,
      languages: { "pt-BR": `${siteUrl}/sobre`, en: `${siteUrl}/en/sobre`, es: `${siteUrl}/es/sobre` },
    },
  };
}

const values = [
  {
    icon: Target,
    title: { "pt-BR": "Foco em resultados", en: "Results-focused", es: "Enfocados en resultados" },
    desc: {
      "pt-BR": "Cada artigo e ferramenta recomendada é testada e pensada para gerar resultados reais na sua vida.",
      en: "Every article and recommended tool is tested and designed to generate real results in your life.",
      es: "Cada artículo y herramienta recomendada está probada y pensada para generar resultados reales en tu vida.",
    },
  },
  {
    icon: Shield,
    title: { "pt-BR": "Honestidade radical", en: "Radical honesty", es: "Honestidad radical" },
    desc: {
      "pt-BR": "Reviews honestos, sem patrocínio disfarçado. Se algo não funciona, falamos abertamente.",
      en: "Honest reviews, no disguised sponsorship. If something doesn't work, we say it openly.",
      es: "Reviews honestas, sin patrocinio disfrazado. Si algo no funciona, lo decimos abiertamente.",
    },
  },
  {
    icon: Bot,
    title: { "pt-BR": "IA como aliada", en: "AI as an ally", es: "IA como aliada" },
    desc: {
      "pt-BR": "Usamos IA não para substituir humanos, mas para amplificar capacidades e criar mais com menos.",
      en: "We use AI not to replace humans, but to amplify capabilities and create more with less.",
      es: "Usamos IA no para reemplazar humanos, sino para amplificar capacidades y crear más con menos.",
    },
  },
  {
    icon: BookOpen,
    title: { "pt-BR": "Educação prática", en: "Practical education", es: "Educación práctica" },
    desc: {
      "pt-BR": "Conteúdo direto ao ponto, aplicável imediatamente. Sem teoria vazia, sem enrolação.",
      en: "Straight-to-the-point content, immediately applicable. No empty theory, no filler.",
      es: "Contenido directo al punto, aplicable de inmediato. Sin teoría vacía, sin relleno.",
    },
  },
];

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const l = locale as Locale;

  const sobreData = await getSobreData();

  const headlines: Record<Locale, { h1: string; sub: string }> = {
    "pt-BR": { h1: sobreData.headline["pt-BR"], sub: sobreData.subheadline["pt-BR"] },
    en: { h1: sobreData.headline.en, sub: sobreData.subheadline.en },
    es: { h1: sobreData.headline.es, sub: sobreData.subheadline.es },
  };

  const storyTitle: Record<Locale, string> = {
    "pt-BR": "Nossa história",
    en: "Our story",
    es: "Nuestra historia",
  };

  const storyText: Record<Locale, string> = {
    "pt-BR": sobreData.story["pt-BR"],
    en: sobreData.story.en,
    es: sobreData.story.es,
  };

  const valuesTitle: Record<Locale, string> = {
    "pt-BR": "Nossos valores",
    en: "Our values",
    es: "Nuestros valores",
  };

  const ctaTitle: Record<Locale, string> = {
    "pt-BR": "Comece sua jornada",
    en: "Start your journey",
    es: "Comienza tu viaje",
  };

  const ctaDesc: Record<Locale, string> = {
    "pt-BR": "Explore nosso conteúdo e dê o primeiro passo para construir sua fábrica de liberdade pessoal.",
    en: "Explore our content and take the first step toward building your personal freedom factory.",
    es: "Explora nuestro contenido y da el primer paso para construir tu fábrica de libertad personal.",
  };

  const ctaBtn: Record<Locale, string> = {
    "pt-BR": "Explorar blog",
    en: "Explore blog",
    es: "Explorar blog",
  };

  const hl = headlines[l];

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen">
        {/* Hero */}
        <section className="py-20 bg-dark-700 border-b border-dark-400 relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-gradient opacity-50" />
          <div className="container-main relative z-10 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 border border-brand-500/30 rounded-full text-brand-400 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              {l === "pt-BR" ? "Sobre nós" : l === "en" ? "About us" : "Sobre nosotros"}
            </div>
            <h1 className="font-display font-bold text-4xl lg:text-5xl text-white mb-6">
              {hl.h1}
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              {hl.sub}
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-14 border-b border-dark-400">
          <div className="container-main">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              {[
                { value: sobreData.stats.readers, label: { "pt-BR": "Leitores mensais", en: "Monthly readers", es: "Lectores mensuales" }, icon: Users },
                { value: sobreData.stats.articles, label: { "pt-BR": "Artigos publicados", en: "Published articles", es: "Artículos publicados" }, icon: BookOpen },
                { value: sobreData.stats.tools, label: { "pt-BR": "Ferramentas avaliadas", en: "Tools reviewed", es: "Herramientas evaluadas" }, icon: Bot },
                { value: sobreData.stats.languages, label: { "pt-BR": "Idiomas", en: "Languages", es: "Idiomas" }, icon: TrendingUp },
              ].map(({ value, label, icon: Icon }) => (
                <div key={value} className="card p-6">
                  <Icon className="w-6 h-6 text-brand-400 mx-auto mb-3" />
                  <div className="font-display font-bold text-3xl text-white mb-1">{value}</div>
                  <div className="text-gray-500 text-sm">{label[l]}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-16 border-b border-dark-400">
          <div className="container-main max-w-3xl mx-auto">
            <h2 className="font-display font-bold text-3xl text-white mb-6">{storyTitle[l]}</h2>
            <div className="space-y-4 text-gray-400 leading-relaxed">
              {storyText[l].split("\n\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 border-b border-dark-400">
          <div className="container-main">
            <h2 className="font-display font-bold text-3xl text-white mb-10 text-center">{valuesTitle[l]}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map(({ icon: Icon, title, desc }) => (
                <div key={title["pt-BR"]} className="card p-6 text-center">
                  <div className="w-12 h-12 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-brand-400" />
                  </div>
                  <h3 className="font-display font-semibold text-gray-200 mb-2">{title[l]}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc[l]}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container-main text-center max-w-xl mx-auto">
            <h2 className="font-display font-bold text-3xl text-white mb-4">{ctaTitle[l]}</h2>
            <p className="text-gray-400 mb-8">{ctaDesc[l]}</p>
            <Link href="/blog" className="btn-primary text-base px-8 py-4">
              {ctaBtn[l]}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
