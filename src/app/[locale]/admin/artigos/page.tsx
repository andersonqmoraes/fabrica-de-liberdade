"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { getArticles, deleteArticle, updateArticle } from "@/lib/firebase/articles";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Globe,
  FileText,
  Clock,
  Bot,
  ChevronDown,
  Filter,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { Article, Locale, ArticleStatus } from "@/types";

const statusConfig: Record<ArticleStatus, { label: string; color: string; dot: string }> = {
  published: {
    label: "Publicado",
    color: "bg-green-500/15 text-green-400 border-green-500/30",
    dot: "bg-green-400",
  },
  draft: {
    label: "Rascunho",
    color: "bg-dark-500 text-gray-500 border-dark-300",
    dot: "bg-gray-500",
  },
  scheduled: {
    label: "Agendado",
    color: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    dot: "bg-blue-400",
  },
};

export default function AdminArticlesPage() {
  const t = useTranslations("admin");
  const locale = useLocale() as Locale;
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | "all">("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    try {
      const data = await getArticles({ limitCount: 100 });
      setArticles(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Excluir "${title}"? Esta ação não pode ser desfeita.`)) return;
    setDeleting(id);
    try {
      await deleteArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert("Erro ao excluir artigo.");
    } finally {
      setDeleting(null);
    }
  }

  async function handleToggleStatus(article: Article) {
    const newStatus: ArticleStatus =
      article.status === "published" ? "draft" : "published";
    try {
      await updateArticle(article.id, {
        status: newStatus,
        ...(newStatus === "published" && { publishedAt: new Date().toISOString() }),
      });
      setArticles((prev) =>
        prev.map((a) =>
          a.id === article.id ? { ...a, status: newStatus } : a
        )
      );
    } catch {
      alert("Erro ao atualizar status.");
    }
  }

  const filtered = articles.filter((a) => {
    const trans = a.translations[locale] || a.translations["pt-BR"];
    const matchSearch =
      !search ||
      trans?.title.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some((t) => t.includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-white mb-1">
            {t("articles")}
          </h1>
          <p className="text-gray-600 text-sm">
            {filtered.length} artigos encontrados
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/automacao" className="btn-secondary text-sm gap-2">
            <Bot className="w-4 h-4 text-gold-400" />
            Gerar com IA
          </Link>
          <Link href="/admin/artigos/novo" className="btn-primary text-sm">
            <Plus className="w-4 h-4" />
            {t("newArticle")}
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar artigos..."
            className="input pl-9 py-2 text-sm"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "published", "draft", "scheduled"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-medium border transition-all",
                statusFilter === s
                  ? "bg-brand-500/15 text-brand-400 border-brand-500/30"
                  : "bg-dark-600 text-gray-500 border-dark-400 hover:border-dark-300"
              )}
            >
              {s === "all"
                ? "Todos"
                : statusConfig[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {/* Articles table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-400 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-600 text-sm">Carregando artigos...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-600">Nenhum artigo encontrado.</p>
            <Link
              href="/admin/artigos/novo"
              className="btn-primary mt-4 text-sm inline-flex"
            >
              <Plus className="w-4 h-4" />
              Criar primeiro artigo
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-dark-400">
            {/* Table header */}
            <div className="hidden lg:grid grid-cols-[1fr_140px_120px_100px_80px] gap-4 px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
              <span>Artigo</span>
              <span>Categoria</span>
              <span>Status</span>
              <span>Data</span>
              <span className="text-right">Ações</span>
            </div>

            {/* Rows */}
            {filtered.map((article) => {
              const trans = article.translations[locale] || article.translations["pt-BR"];
              const status = statusConfig[article.status];
              const categoryLabel = article.category.replace("-", " ");

              return (
                <div
                  key={article.id}
                  className="grid grid-cols-1 lg:grid-cols-[1fr_140px_120px_100px_80px] gap-3 lg:gap-4 px-6 py-4 hover:bg-dark-600/30 transition-colors items-center"
                >
                  {/* Title */}
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-gray-200 text-sm line-clamp-1">
                          {trans?.title || "Sem título"}
                        </h3>
                        {article.generatedByAI && (
                          <span className="badge bg-gold-500/15 text-gold-500 border border-gold-500/20 text-xs">
                            <Bot className="w-3 h-3" />
                            AI
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-gray-600 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.readTime} min
                        </span>
                        <span className="text-gray-600 text-xs flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.views}
                        </span>
                        <span className="text-gray-600 text-xs flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {Object.keys(article.translations).length} idiomas
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="hidden lg:block">
                    <span className="text-gray-500 text-xs capitalize">
                      {categoryLabel}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="hidden lg:block">
                    <button
                      onClick={() => handleToggleStatus(article)}
                      className={cn(
                        "badge border text-xs cursor-pointer hover:opacity-80 transition-opacity",
                        status.color
                      )}
                      title="Clique para alternar status"
                    >
                      <div className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
                      {status.label}
                    </button>
                  </div>

                  {/* Date */}
                  <div className="hidden lg:block text-gray-600 text-xs">
                    {formatDate(article.publishedAt || article.createdAt, locale, "dd/MM/yy")}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 lg:justify-end">
                    {article.status === "published" && (
                      <a
                        href={`/blog/${article.slug}`}
                        target="_blank"
                        rel="noopener"
                        className="p-1.5 text-gray-600 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-all"
                        title="Ver artigo"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                    )}
                    <Link
                      href={`/admin/artigos/${article.id}` as any}
                      className="p-1.5 text-gray-600 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() =>
                        handleDelete(article.id, trans?.title || "este artigo")
                      }
                      disabled={deleting === article.id}
                      className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
