import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: NextRequest) {
  try {
    const { title, excerpt, content, metaTitle, metaDescription, focusKeyword, sourceLocale, targetLocale } =
      await request.json();

    if (!content || !sourceLocale || !targetLocale) {
      return NextResponse.json({ error: "content, sourceLocale e targetLocale são obrigatórios." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY não configurada." }, { status: 400 });
    }

    const localeNames: Record<string, string> = {
      "pt-BR": "português brasileiro",
      en: "English",
      es: "español",
    };

    const sourceName = localeNames[sourceLocale] || sourceLocale;
    const targetName = localeNames[targetLocale] || targetLocale;

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a professional translator specializing in tech, AI tools, and productivity content.

Translate the following blog article fields from ${sourceName} to ${targetName}.

Rules:
- Maintain the exact Markdown formatting in the content field
- Keep SEO optimization in mind — translate keywords naturally
- Preserve technical terms (AI, ChatGPT, API, etc.) as-is
- Adapt idioms naturally for the target language, don't translate literally
- Return ONLY valid JSON, no markdown code blocks

Input:
${JSON.stringify({ title, excerpt, content, metaTitle, metaDescription, focusKeyword }, null, 2)}

Return a JSON object with the same fields translated to ${targetName}:
{
  "title": "...",
  "excerpt": "...",
  "content": "...",
  "metaTitle": "...",
  "metaDescription": "...",
  "focusKeyword": "..."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });

    const text = response.text ?? "";

    // Parse JSON from response
    let parsed: Record<string, string> | null = null;
    try {
      parsed = JSON.parse(text.trim());
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch { /* continue */ }
      }
    }

    if (!parsed) {
      return NextResponse.json({ error: "Falha ao parsear resposta do Gemini.", raw: text }, { status: 500 });
    }

    return NextResponse.json({ success: true, translation: parsed });
  } catch (error: unknown) {
    console.error("Translate error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao traduzir" },
      { status: 500 }
    );
  }
}
