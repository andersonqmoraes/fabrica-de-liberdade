"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/config";
import {
  collection, getDocs, query, orderBy, deleteDoc, doc, where,
} from "firebase/firestore";
import {
  Mail, Users, Send, Trash2, Loader2, RefreshCw, Globe, AlertCircle,
  CheckCircle, X, ChevronDown, ChevronUp, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Subscriber {
  id: string;
  email: string;
  locale: string;
  source: string;
  confirmed: boolean;
  subscribedAt: { seconds: number } | null;
}

const LOCALES = [
  { value: "pt-BR", label: "Português (BR)" },
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
];

const TONES = [
  { value: "informativo", label: "Informativo" },
  { value: "promocional", label: "Promocional" },
  { value: "urgente", label: "Urgente" },
];

const DEFAULT_HTML = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #e5e5e5; padding: 32px; border-radius: 12px;">
  <h1 style="color: #a3e635; font-size: 24px; margin-bottom: 16px;">Título do email</h1>
  <p style="color: #9ca3af; line-height: 1.6; margin-bottom: 20px;">
    Escreva o conteúdo principal do seu email aqui. Pode usar HTML para formatar.
  </p>
  <a href="https://fabricadeliberdade.com.br" style="display: inline-block; background: #a3e635; color: #0f0f0f; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none;">
    Ver no site →
  </a>
  <hr style="border: 1px solid #1f1f1f; margin: 24px 0;" />
  <p style="color: #4b5563; font-size: 12px;">Fábrica de Liberdade · Você está recebendo este email porque se inscreveu em fabricadeliberdade.com.br</p>
</div>`;

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Broadcast form
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState(DEFAULT_HTML);
  const [previewText, setPreviewText] = useState("");
  const [broadcastLocale, setBroadcastLocale] = useState("pt-BR");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success?: boolean; sent?: number; error?: string } | null>(null);

  // UI state
  const [showPreview, setShowPreview] = useState(false);
  const [filterLocale, setFilterLocale] = useState("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [expandBroadcast, setExpandBroadcast] = useState(true);

  async function loadSubscribers() {
    setLoading(true);
    setError("");
    try {
      const snap = await getDocs(query(collection(db, "subscribers"), orderBy("subscribedAt", "desc")));
      setSubscribers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Subscriber)));
    } catch {
      // fallback: sem orderBy
      try {
        const snap2 = await getDocs(collection(db, "subscribers"));
        setSubscribers(snap2.docs.map((d) => ({ id: d.id, ...d.data() } as Subscriber)));
      } catch {
        setError("Erro ao carregar inscritos.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadSubscribers(); }, []);

  async function handleDelete(id: string) {
    await deleteDoc(doc(db, "subscribers", id));
    setSubscribers((prev) => prev.filter((s) => s.id !== id));
    setShowDeleteConfirm(null);
  }

  async function handleBroadcast() {
    if (!subject.trim() || !htmlContent.trim()) {
      setSendResult({ error: "Assunto e conteúdo são obrigatórios." });
      return;
    }
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/newsletter/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, htmlContent, previewText, locale: broadcastLocale }),
      });
      const data = await res.json();
      setSendResult(data);
    } catch {
      setSendResult({ error: "Erro de conexão ao enviar." });
    } finally {
      setSending(false);
    }
  }

  const filtered = filterLocale === "all" ? subscribers : subscribers.filter((s) => s.locale === filterLocale);
  const byLocale = LOCALES.map((l) => ({
    ...l,
    count: subscribers.filter((s) => s.locale === l.value).length,
  }));
  const confirmed = subscribers.filter((s) => s.confirmed).length;

  function formatDate(ts: { seconds: number } | null) {
    if (!ts) return "—";
    return new Date(ts.seconds * 1000).toLocaleDateString("pt-BR");
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-white mb-1">Newsletter</h1>
          <p className="text-gray-500 text-sm">Gerencie inscritos e envie campanhas via Resend</p>
        </div>
        <button onClick={loadSubscribers} disabled={loading} className="btn-secondary text-sm">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Atualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <Users className="w-3.5 h-3.5" /> Total
          </div>
          <div className="font-display font-bold text-2xl text-white">{subscribers.length}</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
            <CheckCircle className="w-3.5 h-3.5" /> Confirmados
          </div>
          <div className="font-display font-bold text-2xl text-white">{confirmed}</div>
        </div>
        {byLocale.slice(0, 2).map((l) => (
          <div key={l.value} className="card p-4">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <Globe className="w-3.5 h-3.5" /> {l.label.split(" ")[0]}
            </div>
            <div className="font-display font-bold text-2xl text-white">{l.count}</div>
          </div>
        ))}
      </div>

      {/* Broadcast */}
      <div className="card overflow-hidden">
        <button
          onClick={() => setExpandBroadcast((v) => !v)}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-dark-600/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Send className="w-5 h-5 text-brand-400" />
            <div>
              <div className="font-semibold text-gray-200">Enviar campanha</div>
              <div className="text-xs text-gray-600 mt-0.5">Broadcast para todos os inscritos de um idioma</div>
            </div>
          </div>
          {expandBroadcast ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
        </button>

        {expandBroadcast && (
          <div className="px-5 pb-6 space-y-4 border-t border-dark-400">
            <div className="pt-4 grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Assunto *</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="input text-sm"
                  placeholder="🚀 Novidades desta semana na Fábrica de Liberdade"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Preview text (opcional)</label>
                <input
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  className="input text-sm"
                  placeholder="Texto exibido antes de abrir o email..."
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Idioma dos destinatários</label>
                <select value={broadcastLocale} onChange={(e) => setBroadcastLocale(e.target.value)} className="input text-sm">
                  {LOCALES.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label} ({byLocale.find((b) => b.value === l.value)?.count ?? 0} inscritos)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-gray-500">Conteúdo HTML *</label>
                <button
                  onClick={() => setShowPreview((v) => !v)}
                  className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {showPreview ? "Ocultar prévia" : "Ver prévia"}
                </button>
              </div>
              <textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                className="input text-xs font-mono resize-y"
                rows={10}
                placeholder="<h1>Título</h1><p>Conteúdo...</p>"
              />
            </div>

            {showPreview && (
              <div className="border border-dark-400 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 bg-dark-600 text-xs text-gray-500 border-b border-dark-400">
                  <Eye className="w-3.5 h-3.5" /> Prévia do email
                </div>
                <div
                  className="p-4 bg-[#0a0a0a]"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              </div>
            )}

            {sendResult && (
              <div className={cn(
                "flex items-start gap-3 p-4 rounded-xl border text-sm",
                sendResult.success
                  ? "bg-green-500/10 border-green-500/30 text-green-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              )}>
                {sendResult.success
                  ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                }
                <div>
                  {sendResult.success
                    ? `Email enviado com sucesso para ${sendResult.sent} inscrito${(sendResult.sent ?? 0) !== 1 ? "s" : ""}!`
                    : sendResult.error
                  }
                </div>
                <button onClick={() => setSendResult(null)} className="ml-auto flex-shrink-0">
                  <X className="w-4 h-4 opacity-60 hover:opacity-100" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2 border-t border-dark-400">
              <button
                onClick={handleBroadcast}
                disabled={sending || !subject.trim()}
                className="btn-primary text-sm"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? "Enviando..." : "Enviar campanha"}
              </button>
              <p className="text-xs text-gray-600">
                Será enviado para {byLocale.find((b) => b.value === broadcastLocale)?.count ?? 0} inscrito(s) em {broadcastLocale}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Subscriber list */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-dark-400">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-300 text-sm">Inscritos</span>
            <span className="badge text-xs bg-dark-500 text-gray-500 border border-dark-400">{filtered.length}</span>
          </div>
          <div className="flex gap-2">
            {["all", "pt-BR", "en", "es"].map((loc) => (
              <button
                key={loc}
                onClick={() => setFilterLocale(loc)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-medium border transition-colors",
                  filterLocale === loc
                    ? "bg-brand-500/15 text-brand-400 border-brand-500/30"
                    : "text-gray-600 border-dark-400 hover:border-dark-300"
                )}
              >
                {loc === "all" ? "Todos" : loc}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="m-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-4 space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-dark-600 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-600 text-sm">
              {filterLocale === "all" ? "Nenhum inscrito ainda." : `Nenhum inscrito para "${filterLocale}".`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-dark-400">
            {filtered.map((sub) => (
              <div key={sub.id} className="flex items-center gap-4 px-5 py-3 hover:bg-dark-600/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300 truncate">{sub.email}</span>
                    {sub.confirmed && (
                      <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" aria-label="Confirmado" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {sub.locale}
                    </span>
                    {sub.source && sub.source !== "unknown" && (
                      <span>via {sub.source}</span>
                    )}
                    <span>{formatDate(sub.subscribedAt)}</span>
                  </div>
                </div>
                <div>
                  {showDeleteConfirm === sub.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-400">Confirmar?</span>
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="px-2 py-1 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30"
                      >
                        Sim
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-2 py-1 text-xs text-gray-600 border border-dark-400 rounded-lg hover:border-dark-300"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowDeleteConfirm(sub.id)}
                      className="p-1.5 text-gray-700 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
