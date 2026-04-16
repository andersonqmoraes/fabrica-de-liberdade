import Image from "next/image";
import { useTranslations } from "next-intl";
import { Star, ExternalLink, Tag, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AffiliateLink } from "@/types";

interface AffiliateBoxProps {
  links: AffiliateLink[];
  title?: string;
  variant?: "cards" | "table" | "single";
}

const platformConfig = {
  amazon: {
    name: "Amazon",
    color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    icon: "🛒",
    ctaKey: "amazonCta" as const,
  },
  mercadolivre: {
    name: "Mercado Livre",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    icon: "🛍️",
    ctaKey: "mlCta" as const,
  },
  aliexpress: {
    name: "AliExpress",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: "📦",
    ctaKey: "aliCta" as const,
  },
  hotmart: {
    name: "Hotmart",
    color: "bg-brand-500/20 text-brand-400 border-brand-500/30",
    icon: "🔥",
    ctaKey: "amazonCta" as const,
  },
  saas: {
    name: "SaaS",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: "⚡",
    ctaKey: "amazonCta" as const,
  },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "w-3.5 h-3.5",
            star <= rating ? "text-gold-400 fill-gold-400" : "text-dark-300"
          )}
        />
      ))}
    </div>
  );
}

export function AffiliateBox({ links, title, variant = "cards" }: AffiliateBoxProps) {
  const t = useTranslations("affiliate");

  if (links.length === 0) return null;

  return (
    <div className="my-8 p-6 bg-dark-600/50 border border-brand-500/20 rounded-2xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 bg-brand-500/20 rounded-lg flex items-center justify-center">
          <Tag className="w-4 h-4 text-brand-400" />
        </div>
        <h3 className="font-display font-bold text-gray-200">
          {title || "Produtos Recomendados"}
        </h3>
      </div>

      {/* Disclaimer */}
      <p className="text-gray-600 text-xs mb-5 italic">{t("disclaimer")}</p>

      {/* Products */}
      {variant === "cards" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {links.map((link) => {
            const config = platformConfig[link.type] || platformConfig.amazon;
            return (
              <div
                key={link.id}
                className="bg-dark-700 border border-dark-400 rounded-xl p-4 hover:border-brand-500/30 transition-colors"
              >
                <div className="flex gap-3">
                  {link.productImage && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-dark-600">
                      <Image
                        src={link.productImage}
                        alt={link.productName}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {link.badge && (
                      <span className="badge badge-gold text-xs mb-2">
                        <TrendingUp className="w-3 h-3" />
                        {link.badge}
                      </span>
                    )}
                    <h4 className="font-semibold text-sm text-gray-200 line-clamp-2 mb-1">
                      {link.productName}
                    </h4>
                    {link.rating && <StarRating rating={link.rating} />}
                    {link.price && (
                      <div className="font-bold text-brand-400 mt-1">{link.price}</div>
                    )}
                  </div>
                </div>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow sponsored"
                  className={cn(
                    "mt-3 flex items-center justify-center gap-2 w-full py-2 rounded-lg border text-xs font-semibold transition-colors",
                    config.color
                  )}
                >
                  <span>{config.icon}</span>
                  {t(config.ctaKey)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            );
          })}
        </div>
      )}

      {variant === "table" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-400">
                <th className="text-left py-3 px-3 text-gray-500 font-medium">Produto</th>
                <th className="text-left py-3 px-3 text-gray-500 font-medium">Nota</th>
                <th className="text-left py-3 px-3 text-gray-500 font-medium">Preço</th>
                <th className="text-left py-3 px-3 text-gray-500 font-medium">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-400">
              {links.map((link) => {
                const config = platformConfig[link.type] || platformConfig.amazon;
                return (
                  <tr key={link.id} className="hover:bg-dark-600 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        {link.badge && (
                          <span className="badge-gold badge text-xs">{link.badge}</span>
                        )}
                        <span className="text-gray-200 font-medium">{link.productName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {link.rating && <StarRating rating={link.rating} />}
                    </td>
                    <td className="py-3 px-3 text-brand-400 font-bold">
                      {link.price || "—"}
                    </td>
                    <td className="py-3 px-3">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow sponsored"
                        className={cn("badge border text-xs", config.color)}
                      >
                        {config.icon} {config.name}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
