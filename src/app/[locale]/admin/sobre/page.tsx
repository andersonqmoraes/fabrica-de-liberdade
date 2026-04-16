"use client";

import { useState, useEffect } from "react";
import { getSobreData, saveSobreData, SOBRE_DEFAULTS, type SobreData } from "@/lib/firebase/sobre";
import { Save, Loader2, Check, RefreshCw, Globe, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const LOCALES = [
  { code: "pt-BR" as const, label: "Português", flag: "🇧🇷" },
  { code: "en" as const, label: "English", flag: "🇺🇸" },
  { code: "es" as const, label: "Español", flag: "🇪🇸" },
];

export default function AdminSobrePage() {
  const [data, setData] = useState<SobreData>(SOBRE_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [activeLocale, setActiveLocale] = useState<"pt-BR" | "en" | "es">("pt-BR");

  useEffect(() => {
    getSobreData()
      .then((d) => setData(d))
      .catch(() => setError("Erro ao carregar dados."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await saveSobreData(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Erro ao salvar. Verifique as permissões do Firestore.");
    } finally {
      setSaving(false);
    }
  }

  function updateLocaleField(
    field: keyof Pick<SobreData, "headline" | "subheadline" | "story">,
    locale: "pt-BR" | "en" | "es",
    value: string
  ) {
    setData((prev) => ({ ...prev, [field]: { ...prev[field], [locale]: value } }));
  }

  function updateStat(key: keyof SobreData["stats"], value: string) {
    setData((prev) => ({ ...prev, stats: { ...prev.stats, [key]: value } }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-white mb-1">Página Sobre</h1>
          <p className="text-gray-500 text-sm">Edite os textos exibidos em /sobre</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setData(SOBRE_DEFAULTS); }}
            className="btn-secondary text-sm"
            title="Restaurar textos padrão"
          >
            <RefreshCw className="w-4 h-4" /> Restaurar padrão
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar alterações
          </button>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-green-400 text-sm">
          <Check className="w-4 h-4" /> Página Sobre atualizada com sucesso!
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">{error}</div>
      )}

      {/* Stats */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-gray-300 text-sm flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> Números / Estatísticas
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { key: "readers" as const, label: "Leitores mensais" },
            { key: "articles" as const, label: "Artigos publicados" },
            { key: "tools" as const, label: "Ferramentas avaliadas" },
            { key: "languages" as const, label: "Idiomas" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs text-gray-500 mb-1.5 block">{label}</label>
              <input
                value={data.stats[key]}
                onChange={(e) => updateStat(key, e.target.value)}
                className="input text-sm text-center font-display font-bold text-white"
                placeholder="50k+"
              />
            </div>
          ))}
        </div>
      </div>

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
            <Globe className="w-3.5 h-3.5" />
            {l.flag} {l.label}
          </button>
        ))}
      </div>

      {/* Text fields */}
      <div className="space-y-5">
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-300 text-sm">Hero — {LOCALES.find((l) => l.code === activeLocale)?.label}</h2>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Headline (H1)</label>
            <input
              value={data.headline[activeLocale]}
              onChange={(e) => updateLocaleField("headline", activeLocale, e.target.value)}
              className="input text-sm font-medium"
              placeholder="Nossa missão é sua liberdade"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Subheadline (parágrafo hero)</label>
            <textarea
              value={data.subheadline[activeLocale]}
              onChange={(e) => updateLocaleField("subheadline", activeLocale, e.target.value)}
              className="input text-sm resize-none"
              rows={3}
            />
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-300 text-sm">
            Nossa história — {LOCALES.find((l) => l.code === activeLocale)?.label}
          </h2>
          <p className="text-xs text-gray-600">Separe parágrafos com uma linha em branco.</p>
          <textarea
            value={data.story[activeLocale]}
            onChange={(e) => updateLocaleField("story", activeLocale, e.target.value)}
            className="input text-sm resize-none font-mono"
            rows={8}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar alterações
        </button>
        <a href="/sobre" target="_blank" className="btn-secondary text-sm">
          Ver página pública
        </a>
      </div>
    </div>
  );
}
