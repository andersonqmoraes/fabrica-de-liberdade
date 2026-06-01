"use client";

import { useEffect, useState } from "react";
import {
  getArticles,
  updateArticle,
} from "@/lib/firebase/articles";
import { saveSobreData, SOBRE_DEFAULTS } from "@/lib/firebase/sobre";
import { DEFAULT_AUTHOR_ID } from "@/lib/authors";
import type { Article } from "@/types";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Play,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

type Step = {
  id: string;
  title: string;
  description: string;
  count?: number;
  status: "pending" | "running" | "done" | "error";
  detail?: string;
};

export default function AdSenseFixPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<Step[]>([]);
  const [running, setRunning] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const all = await getArticles({ limitCount: 200 });
      setArticles(all);
      buildSteps(all);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function buildSteps(all: Article[]) {
    const published = all.filter((a) => a.status === "published");
    // Marcadores típicos de conteúdo gerado por IA / SEO-spam
    const aiMarkers = [
      "guia definitivo",
      "guia completo",
      "tudo o que voc",
      "como criar",
      "melhores ferramentas",
      "melhores ias",
    ];
    const futureDated = all.filter((a) => {
      const d = new Date(a.publishedAt);
      return !Number.isNaN(d.getTime()) && d.getTime() > Date.now();
    });
    const aiSuspect = published.filter((a) => {
      if (a.generatedByAI) return true;
      const t = a.translations["pt-BR"]?.title?.toLowerCase() || "";
      return aiMarkers.some((m) => t.includes(m));
    });
    const noAuthor = all.filter((a) => !(a as Article & { authorId?: string }).authorId);

    setSteps([
      {
        id: "author",
        title: `Atribuir autor (Anderson) a ${noAuthor.length} artigo(s) sem autor`,
        description: "Define authorId='anderson' nos artigos onde está vazio.",
        count: noAuthor.length,
        status: "pending",
      },
      {
        id: "dates",
        title: `Corrigir ${futureDated.length} artigo(s) com data futura`,
        description: "Ajusta publishedAt para hoje quando a data é futura.",
        count: futureDated.length,
        status: "pending",
      },
      {
        id: "despublish",
        title: `Despublicar ${aiSuspect.length} artigo(s) com sinais de IA`,
        description: "Marca status='draft' nos artigos com títulos genéricos ou flag generatedByAI=true. Reversível.",
        count: aiSuspect.length,
        status: "pending",
      },
      {
        id: "sobre",
        title: "Atualizar página Sobre (remover números falsos)",
        description: "Sobrescreve site_config/sobre no Firestore com os defaults editoriais.",
        status: "pending",
      },
    ]);
  }

  function updateStep(id: string, patch: Partial<Step>) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  async function runAuthor() {
    updateStep("author", { status: "running" });
    const noAuthor = articles.filter((a) => !(a as Article & { authorId?: string }).authorId);
    let ok = 0;
    let err = 0;
    for (const a of noAuthor) {
      try {
        await updateArticle(a.id, { authorId: DEFAULT_AUTHOR_ID } as Partial<Article>);
        ok++;
      } catch {
        err++;
      }
    }
    updateStep("author", {
      status: err ? "error" : "done",
      detail: `${ok} atualizado(s)${err ? `, ${err} erro(s)` : ""}`,
    });
  }

  async function runDates() {
    updateStep("dates", { status: "running" });
    const now = new Date();
    const futureDated = articles.filter((a) => {
      const d = new Date(a.publishedAt);
      return !Number.isNaN(d.getTime()) && d.getTime() > now.getTime();
    });
    let ok = 0;
    let err = 0;
    for (const a of futureDated) {
      try {
        await updateArticle(a.id, {
          publishedAt: now.toISOString(),
        });
        ok++;
      } catch {
        err++;
      }
    }
    updateStep("dates", {
      status: err ? "error" : "done",
      detail: `${ok} corrigido(s)${err ? `, ${err} erro(s)` : ""}`,
    });
  }

  async function runDespublish() {
    updateStep("despublish", { status: "running" });
    const aiMarkers = [
      "guia definitivo",
      "guia completo",
      "tudo o que voc",
      "como criar",
      "melhores ferramentas",
      "melhores ias",
    ];
    const target = articles.filter((a) => {
      if (a.status !== "published") return false;
      if (a.generatedByAI) return true;
      const t = a.translations["pt-BR"]?.title?.toLowerCase() || "";
      return aiMarkers.some((m) => t.includes(m));
    });
    let ok = 0;
    let err = 0;
    for (const a of target) {
      try {
        await updateArticle(a.id, { status: "draft" });
        ok++;
      } catch {
        err++;
      }
    }
    updateStep("despublish", {
      status: err ? "error" : "done",
      detail: `${ok} despublicado(s)${err ? `, ${err} erro(s)` : ""}. Reverta pelo painel de Artigos.`,
    });
  }

  async function runSobre() {
    updateStep("sobre", { status: "running" });
    try {
      await saveSobreData(SOBRE_DEFAULTS);
      updateStep("sobre", { status: "done", detail: "Defaults aplicados." });
    } catch (e) {
      updateStep("sobre", {
        status: "error",
        detail: e instanceof Error ? e.message : "Erro desconhecido",
      });
    }
  }

  async function runAll() {
    setRunning(true);
    try {
      await runAuthor();
      await runDates();
      await runDespublish();
      await runSobre();
      await load();
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

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-xs font-medium mb-3">
          <AlertTriangle className="w-3.5 h-3.5" />
          AdSense rejeitado em 31/05/2026
        </div>
        <h1 className="font-display font-bold text-3xl text-white mb-3">
          Limpeza para reaprovação do AdSense
        </h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          Este painel aplica as correções estruturais identificadas como causa
          do erro &quot;Conteúdo de baixo valor&quot;. Cada etapa é reversível pelo painel
          de Artigos (status draft/published) ou pela página /admin/sobre.
        </p>
      </div>

      <div className="card p-5 mb-6 bg-dark-700/60">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="w-5 h-5 text-brand-400" />
          <h2 className="font-semibold text-gray-200">Estado atual</h2>
        </div>
        <ul className="text-sm text-gray-500 space-y-1">
          <li>
            Total de artigos:{" "}
            <span className="text-gray-300 font-medium">{articles.length}</span>
          </li>
          <li>
            Publicados:{" "}
            <span className="text-gray-300 font-medium">
              {articles.filter((a) => a.status === "published").length}
            </span>
          </li>
          <li>
            Rascunhos:{" "}
            <span className="text-gray-300 font-medium">
              {articles.filter((a) => a.status === "draft").length}
            </span>
          </li>
        </ul>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={runAll}
          disabled={running}
          className="btn-primary"
        >
          {running ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {running ? "Executando..." : "Executar todas as etapas"}
        </button>
        <button
          onClick={load}
          disabled={running}
          className="btn-secondary"
        >
          <RefreshCw className="w-4 h-4" />
          Recarregar
        </button>
      </div>

      <div className="space-y-3">
        {steps.map((step) => {
          const onRun = {
            author: runAuthor,
            dates: runDates,
            despublish: runDespublish,
            sobre: runSobre,
          }[step.id] as () => Promise<void>;
          return (
            <div
              key={step.id}
              className="card p-4 flex items-start gap-4"
            >
              <div className="mt-0.5">
                {step.status === "done" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : step.status === "running" ? (
                  <Loader2 className="w-5 h-5 text-brand-400 animate-spin" />
                ) : step.status === "error" ? (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-200 text-sm mb-1">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  {step.description}
                </p>
                {step.detail && (
                  <p
                    className={`text-xs mt-2 ${
                      step.status === "error" ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    {step.detail}
                  </p>
                )}
              </div>
              <button
                onClick={onRun}
                disabled={running || step.status === "running"}
                className="btn-ghost text-xs"
              >
                Rodar só esta
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-10 p-5 rounded-2xl border border-gold-500/30 bg-gold-500/5">
        <h3 className="font-semibold text-gold-300 mb-2 text-sm">Próximos passos manuais</h3>
        <ol className="text-xs text-gray-400 space-y-2 leading-relaxed list-decimal pl-4">
          <li>
            Escolha 2-3 artigos que você consegue reescrever com{" "}
            <strong>experiência prática real</strong> (testes próprios, prints, dados) e
            republique-os via <code>/admin/artigos</code>.
          </li>
          <li>
            Escreva pelo menos <strong>5 artigos novos do zero</strong> nas próximas 2-3 semanas,
            assinados como Anderson Moraes, antes de pedir revisão.
          </li>
          <li>
            Não rode <code>automation/scheduler.py</code> até o AdSense aprovar.
          </li>
          <li>
            Quando reaplicar no AdSense, marque &quot;Confirmo que corrigi os problemas&quot; e
            envie para revisão.
          </li>
        </ol>
      </div>
    </div>
  );
}
