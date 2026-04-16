"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { uploadMedia, deleteMedia } from "@/lib/firebase/storage";
import {
  Upload,
  Image,
  Trash2,
  Copy,
  Check,
  Loader2,
  X,
  File,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MediaFile } from "@/types";

export default function AdminMediaPage() {
  const t = useTranslations("admin");
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;

    setUploading(true);
    setError("");

    const uploaded: MediaFile[] = [];

    for (const file of Array.from(fileList)) {
      if (!file.type.startsWith("image/") && !file.type.includes("video/")) {
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(`Arquivo muito grande (máx 10MB): ${file.name}`);
        continue;
      }

      try {
        const media = await uploadMedia(file);
        uploaded.push(media);
      } catch (err) {
        setError(`Erro ao enviar ${file.name}`);
      }
    }

    setFiles((prev) => [...uploaded, ...prev]);
    setUploading(false);
  }

  async function handleDelete(file: MediaFile) {
    if (!confirm(`Excluir "${file.name}"?`)) return;
    try {
      await deleteMedia(file.id);
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    } catch {
      setError("Erro ao excluir arquivo.");
    }
  }

  function copyUrl(file: MediaFile) {
    navigator.clipboard.writeText(file.url);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="font-display font-bold text-3xl text-white mb-1">
          {t("media")}
        </h1>
        <p className="text-gray-600 text-sm">
          Gerencie imagens e arquivos do site
        </p>
      </div>

      {/* Upload area */}
      <div
        className={cn(
          "card border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200",
          dragging
            ? "border-brand-500 bg-brand-500/10"
            : "border-dark-400 hover:border-dark-300"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

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
              <p className="text-gray-300 font-medium">
                Arraste arquivos ou clique para enviar
              </p>
              <p className="text-gray-600 text-sm mt-1">
                Imagens e vídeos — máx. 10MB por arquivo
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center justify-between bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={() => setError("")}>
            <X className="w-4 h-4 text-red-400" />
          </button>
        </div>
      )}

      {/* Files grid */}
      {files.length === 0 ? (
        <div className="card p-12 text-center">
          <Image className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-600">Nenhum arquivo enviado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => (
            <div key={file.id} className="group card overflow-hidden">
              <div className="relative h-36">
                {file.type.startsWith("image/") ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-dark-600 flex items-center justify-center">
                    <File className="w-10 h-10 text-gray-600" />
                  </div>
                )}

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-dark-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => copyUrl(file)}
                    className="w-9 h-9 bg-brand-500 rounded-lg flex items-center justify-center hover:bg-brand-600 transition-colors"
                    title="Copiar URL"
                  >
                    {copiedId === file.id ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <Copy className="w-4 h-4 text-white" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(file)}
                    className="w-9 h-9 bg-red-500/80 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-gray-400 text-xs truncate">{file.name}</p>
                <p className="text-gray-700 text-xs">
                  {(file.size / 1024).toFixed(0)} KB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
