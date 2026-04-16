"""
============================================
FÁBRICA DE LIBERDADE — Gerador de Imagens
============================================
Gera imagens profissionais para artigos usando DALL-E 3.

Uso:
  python image_generator.py --prompt "AI tools technology" --output cover.png
"""

import os
import sys
import argparse
import requests
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


def enhance_prompt(prompt: str) -> str:
    """Melhora o prompt para gerar imagens mais profissionais."""
    return (
        f"{prompt}. "
        "Professional blog cover image, dark tech aesthetic, "
        "cinematic lighting, high contrast, no text, no watermarks, "
        "futuristic design elements, 16:9 aspect ratio, "
        "suitable for technology blog, ultra-detailed, 4K quality."
    )


def generate_image_for_article(
    prompt: str,
    size: str = "1792x1024",
    quality: str = "standard",
) -> str | None:
    """
    Gera imagem com DALL-E 3 e retorna a URL.

    Args:
        prompt: Descrição da imagem
        size: "1024x1024", "1024x1792", "1792x1024"
        quality: "standard" ou "hd" (HD = 2x custo)

    Returns:
        URL da imagem gerada ou None em caso de erro
    """
    if not OPENAI_API_KEY:
        print("⚠️ OPENAI_API_KEY não configurada. Imagem não gerada.")
        return None

    enhanced = enhance_prompt(prompt)

    response = requests.post(
        "https://api.openai.com/v1/images/generations",
        headers={
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": "dall-e-3",
            "prompt": enhanced,
            "n": 1,
            "size": size,
            "quality": quality,
            "response_format": "url",
        },
        timeout=60,
    )

    if not response.ok:
        print(f"❌ Erro DALL-E: {response.status_code} — {response.text}")
        return None

    data = response.json()
    url = data["data"][0]["url"]
    revised = data["data"][0].get("revised_prompt", "")

    if revised:
        print(f"📝 Prompt ajustado pelo DALL-E: {revised[:100]}...")

    return url


def download_image(url: str, output_path: str) -> bool:
    """Faz download da imagem para arquivo local."""
    response = requests.get(url, timeout=30)
    if response.ok:
        with open(output_path, "wb") as f:
            f.write(response.content)
        return True
    return False


def generate_multiple_sizes(prompt: str, base_name: str = "article") -> dict:
    """
    Gera a imagem de capa + versão quadrada para social media.
    """
    results = {}

    # Capa do artigo (wide)
    url_wide = generate_image_for_article(prompt, size="1792x1024")
    if url_wide:
        results["cover"] = url_wide
        download_image(url_wide, f"{base_name}-cover.png")
        print(f"✅ Capa salva: {base_name}-cover.png")

    # Social media (square)
    url_square = generate_image_for_article(prompt, size="1024x1024")
    if url_square:
        results["social"] = url_square
        download_image(url_square, f"{base_name}-social.png")
        print(f"✅ Social salva: {base_name}-social.png")

    return results


# ============================================
# CLI
# ============================================
def main():
    parser = argparse.ArgumentParser(description="Gerador de Imagens com DALL-E 3")
    parser.add_argument("--prompt", "-p", required=True, help="Descrição da imagem")
    parser.add_argument("--output", "-o", default="image.png", help="Arquivo de saída")
    parser.add_argument("--size", "-s", default="1792x1024",
                       choices=["1024x1024", "1024x1792", "1792x1024"])
    parser.add_argument("--quality", "-q", default="standard", choices=["standard", "hd"])
    parser.add_argument("--multiple", "-m", action="store_true",
                       help="Gera versão wide + square")

    args = parser.parse_args()

    print(f"🎨 Gerando imagem com DALL-E 3...")
    print(f"📝 Prompt: {args.prompt}")

    if args.multiple:
        base = args.output.replace(".png", "")
        results = generate_multiple_sizes(args.prompt, base)
        print(f"\n✅ Geradas {len(results)} imagens")
    else:
        url = generate_image_for_article(args.prompt, args.size, args.quality)

        if url:
            if download_image(url, args.output):
                print(f"✅ Imagem salva: {args.output}")
            else:
                print(f"✅ URL da imagem: {url}")
        else:
            print("❌ Falha na geração")
            sys.exit(1)


if __name__ == "__main__":
    main()
