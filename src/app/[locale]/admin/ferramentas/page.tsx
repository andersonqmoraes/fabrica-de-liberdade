"use client";

import { useState, useEffect } from "react";
import { getTools, createTool, updateTool, deleteTool, type Tool } from "@/lib/firebase/tools";
import {
  Plus, Loader2, Pencil, Trash2, Save, X, ToggleLeft, ToggleRight, Star, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const EMPTY_TOOL: Omit<Tool, "id"> = {
  name: "", description: { "pt-BR": "", en: "", es: "" },
  category: "ai-tools", badge: "", badgeColor: "bg-brand-500/20 text-brand-400 border-brand-500/30",
  rating: 4.5, href: "", free: true, tags: [], active: true, order: 99,
};

const BADGE_COLORS = [
  { label: "Brand", value: "bg-brand-500/20 text-brand-400 border-brand-500/30" },
  { label: "Gold", value: "bg-gold-500/20 text-gold-400 border-gold-500/30" },
  { label: "Blue", value: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { label: "Green", value: "bg-green-500/20 text-green-400 border-green-500/30" },
  { label: "Purple", value: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { label: "Cyan", value: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  { label: "Pink", value: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
];

const CATEGORIES = [
  { value: "ai-tools", label: "Ferramentas de IA" },
  { value: "productivity", label: "Produtividade" },
  { value: "automation", label: "Automação" },
  { value: "make-money", label: "Ganhar Dinheiro" },
  { value: "software", label: "Software & Apps" },
  { value: "tech-reviews", label: "Tech Reviews" },
];

export default function AdminFerramentasPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null); // id or "new"
  const [form, setForm] = useState<Omit<Tool, "id">>(EMPTY_TOOL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try { setTools(await getTools()); } catch { setError("Erro ao carregar ferramentas."); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function startEdit(tool?: Tool) {
    if (tool) {
      const { id: _, ...rest } = tool;
      setForm(rest);
      setEditing(tool.id);
    } else {
      setForm({ ...EMPTY_TOOL, order: tools.length + 1 });
      setEditing("new");
    }
    setError("");
  }

  async function handleSave() {
    if (!form.name || !form.href) { setError("Nome e URL são obrigatórios."); return; }
    setSaving(true);
    setError("");
    try {
      const tagsArr = typeof form.tags === "string"
        ? (form.tags as string).split(",").map((t) => t.trim()).filter(Boolean)
        : form.tags;
      const data = { ...form, tags: tagsArr };

      if (editing === "new") {
        const id = await createTool(data);
        setTools((prev) => [...prev, { id, ...data }]);
      } else if (editing) {
        await updateTool(editing, data);
        setTools((prev) => prev.map((t) => t.id === editing ? { ...t, ...data } : t));
      }
      setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Excluir "${name}"?`)) return;
    await deleteTool(id);
    setTools((prev) => prev.filter((t) => t.id !== id));
  }

  async function toggleActive(tool: Tool) {
    await updateTool(tool.id, { active: !tool.active });
    setTools((prev) => prev.map((t) => t.id === tool.id ? { ...t, active: !t.active } : t));
  }

  const isEditing = editing !== null;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-white mb-1">Ferramentas</h1>
          <p className="text-gray-500 text-sm">Gerencie as ferramentas exibidas em /ferramentas</p>
        </div>
        {!isEditing && (
          <button onClick={() => startEdit()} className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> Nova ferramenta
          </button>
        )}
      </div>

      {/* Form */}
      {isEditing && (
        <div className="card p-6 space-y-5 border-brand-500/20">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-200">{editing === "new" ? "Nova ferramenta" : "Editar ferramenta"}</h2>
            <button onClick={() => setEditing(null)} className="text-gray-600 hover:text-gray-300"><X className="w-4 h-4" /></button>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Nome *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input text-sm" placeholder="ChatGPT" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">URL *</label>
              <input value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })} className="input text-sm" placeholder="https://..." />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Categoria</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input text-sm">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Badge (texto)</label>
              <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} className="input text-sm" placeholder="Mais popular" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Cor do badge</label>
              <select value={form.badgeColor} onChange={(e) => setForm({ ...form, badgeColor: e.target.value })} className="input text-sm">
                {BADGE_COLORS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Rating (0–5)</label>
              <input type="number" min={0} max={5} step={0.1} value={form.rating}
                onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) })} className="input text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Tags (vírgula)</label>
              <input value={Array.isArray(form.tags) ? form.tags.join(", ") : form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value as unknown as string[] })} className="input text-sm" placeholder="IA, escrita, automação" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Ordem</label>
              <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) })} className="input text-sm" />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Descrição PT-BR</label>
              <textarea value={form.description["pt-BR"]} onChange={(e) => setForm({ ...form, description: { ...form.description, "pt-BR": e.target.value } })}
                className="input text-sm resize-none" rows={2} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Descrição EN</label>
              <textarea value={form.description.en} onChange={(e) => setForm({ ...form, description: { ...form.description, en: e.target.value } })}
                className="input text-sm resize-none" rows={2} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Descrição ES</label>
              <textarea value={form.description.es} onChange={(e) => setForm({ ...form, description: { ...form.description, es: e.target.value } })}
                className="input text-sm resize-none" rows={2} />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.free} onChange={(e) => setForm({ ...form, free: e.target.checked })} className="accent-brand-500" />
              <span className="text-sm text-gray-400">Tem versão gratuita</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="accent-brand-500" />
              <span className="text-sm text-gray-400">Visível no site</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2 border-t border-dark-400">
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar ferramenta
            </button>
            <button onClick={() => setEditing(null)} className="btn-secondary text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="card p-4 animate-pulse h-16 bg-dark-600" />)}
        </div>
      ) : tools.length === 0 ? (
        <div className="card p-12 text-center text-gray-600">
          <p className="mb-4">Nenhuma ferramenta cadastrada.</p>
          <button onClick={() => startEdit()} className="btn-primary text-sm"><Plus className="w-4 h-4" /> Adicionar primeira ferramenta</button>
        </div>
      ) : (
        <div className="space-y-2">
          {tools.map((tool) => (
            <div key={tool.id} className={cn("card p-4 flex items-center gap-4 transition-all", !tool.active && "opacity-50")}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium text-gray-200 text-sm">{tool.name}</span>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full border", tool.badgeColor)}>{tool.badge}</span>
                  {!tool.active && <span className="text-xs text-gray-600">oculta</span>}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span>{CATEGORIES.find((c) => c.value === tool.category)?.label}</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-gold-400" />{tool.rating}</span>
                  <a href={tool.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-brand-400 transition-colors">
                    <ExternalLink className="w-3 h-3" />{tool.href.replace(/^https?:\/\//, "").split("/")[0]}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleActive(tool)} title={tool.active ? "Ocultar" : "Mostrar"}
                  className="text-gray-600 hover:text-brand-400 transition-colors">
                  {tool.active ? <ToggleRight className="w-5 h-5 text-brand-400" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button onClick={() => startEdit(tool)} className="p-1.5 text-gray-600 hover:text-gray-300 transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(tool.id, tool.name)} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
