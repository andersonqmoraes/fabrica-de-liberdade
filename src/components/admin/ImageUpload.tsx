"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  X,
  Loader2,
  ImageIcon,
  Check,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadMedia } from "@/lib/firebase/storage";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

type UploadStage = "idle" | "optimizing" | "uploading" | "done" | "error";

interface OptimizationInfo {
  reduction: string;
  originalSize: string;
  optimizedSize: string;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [stage, setStage] = useState<UploadStage>("idle");
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [optimizationInfo, setOptimizationInfo] =
    useState<OptimizationInfo | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      // Validações
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/avif",
      ];
      if (!validTypes.includes(file.type)) {
        setError("Formato não suportado. Use JPEG, PNG, WebP, GIF ou AVIF.");
        setStage("error");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("A imagem deve ter no máximo 10MB.");
        setStage("error");
        return;
      }

      setError("");
      setStage("optimizing");
      setProgress("Otimizando imagem...");
      setOptimizationInfo(null);

      try {
        // 1. Enviar para API de otimização
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Erro ao otimizar imagem");
        }

        const data = await res.json();
        setOptimizationInfo(data.optimization);

        // 2. Fazer upload ao Firebase Storage
        setStage("uploading");
        setProgress("Enviando para o servidor...");

        // Converter base64 de volta para File para o upload
        const optimizedBlob = base64ToBlob(data.main.base64, "image/webp");
        const optimizedFile = new File(
          [optimizedBlob],
          file.name.replace(/\.[^.]+$/, ".webp"),
          { type: "image/webp" }
        );

        const media = await uploadMedia(optimizedFile, "media/articles");

        // 3. Upload da thumbnail também
        const thumbBlob = base64ToBlob(data.thumb.base64, "image/webp");
        const thumbFile = new File(
          [thumbBlob],
          file.name.replace(/\.[^.]+$/, "_thumb.webp"),
          { type: "image/webp" }
        );
        await uploadMedia(thumbFile, "media/articles/thumbs");

        setStage("done");
        setProgress("");
        onChange(media.url);

        // Reset para idle depois de mostrar sucesso
        setTimeout(() => setStage("idle"), 3000);
      } catch (err) {
        console.error("Erro no upload:", err);
        setError(
          err instanceof Error ? err.message : "Erro ao processar imagem"
        );
        setStage("error");
      }
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      // Reset input para permitir reenviar o mesmo arquivo
      if (inputRef.current) inputRef.current.value = "";
    },
    [processFile]
  );

  const handleRemove = useCallback(() => {
    onChange("");
    setOptimizationInfo(null);
    setStage("idle");
    setError("");
  }, [onChange]);

  const isProcessing = stage === "optimizing" || stage === "uploading";

  return (
    <div className="space-y-3">
      {/* Área de preview / upload */}
      {value ? (
        /* Preview da imagem atual */
        <div className="relative group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Imagem de capa"
            className="w-full h-40 object-cover rounded-xl"
          />
          {/* Overlay de ações */}
          <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isProcessing}
              className="flex items-center gap-2 px-3 py-2 bg-brand-500/20 border border-brand-500/40 rounded-lg text-brand-400 text-xs font-medium hover:bg-brand-500/30 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Trocar
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={isProcessing}
              className="flex items-center gap-2 px-3 py-2 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400 text-xs font-medium hover:bg-red-500/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remover
            </button>
          </div>

          {/* Badge de otimização */}
          {optimizationInfo && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-[10px] font-medium backdrop-blur-sm">
              <Check className="w-3 h-3" />
              {optimizationInfo.optimizedSize} (−{optimizationInfo.reduction})
            </div>
          )}
        </div>
      ) : (
        /* Dropzone */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !isProcessing && inputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center gap-3 py-8 px-4 border-2 border-dashed rounded-xl cursor-pointer transition-all",
            dragOver
              ? "border-brand-400 bg-brand-500/10"
              : "border-dark-300 bg-dark-600/50 hover:border-dark-200 hover:bg-dark-600",
            isProcessing && "pointer-events-none"
          )}
        >
          {isProcessing ? (
            <>
              <div className="relative">
                <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-300 font-medium">{progress}</p>
                {stage === "optimizing" && (
                  <p className="text-xs text-gray-600 mt-1">
                    Comprimindo e convertendo para WebP...
                  </p>
                )}
                {stage === "uploading" && (
                  <p className="text-xs text-gray-600 mt-1">
                    Enviando para Firebase Storage...
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                  dragOver
                    ? "bg-brand-500/20 text-brand-400"
                    : "bg-dark-500 text-gray-500"
                )}
              >
                <ImageIcon className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-300">
                  <span className="text-brand-400 font-medium">
                    Clique para enviar
                  </span>{" "}
                  ou arraste aqui
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  JPEG, PNG, WebP, GIF ou AVIF • Máximo 10MB
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  A imagem será otimizada automaticamente para WebP
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Input file oculto */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Status de sucesso */}
      {stage === "done" && (
        <div className="flex items-center gap-2 text-green-400 text-xs animate-fade-in">
          <Check className="w-3.5 h-3.5" />
          <span>Imagem otimizada e enviada com sucesso!</span>
          {optimizationInfo && (
            <span className="text-gray-600">
              {optimizationInfo.originalSize} → {optimizationInfo.optimizedSize}{" "}
              (−{optimizationInfo.reduction})
            </span>
          )}
        </div>
      )}

      {/* Erro */}
      {stage === "error" && error && (
        <div className="flex items-center gap-2 text-red-400 text-xs">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => {
              setError("");
              setStage("idle");
            }}
            className="ml-auto text-gray-600 hover:text-gray-400"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteChars = atob(base64);
  const byteNumbers = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  return new Blob([byteNumbers.buffer as ArrayBuffer], { type: mimeType });
}
