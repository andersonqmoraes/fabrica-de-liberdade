import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ArticleCategory, Locale } from "@/types";

// Prompts otimizados para SEO e monetização
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
  "imagePrompt": "Prompt para geração de imagem DALL-E 3",
  "affiliateKeywords": ["produto1", "produto2"],
  "wordCount": 2500,
  "readTime": 12
}
\`\`\`

Gere APENAS o JSON, sem texto adicional.`;
}

async function generateImage(prompt: string): Promise<string | null> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `Professional blog thumbnail image for an article about ${prompt}. Dark theme, tech aesthetic, no text, high quality, 16:9 ratio.`,
        n: 1,
        size: "1792x1024",
        quality: "standard",
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.data?.[0]?.url || null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { keyword, category, locale, tone, generateImage: genImage } =
      await request.json();

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      return NextResponse.json(
        {
          error:
            "ANTHROPIC_API_KEY não configurada. Adicione no arquivo .env.local",
        },
        { status: 400 }
      );
    }

    // Gera conteúdo com Claude
    const client = new Anthropic({ apiKey: anthropicKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: buildArticlePrompt(keyword, category, locale, tone),
        },
      ],
    });

    const rawContent = message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON da resposta
    const jsonMatch = rawContent.match(/```json\n?([\s\S]*?)\n?```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : rawContent;

    let articleData;
    try {
      articleData = JSON.parse(jsonStr);
    } catch {
      // Tenta parse direto
      articleData = JSON.parse(rawContent);
    }

    // Gera imagem se solicitado
    let imageUrl: string | null = null;
    if (genImage && articleData.imagePrompt) {
      imageUrl = await generateImage(articleData.imagePrompt);
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
