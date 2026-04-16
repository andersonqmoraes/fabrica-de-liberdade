"use client";

import { useState, useRef, useCallback } from "react";
import { createArticle, getArticlesForIdeas } from "@/lib/firebase/articles";
import { slugify, calculateReadTime } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import {
  Bot,
  Sparkles,
  Zap,
  Loader2,
  CheckCircle,
  AlertCircle,
  Upload,
  ImageOff,
  ArrowRight,
  RefreshCw,
  FileText,
  Lightbulb,
  TrendingUp,
  Target,
  DollarSign,
  ChevronRight,
  TerminalSquare,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale, ArticleCategory } from "@/types";
import type { ContentIdea } from "@/app/api/automation/ideas/route";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = "generate" | "ideas";
type GenerateStatus = "idle" | "writing" | "imaging" | "saving" | "done" | "error";
type ImageMode = "ai" | "upload" | "none";

const CATEGORIES: { value: ArticleCategory; label: string }[] = [
  { value: "ai-tools", label: "Ferramentas de IA" },
  { value: "productivity", label: "Produtividade" },
  { value: "tech-reviews", label: "Tech Reviews" },
  { value: "make-money", label: "Ganhar Dinheiro" },
  { value: "automation", label: "Automação" },
  { value: "software", label: "Software & Apps" },
];

const TONES = [
  { value: "professional", label: "Profissional", icon: "💼", desc: "Autoritário e baseado em dados" },
  { value: "casual", label: "Casual", icon: "😊", desc: "Amigável e acessível" },
  { value: "educational", label: "Educacional", icon: "🎓", desc: "Didático e passo a passo" },
  { value: "persuasive", label: "Persuasivo", icon: "🔥", desc: "Com urgência e provas sociais" },
];

const DIFFICULTY_CONFIG = {
  low: { label: "Fácil", color: "text-green-400 bg-green-500/10 border-green-500/20" },
  medium: { label: "Médio", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  high: { label: "Difícil", color: "text-red-400 bg-red-500/10 border-red-500/20" },
};

const INTENT_CONFIG = {
  informational: { label: "Informacional", color: "text-blue-400" },
  commercial: { label: "Comercial", color: "text-brand-400" },
  transactional: { label: "Transacional", color: "text-gold-400" },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminAutomacaoPage() {
  const [activeTab, setActiveTab] = useState<Tab>("generate");

  // ── Generate tab state
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState<ArticleCategory>("ai-tools");
  const [locale, setLocale] = useState<Locale>("pt-BR");
  const [tone, setTone] = useState("professional");
  const [instructions, setInstructions] = useState("");
  const [imageMode, setImageMode] = useState<ImageMode>("ai");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageName, setUploadedImageName] = useState("");
  const [publish, setPublish] = useState(false);
  const [status, setStatus] = useState<GenerateStatus>("idle");
  const [logs, setLogs] = useState<{ time: string; msg: string; type: "info" | "success" | "error" }[]>([]);
  const [result, setResult] = useState<{ title?: string; imageUrl?: string; articleId?: string } | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Ideas tab state
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [ideasError, setIdeasError] = useState("");
  const [existingArticles, setExistingArticles] = useState<{ title: string; category: string; tags: string[] }[]>([]);
  const [articlesFetched, setArticlesFetched] = useState(false);

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const addLog = useCallback((msg: string, type: "info" | "success" | "error" = "info") => {
    const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs((prev) => [{ time, msg, type }, ...prev]);
  }, []);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedImageName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function useIdea(idea: ContentIdea) {
    setKeyword(idea.keyword);
    setCategory(idea.category as ArticleCategory);
    setActiveTab("generate");
  }

  // ─── Generate handler ────────────────────────────────────────────────────

  async function handleGenerate() {
    if (!keyword.trim()) return;
    setStatus("writing");
    setResult(null);
    setError("");
    setLogs([]);

    try {
      addLog(`Iniciando geração para: "${keyword}"`);
      addLog(`Idioma: ${locale} | Tom: ${tone} | Categoria: ${category}`);
      if (instructions.trim()) addLog("Instruções personalizadas aplicadas");

      const res = await fetch("/api/automation/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword,
          category,
          locale,
          tone,
          instructions,
          generateImage: imageMode === "ai",
        }),
      });

      if (!res.ok) {
        let errorMsg = `Erro ${res.status} na API`;
        try {
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const err = await res.json();
            errorMsg = err.error || errorMsg;
          } else {
            errorMsg = res.status === 500
              ? "Erro 500 — verifique se GEMINI_API_KEY está configurada nas variáveis de ambiente da Vercel"
              : `Erro ${res.status}`;
          }
        } catch { /* mantém o errorMsg padrão */ }
        throw new Error(errorMsg);
      }

      const data = await res.json();
      addLog(`Artigo gerado: "${data.title}"`, "success");
      addLog(`${data.wordCount ?? "~2500"} palavras · ${data.readTime ?? 12} min de leitura`);

      // Imagem: AI ou upload manual
      let finalImageUrl = "";
      if (imageMode === "ai" && data.imageUrl) {
        addLog("Imagem gerada pelo Gemini Imagen 3", "success");
        finalImageUrl = data.imageUrl;
      } else if (imageMode === "upload" && uploadedImage) {
        addLog("Usando imagem enviada manualmente");
        finalImageUrl = uploadedImage;
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
        featuredImage: finalImageUrl,
        hasAdsense: true,
        readTime: calculateReadTime(data.content || ""),
        publishedAt: new Date().toISOString(),
        generatedByAI: true,
        aiModel: "gemini-2.0-flash",
        targetKeyword: keyword,
        affiliateLinks: data.affiliateLinks || [],
      });

      addLog(`Salvo com sucesso · ID: ${articleId}`, "success");
      addLog(publish ? "Publicado imediatamente!" : "Salvo como rascunho para revisão.");

      setResult({ title: data.title, imageUrl: finalImageUrl, articleId });
      setStatus("done");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
      addLog(`ERRO: ${message}`, "error");
      setStatus("error");
    }
  }

  // ─── Ideas handler ───────────────────────────────────────────────────────

  async function handleGenerateIdeas() {
    setIdeasLoading(true);
    setIdeasError("");
    setIdeas([]);

    try {
      // Busca artigos existentes se ainda não buscou
      let articles = existingArticles;
      if (!articlesFetched) {
        const fetched = await getArticlesForIdeas(20);
        const mapped = fetched.map((a) => ({
          title: a.translations?.["pt-BR"]?.title || a.translations?.en?.title || "Sem título",
          category: a.category,
          tags: a.tags || [],
        }));
        setExistingArticles(mapped);
        setArticlesFetched(true);
        articles = mapped;
      }

      const res = await fetch("/api/automation/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articles }),
      });

      if (!res.ok) {
        let errorMsg = `Erro ${res.status} na API`;
        try {
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const err = await res.json();
            errorMsg = err.error || errorMsg;
          } else {
            errorMsg = res.status === 500
              ? "Erro 500 — verifique se GEMINI_API_KEY está configurada nas variáveis de ambiente da Vercel (Settings → Environment Variables)"
              : `Erro ${res.status}`;
          }
        } catch { /* mantém o errorMsg padrão */ }
        throw new Error(errorMsg);
      }

      const data = await res.json();
      setIdeas(data.ideas || []);
    } catch (err: unknown) {
      setIdeasError(err instanceof Error ? err.message : "Erro ao gerar ideias");
    } finally {
      setIdeasLoading(false);
    }
  }

  const isRunning = ["writing", "imaging", "saving"].includes(status);

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="max-w-6xl space-y-6 pb-10">
      {/* ── Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-white mb-1 flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-500/10 border border-gold-500/20 rounded-xl flex items-center justify-center">
              <Bot className="w-5 h-5 text-gold-400" />
            </div>
            Studio de Conteúdo IA
          </h1>
          <p className="text-gray-500 text-sm">
            Gere artigos completos e otimizados com Gemini · Análise de pauta inteligente
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs font-medium">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          Gemini 2.0 Flash
        </div>
      </div>

      {/* ── Tabs */}
      <div className="flex gap-1 p-1 bg-dark-700 border border-dark-400 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("generate")}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
            activeTab === "generate"
              ? "bg-brand-500/15 text-brand-400 border border-brand-500/20"
              : "text-gray-500 hover:text-gray-300"
          )}
        >
          <Zap className="w-4 h-4" />
          Gerar Artigo
        </button>
        <button
          onClick={() => setActiveTab("ideas")}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
            activeTab === "ideas"
              ? "bg-gold-500/15 text-gold-400 border border-gold-500/20"
              : "text-gray-500 hover:text-gray-300"
          )}
        >
          <Lightbulb className="w-4 h-4" />
          Ideias de Pauta
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          TAB: GERAR ARTIGO
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "generate" && (
        <div className="grid lg:grid-cols-5 gap-5">
          {/* ── Left: Form */}
          <div className="lg:col-span-3 space-y-4">

            {/* Keyword */}
            <div className="card p-5">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Keyword alvo <span className="text-brand-400">*</span>
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Ex: melhores ferramentas de IA para criar conteúdo em 2026"
                className="input text-sm"
                disabled={isRunning}
              />
              <p className="text-gray-700 text-xs mt-2">
                Use intenção comercial alta: "melhor [X] para [Y]", "como usar [Z]"
              </p>
            </div>

            {/* Config row */}
            <div className="card p-5 space-y-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Configurações</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ArticleCategory)}
                    className="input text-sm"
                    disabled={isRunning}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Idioma</label>
                  <select
                    value={locale}
                    onChange={(e) => setLocale(e.target.value as Locale)}
                    className="input text-sm"
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
                <label className="block text-xs text-gray-500 mb-2">Tom do artigo</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TONES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTone(t.value)}
                      disabled={isRunning}
                      title={t.desc}
                      className={cn(
                        "p-3 rounded-xl border text-xs font-medium text-center transition-all",
                        tone === t.value
                          ? "bg-brand-500/15 border-brand-500/30 text-brand-400"
                          : "bg-dark-600 border-dark-400 text-gray-500 hover:border-dark-300 hover:text-gray-300"
                      )}
                    >
                      <div className="text-base mb-1">{t.icon}</div>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="card p-5">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Instruções personalizadas
                <span className="ml-2 text-gray-600 normal-case font-normal">opcional</span>
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Ex: Incluir comparativo com o ChatGPT, focar no mercado brasileiro, mencionar o Hotmart como plataforma de afiliados, destacar uso gratuito..."
                className="input text-sm resize-none"
                rows={3}
                disabled={isRunning}
              />
              <p className="text-gray-700 text-xs mt-2">
                Contexto ou direcionamentos que a IA deve seguir ao escrever
              </p>
            </div>

            {/* Image */}
            <div className="card p-5 space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Imagem de capa</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { mode: "ai" as ImageMode, icon: Sparkles, label: "Gerar com IA", sub: "Imagen 3" },
                  { mode: "upload" as ImageMode, icon: Upload, label: "Enviar imagem", sub: "JPG / PNG / WebP" },
                  { mode: "none" as ImageMode, icon: ImageOff, label: "Sem imagem", sub: "Adicionar depois" },
                ].map(({ mode, icon: Icon, label, sub }) => (
                  <button
                    key={mode}
                    onClick={() => !isRunning && setImageMode(mode)}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all",
                      imageMode === mode
                        ? "bg-brand-500/15 border-brand-500/30"
                        : "bg-dark-600 border-dark-400 hover:border-dark-300"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 mb-2", imageMode === mode ? "text-brand-400" : "text-gray-600")} />
                    <div className={cn("text-xs font-medium", imageMode === mode ? "text-brand-400" : "text-gray-400")}>
                      {label}
                    </div>
                    <div className="text-gray-700 text-xs">{sub}</div>
                  </button>
                ))}
              </div>

              {imageMode === "upload" && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {uploadedImage ? (
                    <div className="relative rounded-xl overflow-hidden border border-dark-400">
                      <img src={uploadedImage} alt="Preview" className="w-full h-32 object-cover" />
                      <button
                        onClick={() => { setUploadedImage(null); setUploadedImageName(""); }}
                        className="absolute top-2 right-2 p-1 bg-dark-800/80 rounded-lg text-gray-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-dark-800/80 rounded-lg px-2 py-1 text-xs text-gray-300">
                        {uploadedImageName}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-dark-400 rounded-xl py-6 text-center text-gray-600 hover:border-brand-500/30 hover:text-gray-400 transition-all text-sm"
                    >
                      <Upload className="w-5 h-5 mx-auto mb-1" />
                      Clique para selecionar imagem
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Publish toggle */}
            <div className="card p-4">
              <button
                onClick={() => !isRunning && setPublish(!publish)}
                className="w-full flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-medium text-gray-300">Publicar imediatamente</div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    {publish ? "O artigo será publicado ao ser salvo" : "Salvo como rascunho para revisão"}
                  </div>
                </div>
                <div className={cn("w-11 h-6 rounded-full relative transition-colors flex-shrink-0", publish ? "bg-brand-500" : "bg-dark-500")}>
                  <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform", publish ? "translate-x-6" : "translate-x-1")} />
                </div>
              </button>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={isRunning || !keyword.trim()}
              className={cn(
                "w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-base transition-all",
                isRunning || !keyword.trim()
                  ? "bg-dark-600 border border-dark-400 text-gray-600 cursor-not-allowed"
                  : "btn-primary"
              )}
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {status === "writing" && "Gemini está escrevendo..."}
                  {status === "imaging" && "Imagen gerando imagem..."}
                  {status === "saving" && "Salvando no Firebase..."}
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Gerar artigo agora
                </>
              )}
            </button>

            {/* Feedback */}
            {status === "done" && result && (
              <div className="card p-5 border-brand-500/30 bg-brand-500/5">
                <div className="flex items-center gap-2 text-brand-400 font-semibold mb-3">
                  <CheckCircle className="w-5 h-5" />
                  Artigo gerado com sucesso!
                </div>
                <p className="text-gray-300 font-medium text-sm mb-3">{result.title}</p>
                {result.imageUrl && (
                  <img src={result.imageUrl} alt="Capa" className="w-full h-32 object-cover rounded-xl mb-3" />
                )}
                <Link
                  href={`/admin/artigos/${result.articleId}` as "/"}
                  className="btn-primary text-sm w-full justify-center"
                >
                  <FileText className="w-4 h-4" />
                  Revisar e publicar artigo
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {status === "error" && (
              <div className="card p-4 border-red-500/30 bg-red-500/5">
                <div className="flex items-start gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Info + Log */}
          <div className="lg:col-span-2 space-y-4">
            {/* What will be generated */}
            <div className="card p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">O que será gerado</h3>
              <ul className="space-y-2.5">
                {[
                  { icon: "📝", text: "Artigo de 2000-3000 palavras" },
                  { icon: "🎯", text: "SEO completo (H1-H6, meta, schema)" },
                  { icon: "🖼️", text: imageMode === "ai" ? "Imagem via Gemini Imagen 3" : imageMode === "upload" ? "Imagem enviada manualmente" : "Sem imagem (adicionar depois)" },
                  { icon: "🔗", text: "Palavras-chave de afiliado identificadas" },
                  { icon: "❓", text: "FAQ para featured snippets" },
                  { icon: "📊", text: "Tabelas comparativas quando relevante" },
                  { icon: "🌐", text: "Suporte a PT-BR, EN e ES" },
                ].map(({ icon, text }) => (
                  <li key={text} className="flex items-start gap-2.5 text-sm">
                    <span className="text-base leading-tight">{icon}</span>
                    <span className="text-gray-500 leading-tight">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Execution log */}
            <div className="card p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                <TerminalSquare className="w-3.5 h-3.5" />
                Log de execução
              </h3>
              <div className="bg-dark-800 rounded-xl p-3 h-52 overflow-y-auto font-mono text-xs space-y-1.5">
                {logs.length === 0 ? (
                  <p className="text-gray-700">Aguardando início...</p>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-gray-700 flex-shrink-0">{log.time}</span>
                      <span className={cn(
                        log.type === "success" && "text-green-400",
                        log.type === "error" && "text-red-400",
                        log.type === "info" && "text-gray-500"
                      )}>
                        {log.msg}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-dark-700/50 border border-gold-500/20 rounded-2xl p-5">
              <h3 className="text-xs font-semibold text-gold-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Keywords de alta conversão
              </h3>
              <ul className="space-y-1.5 text-xs text-gray-600">
                {[
                  '"melhor [produto] para [uso]"',
                  '"[produto] vs [produto] qual escolher"',
                  '"como usar [ferramenta] para [objetivo]"',
                  '"top 10 [categoria] em 2026"',
                  '"[ferramenta] review completo e honesto"',
                ].map((tip) => (
                  <li key={tip} className="flex gap-2">
                    <span className="text-brand-500">→</span>
                    <span>{tip}</span>
                  </li>
                ))}
                <li className="text-brand-500/70 mt-2 pt-2 border-t border-dark-400">
                  💡 "melhor" e "top" têm alta intenção comercial — mais cliques em afiliados
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TAB: IDEIAS DE PAUTA
      ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "ideas" && (
        <div className="space-y-5">
          {/* Hero CTA */}
          <div className="card p-6 border-gold-500/20 bg-gradient-to-r from-gold-500/5 to-transparent">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h2 className="font-display font-bold text-xl text-white mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-gold-400" />
                  Análise Inteligente de Pauta
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xl">
                  O Gemini analisa seus artigos já publicados, identifica gaps de conteúdo
                  e sugere temas com alto potencial de tráfego orgânico e monetização.
                </p>
              </div>
              <button
                onClick={handleGenerateIdeas}
                disabled={ideasLoading}
                className={cn(
                  "flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all",
                  ideasLoading
                    ? "bg-dark-600 border border-dark-400 text-gray-600 cursor-not-allowed"
                    : "bg-gold-500/15 border border-gold-500/30 text-gold-400 hover:bg-gold-500/20"
                )}
              >
                {ideasLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    {ideas.length > 0 ? "Gerar novas ideias" : "Analisar e sugerir ideias"}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {ideasError && (
            <div className="card p-4 border-red-500/30 bg-red-500/5">
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {ideasError}
              </div>
            </div>
          )}

          {/* Loading skeleton */}
          {ideasLoading && (
            <div className="grid sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card p-5 animate-pulse space-y-3">
                  <div className="h-3 bg-dark-500 rounded w-3/4" />
                  <div className="h-2 bg-dark-500 rounded w-full" />
                  <div className="h-2 bg-dark-500 rounded w-2/3" />
                  <div className="flex gap-2 mt-4">
                    <div className="h-6 bg-dark-500 rounded-full w-16" />
                    <div className="h-6 bg-dark-500 rounded-full w-20" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Ideas grid */}
          {!ideasLoading && ideas.length > 0 && (
            <>
              <p className="text-gray-600 text-sm">{ideas.length} ideias geradas pelo Gemini</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {ideas.map((idea, i) => (
                  <div key={i} className="card p-5 flex flex-col gap-3 hover:border-dark-300 transition-all">
                    {/* Category + Difficulty */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2.5 py-1 bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-full font-medium">
                        {CATEGORIES.find((c) => c.value === idea.category)?.label || idea.category}
                      </span>
                      <span className={cn("text-xs px-2.5 py-1 border rounded-full font-medium", DIFFICULTY_CONFIG[idea.difficulty]?.color)}>
                        {DIFFICULTY_CONFIG[idea.difficulty]?.label || idea.difficulty}
                      </span>
                      <span className={cn("text-xs font-medium", INTENT_CONFIG[idea.searchIntent]?.color)}>
                        {INTENT_CONFIG[idea.searchIntent]?.label}
                      </span>
                    </div>

                    {/* Keyword */}
                    <div>
                      <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Keyword alvo
                      </div>
                      <p className="font-semibold text-gray-200 text-sm">{idea.keyword}</p>
                    </div>

                    {/* Title */}
                    <div>
                      <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Título sugerido
                      </div>
                      <p className="text-gray-400 text-sm leading-snug">{idea.title}</p>
                    </div>

                    {/* Rationale */}
                    <p className="text-gray-600 text-xs leading-relaxed border-t border-dark-400 pt-3">
                      {idea.rationale}
                    </p>

                    {/* Monetization */}
                    <div className="flex items-start gap-2 text-xs text-gray-600">
                      <DollarSign className="w-3.5 h-3.5 text-gold-500 flex-shrink-0 mt-0.5" />
                      <span>{idea.monetization}</span>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => useIdea(idea)}
                      className="mt-auto flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium hover:bg-brand-500/20 transition-all"
                    >
                      Usar esta ideia
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Empty state */}
          {!ideasLoading && ideas.length === 0 && !ideasError && (
            <div className="card p-12 text-center">
              <Lightbulb className="w-10 h-10 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 text-sm font-medium mb-1">Pronto para sugerir ideias</p>
              <p className="text-gray-700 text-xs">
                Clique em "Analisar e sugerir ideias" para o Gemini analisar seu site e gerar sugestões estratégicas
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
