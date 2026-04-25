"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Link } from "@/i18n/routing";
import { getTools, type Tool as FirestoreTool } from "@/lib/firebase/tools";
import {
  Bot,
  Zap,
  DollarSign,
  Code2,
  Wrench,
  ExternalLink,
  Star,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import type { Locale } from "@/types";

interface Props {
  locale: string;
}

interface Tool {
  name: string;
  description: Record<Locale, string>;
  category: string;
  badge: string;
  badgeColor: string;
  rating: number;
  href: string;
  free: boolean;
  tags: string[];
}

const tools: Tool[] = [
  {
    name: "ChatGPT",
    description: {
      "pt-BR": "O modelo de linguagem mais popular do mundo. Ideal para escrita, brainstorming e automação de tarefas.",
      en: "The world's most popular language model. Ideal for writing, brainstorming, and task automation.",
      es: "El modelo de lenguaje más popular del mundo. Ideal para escritura, lluvia de ideas y automatización.",
    },
    category: "ai-tools",
    badge: "Mais popular",
    badgeColor: "bg-brand-500/20 text-brand-400 border-brand-500/30",
    rating: 4.8,
    href: "https://chatgpt.com",
    free: true,
    tags: ["IA", "escrita", "automação"],
  },
  {
    name: "Claude (Anthropic)",
    description: {
      "pt-BR": "IA da Anthropic focada em segurança e raciocínio. Excelente para análise de documentos e conteúdo longo.",
      en: "Anthropic's AI focused on safety and reasoning. Excellent for document analysis and long-form content.",
      es: "IA de Anthropic enfocada en seguridad y razonamiento. Excelente para análisis de documentos y contenido largo.",
    },
    category: "ai-tools",
    badge: "Editor usa",
    badgeColor: "bg-gold-500/20 text-gold-400 border-gold-500/30",
    rating: 4.9,
    href: "https://claude.ai",
    free: true,
    tags: ["IA", "análise", "escrita"],
  },
  {
    name: "Notion",
    description: {
      "pt-BR": "Workspace all-in-one para notas, wikis, projetos e banco de dados. Transforme sua produtividade pessoal.",
      en: "All-in-one workspace for notes, wikis, projects, and databases. Transform your personal productivity.",
      es: "Espacio de trabajo todo en uno para notas, wikis, proyectos y bases de datos.",
    },
    category: "productivity",
    badge: "Freemium",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    rating: 4.7,
    href: "https://notion.so",
    free: true,
    tags: ["produtividade", "notas", "projetos"],
  },
  {
    name: "n8n",
    description: {
      "pt-BR": "Automação de workflows open-source. Conecte qualquer app sem código. Alternativa ao Zapier.",
      en: "Open-source workflow automation. Connect any app without code. Alternative to Zapier.",
      es: "Automatización de flujos de trabajo open-source. Conecta cualquier app sin código.",
    },
    category: "automation",
    badge: "Open source",
    badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    rating: 4.6,
    href: "https://n8n.io",
    free: true,
    tags: ["automação", "workflow", "no-code"],
  },
  {
    name: "Midjourney",
    description: {
      "pt-BR": "Geração de imagens com IA de altíssima qualidade. Indispensável para designers e criadores de conteúdo.",
      en: "High-quality AI image generation. Indispensable for designers and content creators.",
      es: "Generación de imágenes con IA de altísima calidad. Indispensable para diseñadores y creadores.",
    },
    category: "ai-tools",
    badge: "Pago",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    rating: 4.8,
    href: "https://midjourney.com",
    free: false,
    tags: ["IA", "imagens", "design"],
  },
  {
    name: "Hotmart",
    description: {
      "pt-BR": "Plataforma para criar e vender produtos digitais: cursos, ebooks, memberships. Líder no mercado brasileiro.",
      en: "Platform to create and sell digital products: courses, ebooks, memberships. Leader in the Brazilian market.",
      es: "Plataforma para crear y vender productos digitales: cursos, ebooks, membresías.",
    },
    category: "make-money",
    badge: "Grátis para começar",
    badgeColor: "bg-gold-500/20 text-gold-400 border-gold-500/30",
    rating: 4.5,
    href: "https://hotmart.com",
    free: true,
    tags: ["monetização", "cursos", "digital"],
  },
  {
    name: "Figma",
    description: {
      "pt-BR": "Design colaborativo no navegador. Crie interfaces, protótipos e sistemas de design profissionais.",
      en: "Collaborative browser-based design. Create interfaces, prototypes, and professional design systems.",
      es: "Diseño colaborativo en el navegador. Crea interfaces, prototipos y sistemas de diseño.",
    },
    category: "software",
    badge: "Freemium",
    badgeColor: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    rating: 4.9,
    href: "https://figma.com",
    free: true,
    tags: ["design", "prototipagem", "UI/UX"],
  },
  {
    name: "Perplexity AI",
    description: {
      "pt-BR": "Motor de busca com IA que cita fontes em tempo real. Pesquisa mais inteligente e confiável.",
      en: "AI-powered search engine that cites real-time sources. Smarter and more reliable research.",
      es: "Motor de búsqueda con IA que cita fuentes en tiempo real. Investigación más inteligente.",
    },
    category: "ai-tools",
    badge: "Freemium",
    badgeColor: "bg-brand-500/20 text-brand-400 border-brand-500/30",
    rating: 4.7,
    href: "https://perplexity.ai",
    free: true,
    tags: ["IA", "pesquisa", "busca"],
  },
];

const categories = [
  { key: "all", label: { "pt-BR": "Todas", en: "All", es: "Todas" }, icon: Wrench },
  { key: "ai-tools", label: { "pt-BR": "IA", en: "AI", es: "IA" }, icon: Bot },
  { key: "productivity", label: { "pt-BR": "Produtividade", en: "Productivity", es: "Productividad" }, icon: Zap },
  { key: "automation", label: { "pt-BR": "Automação", en: "Automation", es: "Automatización" }, icon: Code2 },
  { key: "make-money", label: { "pt-BR": "Monetização", en: "Monetization", es: "Monetización" }, icon: DollarSign },
];

export function ToolsContent({ locale }: Props) {
  const l = locale as Locale;
  const [activeCategory, setActiveCategory] = useState("all");
  const [dynamicTools, setDynamicTools] = useState<FirestoreTool[] | null>(null);

  useEffect(() => {
    getTools()
      .then((list) => { if (list.length > 0) setDynamicTools(list.filter((t) => t.active)); })
      .catch(() => {});
  }, []);

  const allTools = dynamicTools ?? tools;
  const filteredTools = activeCategory === "all"
    ? allTools
    : allTools.filter((t) => t.category === activeCategory);

  const pageTitle: Record<Locale, string> = {
    "pt-BR": "Ferramentas recomendadas",
    en: "Recommended tools",
    es: "Herramientas recomendadas",
  };
  const pageDesc: Record<Locale, string> = {
    "pt-BR": "Testadas, aprovadas e usadas pelo time da Fábrica de Liberdade.",
    en: "Tested, approved, and used by the Freedom Factory team.",
    es: "Probadas, aprobadas y utilizadas por el equipo de Fábrica de Libertad.",
  };

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen">
        {/* Hero */}
        <section className="py-14 bg-dark-700 border-b border-dark-400">
          <div className="container-main">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 border border-brand-500/30 rounded-full text-brand-400 text-sm font-medium mb-5">
                <Wrench className="w-4 h-4" />
                {l === "pt-BR" ? "Ferramentas" : l === "en" ? "Tools" : "Herramientas"}
              </div>
              <h1 className="font-display font-bold text-4xl lg:text-5xl text-white mb-3">
                {pageTitle[l]}
              </h1>
              <p className="text-gray-400 text-lg">{pageDesc[l]}</p>
            </div>
          </div>
        </section>

        <div className="container-main py-12">
          {/* Categories */}
          <div className="flex gap-2 flex-wrap mb-10">
            {categories.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  activeCategory === key
                    ? "bg-brand-500/15 text-brand-400 border-brand-500/30"
                    : "bg-dark-600 text-gray-500 border-dark-400 hover:border-dark-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label[l]}
              </button>
            ))}
          </div>

          {/* Tools grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredTools.map((tool) => (
              <a
                key={tool.name}
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="card p-5 flex flex-col group hover:border-brand-500/30 transition-all duration-200"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-display font-bold text-gray-100 group-hover:text-brand-400 transition-colors">
                      {tool.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`badge text-xs border ${tool.badgeColor}`}>
                        {tool.badge}
                      </span>
                      {tool.free && (
                        <span className="badge text-xs bg-green-500/10 text-green-400 border border-green-500/20">
                          <CheckCircle className="w-3 h-3" />
                          Free
                        </span>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-brand-400 transition-colors flex-shrink-0 mt-0.5" />
                </div>

                {/* Description */}
                <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-4">
                  {tool.description[l]}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1.5 pt-3 border-t border-dark-400">
                  <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
                  <span className="text-sm font-medium text-gray-300">{tool.rating}</span>
                  <span className="text-gray-600 text-xs">/ 5.0</span>
                </div>
              </a>
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              {l === "pt-BR" ? "Nenhuma ferramenta nessa categoria ainda." : l === "en" ? "No tools in this category yet." : "No hay herramientas en esta categoría aún."}
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 card p-8 text-center max-w-2xl mx-auto">
            <Bot className="w-10 h-10 text-brand-400 mx-auto mb-4" />
            <h2 className="font-display font-bold text-2xl text-white mb-3">
              {l === "pt-BR" ? "Quer saber mais sobre cada ferramenta?" : l === "en" ? "Want to learn more about each tool?" : "¿Quieres saber más sobre cada herramienta?"}
            </h2>
            <p className="text-gray-400 mb-6">
              {l === "pt-BR"
                ? "Temos reviews detalhados, comparativos e tutoriais para cada ferramenta no blog."
                : l === "en"
                ? "We have detailed reviews, comparisons, and tutorials for each tool on the blog."
                : "Tenemos reviews detalladas, comparativas y tutoriales para cada herramienta en el blog."}
            </p>
            <Link href="/blog?categoria=ai-tools" className="btn-primary text-sm">
              {l === "pt-BR" ? "Ver artigos sobre ferramentas" : l === "en" ? "View tool articles" : "Ver artículos sobre herramientas"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
