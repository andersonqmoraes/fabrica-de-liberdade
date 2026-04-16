"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Globe, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

const languages: { code: Locale; label: string; flag: string }[] = [
  { code: "pt-BR", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const current = languages.find((l) => l.code === locale) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function switchLocale(newLocale: Locale) {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
          isOpen
            ? "bg-dark-500 text-gray-100"
            : "text-gray-400 hover:text-gray-100 hover:bg-dark-500"
        )}
        aria-label="Selecionar idioma"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{current.flag}</span>
        <span className="hidden sm:inline text-xs">{current.label.split(" ")[0]}</span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-dark-600 border border-dark-400 rounded-xl shadow-card overflow-hidden z-50 animate-fade-in">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLocale(lang.code)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 text-sm transition-colors duration-150",
                lang.code === locale
                  ? "bg-brand-500/10 text-brand-400"
                  : "text-gray-300 hover:bg-dark-500 hover:text-gray-100"
              )}
            >
              <span className="flex items-center gap-2.5">
                <span>{lang.flag}</span>
                <span className="font-medium">{lang.label}</span>
              </span>
              {lang.code === locale && (
                <Check className="w-4 h-4 text-brand-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
