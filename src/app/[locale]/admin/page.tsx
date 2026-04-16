"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { getArticleStats } from "@/lib/firebase/articles";
import {
  FileText,
  Eye,
  TrendingUp,
  Mail,
  Plus,
  Bot,
  Zap,
  ArrowRight,
  BarChart3,
  CircleDot,
} from "lucide-react";
import type { SiteStats } from "@/types";

export default function AdminDashboard() {
  const t = useTranslations("admin");
  const [stats, setStats] = useState<Partial<SiteStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getArticleStats()
      .then((s) => setStats(s))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      key: "totalArticles",
      label: t("stats.totalArticles"),
      value: stats.totalArticles ?? "—",
      icon: FileText,
      color: "text-brand-400",
      bg: "bg-brand-500/10",
    },
    {
      key: "published",
      label: t("stats.published"),
      value: stats.publishedArticles ?? "—",
      icon: CircleDot,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      key: "totalViews",
      label: t("stats.totalViews"),
      value: stats.totalViews?.toLocaleString() ?? "—",
      icon: Eye,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      key: "emailSubscribers",
      label: t("stats.emailSubscribers"),
      value: stats.emailSubscribers ?? "—",
      icon: Mail,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
  ];

  const quickActions = [
    {
      href: "/admin/artigos/novo",
      label: "Novo Artigo",
      desc: "Criar manualmente",
      icon: Plus,
      color: "border-brand-500/30 hover:bg-brand-500/10",
    },
    {
      href: "/admin/automacao",
      label: "Gerar com IA",
      desc: "Criação automática",
      icon: Bot,
      color: "border-gold-500/30 hover:bg-gold-500/10",
    },
    {
      href: "/admin/artigos",
      label: "Gerenciar Artigos",
      desc: "Ver todos",
      icon: FileText,
      color: "border-blue-500/30 hover:bg-blue-500/10",
    },
    {
      href: "/admin/midia",
      label: "Biblioteca de Mídia",
      desc: "Imagens e arquivos",
      icon: BarChart3,
      color: "border-purple-500/30 hover:bg-purple-500/10",
    },
  ];

  return (
    <div className="max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-3xl text-white mb-1">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Bem-vindo ao painel da Fábrica de Liberdade
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.key} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <TrendingUp className="w-4 h-4 text-gray-700" />
              </div>
              <div className="font-display font-bold text-2xl text-white mb-1">
                {loading ? (
                  <div className="h-7 w-16 bg-dark-500 rounded animate-pulse" />
                ) : (
                  card.value
                )}
              </div>
              <div className="text-gray-600 text-xs">{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-display font-semibold text-lg text-gray-300 mb-4">
          Ações rápidas
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map(({ href, label, desc, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className={`group card p-5 border ${color} transition-all duration-200`}
            >
              <Icon className="w-6 h-6 text-gray-400 group-hover:text-brand-400 mb-3 transition-colors" />
              <div className="font-semibold text-gray-200 text-sm mb-0.5">{label}</div>
              <div className="text-gray-600 text-xs">{desc}</div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-700 group-hover:text-brand-400 mt-3 transition-all group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </div>

      {/* AI Automation status */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-500/10 rounded-xl flex items-center justify-center">
              <Bot className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-gray-200">
                Central de Automação
              </h2>
              <p className="text-gray-600 text-xs">Pipeline de geração de conteúdo</p>
            </div>
          </div>
          <Link href="/admin/automacao" className="btn-ghost text-sm">
            Acessar <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: "🔍",
              title: "Research",
              desc: "Busca keywords hot com alto CPC",
              status: "Configurado",
              ok: true,
            },
            {
              icon: "✍️",
              title: "Content Gen",
              desc: "Gera artigo completo com IA",
              status: "Aguardando API key",
              ok: false,
            },
            {
              icon: "🖼️",
              title: "Image Gen",
              desc: "Cria imagens com DALL-E 3",
              status: "Aguardando API key",
              ok: false,
            },
          ].map(({ icon, title, desc, status, ok }) => (
            <div
              key={title}
              className="bg-dark-700 border border-dark-400 rounded-xl p-4"
            >
              <div className="text-2xl mb-2">{icon}</div>
              <div className="font-semibold text-gray-200 text-sm mb-1">{title}</div>
              <div className="text-gray-600 text-xs mb-3">{desc}</div>
              <div
                className={`badge text-xs ${
                  ok
                    ? "bg-brand-500/20 text-brand-400 border border-brand-500/30"
                    : "bg-dark-500 text-gray-600 border border-dark-400"
                }`}
              >
                <Zap className="w-3 h-3" />
                {status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
