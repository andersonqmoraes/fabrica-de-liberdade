"use client";

import { useState, useRef, useEffect } from "react";
import { uploadMedia, listMediaFiles, deleteMedia } from "@/lib/firebase/storage";
import {
  Upload, Image, Trash2, Copy, Check, Loader2, X, File, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MediaFile } from "@/types";

type StoredFile = MediaFile & { storagePath?: string };

export default function AdminMediaPage() {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function loadFiles() {
    setLoading(true);
    try {
      const list = await listMediaFiles();
      setFiles(list);
    } catch {
      setError("Erro ao carregar arquivos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadFiles(); }, []);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    setUploading(true);
    setError("");
    const uploaded: StoredFile[] = [];
    for (const file of Array.from(fileList)) {
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) continue;
      if (file.size > 10 * 1024 * 1024) { setError(`Muito grande (máx 10MB): ${file.name}`); continue; }
      try {
        const media = await uploadMedia(file) as StoredFile;
        uploaded.push(media);
      } catch { setError(`Erro ao enviar ${file.name}`); }
    }
    setFiles((prev) => [...uploaded, ...prev]);
    setUploading(false);
  }

  async function handleDelete(file: StoredFile) {
    if (!confirm(`Excluir "${file.name}"?`)) return;
    try {
      await deleteMedia(file.id, file.storagePath);
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    } catch { setError("Erro ao excluir arquivo."); }
  }

  function copyUrl(file: StoredFile) {
    navigator.clipboard.writeText(file.url);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const totalSize = files.reduce((acc, f) => acc + (f.size || 0), 0);

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-white mb-1">Biblioteca de Mídia</h1>
          <p className="text-gray-600 text-sm">
            {files.length} arquivo{files.length !== 1 ? "s" : ""} · {(totalSize / 1024 / 1024).toFixed(1)} MB usado
          </p>
        </div>
        <button onClick={loadFiles} disabled={loading} className="btn-secondary text-sm">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Atualizar
        </button>
      </div>

      {/* Upload area */}
      <div
        className={cn(
          "card border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all",
          dragging ? "border-brand-500 bg-brand-500/10" : "border-dark-400 hover:border-dark-300"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" multiple accept="image/*,video/*" className="hidden"
          onChange={(e) => handleFiles(e.target.files)} />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-brand-400 animate-spin" />
            <p className="text-gray-400">Enviando arquivos...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-dark-600 rounded-2xl flex items-center justify-center">
              <Upload className="w-7 h-7 text-gray-500" />
            </div>
            <div>
              <p className="text-gray-300 font-medium">Arraste ou clique para enviar</p>
              <p className="text-gray-600 text-sm mt-1">Imagens e vídeos · máx. 10MB</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center justify-between bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={() => setError("")}><X className="w-4 h-4 text-red-400" /></button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-36 bg-dark-600 rounded-t-2xl" />
              <div className="p-3 space-y-2">
                <div className="h-2 bg-dark-500 rounded w-3/4" />
                <div className="h-2 bg-dark-500 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="card p-12 text-center">
          <Image className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-600">Nenhum arquivo ainda. Faça o primeiro upload acima.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => (
            <div key={file.id} className="group card overflow-hidden">
              <div className="relative h-36 bg-dark-600">
                {file.type?.startsWith("image/") ? (
                  <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <File className="w-10 h-10 text-gray-600" />
                  </div>
                )}
                <div className="absolute inset-0 bg-dark-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button onClick={() => copyUrl(file)}
                    className="w-9 h-9 bg-brand-500 rounded-lg flex items-center justify-center hover:bg-brand-600 transition-colors" title="Copiar URL">
                    {copiedId === file.id ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
                  </button>
                  <button onClick={() => handleDelete(file)}
                    className="w-9 h-9 bg-red-500/80 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors" title="Excluir">
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-gray-400 text-xs truncate" title={file.name}>{file.name}</p>
                <p className="text-gray-700 text-xs">{((file.size || 0) / 1024).toFixed(0)} KB</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
