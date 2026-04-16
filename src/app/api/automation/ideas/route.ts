import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export interface ContentIdea {
  keyword: string;
  title: string;
  category: string;
  rationale: string;
  searchIntent: "informational" | "commercial" | "transactional";
  difficulty: "low" | "medium" | "high";
  monetization: string;
}

interface ExistingArticle {
  title: string;
  category: string;
  tags: string[];
  views?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { articles }: { articles: ExistingArticle[] } = await request.json();

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY não configurada no .env.local" },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: geminiKey });

    const articlesContext =
      articles.length > 0
        ? articles
            .slice(0, 20)
            .map(
              (a, i) =>
                `${i + 1}. "${a.title}" [${a.category}]${a.views ? ` — ${a.views} views` : ""}`
            )
            .join("\n")
        : "Nenhum artigo publicado ainda — site novo.";

    const prompt = `Você é um estrategista de conteúdo especializado em blogs de tecnologia, IA, produtividade e monetização digital no mercado brasileiro.

**SITE:** Fábrica de Liberdade (fabricadeliberdade.com.br)
**NICHO:** Ferramentas de IA, produtividade, automação, ganhar dinheiro online, reviews de software

**ARTIGOS JÁ PUBLICADOS:**
${articlesContext}

**SUA TAREFA:**
Analise o portfólio acima e sugira 8 ideias de conteúdo estratégicas que:
1. Complementem o que já existe (sem repetir temas)
2. Tenham alto potencial de tráfego orgânico no Brasil em 2025-2026
3. Tenham oportunidades claras de monetização (afiliados, AdSense)
4. Abordem gaps temáticos ou tendências emergentes
5. Misturem diferentes intenções de busca (informacional, comercial, transacional)

**RESPOSTA — SOMENTE JSON:**
\`\`\`json
{
  "ideas": [
    {
      "keyword": "keyword principal para SEO",
      "title": "Título sugerido para o artigo",
      "category": "ai-tools|productivity|tech-reviews|make-money|automation|software",
      "rationale": "Por que esse conteúdo vai performar bem e tem oportunidade",
      "searchIntent": "informational|commercial|transactional",
      "difficulty": "low|medium|high",
      "monetization": "Como monetizar: afiliado X, Y ou AdSense"
    }
  ]
}
\`\`\``;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
      config: { temperature: 0.8, maxOutputTokens: 4096 },
    });

    const rawContent = response.text ?? "";
    const jsonMatch = rawContent.match(/```json\n?([\s\S]*?)\n?```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : rawContent.trim();

    let data: { ideas: ContentIdea[] };
    try {
      data = JSON.parse(jsonStr);
    } catch {
      const firstBrace = rawContent.indexOf("{");
      const lastBrace = rawContent.lastIndexOf("}");
      data = JSON.parse(rawContent.slice(firstBrace, lastBrace + 1));
    }

    return NextResponse.json({ ideas: data.ideas || [] });
  } catch (error: unknown) {
    console.error("Ideas generation error:", error);
    const message = error instanceof Error ? error.message : "Erro ao gerar ideias";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
