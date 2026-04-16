"use client";

import { useMemo } from "react";
import { Search, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface SeoData {
  title: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  content: string;
  excerpt: string;
  tags: string;
  featuredImage: string;
  slug: string;
}

interface ArticleSeoPanelProps {
  data: SeoData;
  siteUrl?: string;
  onChange: (field: keyof SeoData, value: string) => void;
}

interface SeoCheck {
  label: string;
  pass: boolean;
  tip?: string;
}

function scoreColor(score: number) {
  if (score >= 80) return "text-green-400";
  if (score >= 50) return "text-yellow-400";
  return "text-red-400";
}

function scoreBg(score: number) {
  if (score >= 80) return "bg-green-400";
  if (score >= 50) return "bg-yellow-400";
  return "bg-red-400";
}

function scoreLabel(score: number) {
  if (score >= 80) return "Bom";
  if (score >= 50) return "Precisa melhorar";
  return "Ruim";
}

function computeSeoScore(data: SeoData): { score: number; checks: SeoCheck[] } {
  const kw = data.focusKeyword.trim().toLowerCase();
  const title = (data.metaTitle || data.title).toLowerCase();
  const desc = data.metaDescription.toLowerCase();
  const content = data.content.toLowerCase();
  const titleLen = (data.metaTitle || data.title).length;
  const descLen = data.metaDescription.length;

  const checks: SeoCheck[] = [
    {
      label: "Palavra-chave definida",
      pass: kw.length > 0,
      tip: "Defina uma palavra-chave foco para o artigo",
    },
    {
      label: "Palavra-chave no título",
      pass: kw.length > 0 && title.includes(kw),
      tip: "O título deve conter a palavra-chave foco",
    },
    {
      label: "Título no tamanho ideal (50-65 chars)",
      pass: titleLen >= 50 && titleLen <= 65,
      tip: `Atual: ${titleLen} chars. Ideal: 50-65`,
    },
    {
      label: "Meta description com 120-160 chars",
      pass: descLen >= 120 && descLen <= 160,
      tip: `Atual: ${descLen} chars. Ideal: 120-160`,
    },
    {
      label: "Palavra-chave na meta description",
      pass: kw.length > 0 && desc.includes(kw),
      tip: "A meta description deve mencionar a palavra-chave",
    },
    {
      label: "Conteúdo com mínimo 300 palavras",
      pass: content.split(/\s+/).filter(Boolean).length >= 300,
      tip: `Atual: ${content.split(/\s+/).filter(Boolean).length} palavras`,
    },
    {
      label: "Palavra-chave no conteúdo",
      pass: kw.length > 0 && content.includes(kw),
      tip: "O conteúdo deve mencionar a palavra-chave pelo menos uma vez",
    },
    {
      label: "Imagem de capa definida",
      pass: data.featuredImage.trim().length > 0,
      tip: "Adicione uma imagem de capa ao artigo",
    },
    {
      label: "Tags preenchidas",
      pass: data.tags.trim().length > 0,
      tip: "Adicione pelo menos uma tag",
    },
    {
      label: "URL / slug definido",
      pass: data.slug.trim().length > 0,
      tip: "O slug da URL deve estar preenchido",
    },
  ];

  const passed = checks.filter((c) => c.pass).length;
  const score = Math.round((passed / checks.length) * 100);

  return { score, checks };
}

export function ArticleSeoPanel({ data, siteUrl = "https://fabricadeliberdade.com.br", onChange }: ArticleSeoPanelProps) {
  const { score, checks } = useMemo(() => computeSeoScore(data), [data]);

  const displayTitle = data.metaTitle || data.title || "Título do artigo";
  const displayDesc = data.metaDescription || data.excerpt || "Descrição do artigo para aparecer no Google...";
  const displayUrl = `${siteUrl}/blog/${data.slug || "slug-do-artigo"}`;

  const kw = data.focusKeyword.trim().toLowerCase();

  function highlightKw(text: string) {
    if (!kw) return text;
    const idx = text.toLowerCase().indexOf(kw);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-transparent text-brand-400 font-medium">
          {text.slice(idx, idx + kw.length)}
        </mark>
        {text.slice(idx + kw.length)}
      </>
    );
  }

  return (
    <div className="card p-5 space-y-5">
      {/* Header + Score */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-300 flex items-center gap-2">
          <Search className="w-4 h-4 text-brand-400" />
          SEO
        </h3>
        <div className="flex items-center gap-2">
          <div className="relative w-10 h-10">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-dark-400"
              />
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${(score / 100) * 94.2} 94.2`}
                strokeLinecap="round"
                className={scoreColor(score)}
              />
            </svg>
            <span className={cn("absolute inset-0 flex items-center justify-center text-xs font-bold", scoreColor(score))}>
              {score}
            </span>
          </div>
          <div>
            <div className={cn("text-sm font-semibold", scoreColor(score))}>
              {scoreLabel(score)}
            </div>
            <div className="text-xs text-gray-600">
              {checks.filter((c) => c.pass).length}/{checks.length} critérios
            </div>
          </div>
        </div>
      </div>

      {/* Focus keyword */}
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
          Palavra-chave foco
        </label>
        <input
          value={data.focusKeyword}
          onChange={(e) => onChange("focusKeyword", e.target.value)}
          placeholder="ex: ferramentas de IA gratuitas"
          className="input text-sm"
        />
        <p className="text-gray-700 text-xs mt-1">
          Palavra ou frase que você quer rankear no Google
        </p>
      </div>

      {/* Meta Title */}
      <div>
        <label className="text-xs font-medium text-gray-500 mb-2 block">Meta Title</label>
        <input
          value={data.metaTitle}
          onChange={(e) => onChange("metaTitle", e.target.value)}
          placeholder="Deixe vazio para usar o título"
          className="input text-sm"
        />
        <div className="flex justify-between text-xs text-gray-700 mt-1">
          <span>{(data.metaTitle || data.title).length}/65 chars</span>
          {(data.metaTitle || data.title).length > 65 && (
            <span className="text-red-400">Muito longo</span>
          )}
        </div>
      </div>

      {/* Meta Description */}
      <div>
        <label className="text-xs font-medium text-gray-500 mb-2 block">Meta Description</label>
        <textarea
          value={data.metaDescription}
          onChange={(e) => onChange("metaDescription", e.target.value)}
          placeholder="Descrição persuasiva (150-160 chars) que contém a palavra-chave"
          className="input text-sm resize-none"
          rows={3}
        />
        <div className="flex justify-between text-xs text-gray-700 mt-1">
          <span
            className={cn(
              data.metaDescription.length > 160
                ? "text-red-400"
                : data.metaDescription.length >= 120
                ? "text-green-400"
                : ""
            )}
          >
            {data.metaDescription.length}/160 chars
          </span>
          {data.metaDescription.length > 0 && data.metaDescription.length < 120 && (
            <span className="text-yellow-400">Muito curta</span>
          )}
        </div>
      </div>

      {/* Google Preview */}
      <div className="bg-dark-700 border border-dark-400 rounded-xl p-4 space-y-1.5">
        <div className="flex items-center gap-1.5 mb-2">
          <Eye className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-xs text-gray-600 uppercase tracking-wide font-medium">
            Preview no Google
          </span>
        </div>
        <div className="text-xs text-gray-500 font-mono truncate">{displayUrl}</div>
        <div className="text-base text-blue-400 font-medium leading-snug">
          {highlightKw(displayTitle)}
        </div>
        <div className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
          {highlightKw(displayDesc)}
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Análise SEO
        </p>
        {checks.map((check) => (
          <div key={check.label} className="flex items-start gap-2 text-sm">
            <div
              className={cn(
                "w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center text-xs",
                check.pass
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/10 text-red-400"
              )}
            >
              {check.pass ? "✓" : "✗"}
            </div>
            <div>
              <span
                className={check.pass ? "text-gray-400" : "text-gray-500"}
              >
                {check.label}
              </span>
              {!check.pass && check.tip && (
                <p className="text-xs text-gray-600 mt-0.5">{check.tip}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Score bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-gray-600">
          <span>Pontuação SEO</span>
          <span className={scoreColor(score)}>{score}/100</span>
        </div>
        <div className="h-2 bg-dark-400 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", scoreBg(score))}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  );
}
