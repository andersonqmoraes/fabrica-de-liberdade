import { Info } from "lucide-react";
import type { Locale } from "@/types";

interface Props {
  locale: Locale;
  variant?: "inline" | "compact";
}

const TEXT: Record<Locale, { title: string; body: string }> = {
  "pt-BR": {
    title: "Aviso de afiliação",
    body: "Este artigo pode conter links de afiliados. Se você comprar algo através desses links, podemos receber uma pequena comissão sem nenhum custo adicional para você. Isso ajuda a manter o blog independente e sem patrocínio disfarçado. Recomendações são baseadas em avaliação editorial e não em valor de comissão.",
  },
  en: {
    title: "Affiliate disclosure",
    body: "This article may contain affiliate links. If you purchase something through these links, we may receive a small commission at no additional cost to you. This helps keep the blog independent and free from disguised sponsorship. Recommendations are based on editorial evaluation, not on commission value.",
  },
  es: {
    title: "Aviso de afiliación",
    body: "Este artículo puede contener enlaces de afiliados. Si compras algo a través de estos enlaces, podemos recibir una pequeña comisión sin ningún costo adicional para ti. Esto ayuda a mantener el blog independiente y sin patrocinio disfrazado. Las recomendaciones se basan en evaluación editorial, no en el valor de la comisión.",
  },
};

export function AffiliateDisclosure({ locale, variant = "inline" }: Props) {
  const t = TEXT[locale] || TEXT["pt-BR"];

  if (variant === "compact") {
    return (
      <p className="text-xs text-gray-600 italic mt-3">
        <Info className="w-3 h-3 inline mr-1" />
        {t.body}
      </p>
    );
  }

  return (
    <aside className="rounded-xl bg-dark-700/60 border border-dark-400 p-4 my-8 flex gap-3">
      <Info className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
      <div>
        <div className="text-sm font-medium text-gray-200 mb-1">{t.title}</div>
        <p className="text-xs text-gray-500 leading-relaxed">{t.body}</p>
      </div>
    </aside>
  );
}
