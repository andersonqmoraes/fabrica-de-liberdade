"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowRight, Bot, Cpu, TrendingUp, Zap, ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";

interface HeroStats {
  totalArticles?: number;
  publishedArticles?: number;
  totalViews?: number;
}

interface HeroSectionProps {
  stats?: HeroStats | null;
}

function formatStatValue(value: number | undefined, fallback: string): string {
  if (!value) return fallback;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k+`;
  if (value > 100) return `${Math.floor(value / 10) * 10}+`;
  return `${value}`;
}

export function HeroSection({ stats }: HeroSectionProps) {
  const t = useTranslations("hero");
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!glowRef.current) return;
      const rect = glowRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      glowRef.current.style.setProperty("--mouse-x", `${x}%`);
      glowRef.current.style.setProperty("--mouse-y", `${y}%`);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const statItems = [
    {
      key: "articles",
      value: formatStatValue(stats?.publishedArticles, "500+"),
      icon: Bot,
    },
    {
      key: "tools",
      value: "200+",
      icon: Cpu,
    },
    {
      key: "readers",
      value: formatStatValue(stats?.totalViews, "50k+"),
      icon: TrendingUp,
    },
  ];

  return (
    <section
      ref={glowRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background layers */}
      <div className="absolute inset-0 bg-dark-800" />
      <div className="absolute inset-0 bg-hero-gradient" />

      {/* Animated grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/3 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 container-main text-center pt-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 border border-brand-500/30 rounded-full text-brand-400 text-sm font-medium mb-8 animate-fade-in">
          <div className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
          {t("badge")}
        </div>

        {/* Headline */}
        <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl xl:text-8xl tracking-tight mb-6 animate-slide-up">
          <span className="text-white block">{t("headline1")}</span>
          <span className="gradient-text block">{t("headline2")}</span>
          <span className="text-white block">{t("headline3")}</span>
        </h1>

        {/* Subheadline */}
        <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-in">
          {t("subheadline")}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in">
          <Link href="/blog" className="btn-primary text-base px-8 py-4 w-full sm:w-auto">
            <Zap className="w-5 h-5" />
            {t("cta1")}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/ferramentas" className="btn-secondary text-base px-8 py-4 w-full sm:w-auto">
            {t("cta2")}
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto animate-fade-in">
          {statItems.map(({ key, value, icon: Icon }) => (
            <div key={key} className="text-center group">
              <div className="flex items-center justify-center mb-2">
                <div className="w-10 h-10 bg-brand-500/10 border border-brand-500/20 rounded-lg flex items-center justify-center group-hover:bg-brand-500/20 transition-colors">
                  <Icon className="w-5 h-5 text-brand-400" />
                </div>
              </div>
              <div className="font-display font-bold text-2xl sm:text-3xl text-white">
                {value}
              </div>
              <div className="text-gray-600 text-xs sm:text-sm mt-0.5">
                {t(`stats.${key}`)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600 animate-bounce">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    </section>
  );
}
