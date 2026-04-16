import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import type { ArticleCategory, Locale } from "@/types";

function buildArticlePrompt(
  keyword: string,
  category: ArticleCategory,
  locale: Locale,
  tone: string,
  instructions: string
): string {
  const localeNames: Record<Locale, string> = {
    "pt-BR": "Português Brasileiro",
    en: "English",
    es: "Español",
  };

  const toneGuides: Record<string, string> = {
    professional: "Profissional, autoritário, baseado em dados e fatos concretos",
    casual: "Casual e acessível, como um amigo experiente explicando com exemplos reais",
    educational: "Didático, passo a passo, com exemplos práticos e clareza total",
    persuasive: "Persuasivo com provas sociais, benefícios claros e urgência sutil",
  };

  const extraInstructions = instructions?.trim()
    ? `\n**INSTRUÇÕES ADICIONAIS DO EDITOR:**\n${instructions}\n`
    : "";

  return `Você é um especialista sênior em SEO, marketing de conteúdo e monetização digital. Crie um artigo completo, otimizado para SEO em ${localeNames[locale]}.

**Keyword principal:** "${keyword}"
**Categoria:** ${category}
**Tom:** ${toneGuides[tone] || toneGuides.professional}
${extraInstructions}
**REQUISITOS OBRIGATÓRIOS:**
1. Título H1 otimizado com a keyword (55-65 caracteres)
2. Meta title SEO (50-60 caracteres)
3. Meta description persuasiva (150-160 caracteres)
4. Artigo completo de 2000-3000 palavras em Markdown
5. Estrutura: Introdução impactante → 4-6 seções H2 com subseções H3 → Conclusão com CTA forte
6. FAQ com 5-7 perguntas otimizadas para featured snippets do Google
7. Linguagem natural, sem jargão desnecessário, fluente e envolvente
8. Mencionar ferramentas/produtos específicos reais (oportunidades de links de afiliado)
9. CTA claro e persuasivo no final direcionando para ação
10. Prompt de imagem detalhado para geração visual

**FORMATO DE RESPOSTA — SOMENTE JSON, sem explicações:**
\`\`\`json
{
  "title": "Título do artigo (H1)",
  "metaTitle": "Meta title SEO",
  "metaDescription": "Meta description SEO",
  "excerpt": "Resumo atrativo de 2-3 frases para listagens",
  "content": "Conteúdo completo em Markdown com headers, listas, etc.",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "imagePrompt": "Prompt detalhado em inglês para geração de imagem de capa profissional",
  "affiliateKeywords": ["produto mencionado 1", "produto mencionado 2"],
  "wordCount": 2500,
  "readTime": 12
}
\`\`\``;
}

async function generateImageWithImagen(
  ai: GoogleGenAI,
  prompt: string
): Promise<string | null> {
  try {
    const response = await ai.models.generateImages({
      model: "imagen-3.0-generate-002",
      prompt: `Professional blog thumbnail for an article about: ${prompt}. Dark tech aesthetic, modern minimalist design, no text overlay, cinematic lighting, high quality, 16:9 ratio.`,
      config: {
        numberOfImages: 1,
        aspectRatio: "16:9",
      },
    });

    const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!imageBytes) return null;
    return `data:image/png;base64,${imageBytes}`;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { keyword, category, locale, tone, generateImage: genImage, instructions } =
      await request.json();

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY não configurada no .env.local" },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: geminiKey });

    // Gera conteúdo com Gemini 2.0 Flash
    const textResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: buildArticlePrompt(keyword, category, locale, tone, instructions || ""),
      config: {
        temperature: 0.75,
        maxOutputTokens: 8192,
      },
    });

    const rawContent = textResponse.text ?? "";

    // Parse JSON da resposta (aceita com ou sem bloco de código)
    const jsonMatch = rawContent.match(/```json\n?([\s\S]*?)\n?```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : rawContent.trim();

    let articleData: Record<string, unknown>;
    try {
      articleData = JSON.parse(jsonStr);
    } catch {
      // Última tentativa: remove possível lixo antes/depois do JSON
      const firstBrace = rawContent.indexOf("{");
      const lastBrace = rawContent.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1) {
        articleData = JSON.parse(rawContent.slice(firstBrace, lastBrace + 1));
      } else {
        throw new Error("Resposta da IA não é um JSON válido. Tente novamente.");
      }
    }

    // Gera imagem com Imagen 3 se solicitado
    let imageUrl: string | null = null;
    if (genImage && articleData.imagePrompt) {
      imageUrl = await generateImageWithImagen(ai, articleData.imagePrompt as string);
    }

    return NextResponse.json({
      ...articleData,
      imageUrl,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("Content generation error:", error);
    const message = error instanceof Error ? error.message : "Erro na geração de conteúdo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
