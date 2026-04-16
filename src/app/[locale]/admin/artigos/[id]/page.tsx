"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { getArticleById, updateArticle } from "@/lib/firebase/articles";
import { slugify, calculateReadTime } from "@/lib/utils";
import {
  Save,
  Loader2,
  Image,
  Tag,
  FileText,
  Send,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ArticleSeoPanel } from "@/components/admin/ArticleSeoPanel";
import { Link } from "@/i18n/routing";
import type { Article, ArticleCategory, ArticleStatus, Locale } from "@/types";

const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "pt-BR", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

export default function EditArticlePage() {
  const t = useTranslations("admin");
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeLocale, setActiveLocale] = useState<Locale>("pt-BR");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // Metadata
  const [category, setCategory] = useState<ArticleCategory>("ai-tools");
  const [status, setStatus] = useState<ArticleStatus>("draft");
  const [featuredImage, setFeaturedImage] = useState("");
  const [tags, setTags] = useState("");
  const [hasAdsense, setHasAdsense] = useState(true);
  const [slug, setSlug] = useState("");

  // Translations
  const [translations, setTranslations] = useState<
    Record<Locale, { title: string; excerpt: string; content: string; metaTitle: string; metaDescription: string; focusKeyword: string }>
  >({
    "pt-BR": { title: "", excerpt: "", content: "", metaTitle: "", metaDescription: "", focusKeyword: "" },
    en: { title: "", excerpt: "", content: "", metaTitle: "", metaDescription: "", focusKeyword: "" },
    es: { title: "", excerpt: "", content: "", metaTitle: "", metaDescription: "", focusKeyword: "" },
  });

  useEffect(() => {
    async function loadArticle() {
      try {
        const data = await getArticleById(articleId);
        if (!data) {
          setNotFound(true);
          return;
        }
        setArticle(data);
        setCategory(data.category);
        setStatus(data.status);
        setFeaturedImage(data.featuredImage || "");
        setTags(data.tags?.join(", ") || "");
        setHasAdsense(data.hasAdsense ?? true);
        setSlug(data.slug);

        // Populate translations
        const filled: typeof translations = {
          "pt-BR": { title: "", excerpt: "", content: "", metaTitle: "", metaDescription: "", focusKeyword: "" },
          en: { title: "", excerpt: "", content: "", metaTitle: "", metaDescription: "", focusKeyword: "" },
          es: { title: "", excerpt: "", content: "", metaTitle: "", metaDescription: "", focusKeyword: "" },
        };
        for (const locale of ["pt-BR", "en", "es"] as Locale[]) {
          const tr = data.translations[locale];
          if (tr) {
            filled[locale] = {
              title: tr.title || "",
              excerpt: tr.excerpt || "",
              content: tr.content || "",
              metaTitle: tr.metaTitle || "",
              metaDescription: tr.metaDescription || "",
              focusKeyword: tr.focusKeyword || "",
            };
          }
        }
        setTranslations(filled);
      } catch {
        setError("Erro ao carregar artigo.");
      } finally {
        setLoading(false);
      }
    }
    loadArticle();
  }, [articleId]);

  function updateTranslation(locale: Locale, field: string, value: string) {
    setTranslations((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], [field]: value },
    }));
  }

  const current = translations[activeLocale];
  const mainTitle = translations["pt-BR"].title || translations.en.title;

  async function handleSave(publish = false) {
    if (!mainTitle) {
      setError("Adicione pelo menos o título em PT-BR ou EN.");
      return;
    }

    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const filledTranslations = Object.fromEntries(
        Object.entries(translations).filter(([, v]) => v.title.trim())
      );

      await updateArticle(articleId, {
        slug: slug || slugify(mainTitle),
        status: publish ? "published" : status,
        translations: filledTranslations,
        category,
        tags: tagList,
        featuredImage,
        hasAdsense,
        readTime: calculateReadTime(current.content),
        ...(publish && { publishedAt: new Date().toISOString() }),
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Carregando artigo...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="font-display font-bold text-xl text-white mb-2">Artigo não encontrado</h2>
          <p className="text-gray-500 mb-6">O artigo com ID <code className="text-brand-400">{articleId}</code> não existe.</p>
          <Link href="/admin/artigos" className="btn-primary text-sm">
            <ArrowLeft className="w-4 h-4" />
            Voltar para artigos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/admin/artigos"
              className="text-gray-600 hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="font-display font-bold text-3xl text-white">
              {t("editArticle")}
            </h1>
          </div>
          {slug && (
            <p className="text-gray-600 text-sm font-mono pl-7">
              slug: {slug}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          {status === "published" && (
            <a
              href={`/blog/${slug}`}
              target="_blank"
              rel="noopener"
              className="btn-ghost text-sm"
            >
              Ver artigo
            </a>
          )}
          <button onClick={() => handleSave(false)} disabled={saving} className="btn-secondary text-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {t("saveDraft")}
          </button>
          <button onClick={() => handleSave(true)} disabled={saving} className="btn-primary text-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {t("publishArticle")}
          </button>
        </div>
      </div>

      {saved && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-green-400 text-sm">
          ✓ Artigo salvo com sucesso!
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-5">
          {/* Locale tabs */}
          <div className="flex gap-2">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                onClick={() => setActiveLocale(l.code)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                  activeLocale === l.code
                    ? "bg-brand-500/15 text-brand-400 border-brand-500/30"
                    : "bg-dark-600 text-gray-500 border-dark-400 hover:border-dark-300"
                )}
              >
                {l.flag} {l.label}
                {translations[l.code].title && (
                  <div className="w-1.5 h-1.5 bg-brand-400 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Title */}
          <div className="card p-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Título *
              </label>
              <input
                value={current.title}
                onChange={(e) => updateTranslation(activeLocale, "title", e.target.value)}
                placeholder="Título otimizado para SEO (60-65 caracteres)"
                className="input text-lg font-medium"
              />
              <div className="text-xs text-gray-700 mt-1.5 text-right">
                {current.title.length}/65 chars
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Resumo / Excerpt
              </label>
              <textarea
                value={current.excerpt}
                onChange={(e) => updateTranslation(activeLocale, "excerpt", e.target.value)}
                placeholder="Resumo atrativo de 1-2 frases..."
                className="input resize-none"
                rows={2}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Conteúdo (Markdown)
              </label>
              <textarea
                value={current.content}
                onChange={(e) => updateTranslation(activeLocale, "content", e.target.value)}
                placeholder="# Título H1&#10;&#10;Conteúdo em Markdown..."
                className="input font-mono text-sm resize-none"
                rows={22}
              />
              <div className="text-xs text-gray-700 mt-1.5">
                ~{calculateReadTime(current.content)} min de leitura
              </div>
            </div>
          </div>

          {/* SEO Panel */}
          <ArticleSeoPanel
            data={{
              title: current.title,
              metaTitle: current.metaTitle,
              metaDescription: current.metaDescription,
              focusKeyword: current.focusKeyword,
              content: current.content,
              excerpt: current.excerpt,
              tags,
              featuredImage,
              slug,
            }}
            onChange={(field, value) => {
              if (field === "tags") {
                setTags(value);
              } else if (field === "featuredImage") {
                setFeaturedImage(value);
              } else {
                updateTranslation(activeLocale, field, value);
              }
            }}
          />

          {/* Slug */}
          <div className="card p-5 space-y-3">
            <h3 className="font-semibold text-gray-300 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" />
              URL / Slug
            </h3>
            <div className="flex gap-2 items-center">
              <span className="text-gray-600 text-sm font-mono">/blog/</span>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="input text-sm font-mono flex-1"
              />
            </div>
            <button
              onClick={() => setSlug(slugify(mainTitle))}
              className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
            >
              Regenerar a partir do título
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Status & Category */}
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-gray-300 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Configurações
            </h3>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ArticleCategory)}
                className="input text-sm"
              >
                <option value="ai-tools">Ferramentas de IA</option>
                <option value="productivity">Produtividade</option>
                <option value="tech-reviews">Tech Reviews</option>
                <option value="make-money">Ganhar Dinheiro</option>
                <option value="automation">Automação</option>
                <option value="software">Software & Apps</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                className="input text-sm"
              >
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
                <option value="scheduled">Agendado</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasAdsense}
                onChange={(e) => setHasAdsense(e.target.checked)}
                className="w-4 h-4 accent-brand-500"
              />
              <span className="text-sm text-gray-400">Ativar AdSense neste artigo</span>
            </label>
          </div>

          {/* Datas */}
          {article && (
            <div className="card p-5 space-y-3">
              <h3 className="font-semibold text-gray-300 text-sm">Datas</h3>
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Criado em:</span>
                  <span>{new Date(article.createdAt).toLocaleDateString("pt-BR")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Publicado em:</span>
                  <span>{new Date(article.publishedAt).toLocaleDateString("pt-BR")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Atualizado:</span>
                  <span>{new Date(article.updatedAt).toLocaleDateString("pt-BR")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Visualizações:</span>
                  <span className="text-brand-400">{article.views?.toLocaleString("pt-BR")}</span>
                </div>
              </div>
            </div>
          )}

          {/* Featured Image */}
          <div className="card p-5 space-y-3">
            <h3 className="font-semibold text-gray-300 text-sm flex items-center gap-2">
              <Image className="w-4 h-4" />
              Imagem de capa
            </h3>
            <input
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="URL da imagem..."
              className="input text-sm"
            />
            {featuredImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={featuredImage}
                alt="Preview"
                className="w-full h-32 object-cover rounded-xl"
              />
            )}
          </div>

          {/* Tags */}
          <div className="card p-5 space-y-3">
            <h3 className="font-semibold text-gray-300 text-sm flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </h3>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="ia, ferramentas, produtividade"
              className="input text-sm"
            />
            <p className="text-gray-700 text-xs">Separadas por vírgula</p>
          </div>
        </div>
      </div>
    </div>
  );
}
