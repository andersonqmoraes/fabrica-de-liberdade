"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/config";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import {
  Mail,
  Trash2,
  CheckCheck,
  RefreshCw,
  Loader2,
  MessageSquare,
  User,
  Calendar,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: Timestamp | null;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function fetchMessages() {
    setLoading(true);
    try {
      const snap = await getDocs(
        query(collection(db, "contact_messages"), orderBy("createdAt", "desc"))
      );
      setMessages(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ContactMessage, "id">) }))
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMessages();
  }, []);

  async function markRead(msg: ContactMessage) {
    if (msg.read) return;
    await updateDoc(doc(db, "contact_messages", msg.id), { read: true });
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m)));
    setSelected((prev) => (prev?.id === msg.id ? { ...prev, read: true } : prev));
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta mensagem?")) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, "contact_messages", id));
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selected?.id === id) setSelected(null);
    } finally {
      setDeleting(null);
    }
  }

  function handleSelect(msg: ContactMessage) {
    setSelected(msg);
    markRead(msg);
  }

  const unread = messages.filter((m) => !m.read).length;

  function formatTs(ts: Timestamp | null): string {
    if (!ts) return "—";
    return format(ts.toDate(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  }

  const subjectLabels: Record<string, string> = {
    parceria: "Parceria / Collab",
    pauta: "Sugestão de pauta",
    afiliado: "Programa de afiliados",
    imprensa: "Imprensa / Mídia",
    duvida: "Dúvida geral",
    outro: "Outro",
  };

  return (
    <div className="p-6 lg:p-8 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            <Mail className="w-6 h-6 text-brand-400" />
            Mensagens de Contato
            {unread > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-brand-500 text-white text-xs font-bold rounded-full">
                {unread}
              </span>
            )}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {messages.length} mensagem{messages.length !== 1 ? "s" : ""} no total
          </p>
        </div>
        <button
          onClick={fetchMessages}
          disabled={loading}
          className="btn-secondary text-sm"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Atualizar
        </button>
      </div>

      <div className="flex gap-4 h-[calc(100vh-220px)]">
        {/* Message list */}
        <div className="w-80 flex-shrink-0 overflow-y-auto space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-600">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Carregando...
            </div>
          ) : messages.length === 0 ? (
            <div className="card p-8 text-center text-gray-600">
              <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Nenhuma mensagem ainda</p>
            </div>
          ) : (
            messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => handleSelect(msg)}
                className={cn(
                  "w-full text-left card p-4 transition-all hover:border-brand-500/30",
                  selected?.id === msg.id && "border-brand-500/50 bg-brand-500/5",
                  !msg.read && "border-brand-500/20"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className={cn("font-medium text-sm", !msg.read ? "text-white" : "text-gray-300")}>
                    {msg.name}
                  </span>
                  {!msg.read && (
                    <span className="w-2 h-2 bg-brand-400 rounded-full flex-shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-gray-500 text-xs truncate">{msg.email}</p>
                {msg.subject && (
                  <p className="text-gray-600 text-xs mt-1 truncate">
                    {subjectLabels[msg.subject] || msg.subject}
                  </p>
                )}
                <p className="text-gray-600 text-xs mt-2 truncate">{msg.message}</p>
                <p className="text-gray-700 text-xs mt-2">{formatTs(msg.createdAt)}</p>
              </button>
            ))
          )}
        </div>

        {/* Message detail */}
        <div className="flex-1 overflow-y-auto">
          {selected ? (
            <div className="card p-6 h-full">
              {/* Meta */}
              <div className="flex items-start justify-between mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <User className="w-4 h-4" />
                    <span className="font-medium text-gray-200">{selected.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${selected.email}`} className="text-brand-400 hover:underline">
                      {selected.email}
                    </a>
                  </div>
                  {selected.subject && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Tag className="w-4 h-4" />
                      <span>{subjectLabels[selected.subject] || selected.subject}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{formatTs(selected.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selected.read && (
                    <span className="flex items-center gap-1 text-xs text-green-400">
                      <CheckCheck className="w-3.5 h-3.5" />
                      Lida
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(selected.id)}
                    disabled={deleting === selected.id}
                    className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    {deleting === selected.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Message body */}
              <div className="border-t border-dark-400 pt-6">
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {selected.message}
                </p>
              </div>

              {/* Reply CTA */}
              <div className="mt-6 pt-6 border-t border-dark-400">
                <a
                  href={`mailto:${selected.email}?subject=Re: ${subjectLabels[selected.subject] || selected.subject || "Sua mensagem"}`}
                  className="btn-primary text-sm"
                >
                  <Mail className="w-4 h-4" />
                  Responder por e-mail
                </a>
              </div>
            </div>
          ) : (
            <div className="card h-full flex items-center justify-center text-center">
              <div>
                <MessageSquare className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">Selecione uma mensagem para visualizar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
