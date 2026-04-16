"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createArticle } from "@/lib/firebase/articles";
import { slugify, calculateReadTime } from "@/lib/utils";
import {
  Bot,
  Sparkles,
  Image,
  Send,
  Loader2,
  Check,
  AlertCircle,
  ChevronDown,
  Zap,
  RefreshCw,
  Copy,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale, ArticleCategory } from "@/types";

type GenerateStatus = "idle" | "researching" | "writing" | "generating-image" | "saving" | "done" | "error";

const statusMessages: Record<GenerateStatus, string> = {
  idle: "",
  researching: "🔍 Pesquisando keyword e concorrência...",
  writing: "✍️ Gerando artigo completo com IA...",
  "generating-image": "🖼️ Criando imagem de capa com DALL-E 3...",
  saving: "💾 Salvando no Firebase...",
  done: "✅ Artigo gerado e salvo com sucesso!",
  error: "❌ Erro na geração. Verifique as API keys.",
};

export default function AdminAutomacaoPage() {
  const t = useTranslations("admin.automation");

  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState<ArticleCategory>("ai-tools");
  const [locale, setLocale] = useState<Locale>("pt-BR");
  const [tone, setTone] = useState("professional");
  const [generateImage, setGenerateImage] = useState(true);
  const [publish, setPublish] = useState(false);
  const [status, setStatus] = useState<GenerateStatus>("idle");
  const [result, setResult] = useState<{
    title?: string;
    content?: string;
    imageUrl?: string;
    articleId?: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  function addLog(msg: string) {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  }

  async function handleGenerate() {
    if (!keyword.trim()) return;

    setStatus("researching");
    setResult(null);
    setError("");
    setLogs([]);

    try {
      addLog(`Iniciando geração para keyword: "${keyword}"`);
      addLog(`Idioma: ${locale} | Tom: ${tone} | Categoria: ${category}`);

      setStatus("writing");
      addLog("Chamando API de geração de conteúdo...");

      const res = await fetch("/api/automation/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, category, locale, tone, generateImage }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Falha na geração");
      }

      const data = await res.json();
      addLog(`Artigo gerado: "${data.title}"`);
      addLog(`${data.wordCount} palavras | ${data.readTime} min de leitura`);

      if (data.imageUrl) {
        addLog(`Imagem gerada com sucesso`);
      }

      setStatus("saving");
      addLog("Salvando no Firebase Firestore...");

      const articleId = await createArticle({
        slug: slugify(data.title),
        status: publish ? "published" : "draft",
        translations: {
          [locale]: {
            title: data.title,
            excerpt: data.excerpt,
            content: data.content,
            metaTitle: data.metaTitle,
            metaDescription: data.metaDescription,
            focusKeyword: keyword,
          },
        },
        category,
        tags: data.tags || [],
        featuredImage: data.imageUrl || "",
        hasAdsense: true,
        readTime: calculateReadTime(data.content),
        publishedAt: publish ? new Date().toISOString() : new Date().toISOString(),
        generatedByAI: true,
        aiModel: "claude-3-5-sonnet",
        targetKeyword: keyword,
        affiliateLinks: data.affiliateLinks || [],
      });

      addLog(`Artigo salvo com ID: ${articleId}`);
      addLog(publish ? "Publicado imediatamente!" : "Salvo como rascunho para revisão.");

      setResult({
        title: data.title,
        content: data.content.substring(0, 500) + "...",
        imageUrl: data.imageUrl,
        articleId,
      });
      setStatus("done");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
      addLog(`ERRO: ${message}`);
      setStatus("error");
    }
  }

  const isRunning = ["researching", "writing", "generating-image", "saving"].includes(status);

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-3xl text-white mb-1 flex items-center gap-3">
          <div className="w-10 h-10 bg-gold-500/10 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-gold-400" />
          </div>
          {t("title")}
        </h1>
        <p className="text-gray-600">
          Gere artigos completos, otimizados para SEO e prontos para publicar
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-3 space-y-5">
          <div className="card p-6 space-y-5">
            <h2 className="font-semibold text-gray-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-400" />
              Configurar geração
            </h2>

            {/* Keyword */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                {t("keyword")} *
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Ex: melhores ferramentas de IA para escrever"
                className="input"
                disabled={isRunning}
              />
              <p className="text-gray-700 text-xs mt-1.5">
                Use keywords com alto volume de busca para melhores resultados
              </p>
            </div>

            {/* Category + Locale */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ArticleCategory)}
                  className="input"
                  disabled={isRunning}
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
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {t("language")}
                </label>
                <select
                  value={locale}
                  onChange={(e) => setLocale(e.target.value as Locale)}
                  className="input"
                  disabled={isRunning}
                >
                  <option value="pt-BR">🇧🇷 Português BR</option>
                  <option value="en">🇺🇸 English</option>
                  <option value="es">🇪🇸 Español</option>
                </select>
              </div>
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                {t("tone")}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { value: "professional", label: "Profissional", icon: "💼" },
                  { value: "casual", label: "Casual", icon: "😊" },
                  { value: "educational", label: "Educacional", icon: "🎓" },
                  { value: "persuasive", label: "Persuasivo", icon: "🔥" },
                ].map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTone(t.value)}
                    disabled={isRunning}
                    className={cn(
                      "p-3 rounded-xl border text-xs font-medium text-center transition-all",
                      tone === t.value
                        ? "bg-brand-500/15 border-brand-500/30 text-brand-400"
                        : "bg-dark-600 border-dark-400 text-gray-500 hover:border-dark-300"
                    )}
                  >
                    <div className="text-lg mb-1">{t.icon}</div>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={cn(
                    "w-10 h-5 rounded-full relative transition-colors",
                    generateImage ? "bg-brand-500" : "bg-dark-500"
                  )}
                  onClick={() => !isRunning && setGenerateImage(!generateImage)}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
                      generateImage ? "translate-x-5" : "translate-x-0.5"
                    )}
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-300">
                    Gerar imagem com IA
                  </div>
                  <div className="text-xs text-gray-600">DALL-E 3 — usa créditos da API</div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  className={cn(
                    "w-10 h-5 rounded-full relative transition-colors",
                    publish ? "bg-brand-500" : "bg-dark-500"
                  )}
                  onClick={() => !isRunning && setPublish(!publish)}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
                      publish ? "translate-x-5" : "translate-x-0.5"
                    )}
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-300">
                    Publicar imediatamente
                  </div>
                  <div className="text-xs text-gray-600">
                    Desligado = salva como rascunho
                  </div>
                </div>
              </label>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={isRunning || !keyword.trim()}
              className={cn(
                "btn-primary w-full justify-center text-base py-4",
                (isRunning || !keyword.trim()) &&
                  "opacity-70 cursor-not-allowed hover:translate-y-0 hover:shadow-brand"
              )}
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {statusMessages[status]}
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  {t("generate")}
                </>
              )}
            </button>

            {/* Status message */}
            {status === "done" && (
              <div className="flex items-center gap-2 p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl text-brand-400 text-sm">
                <Check className="w-4 h-4 flex-shrink-0" />
                {t("success")}
              </div>
            )}
            {status === "error" && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error || "Verifique suas API keys no arquivo .env.local"}
              </div>
            )}
          </div>

          {/* Result preview */}
          {result && (
            <div className="card p-6">
              <h3 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
                <Check className="w-4 h-4 text-brand-400" />
                Artigo gerado
              </h3>
              <h4 className="font-bold text-lg text-white mb-3">{result.title}</h4>
              {result.imageUrl && (
                <img
                  src={result.imageUrl}
                  alt={result.title}
                  className="w-full h-40 object-cover rounded-xl mb-4"
                />
              )}
              <p className="text-gray-500 text-sm line-clamp-4 mb-4">{result.content}</p>
              <div className="flex gap-2">
                <a
                  href={`/admin/artigos/${result.articleId}`}
                  className="btn-primary text-sm flex-1 justify-center"
                >
                  <RefreshCw className="w-4 h-4" />
                  Revisar artigo
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right panel — info + logs */}
        <div className="lg:col-span-2 space-y-5">
          {/* What will be generated */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-300 text-sm mb-4">
              O que será gerado
            </h3>
            <ul className="space-y-3">
              {[
                { icon: "📝", text: "Artigo de 1500-3000 palavras" },
                { icon: "🎯", text: "SEO otimizado (H1-H6, meta, schema)" },
                { icon: "🖼️", text: "Imagem de capa (DALL-E 3)" },
                { icon: "🔗", text: "Links de afiliado inseridos" },
                { icon: "❓", text: "Seção FAQ para featured snippets" },
                { icon: "📊", text: "Tabelas comparativas quando relevante" },
                { icon: "🌐", text: "Tradução automática opcional" },
              ].map(({ icon, text }) => (
                <li key={text} className="flex items-center gap-2.5 text-sm">
                  <span>{icon}</span>
                  <span className="text-gray-500">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Automation log */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-300 text-sm mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Log de execução
            </h3>
            <div className="bg-dark-700 rounded-xl p-3 h-48 overflow-y-auto font-mono text-xs">
              {logs.length === 0 ? (
                <p className="text-gray-700">
                  Aguardando início da geração...
                </p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="text-gray-500 mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-dark-700/50 border border-gold-500/20 rounded-2xl p-5">
            <h3 className="font-semibold text-gold-400 text-sm mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Dicas de keyword
            </h3>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>✅ "melhor [produto] para [uso]"</li>
              <li>✅ "[produto] vs [produto] qual é melhor"</li>
              <li>✅ "como usar [ferramenta] para [objetivo]"</li>
              <li>✅ "top 10 [categoria] em 2025"</li>
              <li>✅ "[ferramenta] review completo"</li>
              <li className="text-brand-500 mt-3">
                💡 Keywords com "melhor" e "top" têm alta intenção comercial → mais cliques em afiliados
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
