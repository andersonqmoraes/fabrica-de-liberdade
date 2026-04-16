"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Globe,
  Search,
  Share2,
  BarChart2,
  Save,
  Loader2,
  CheckCircle,
  RefreshCw,
  ExternalLink,
  Key,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getSiteConfig, saveSiteConfig, type SiteConfigData } from "@/lib/firebase/siteConfig";

type Tab = "geral" | "seo" | "social" | "integracoes";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "geral", label: "Geral", icon: Globe },
  { id: "seo", label: "SEO", icon: Search },
  { id: "social", label: "Redes Sociais", icon: Share2 },
  { id: "integracoes", label: "Integrações", icon: BarChart2 },
];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block">
        {label}
      </label>
      {children}
      {hint && <p className="text-gray-700 text-xs">{hint}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("geral");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [config, setConfig] = useState<SiteConfigData>({
    siteName: "",
    siteDescription: "",
    siteUrl: "",
    seo: {
      defaultMetaTitle: "",
      defaultMetaDescription: "",
      defaultOgImage: "",
      twitterHandle: "",
      googleVerification: "",
    },
    socialLinks: {
      instagram: "",
      youtube: "",
      twitter: "",
      telegram: "",
      linkedin: "",
    },
    googleAnalyticsId: "",
    adsenseClientId: "",
    amazonTag: "",
    hotmartTag: "",
  });

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSiteConfig();
      setConfig(data);
    } catch {
      setError("Erro ao carregar configurações.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  function set(field: keyof SiteConfigData, value: string) {
    setConfig((prev) => ({ ...prev, [field]: value }));
  }

  function setSeo(field: keyof SiteConfigData["seo"], value: string) {
    setConfig((prev) => ({ ...prev, seo: { ...prev.seo, [field]: value } }));
  }

  function setSocial(field: keyof SiteConfigData["socialLinks"], value: string) {
    setConfig((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [field]: value },
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      await saveSiteConfig(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch {
      setError("Erro ao salvar. Verifique sua conexão e tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  const envVars = [
    {
      key: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      value: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      label: "Firebase Project ID",
    },
    {
      key: "NEXT_PUBLIC_SITE_URL",
      value: process.env.NEXT_PUBLIC_SITE_URL,
      label: "URL do Site (env)",
    },
    {
      key: "NEXT_PUBLIC_ADSENSE_CLIENT_ID",
      value: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
      label: "AdSense Client ID (env)",
    },
  ];

  const apiKeys = [
    { label: "Anthropic (Claude AI)", key: "ANTHROPIC_API_KEY", docs: "https://console.anthropic.com" },
    { label: "OpenAI (DALL-E 3)", key: "OPENAI_API_KEY", docs: "https://platform.openai.com" },
    { label: "Mailchimp Newsletter", key: "MAILCHIMP_API_KEY", docs: "https://mailchimp.com/developer" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-white mb-1">Configurações</h1>
          <p className="text-gray-600 text-sm">
            Edite as configurações do site e salve diretamente no Firestore
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadConfig}
            className="btn-secondary text-sm"
            title="Recarregar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-sm"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? "Salvo!" : "Salvar"}
          </button>
        </div>
      </div>

      {/* Feedback */}
      {saved && (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-green-400 text-sm">
          <CheckCircle className="w-4 h-4" />
          Configurações salvas com sucesso no Firestore!
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-700 border border-dark-400 rounded-2xl p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-medium transition-all",
              activeTab === id
                ? "bg-brand-500/15 text-brand-400 border border-brand-500/20"
                : "text-gray-500 hover:text-gray-300"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="card p-6 space-y-5">
        {/* GERAL */}
        {activeTab === "geral" && (
          <>
            <div className="border-b border-dark-400 pb-4 mb-2">
              <h2 className="font-display font-semibold text-gray-200">Informações Gerais</h2>
              <p className="text-gray-600 text-sm mt-0.5">
                Nome, descrição e identidade básica do site
              </p>
            </div>
            <Field label="Nome do site">
              <input
                value={config.siteName}
                onChange={(e) => set("siteName", e.target.value)}
                className="input text-sm"
                placeholder="Fábrica de Liberdade"
              />
            </Field>
            <Field
              label="Descrição padrão"
              hint="Usada em meta description quando não há descrição específica de página"
            >
              <textarea
                value={config.siteDescription}
                onChange={(e) => set("siteDescription", e.target.value)}
                className="input text-sm resize-none"
                rows={3}
                placeholder="Descrição do site em 1-2 frases..."
              />
              <div className="text-right text-xs text-gray-700 mt-1">
                {config.siteDescription.length}/160 chars
              </div>
            </Field>
            <Field label="URL do site" hint="URL canônica sem barra no final">
              <input
                value={config.siteUrl}
                onChange={(e) => set("siteUrl", e.target.value)}
                className="input text-sm"
                placeholder="https://fabricadeliberdade.com.br"
              />
            </Field>
          </>
        )}

        {/* SEO */}
        {activeTab === "seo" && (
          <>
            <div className="border-b border-dark-400 pb-4 mb-2">
              <h2 className="font-display font-semibold text-gray-200">SEO Global</h2>
              <p className="text-gray-600 text-sm mt-0.5">
                Metadados padrão para páginas sem configuração específica
              </p>
            </div>
            <Field
              label="Meta Title padrão"
              hint="Formato recomendado: Palavra-chave — Nome do site (50-60 chars)"
            >
              <input
                value={config.seo.defaultMetaTitle}
                onChange={(e) => setSeo("defaultMetaTitle", e.target.value)}
                className="input text-sm"
                placeholder="Fábrica de Liberdade — IA, Produtividade & Liberdade"
              />
              <div className="flex justify-between text-xs text-gray-700 mt-1">
                <span className={config.seo.defaultMetaTitle.length > 60 ? "text-red-400" : ""}>
                  {config.seo.defaultMetaTitle.length}/60 chars
                </span>
                {config.seo.defaultMetaTitle.length > 60 && (
                  <span className="text-red-400">Muito longo — pode ser cortado no Google</span>
                )}
              </div>
            </Field>

            <Field
              label="Meta Description padrão"
              hint="Deve ser atrativa e conter a palavra-chave principal (150-160 chars)"
            >
              <textarea
                value={config.seo.defaultMetaDescription}
                onChange={(e) => setSeo("defaultMetaDescription", e.target.value)}
                className="input text-sm resize-none"
                rows={3}
                placeholder="Descrição para aparecer nos resultados do Google..."
              />
              <div className="flex justify-between text-xs text-gray-700 mt-1">
                <span className={config.seo.defaultMetaDescription.length > 160 ? "text-red-400" : ""}>
                  {config.seo.defaultMetaDescription.length}/160 chars
                </span>
              </div>
            </Field>

            <Field
              label="Imagem OG padrão (Open Graph)"
              hint="URL da imagem usada no compartilhamento em redes sociais (1200×630px)"
            >
              <input
                value={config.seo.defaultOgImage}
                onChange={(e) => setSeo("defaultOgImage", e.target.value)}
                className="input text-sm"
                placeholder="/images/og-default.jpg"
              />
              {config.seo.defaultOgImage && (
                <img
                  src={config.seo.defaultOgImage}
                  alt="OG preview"
                  className="mt-2 w-full max-w-sm h-28 object-cover rounded-xl border border-dark-400"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Twitter Handle" hint="Ex: @fabricadeliberdade">
                <input
                  value={config.seo.twitterHandle}
                  onChange={(e) => setSeo("twitterHandle", e.target.value)}
                  className="input text-sm"
                  placeholder="@fabricadeliberdade"
                />
              </Field>
              <Field
                label="Google Verification"
                hint="Código do Google Search Console"
              >
                <input
                  value={config.seo.googleVerification}
                  onChange={(e) => setSeo("googleVerification", e.target.value)}
                  className="input text-sm font-mono"
                  placeholder="google-site-verification=..."
                />
              </Field>
            </div>

            {/* Live Google preview */}
            <div className="bg-dark-700 border border-dark-400 rounded-xl p-4 space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                Preview no Google
              </p>
              <div className="space-y-0.5">
                <div className="text-sm text-gray-400 font-mono truncate">
                  {config.siteUrl || "https://fabricadeliberdade.com.br"}
                </div>
                <div className="text-base text-blue-400 font-medium leading-tight">
                  {config.seo.defaultMetaTitle || config.siteName || "Fábrica de Liberdade"}
                </div>
                <div className="text-sm text-gray-400 line-clamp-2">
                  {config.seo.defaultMetaDescription || config.siteDescription || "Descrição do site..."}
                </div>
              </div>
            </div>
          </>
        )}

        {/* SOCIAL */}
        {activeTab === "social" && (
          <>
            <div className="border-b border-dark-400 pb-4 mb-2">
              <h2 className="font-display font-semibold text-gray-200">Redes Sociais</h2>
              <p className="text-gray-600 text-sm mt-0.5">
                URLs completas para os perfis sociais do site
              </p>
            </div>
            {(
              [
                { field: "instagram" as const, label: "Instagram", placeholder: "https://instagram.com/fabricadeliberdade" },
                { field: "youtube" as const, label: "YouTube", placeholder: "https://youtube.com/@fabricadeliberdade" },
                { field: "twitter" as const, label: "Twitter / X", placeholder: "https://twitter.com/fabricadeliberdade" },
                { field: "telegram" as const, label: "Telegram", placeholder: "https://t.me/fabricadeliberdade" },
                { field: "linkedin" as const, label: "LinkedIn", placeholder: "https://linkedin.com/in/fabricadeliberdade" },
              ] as const
            ).map(({ field, label, placeholder }) => (
              <Field key={field} label={label}>
                <div className="relative">
                  <input
                    value={config.socialLinks[field]}
                    onChange={(e) => setSocial(field, e.target.value)}
                    className="input text-sm pr-10"
                    placeholder={placeholder}
                  />
                  {config.socialLinks[field] && (
                    <a
                      href={config.socialLinks[field]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-brand-400 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </Field>
            ))}
          </>
        )}

        {/* INTEGRAÇÕES */}
        {activeTab === "integracoes" && (
          <>
            <div className="border-b border-dark-400 pb-4 mb-2">
              <h2 className="font-display font-semibold text-gray-200">Integrações & Analytics</h2>
              <p className="text-gray-600 text-sm mt-0.5">
                IDs e chaves para serviços externos
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Google Analytics ID" hint="Ex: G-XXXXXXXXXX ou UA-XXXXXXXX">
                <input
                  value={config.googleAnalyticsId}
                  onChange={(e) => set("googleAnalyticsId", e.target.value)}
                  className="input text-sm font-mono"
                  placeholder="G-XXXXXXXXXX"
                />
              </Field>
              <Field label="AdSense Client ID" hint="Ex: ca-pub-XXXXXXXXXXXXXXXX">
                <input
                  value={config.adsenseClientId}
                  onChange={(e) => set("adsenseClientId", e.target.value)}
                  className="input text-sm font-mono"
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                />
              </Field>
              <Field label="Amazon Affiliates Tag" hint="Ex: fabricade-20">
                <input
                  value={config.amazonTag}
                  onChange={(e) => set("amazonTag", e.target.value)}
                  className="input text-sm font-mono"
                  placeholder="fabricade-20"
                />
              </Field>
              <Field label="Hotmart Affiliate Tag">
                <input
                  value={config.hotmartTag}
                  onChange={(e) => set("hotmartTag", e.target.value)}
                  className="input text-sm font-mono"
                  placeholder="tag de afiliado Hotmart"
                />
              </Field>
            </div>

            {/* Env vars status */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
                <Key className="w-3.5 h-3.5" />
                Variáveis de Ambiente (Vercel)
              </h3>
              {envVars.map(({ key, value, label }) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 bg-dark-700 border border-dark-400 rounded-xl"
                >
                  <div>
                    <div className="text-sm text-gray-400">{label}</div>
                    <code className="text-xs text-gray-600 font-mono">{key}</code>
                  </div>
                  <span
                    className={cn(
                      "text-xs px-2 py-1 rounded-lg font-medium",
                      value
                        ? "bg-green-500/15 text-green-400"
                        : "bg-dark-500 text-gray-600"
                    )}
                  >
                    {value ? "✓ Configurado" : "Pendente"}
                  </span>
                </div>
              ))}
            </div>

            {/* API Keys */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                API Keys (Variáveis de Ambiente)
              </h3>
              {apiKeys.map(({ label, key, docs }) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 bg-dark-700 border border-dark-400 rounded-xl"
                >
                  <div>
                    <div className="text-sm text-gray-400">{label}</div>
                    <code className="text-xs text-gray-600 font-mono">{key}</code>
                  </div>
                  <a
                    href={docs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-600 hover:text-brand-400 flex items-center gap-1 transition-colors"
                  >
                    Docs <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
              <a
                href="https://vercel.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-sm w-fit flex items-center gap-2 mt-1"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir Vercel Dashboard
              </a>
            </div>
          </>
        )}
      </div>

      {/* Bottom save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Salvando..." : "Salvar configurações"}
        </button>
      </div>
    </div>
  );
}
