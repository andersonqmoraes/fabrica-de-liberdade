"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Settings,
  Globe,
  Mail,
  DollarSign,
  Share2,
  Key,
  Save,
  Loader2,
  CheckCircle,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";

interface SectionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

function Section({ title, description, icon: Icon, children }: SectionProps) {
  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-start gap-3 border-b border-dark-400 pb-4">
        <div className="w-9 h-9 bg-brand-500/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon className="w-4.5 h-4.5 text-brand-400" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-gray-200">{title}</h2>
          <p className="text-gray-600 text-sm mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const t = useTranslations("admin");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Env vars are read-only in the UI — they must be set on Vercel/server
  const envVars = [
    {
      key: "NEXT_PUBLIC_SITE_URL",
      value: process.env.NEXT_PUBLIC_SITE_URL || "",
      label: "URL do site",
      hint: "https://fabricadeliberdade.com.br",
    },
    {
      key: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      value: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
      label: "Firebase Project ID",
      hint: "fabrica-de-liberdade",
    },
    {
      key: "NEXT_PUBLIC_ADSENSE_CLIENT_ID",
      value: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "",
      label: "Google AdSense Client ID",
      hint: "ca-pub-XXXXXXXXXXXXXXXX",
    },
  ];

  const apiKeys = [
    {
      key: "ANTHROPIC_API_KEY",
      label: "Anthropic (Claude)",
      docs: "https://console.anthropic.com",
      set: false,
    },
    {
      key: "OPENAI_API_KEY",
      label: "OpenAI (DALL-E 3)",
      docs: "https://platform.openai.com/api-keys",
      set: false,
    },
    {
      key: "MAILCHIMP_API_KEY",
      label: "Mailchimp",
      docs: "https://mailchimp.com/developer",
      set: false,
    },
  ];

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 800);
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-3xl text-white mb-1">
          {t("settings")}
        </h1>
        <p className="text-gray-600 text-sm">
          Configurações gerais do site e integrações
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-green-400 text-sm">
          <CheckCircle className="w-4 h-4" />
          Configurações salvas com sucesso!
        </div>
      )}

      {/* Site Info */}
      <Section
        title="Informações do Site"
        description="Configurações básicas de identidade do site"
        icon={Globe}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2 block uppercase tracking-wide">
              Nome do site
            </label>
            <input
              defaultValue="Fábrica de Liberdade"
              className="input text-sm"
              readOnly
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2 block uppercase tracking-wide">
              URL do site
            </label>
            <input
              defaultValue={process.env.NEXT_PUBLIC_SITE_URL || "https://fabricadeliberdade.com.br"}
              className="input text-sm"
              readOnly
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-gray-500 mb-2 block uppercase tracking-wide">
              Descrição padrão (SEO)
            </label>
            <textarea
              defaultValue="Guia definitivo de IA, tecnologia e produtividade para conquistar liberdade financeira e de tempo."
              className="input text-sm resize-none"
              rows={2}
              readOnly
            />
          </div>
        </div>
        <div className="bg-dark-700 border border-dark-300 rounded-xl p-4 text-xs text-gray-500 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
          Para alterar estas configurações, edite os arquivos de mensagens em <code className="text-brand-400 mx-1">/messages/*.json</code> e faça um novo deploy.
        </div>
      </Section>

      {/* Variables de ambiente */}
      <Section
        title="Variáveis de Ambiente"
        description="Configurações sensíveis devem ser definidas no painel da Vercel"
        icon={Key}
      >
        <div className="space-y-3">
          {envVars.map(({ key, value, label, hint }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
                <code className="text-xs text-gray-600 font-mono">{key}</code>
              </div>
              <div className="relative">
                <input
                  value={value || hint}
                  readOnly
                  className={`input text-sm font-mono pr-10 ${value ? "text-green-400" : "text-gray-600"}`}
                />
                <div className={`absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${value ? "bg-green-400" : "bg-gray-600"}`} />
              </div>
            </div>
          ))}
        </div>
        <a
          href="https://vercel.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-sm w-fit flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Abrir painel Vercel
        </a>
      </Section>

      {/* API Keys status */}
      <Section
        title="Integrações & API Keys"
        description="Status das integrações externas. Configure via variáveis de ambiente na Vercel."
        icon={Settings}
      >
        <div className="space-y-3">
          {apiKeys.map(({ key, label, docs, set }) => (
            <div
              key={key}
              className="flex items-center justify-between p-4 bg-dark-700 border border-dark-400 rounded-xl"
            >
              <div>
                <div className="font-medium text-gray-300 text-sm">{label}</div>
                <code className="text-xs text-gray-600 font-mono">{key}</code>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge text-xs border ${set ? "bg-green-500/15 text-green-400 border-green-500/30" : "bg-dark-500 text-gray-600 border-dark-300"}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${set ? "bg-green-400" : "bg-gray-600"}`} />
                  {set ? "Configurado" : "Pendente"}
                </span>
                <a
                  href={docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-brand-400 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Newsletter */}
      <Section
        title="Newsletter / Mailchimp"
        description="Configuração da integração com Mailchimp para gestão de assinantes"
        icon={Mail}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2 block uppercase tracking-wide">
              Mailchimp List ID
            </label>
            <input
              placeholder="ex: abc1234def"
              defaultValue={process.env.MAILCHIMP_LIST_ID || ""}
              className="input text-sm font-mono"
              readOnly
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2 block uppercase tracking-wide">
              Server Prefix
            </label>
            <input
              placeholder="ex: us1"
              defaultValue={process.env.MAILCHIMP_SERVER_PREFIX || ""}
              className="input text-sm font-mono"
              readOnly
            />
          </div>
        </div>
      </Section>

      {/* AdSense */}
      <Section
        title="Google AdSense"
        description="Configuração de anúncios para monetização do site"
        icon={DollarSign}
      >
        <div>
          <label className="text-xs font-medium text-gray-500 mb-2 block uppercase tracking-wide">
            AdSense Client ID
          </label>
          <input
            placeholder="ca-pub-XXXXXXXXXXXXXXXX"
            defaultValue={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || ""}
            className="input text-sm font-mono"
            readOnly
          />
        </div>
        <div className="bg-dark-700 border border-dark-300 rounded-xl p-4 text-xs text-gray-500 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
          O AdSense só carrega em produção com o <code className="text-brand-400 mx-1">NEXT_PUBLIC_ADSENSE_CLIENT_ID</code> configurado na Vercel.
        </div>
      </Section>

      {/* Social */}
      <Section
        title="Redes Sociais"
        description="Links para as redes sociais do site"
        icon={Share2}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: "Instagram", value: "@fabricadeliberdade" },
            { label: "YouTube", value: "@fabricadeliberdade" },
            { label: "Twitter / X", value: "@fabricadeliberdade" },
            { label: "Telegram", value: "t.me/fabricadeliberdade" },
          ].map(({ label, value }) => (
            <div key={label}>
              <label className="text-xs font-medium text-gray-500 mb-2 block uppercase tracking-wide">{label}</label>
              <input defaultValue={value} className="input text-sm" readOnly />
            </div>
          ))}
        </div>
        <div className="bg-dark-700 border border-dark-300 rounded-xl p-4 text-xs text-gray-500 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
          Para alterar as redes sociais, edite o componente <code className="text-brand-400 mx-1">Footer.tsx</code>.
        </div>
      </Section>
    </div>
  );
}
