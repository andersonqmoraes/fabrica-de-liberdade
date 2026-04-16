"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { createArticle } from "@/lib/firebase/articles";
import { slugify, calculateReadTime } from "@/lib/utils";
import {
  Save,
  Loader2,
  Image,
  Tag,
  FileText,
  Send,
  Languages,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ArticleSeoPanel } from "@/components/admin/ArticleSeoPanel";
import { ImageUpload } from "@/components/admin/ImageUpload";
import type { ArticleCategory, ArticleStatus, Locale } from "@/types";

const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "pt-BR", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

type TranslationState = {
  title: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
};

export default function NewArticlePage() {
  const t = useTranslations("admin");
  const router = useRouter();

  const [activeLocale, setActiveLocale] = useState<Locale>("pt-BR");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [translating, setTranslating] = useState<Locale | null>(null);
  const [translateError, setTranslateError] = useState("");

  // Metadata
  const [category, setCategory] = useState<ArticleCategory>("ai-tools");
  const [status, setStatus] = useState<ArticleStatus>("draft");
  const [featuredImage, setFeaturedImage] = useState("");
  const [tags, setTags] = useState("");
  const [hasAdsense, setHasAdsense] = useState(true);

  // Translations
  const [translations, setTranslations] = useState<Record<Locale, TranslationState>>({
    "pt-BR": { title: "", excerpt: "", content: "", metaTitle: "", metaDescription: "", focusKeyword: "" },
    en: { title: "", excerpt: "", content: "", metaTitle: "", metaDescription: "", focusKeyword: "" },
    es: { title: "", excerpt: "", content: "", metaTitle: "", metaDescription: "", focusKeyword: "" },
  });

  function updateTranslation(locale: Locale, field: string, value: string) {
    setTranslations((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], [field]: value },
    }));
  }

  async function handleTranslate(targetLocale: Locale) {
    const src = translations[activeLocale];
    if (!src.title || !src.content) {
      setTranslateError("Preencha o título e conteúdo na aba atual antes de traduzir.");
      return;
    }
    setTranslating(targetLocale);
    setTranslateError("");
    try {
      const res = await fetch("/api/automation/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...src, sourceLocale: activeLocale, targetLocale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao traduzir");
      setTranslations((prev) => ({ ...prev, [targetLocale]: { ...prev[targetLocale], ...data.translation } }));
      setActiveLocale(targetLocale);
    } catch (err: unknown) {
      setTranslateError(err instanceof Error ? err.message : "Erro ao traduzir");
    } finally {
      setTranslating(null);
    }
  }

  const current = translations[activeLocale];
  const mainTitle = translations["pt-BR"].title || translations.en.title;
  const generatedSlug = slugify(mainTitle);

  async function handleSave(publish = false) {
    if (!mainTitle) {
      setError("Adicione pelo menos o título em PT-BR ou EN.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const filledTranslations = Object.fromEntries(
        Object.entries(translations).filter(([, v]) => v.title.trim())
      );

      await createArticle({
        slug: generatedSlug,
        status: publish ? "published" : status,
        translations: filledTranslations,
        category,
        tags: tagList,
        featuredImage,
        hasAdsense,
        readTime: calculateReadTime(current.content),
        publishedAt: new Date().toISOString(),
        generatedByAI: false,
        affiliateLinks: [],
      });

      router.push("/admin/artigos");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-white mb-1">
            Novo Artigo
          </h1>
          {mainTitle && (
            <p className="text-gray-600 text-sm font-mono">
              slug: {generatedSlug}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={() => handleSave(false)} disabled={saving} className="btn-secondary text-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar rascunho
          </button>
          <button onClick={() => handleSave(true)} disabled={saving} className="btn-primary text-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Publicar
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {translateError && (
        <div className="flex items-center justify-between bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 text-orange-400 text-sm">
          <span>{translateError}</span>
          <button onClick={() => setTranslateError("")} className="ml-3 opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-5">
          {/* Locale tabs */}
          <div className="flex flex-wrap items-center gap-2">
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
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-gray-600">Traduzir para:</span>
              {LOCALES.filter((l) => l.code !== activeLocale).map((l) => (
                <button
                  key={l.code}
                  onClick={() => handleTranslate(l.code)}
                  disabled={translating !== null}
                  title={`Traduzir para ${l.label} com Gemini`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-dark-600 border border-dark-400 text-gray-400 hover:border-brand-500/40 hover:text-brand-400 transition-all disabled:opacity-50"
                >
                  {translating === l.code
                    ? <Loader2 className="w-3 h-3 animate-spin" />
                    : <Languages className="w-3 h-3" />
                  }
                  {l.flag} {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title + Content */}
          <div className="card p-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Título *
              </label>
              <input
                value={current.title}
                onChange={(e) => updateTranslation(activeLocale, "title", e.target.value)}
                placeholder="Título otimizado para SEO (50-65 caracteres)"
                className="input text-lg font-medium"
              />
              <div className={cn("text-xs mt-1.5 text-right", current.title.length > 65 ? "text-red-400" : "text-gray-700")}>
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
                rows={20}
              />
              <div className="flex justify-between text-xs text-gray-700 mt-1.5">
                <span>~{calculateReadTime(current.content)} min de leitura</span>
                <span>{current.content.split(/\s+/).filter(Boolean).length} palavras</span>
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
              slug: generatedSlug,
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
              <label className="text-xs font-medium text-gray-500 mb-2 block">Status inicial</label>
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
              <span className="text-sm text-gray-400">Ativar AdSense</span>
            </label>
          </div>

          {/* Featured Image */}
          <div className="card p-5 space-y-3">
            <h3 className="font-semibold text-gray-300 text-sm flex items-center gap-2">
              <Image className="w-4 h-4" />
              Imagem de capa
            </h3>
            <ImageUpload
              value={featuredImage}
              onChange={(url) => setFeaturedImage(url)}
            />
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
