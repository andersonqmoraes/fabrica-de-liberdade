import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Modality } from "@google/genai";
import type { ArticleCategory, Locale } from "@/types";

function buildArticlePrompt(
  keyword: string,
  category: ArticleCategory,
  locale: Locale,
  tone: string
): string {
  const localeNames = {
    "pt-BR": "Português Brasileiro",
    en: "English",
    es: "Español",
  };

  const toneGuides = {
    professional: "Profissional, autoritário, baseado em dados e fatos",
    casual: "Casual e acessível, como um amigo experiente explicando",
    educational: "Didático, passo a passo, explicativo",
    persuasive: "Persuasivo com provas sociais e urgência sutil",
  };

  return `Você é um especialista em SEO e marketing de conteúdo. Crie um artigo completo e otimizado para SEO em ${localeNames[locale]}.

**Keyword principal:** "${keyword}"
**Categoria:** ${category}
**Tom:** ${toneGuides[tone as keyof typeof toneGuides] || toneGuides.professional}

**REQUISITOS DO ARTIGO:**
1. Título otimizado com a keyword (60-65 caracteres)
2. Meta description (150-160 caracteres)
3. Artigo de 2000-3000 palavras
4. Estrutura: Introdução → H2 com subseções → Conclusão com CTA
5. Incluir FAQ com 5 perguntas (para featured snippets)
6. Linguagem natural, sem jargão excessivo
7. Mencionar produtos/ferramentas específicas (para links de afiliado)
8. CTA claro no final (para conversão)

**FORMATO DE RESPOSTA (JSON):**
\`\`\`json
{
  "title": "Título do artigo",
  "metaTitle": "Meta title SEO",
  "metaDescription": "Meta description SEO",
  "excerpt": "Resumo de 1-2 frases",
  "content": "Conteúdo completo em Markdown",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "imagePrompt": "Prompt para geração de imagem: tema, cores, estilo visual",
  "affiliateKeywords": ["produto1", "produto2"],
  "wordCount": 2500,
  "readTime": 12
}
\`\`\`

Gere APENAS o JSON, sem texto adicional.`;
}

async function generateImageWithGemini(
  ai: GoogleGenAI,
  prompt: string
): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: `Create a professional blog thumbnail image for an article about: ${prompt}. Dark tech aesthetic, modern design, no text overlay, high quality, 16:9 ratio.`,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.mimeType?.startsWith("image/")) {
        const base64 = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64}`;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { keyword, category, locale, tone, generateImage: genImage } =
      await request.json();

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY não configurada. Adicione no arquivo .env.local" },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: geminiKey });

    // Gera conteúdo com Gemini
    const textResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: buildArticlePrompt(keyword, category, locale, tone),
      config: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    });

    const rawContent = textResponse.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Parse JSON da resposta
    const jsonMatch = rawContent.match(/```json\n?([\s\S]*?)\n?```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : rawContent;

    let articleData;
    try {
      articleData = JSON.parse(jsonStr);
    } catch {
      articleData = JSON.parse(rawContent);
    }

    // Gera imagem com Gemini se solicitado
    let imageUrl: string | null = null;
    if (genImage && articleData.imagePrompt) {
      imageUrl = await generateImageWithGemini(ai, articleData.imagePrompt);
    }

    return NextResponse.json({
      ...articleData,
      imageUrl,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("Content generation error:", error);
    const message = error instanceof Error ? error.message : "Erro na geração";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
