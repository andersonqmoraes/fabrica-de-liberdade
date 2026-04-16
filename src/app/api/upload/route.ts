import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

// Tamanhos de imagem para gerar
const IMAGE_SIZES = {
  // Imagem principal para Open Graph / capa de artigo
  main: { width: 1200, height: 630 },
  // Thumbnail para listagens
  thumb: { width: 400, height: 225 },
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não suportado. Use JPEG, PNG, WebP, GIF ou AVIF." },
        { status: 400 }
      );
    }

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "A imagem deve ter no máximo 10MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Obter metadados da imagem original
    const metadata = await sharp(buffer).metadata();
    const originalSize = buffer.length;

    // Otimizar a imagem principal
    // Se a imagem for maior que o tamanho alvo, redimensionar
    // Sempre converter para WebP que tem a melhor relação qualidade/tamanho
    const mainImage = sharp(buffer).rotate(); // auto-rotate based on EXIF

    const targetWidth = IMAGE_SIZES.main.width;
    const targetHeight = IMAGE_SIZES.main.height;

    // Só redimensiona se a imagem original for maior
    if (
      (metadata.width && metadata.width > targetWidth) ||
      (metadata.height && metadata.height > targetHeight)
    ) {
      mainImage.resize(targetWidth, targetHeight, {
        fit: "cover",
        position: "centre",
        withoutEnlargement: true,
      });
    }

    // Converter para WebP com qualidade otimizada
    const optimizedBuffer = await mainImage
      .webp({
        quality: 82, // Bom equilíbrio entre qualidade e tamanho
        effort: 6,   // Nível de compressão (0-6, maior = menor arquivo mas mais lento)
        smartSubsample: true,
      })
      .toBuffer();

    // Gerar thumbnail
    const thumbBuffer = await sharp(buffer)
      .rotate()
      .resize(IMAGE_SIZES.thumb.width, IMAGE_SIZES.thumb.height, {
        fit: "cover",
        position: "centre",
      })
      .webp({
        quality: 75,
        effort: 6,
        smartSubsample: true,
      })
      .toBuffer();

    const optimizedSize = optimizedBuffer.length;
    const reduction = Math.round((1 - optimizedSize / originalSize) * 100);

    // Converter para base64 para enviar ao cliente que fará upload ao Firebase
    const mainBase64 = optimizedBuffer.toString("base64");
    const thumbBase64 = thumbBuffer.toString("base64");

    return NextResponse.json({
      main: {
        base64: mainBase64,
        size: optimizedSize,
        mimeType: "image/webp",
      },
      thumb: {
        base64: thumbBase64,
        size: thumbBuffer.length,
        mimeType: "image/webp",
      },
      original: {
        name: file.name,
        size: originalSize,
        width: metadata.width,
        height: metadata.height,
      },
      optimization: {
        reduction: `${reduction}%`,
        originalSize: formatBytes(originalSize),
        optimizedSize: formatBytes(optimizedSize),
      },
    });
  } catch (error) {
    console.error("Erro ao processar imagem:", error);
    return NextResponse.json(
      { error: "Erro ao processar a imagem. Tente novamente." },
      { status: 500 }
    );
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
