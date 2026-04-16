"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Mail, Check, Loader2, Sparkles, Shield, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

export function NewsletterSection() {
  const t = useTranslations("newsletter");
  const locale = useLocale() as Locale;
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
        body: JSON.stringify({ email, locale, source: "homepage" }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const benefits = [
    { icon: Sparkles, text: t("benefit1") },
    { icon: TrendingUp, text: t("benefit2") },
    { icon: Shield, text: t("benefit3") },
  ];

  return (
    <section className="section bg-dark-700">
      <div className="container-main">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-dark-600 to-blue-500/5" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 border border-brand-500/20 rounded-3xl" />

          <div className="relative z-10 p-8 sm:p-12 lg:p-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left */}
              <div>
                <div className="inline-flex items-center gap-2 badge badge-brand mb-6">
                  <Mail className="w-4 h-4" />
                  Newsletter
                </div>
                <h2 className="font-display font-bold text-3xl lg:text-4xl text-white mb-4">
                  {t("title")}
                </h2>
                <p className="text-gray-400 text-lg mb-8">{t("subtitle")}</p>

                {/* Benefits */}
                <ul className="space-y-4">
                  {benefits.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-brand-400" />
                      </div>
                      <span className="text-gray-300 text-sm">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right - Form */}
              <div className="bg-dark-600/50 backdrop-blur border border-dark-400 rounded-2xl p-8">
                {status === "success" ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-brand-400" />
                    </div>
                    <h3 className="font-display font-bold text-xl text-white mb-2">
                      {t("success")}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Verifique sua caixa de entrada e spam.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <div className="w-14 h-14 bg-brand-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-7 h-7 text-brand-400" />
                      </div>
                      <h3 className="font-display font-bold text-xl text-white">
                        Junte-se à comunidade
                      </h3>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t("placeholder")}
                          className="input"
                          required
                          disabled={status === "loading"}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={status === "loading" || !email.trim()}
                        className={cn(
                          "btn-primary w-full justify-center",
                          (status === "loading" || !email.trim()) &&
                            "opacity-70 cursor-not-allowed hover:translate-y-0 hover:shadow-brand"
                        )}
                      >
                        {status === "loading" ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Inscrevendo...
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4" />
                            {t("cta")}
                          </>
                        )}
                      </button>

                      {status === "error" && (
                        <p className="text-red-400 text-sm text-center">{t("error")}</p>
                      )}

                      <p className="text-gray-600 text-xs text-center flex items-center justify-center gap-1">
                        <Shield className="w-3.5 h-3.5" />
                        {t("privacy")}
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
