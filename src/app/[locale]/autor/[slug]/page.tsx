import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { Link } from "@/i18n/routing";
import { User, Mail, MapPin, Instagram, Youtube, CheckCircle2 } from "lucide-react";
import { AUTHORS } from "@/lib/authors";
import { getPublishedArticles } from "@/lib/firebase/articles";
import type { Locale, Article } from "@/types";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const author = Object.values(AUTHORS).find((a) => a.slug === slug);
  if (!author) return {};

  const l = locale as Locale;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fabricadeliberdade.com.br";
  const localePath = l === "pt-BR" ? "" : `/${l}`;

  return {
    title: `${author.name} — Fábrica de Liberdade`,
    description: author.bio[l].slice(0, 160),
    alternates: {
      canonical: `${siteUrl}${localePath}/autor/${author.slug}`,
    },
    openGraph: {
      title: author.name,
      description: author.bio[l].slice(0, 200),
      type: "profile",
    },
  };
}

export async function generateStaticParams() {
  return Object.values(AUTHORS).map((a) => ({ slug: a.slug }));
}

export const revalidate = 3600;

export default async function AuthorPage({ params }: Props) {
  const { locale, slug } = await params;
  const author = Object.values(AUTHORS).find((a) => a.slug === slug);
  if (!author) notFound();

  const l = locale as Locale;

  let articles: Article[] = [];
  try {
    const all = await getPublishedArticles(50);
    articles = all.filter((a) => {
      const aid = (a as Article & { authorId?: string }).authorId;
      return !aid || aid === author.id;
    });
  } catch {}

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    url: `https://fabricadeliberdade.com.br/autor/${author.slug}`,
    description: author.bio[l],
    sameAs: author.sameAs,
    jobTitle: author.role[l],
    worksFor: {
      "@type": "Organization",
      name: "Fábrica de Liberdade",
      url: "https://fabricadeliberdade.com.br",
    },
    knowsAbout: author.expertise[l],
  };

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <main className="pt-20 min-h-screen">
        {/* Hero do autor */}
        <section className="py-16 bg-dark-700 border-b border-dark-400">
          <div className="container-main max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-8 items-start">
              <div className="w-28 h-28 rounded-full bg-brand-500/20 border-2 border-brand-500/40 flex items-center justify-center flex-shrink-0">
                <User className="w-14 h-14 text-brand-400" />
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 border border-brand-500/30 rounded-full text-brand-400 text-xs font-medium mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {author.role[l]}
                </div>
                <h1 className="font-display font-bold text-3xl lg:text-4xl text-white mb-2">
                  {author.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {author.location}
                  </span>
                  <a
                    href={`mailto:${author.email}`}
                    className="flex items-center gap-1.5 hover:text-brand-400 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {author.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bio */}
        <section className="py-12 border-b border-dark-400">
          <div className="container-main max-w-3xl mx-auto">
            <h2 className="font-display font-bold text-2xl text-white mb-5">
              {l === "pt-BR" ? "Sobre" : l === "en" ? "About" : "Sobre"}
            </h2>
            <p className="text-gray-400 leading-relaxed text-base whitespace-pre-line">
              {author.bio[l]}
            </p>
          </div>
        </section>

        {/* Áreas de expertise */}
        <section className="py-12 border-b border-dark-400">
          <div className="container-main max-w-3xl mx-auto">
            <h2 className="font-display font-bold text-2xl text-white mb-5">
              {l === "pt-BR" ? "Áreas de atuação" : l === "en" ? "Areas of expertise" : "Áreas de actuación"}
            </h2>
            <div className="flex flex-wrap gap-2">
              {author.expertise[l].map((skill) => (
                <span
                  key={skill}
                  className="badge bg-dark-600 text-gray-300 border border-dark-400"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Canais sociais */}
        {author.sameAs.length > 0 && (
          <section className="py-12 border-b border-dark-400">
            <div className="container-main max-w-3xl mx-auto">
              <h2 className="font-display font-bold text-2xl text-white mb-5">
                {l === "pt-BR" ? "Onde me encontrar" : l === "en" ? "Where to find me" : "Dónde encontrarme"}
              </h2>
              <div className="flex flex-wrap gap-3">
                {author.sameAs.map((url) => {
                  const isInstagram = url.includes("instagram");
                  const isYoutube = url.includes("youtube");
                  const Icon = isInstagram ? Instagram : isYoutube ? Youtube : Mail;
                  const label = isInstagram ? "Instagram" : isYoutube ? "YouTube" : url;
                  return (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer me"
                      className="card px-4 py-3 flex items-center gap-3 hover:border-brand-500/30 transition-colors"
                    >
                      <Icon className="w-5 h-5 text-brand-400" />
                      <span className="text-sm text-gray-300">{label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Artigos do autor */}
        {articles.length > 0 && (
          <section className="py-14">
            <div className="container-main max-w-5xl mx-auto">
              <h2 className="font-display font-bold text-2xl text-white mb-8">
                {l === "pt-BR" ? "Artigos publicados" : l === "en" ? "Published articles" : "Artículos publicados"}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
              <div className="text-center mt-10">
                <Link href="/blog" className="btn-secondary">
                  {l === "pt-BR" ? "Ver blog completo" : l === "en" ? "View full blog" : "Ver blog completo"}
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
