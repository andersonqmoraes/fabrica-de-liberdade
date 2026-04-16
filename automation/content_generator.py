"""
============================================
FÁBRICA DE LIBERDADE — Gerador de Conteúdo
============================================
Gera artigos completos e otimizados para SEO usando Claude (Anthropic).
Salva automaticamente no Firebase Firestore.

Uso:
  python content_generator.py --keyword "melhores ferramentas de IA" --locale pt-BR
  python content_generator.py --keyword "best AI tools 2025" --locale en --publish
"""

import os
import sys
import json
import argparse
from datetime import datetime, timezone

import anthropic
from dotenv import load_dotenv
from slugify import slugify
import firebase_admin
from firebase_admin import credentials, firestore

load_dotenv()

# ============================================
# Config
# ============================================
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
FIREBASE_SERVICE_ACCOUNT = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "./firebase-service-account.json")
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID")

CATEGORIES = {
    "ai-tools": "Ferramentas de IA",
    "productivity": "Produtividade",
    "tech-reviews": "Reviews de Tecnologia",
    "make-money": "Ganhar Dinheiro Online",
    "automation": "Automação",
    "software": "Software & Apps",
}

LOCALE_NAMES = {
    "pt-BR": "Português Brasileiro",
    "en": "English",
    "es": "Español",
}


# ============================================
# Firebase
# ============================================
def init_firebase():
    if not firebase_admin._apps:
        cred = credentials.Certificate(FIREBASE_SERVICE_ACCOUNT)
        firebase_admin.initialize_app(cred, {"projectId": FIREBASE_PROJECT_ID})
    return firestore.client()


# ============================================
# Prompt Builder
# ============================================
def build_seo_prompt(keyword: str, category: str, locale: str, tone: str = "professional") -> str:
    tone_guides = {
        "professional": "Profissional e autoritário, baseado em dados e fatos verificados",
        "casual": "Casual e acessível, como um amigo experiente explicando de forma simples",
        "educational": "Didático e passo a passo, ótimo para iniciantes",
        "persuasive": "Persuasivo com provas sociais, urgência sutil e CTAs fortes",
    }

    affiliate_context = """
**Integração de afiliados (muito importante):**
- Mencione produtos específicos por nome (Amazon/ML/AliExpress/Hotmart)
- Escreva texto como: "Veja o preço [PRODUTO] na Amazon →" (placeholder para link)
- Priorize produtos com alta comissão no nicho
- Use CTAs como: "Melhor preço garantido", "Economize hoje"
"""

    return f"""Você é um especialista sênior em SEO, marketing de conteúdo e monetização de blogs.
Crie um artigo premium e completo em {LOCALE_NAMES.get(locale, locale)}.

**Keyword principal:** "{keyword}"
**Categoria:** {CATEGORIES.get(category, category)}
**Tom:** {tone_guides.get(tone, tone_guides['professional'])}

{affiliate_context}

**ESTRUTURA OBRIGATÓRIA:**
1. H1: Título com keyword (60-65 chars)
2. Introdução impactante (150-200 palavras) + estatística relevante
3. 4-6 seções H2 com conteúdo detalhado
4. Subseções H3 onde aplicável
5. Tabela comparativa (se relevante)
6. Prós e Contras em lista
7. Seção "Como Começar" ou "Passo a Passo"
8. FAQ com 5-7 perguntas (rich snippets)
9. Conclusão com CTA forte

**SEO TÉCNICO:**
- Densidade keyword: 1-2% (natural, não forçado)
- LSI keywords incluídos organicamente
- Frases de transição para boa legibilidade
- Parágrafos curtos (3-4 linhas máx.)
- Listas e tabelas para scanabilidade

**OUTPUT — APENAS este JSON sem texto adicional:**
{{
  "title": "Título H1 otimizado",
  "metaTitle": "Meta title (60-65 chars com keyword)",
  "metaDescription": "Meta description (150-160 chars, persuasivo)",
  "excerpt": "Resumo de 2-3 frases para preview",
  "content": "Artigo completo em Markdown",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "imagePrompt": "Prompt para DALL-E 3 (em inglês, descritivo)",
  "affiliateKeywords": ["produto1 para buscar", "produto2"],
  "wordCount": 2500,
  "readTime": 12,
  "faqSchema": [
    {{"question": "Pergunta?", "answer": "Resposta completa."}}
  ]
}}"""


# ============================================
# Generator
# ============================================
def generate_article(
    keyword: str,
    category: str = "ai-tools",
    locale: str = "pt-BR",
    tone: str = "professional",
) -> dict:
    """Gera artigo completo usando Claude."""

    if not ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY não configurada no .env")

    print(f"\n{'='*50}")
    print(f"🤖 Gerando artigo com Claude...")
    print(f"📌 Keyword: {keyword}")
    print(f"🌍 Idioma: {locale} | 📁 Categoria: {category}")
    print(f"{'='*50}\n")

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    prompt = build_seo_prompt(keyword, category, locale, tone)

    print("✍️  Chamando API do Claude...")

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=8192,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = message.content[0].text

    # Extrai JSON
    json_start = raw.find("{")
    json_end = raw.rfind("}") + 1
    json_str = raw[json_start:json_end]

    data = json.loads(json_str)

    print(f"\n✅ Artigo gerado!")
    print(f"   📝 Título: {data['title']}")
    print(f"   📊 Palavras: ~{data.get('wordCount', '?')}")
    print(f"   ⏱️  Leitura: {data.get('readTime', '?')} min")

    return data


def save_to_firebase(
    article_data: dict,
    keyword: str,
    category: str,
    locale: str,
    image_url: str = "",
    publish: bool = False,
) -> str:
    """Salva artigo no Firebase Firestore."""

    print("\n💾 Salvando no Firebase...")

    db = init_firebase()

    article = {
        "slug": slugify(article_data["title"]),
        "status": "published" if publish else "draft",
        "translations": {
            locale: {
                "title": article_data["title"],
                "excerpt": article_data["excerpt"],
                "content": article_data["content"],
                "metaTitle": article_data.get("metaTitle", article_data["title"]),
                "metaDescription": article_data.get("metaDescription", article_data["excerpt"]),
                "focusKeyword": keyword,
            }
        },
        "category": category,
        "tags": article_data.get("tags", []),
        "featuredImage": image_url or "",
        "hasAdsense": True,
        "readTime": article_data.get("readTime", 10),
        "views": 0,
        "publishedAt": datetime.now(timezone.utc).isoformat(),
        "createdAt": firestore.SERVER_TIMESTAMP,
        "updatedAt": firestore.SERVER_TIMESTAMP,
        "generatedByAI": True,
        "aiModel": "claude-sonnet-4-6",
        "targetKeyword": keyword,
        "affiliateLinks": [],
    }

    # Adiciona FAQ schema se existir
    if article_data.get("faqSchema"):
        article["structuredData"] = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": faq["question"],
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": faq["answer"]
                    }
                }
                for faq in article_data["faqSchema"]
            ]
        }

    doc_ref = db.collection("articles").add(article)
    article_id = doc_ref[1].id

    print(f"✅ Artigo salvo com ID: {article_id}")
    print(f"   Status: {'Publicado' if publish else 'Rascunho'}")

    return article_id


# ============================================
# CLI
# ============================================
def main():
    parser = argparse.ArgumentParser(description="Fábrica de Liberdade — Gerador de Conteúdo")
    parser.add_argument("--keyword", "-k", required=True, help="Keyword alvo do artigo")
    parser.add_argument("--category", "-c", default="ai-tools", choices=list(CATEGORIES.keys()))
    parser.add_argument("--locale", "-l", default="pt-BR", choices=["pt-BR", "en", "es"])
    parser.add_argument("--tone", "-t", default="professional",
                       choices=["professional", "casual", "educational", "persuasive"])
    parser.add_argument("--publish", "-p", action="store_true", help="Publica imediatamente")
    parser.add_argument("--output", "-o", help="Salvar JSON localmente também")

    args = parser.parse_args()

    try:
        # 1. Gera conteúdo
        article_data = generate_article(
            keyword=args.keyword,
            category=args.category,
            locale=args.locale,
            tone=args.tone,
        )

        # 2. Opcional: salvar JSON local
        if args.output:
            with open(args.output, "w", encoding="utf-8") as f:
                json.dump(article_data, f, ensure_ascii=False, indent=2)
            print(f"\n📄 JSON salvo em: {args.output}")

        # 3. Salva no Firebase
        article_id = save_to_firebase(
            article_data=article_data,
            keyword=args.keyword,
            category=args.category,
            locale=args.locale,
            publish=args.publish,
        )

        print(f"\n🎉 Processo concluído!")
        print(f"   🔗 Admin: /admin/artigos/{article_id}")
        if args.publish:
            print(f"   🌐 Site: /blog/{slugify(article_data['title'])}")

    except json.JSONDecodeError as e:
        print(f"\n❌ Erro ao parsear JSON da resposta: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
