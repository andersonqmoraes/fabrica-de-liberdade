"use client";

import { Share2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface ShareButtonProps {
  title: string;
}

export function ShareButton({ title }: ShareButtonProps) {
  const t = useTranslations("blog");

  return (
    <button
      className="flex items-center gap-1.5 text-gray-500 hover:text-brand-400 text-sm transition-colors"
      onClick={() => {
        if (navigator?.share) {
          navigator.share({ title, url: window.location.href });
        } else {
          navigator.clipboard.writeText(window.location.href);
        }
      }}
    >
      <Share2 className="w-4 h-4" />
      {t("share")}
    </button>
  );
}
