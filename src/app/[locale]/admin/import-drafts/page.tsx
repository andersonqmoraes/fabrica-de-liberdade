"use client";

import { useEffect, useState } from "react";
import { createArticle, getArticleBySlug } from "@/lib/firebase/articles";
import { DEFAULT_AUTHOR_ID } from "@/lib/authors";
import type { Article, ArticleCategory } from "@/types";
import {
  CheckCircle2,
  Loader2,
  Play,
  AlertTriangle,
  FileText,
  ChevronRight,
  RefreshCw,
  SkipForward,
} from "lucide-react";

interface SeedArticle {
  sourceFile: string;
  slug: string;
  category: ArticleCategory;
  tags: string[];
  targetKeyword: string;
  readTime: number;
  publishedAtOffsetDays: number;
  title: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
}

interface ImportState {
  status: "pending" | "running" | "done" | "skipped" | "error";
  detail?: string;
  articleId?: string;
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=1200&q=80";

export default function ImportDraftsPage() {
  const [seed, setSeed] = useState<SeedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [states, setStates] = useState<Record<string, ImportState>>({});
  const [running, setRunning] = useState(false);

  async function loadSeed() {
    setLoading(true);
    try {
      const res = await fetch("/seed-articles.json", { cache: "no-store" });
      const json = await res.json();
      const articles: SeedArticle[] = json.articles || [];
      setSeed(articles);
      const initial: Record<string, ImportState> = {};
      for (const a of articles) initial[a.slug] = { status: "pending" };
      setStates(initial);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSeed();
  }, []);

  function updateState(slug: string, patch: Partial<ImportState>) {
    setStates((prev) => ({ ...prev, [slug]: { ...prev[slug], ...patch } }));
  }

  async function importOne(a: SeedArticle) {
    updateState(a.slug, { status: "running" });

    // Skip se já existe
    try {
      const existing = await getArticleBySlug(a.slug);
      if (existing) {
        updateState(a.slug, {
          status: "skipped",
          detail: `Já existe (id=${existing.id})`,
          articleId: existing.id,
        });
        return;
      }
    } catch {
      // proceed if read fails
    }

    const publishedAt = new Date();
    publishedAt.setDate(publishedAt.getDate() + a.publishedAtOffsetDays);

    const articleData: Omit<
      Article & { authorId: string },
      "id" | "createdAt" | "updatedAt" | "views"
    > = {
      slug: a.slug,
      status: "published",
      translations: {
        "pt-BR": {
          title: a.title,
          excerpt: a.excerpt,
          content: a.content,
          metaTitle: a.metaTitle,
          metaDescription: a.metaDescription,
          focusKeyword: a.targetKeyword,
        },
      },
      category: a.category,
      tags: a.tags,
      featuredImage: PLACEHOLDER_IMAGE,
      hasAdsense: true,
      readTime: a.readTime,
      publishedAt: publishedAt.toISOString(),
      authorId: DEFAULT_AUTHOR_ID,
      generatedByAI: false,
      targetKeyword: a.targetKeyword,
    };

    try {
      const id = await createArticle(
        articleData as unknown as Omit<Article, "id" | "createdAt" | "updatedAt" | "views">
      );
      updateState(a.slug, {
        status: "done",
        detail: `Criado (id=${id})`,
        articleId: id,
      });
    } catch (err) {
      updateState(a.slug, {
        status: "error",
        detail: err instanceof Error ? err.message : "Erro desconhecido",
      });
    }
  }

  async function importAll() {
    setRunning(true);
    try {
      for (const a of seed) {
        await importOne(a);
      }
    } finally {
      setRunning(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
      </div>
    );
  }

  const counts = {
    pending: Object.values(states).filter((s) => s.status === "pending").length,
    done: Object.values(states).filter((s) => s.status === "done").length,
    skipped: Object.values(states).filter((s) => s.status === "skipped").length,
    error: Object.values(states).filter((s) => s.status === "error").length,
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 border border-brand-500/30 rounded-full text-brand-400 text-xs font-medium mb-3">
          <FileText className="w-3.5 h-3.5" />
          Importação de seed articles
        </div>
        <h1 className="font-display font-bold text-3xl text-white mb-3">
          Importar artigos de drafts/
        </h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          Importa os artigos em <code>public/seed-articles.json</code> direto pro Firestore como <strong>publicados</strong>,
          com datas escalonadas, autoria atribuída a Anderson, e <code>generatedByAI=false</code>. Slugs já existentes são ignorados.
          Reversível pela aba de Artigos.
        </p>
      </div>

      <div className="card p-5 mb-6 bg-dark-700/60 grid grid-cols-4 gap-3 text-center">
        <div>
          <div className="text-2xl font-bold text-gray-300">{seed.length}</div>
          <div className="text-xs text-gray-600 uppercase tracking-wider">Total</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-400">{counts.done}</div>
          <div className="text-xs text-gray-600 uppercase tracking-wider">Importados</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gold-400">{counts.skipped}</div>
          <div className="text-xs text-gray-600 uppercase tracking-wider">Pulados</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-red-400">{counts.error}</div>
          <div className="text-xs text-gray-600 uppercase tracking-wider">Erros</div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <button onClick={importAll} disabled={running} className="btn-primary">
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {running ? "Importando..." : `Importar todos (${seed.length})`}
        </button>
        <button onClick={loadSeed} disabled={running} className="btn-secondary">
          <RefreshCw className="w-4 h-4" />
          Recarregar manifest
        </button>
      </div>

      <div className="space-y-2">
        {seed.map((a) => {
          const st = states[a.slug] || { status: "pending" };
          const publishedAt = new Date();
          publishedAt.setDate(publishedAt.getDate() + a.publishedAtOffsetDays);
          return (
            <div key={a.slug} className="card p-4 flex items-start gap-4">
              <div className="mt-0.5">
                {st.status === "done" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : st.status === "running" ? (
                  <Loader2 className="w-5 h-5 text-brand-400 animate-spin" />
                ) : st.status === "skipped" ? (
                  <SkipForward className="w-5 h-5 text-gold-400" />
                ) : st.status === "error" ? (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-200 text-sm mb-1 line-clamp-1">
                  {a.title}
                </h3>
                <div className="text-xs text-gray-600 mb-1">
                  <span className="font-mono">{a.slug}</span>
                  {" · "}
                  <span>{a.category}</span>
                  {" · "}
                  <span>{a.readTime} min</span>
                  {" · "}
                  <span>publicado em {publishedAt.toLocaleDateString("pt-BR")}</span>
                </div>
                {st.detail && (
                  <p
                    className={`text-xs mt-1 ${
                      st.status === "error"
                        ? "text-red-400"
                        : st.status === "skipped"
                        ? "text-gold-400"
                        : "text-green-400"
                    }`}
                  >
                    {st.detail}
                  </p>
                )}
              </div>
              <button
                onClick={() => importOne(a)}
                disabled={running || st.status === "running"}
                className="btn-ghost text-xs"
              >
                Só este
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-10 p-5 rounded-2xl border border-brand-500/30 bg-brand-500/5">
        <h3 className="font-semibold text-brand-300 mb-2 text-sm">Próximo passo</h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          Depois de importar, acesse{" "}
          <code>/admin/artigos</code> pra revisar cada artigo, ajustar imagem destacada
          (substituir o placeholder do Unsplash), ou despublicar individualmente.
          A home deve renderizar os artigos publicados automaticamente — pode levar até 5 min
          de cache (revalidate=300).
        </p>
      </div>
    </div>
  );
}
