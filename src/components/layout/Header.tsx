"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Menu, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/" as const, label: t("home") },
    { href: "/blog" as const, label: t("blog") },
    { href: "/ferramentas" as const, label: t("tools") },
    { href: "/sobre" as const, label: t("about") },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-dark-800/95 backdrop-blur-md border-b border-dark-400 shadow-card"
          : "bg-transparent"
      )}
    >
      <div className="container-main">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center shadow-brand group-hover:shadow-brand-lg transition-all duration-300">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-white text-sm tracking-tight">
                Fábrica de
              </span>
              <span className="font-display font-bold text-brand-400 text-sm tracking-tight">
                Liberdade
              </span>
            </div>
          </Link>

          {/* Nav Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200",
                  pathname === link.href
                    ? "text-brand-400 bg-brand-500/10"
                    : "text-gray-400 hover:text-gray-100 hover:bg-dark-500"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            <Link
              href="/blog"
              className="hidden lg:inline-flex btn-primary text-sm px-5 py-2.5"
            >
              <Zap className="w-4 h-4" />
              Explorar
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-100 hover:bg-dark-500 rounded-lg transition-colors"
              aria-label="Menu"
            >
              {isMobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden transition-all duration-300 overflow-hidden",
          isMobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="container-main pb-4 border-t border-dark-400 mt-0 pt-4 bg-dark-800/95 backdrop-blur-md">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-xl font-medium transition-all duration-200",
                  pathname === link.href
                    ? "text-brand-400 bg-brand-500/10"
                    : "text-gray-300 hover:text-white hover:bg-dark-500"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
