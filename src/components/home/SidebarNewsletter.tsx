"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Mail, Check, Loader2, Shield } from "lucide-react";
import type { Locale } from "@/types";

const labels: Record<Locale, { title: string; desc: string; placeholder: string; cta: string; success: string; privacy: string }> = {
  "pt-BR": {
    title: "Newsletter semanal",
    desc: "As melhores dicas de IA e produtividade direto no seu e-mail.",
    placeholder: "seu@email.com",
    cta: "Quero receber",
    success: "Inscrito! Verifique sua caixa de entrada.",
    privacy: "Sem spam. Cancele quando quiser.",
  },
  en: {
    title: "Weekly newsletter",
    desc: "The best AI and productivity tips straight to your inbox.",
    placeholder: "your@email.com",
    cta: "Subscribe",
    success: "Subscribed! Check your inbox.",
    privacy: "No spam. Unsubscribe anytime.",
  },
  es: {
    title: "Newsletter semanal",
    desc: "Los mejores consejos de IA y productividad directo a tu correo.",
    placeholder: "tu@email.com",
    cta: "Suscribirme",
    success: "¡Inscrito! Revisa tu bandeja de entrada.",
    privacy: "Sin spam. Cancela cuando quieras.",
  },
};

export function SidebarNewsletter() {
  const locale = useLocale() as Locale;
  const t = labels[locale] ?? labels["pt-BR"];
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale, source: "sidebar" }),
      });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="card p-6 border-brand-500/30 bg-gradient-to-br from-brand-500/5 to-transparent">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 bg-brand-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <Mail className="w-4 h-4 text-brand-400" />
        </div>
        <h3 className="font-display font-bold text-base text-white">{t.title}</h3>
      </div>
      <p className="text-gray-500 text-sm mb-4 leading-relaxed">{t.desc}</p>

      {status === "success" ? (
        <div className="flex items-center gap-2 text-brand-400 text-sm bg-brand-500/10 rounded-xl p-3">
          <Check className="w-4 h-4 flex-shrink-0" />
          {t.success}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.placeholder}
            required
            disabled={status === "loading"}
            className="input text-sm"
          />
          <button
            type="submit"
            disabled={status === "loading" || !email.trim()}
            className="btn-primary w-full justify-center text-sm py-2.5"
          >
            {status === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              t.cta
            )}
          </button>
          {status === "error" && (
            <p className="text-red-400 text-xs text-center">Algo deu errado. Tente novamente.</p>
          )}
          <p className="text-gray-600 text-xs flex items-center gap-1">
            <Shield className="w-3 h-3" />
            {t.privacy}
          </p>
        </form>
      )}
    </div>
  );
}
