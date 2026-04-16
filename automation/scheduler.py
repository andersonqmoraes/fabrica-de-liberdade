"""
============================================
FÁBRICA DE LIBERDADE — Agendador de Conteúdo
============================================
Automatiza a publicação de artigos em horários estratégicos.
Roda como processo contínuo (pode usar cron job ou PM2).

Uso:
  python scheduler.py                  # Roda o scheduler
  python scheduler.py --once           # Executa uma vez e sai
  python scheduler.py --dry-run        # Simula sem salvar
"""

import os
import json
import random
import schedule
import time
import logging
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from content_generator import generate_article, save_to_firebase
from image_generator import generate_image_for_article

load_dotenv()

# ============================================
# Config
# ============================================
ARTICLES_PER_DAY = int(os.getenv("ARTICLES_PER_DAY", "3"))
AUTO_PUBLISH = os.getenv("AUTO_PUBLISH", "false").lower() == "true"
DEFAULT_LOCALE = os.getenv("DEFAULT_LOCALE", "pt-BR")

# Horários estratégicos de publicação (maior tráfego)
PUBLISH_TIMES = ["07:00", "12:00", "18:00", "21:00"]

# Log
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("automation.log"),
    ],
)
log = logging.getLogger(__name__)

# ============================================
# Keywords Database
# Adicione suas keywords de alta rentabilidade
# ============================================
KEYWORD_DATABASE = {
    "ai-tools": {
        "pt-BR": [
            "melhores ferramentas de IA para criar conteúdo em 2025",
            "ChatGPT vs Claude qual é melhor em 2025",
            "ferramentas de IA gratuitas para produtividade",
            "como usar inteligência artificial para ganhar dinheiro",
            "Midjourney vs DALL-E 3 qual gera melhores imagens",
            "melhores IAs para escrever textos profissionais",
            "ferramentas de IA para criar vídeos grátis",
            "como automatizar seu negócio com IA",
        ],
        "en": [
            "best AI tools for content creation 2025",
            "ChatGPT alternatives for business",
            "AI tools to make money online",
            "best free AI writing tools",
        ],
    },
    "make-money": {
        "pt-BR": [
            "como ganhar dinheiro com blog de tecnologia",
            "melhores programas de afiliados de tecnologia",
            "como criar renda passiva com IA",
            "sites para ganhar dinheiro online em 2025",
            "como monetizar canal do YouTube com tecnologia",
        ],
    },
    "productivity": {
        "pt-BR": [
            "melhores apps de produtividade para 2025",
            "como usar Notion para organizar sua vida",
            "ferramentas de automação para trabalho remoto",
            "apps gratuitos que aumentam produtividade",
        ],
    },
    "tech-reviews": {
        "pt-BR": [
            "review completo do Copilot Pro vale a pena",
            "análise honesta das melhores VPNs de 2025",
            "melhor hospedagem para blog qual escolher",
        ],
    },
}


def get_next_keyword(category: str = None, locale: str = None) -> tuple[str, str, str]:
    """Seleciona próxima keyword do banco de dados."""
    locale = locale or DEFAULT_LOCALE
    category = category or random.choice(list(KEYWORD_DATABASE.keys()))

    keywords = KEYWORD_DATABASE.get(category, {}).get(locale, [])
    if not keywords:
        # Fallback para pt-BR
        keywords = KEYWORD_DATABASE.get(category, {}).get("pt-BR", [])

    # Prefere keywords não usadas recentemente
    used_file = Path("used_keywords.json")
    used = []
    if used_file.exists():
        with open(used_file) as f:
            used = json.load(f)

    available = [k for k in keywords if k not in used[-20:]]
    if not available:
        available = keywords

    keyword = random.choice(available)

    # Registra como usada
    used.append(keyword)
    with open(used_file, "w") as f:
        json.dump(used[-50:], f, ensure_ascii=False)

    return keyword, category, locale


def run_generation_job(
    category: str = None,
    locale: str = None,
    dry_run: bool = False,
) -> bool:
    """Executa um job de geração de artigo."""

    keyword, cat, loc = get_next_keyword(category, locale)

    log.info(f"🚀 Iniciando geração: '{keyword}' [{cat}] [{loc}]")

    if dry_run:
        log.info(f"🔍 DRY RUN — não salvando")
        return True

    try:
        # 1. Gera conteúdo
        article_data = generate_article(keyword=keyword, category=cat, locale=loc)

        # 2. Gera imagem
        image_url = ""
        image_prompt = article_data.get("imagePrompt", keyword)
        try:
            image_url = generate_image_for_article(image_prompt) or ""
            log.info(f"🖼️ Imagem gerada")
        except Exception as e:
            log.warning(f"⚠️ Imagem não gerada: {e}")

        # 3. Salva no Firebase
        article_id = save_to_firebase(
            article_data=article_data,
            keyword=keyword,
            category=cat,
            locale=loc,
            image_url=image_url,
            publish=AUTO_PUBLISH,
        )

        log.info(f"✅ Artigo salvo: {article_id} — '{article_data['title']}'")

        # 4. Log de resultados
        with open("generation_log.json", "a") as f:
            f.write(json.dumps({
                "timestamp": datetime.now().isoformat(),
                "keyword": keyword,
                "category": cat,
                "locale": loc,
                "article_id": article_id,
                "title": article_data["title"],
                "published": AUTO_PUBLISH,
            }) + "\n")

        return True

    except Exception as e:
        log.error(f"❌ Erro na geração: {e}")
        return False


# ============================================
# Schedule
# ============================================
def setup_schedule():
    """Configura o schedule de publicações."""
    publish_times = PUBLISH_TIMES[:ARTICLES_PER_DAY]

    for t in publish_times:
        schedule.every().day.at(t).do(run_generation_job)
        log.info(f"📅 Agendado: {t}")

    log.info(f"\n{'='*40}")
    log.info(f"🏭 Fábrica de Liberdade — Scheduler ativo")
    log.info(f"📰 {ARTICLES_PER_DAY} artigos por dia")
    log.info(f"🌍 Idioma padrão: {DEFAULT_LOCALE}")
    log.info(f"📢 Auto-publicar: {'Sim' if AUTO_PUBLISH else 'Não (rascunho)'}")
    log.info(f"{'='*40}\n")


# ============================================
# Main
# ============================================
def main():
    import argparse

    parser = argparse.ArgumentParser(description="Fábrica de Liberdade — Scheduler")
    parser.add_argument("--once", action="store_true", help="Executa uma vez e sai")
    parser.add_argument("--dry-run", action="store_true", help="Simula sem salvar")
    parser.add_argument("--category", "-c", help="Categoria específica")
    parser.add_argument("--locale", "-l", default=DEFAULT_LOCALE)

    args = parser.parse_args()

    if args.once:
        run_generation_job(
            category=args.category,
            locale=args.locale,
            dry_run=args.dry_run,
        )
        return

    setup_schedule()

    log.info("⏰ Scheduler rodando... (Ctrl+C para parar)")
    while True:
        schedule.run_pending()
        time.sleep(60)


if __name__ == "__main__":
    main()
