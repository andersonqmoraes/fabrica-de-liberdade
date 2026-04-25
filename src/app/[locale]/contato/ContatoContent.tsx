"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Mail,
  Send,
  MessageSquare,
  Instagram,
  Youtube,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export function ContatoContent() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao enviar mensagem");
      }

      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setSending(false);
    }
  }

  const socials = [
    { label: "Instagram", handle: "@fabricadeliberdade", href: "https://instagram.com/fabricadeliberdade", Icon: Instagram },
    { label: "YouTube", handle: "@fabricadeliberdade", href: "https://youtube.com/@fabricadeliberdade", Icon: Youtube },
    { label: "E-mail", handle: "contato@fabricadeliberdade.com.br", href: "mailto:contato@fabricadeliberdade.com.br", Icon: Mail },
  ];

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen">
        {/* Hero */}
        <section className="py-16 bg-dark-700 border-b border-dark-400">
          <div className="container-main text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 border border-brand-500/30 rounded-full text-brand-400 text-sm font-medium mb-6">
              <MessageSquare className="w-4 h-4" />
              Contato
            </div>
            <h1 className="font-display font-bold text-4xl lg:text-5xl text-white mb-4">
              Fale conosco
            </h1>
            <p className="text-gray-400 text-lg">
              Tem uma dúvida, sugestão de pauta ou quer fazer parceria? Adoramos ouvir de você.
            </p>
          </div>
        </section>

        <div className="container-main py-16">
          <div className="grid lg:grid-cols-5 gap-12 max-w-5xl mx-auto">
            {/* Form */}
            <div className="lg:col-span-3">
              <h2 className="font-display font-bold text-2xl text-white mb-6">Enviar mensagem</h2>

              {sent ? (
                <div className="card p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="font-display font-bold text-xl text-white mb-2">Mensagem enviada!</h3>
                  <p className="text-gray-400">
                    Obrigado pelo contato. Respondemos em até 48 horas úteis.
                  </p>
                  <button onClick={() => setSent(false)} className="btn-secondary text-sm mt-6">
                    Enviar outra mensagem
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="card p-6 space-y-5">
                  {error && (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Nome *</label>
                      <input
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        placeholder="Seu nome"
                        required
                        className="input text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">E-mail *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        placeholder="seu@email.com"
                        required
                        className="input text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Assunto</label>
                    <select
                      value={form.subject}
                      onChange={(e) => update("subject", e.target.value)}
                      className="input text-sm"
                    >
                      <option value="">Selecione um assunto</option>
                      <option value="parceria">Parceria / Collab</option>
                      <option value="pauta">Sugestão de pauta</option>
                      <option value="afiliado">Programa de afiliados</option>
                      <option value="imprensa">Imprensa / Mídia</option>
                      <option value="duvida">Dúvida geral</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Mensagem *</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => update("message", e.target.value)}
                      placeholder="Escreva sua mensagem aqui..."
                      required
                      rows={6}
                      className="input text-sm resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending || !form.name || !form.email || !form.message}
                    className="btn-primary text-sm w-full sm:w-auto"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar mensagem
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="font-display font-bold text-2xl text-white mb-6">Outros canais</h2>
                <div className="space-y-4">
                  {socials.map(({ label, handle, href, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="card p-4 flex items-center gap-4 hover:border-brand-500/30 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-brand-400" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-200 text-sm group-hover:text-brand-400 transition-colors">{label}</div>
                        <div className="text-gray-500 text-xs">{handle}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="card p-5">
                <h3 className="font-semibold text-gray-200 mb-3 text-sm">Tempo de resposta</h3>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex justify-between">
                    <span>E-mail / formulário</span>
                    <span className="text-green-400">até 48h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Instagram DM</span>
                    <span className="text-green-400">até 24h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Parcerias</span>
                    <span className="text-gold-400">até 5 dias</span>
                  </div>
                </div>
              </div>

              <div className="card p-5">
                <h3 className="font-semibold text-gray-200 mb-2 text-sm">Nota</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Não aceitamos guest posts pagos. Todas as recomendações e reviews são baseadas em avaliação independente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
