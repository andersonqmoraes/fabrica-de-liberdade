import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Logo } from "./Logo";
import {
  Instagram,
  Youtube,
  Twitter,
  Send,
  ArrowRight,
} from "lucide-react";

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-700 border-t border-dark-400 mt-auto">
      {/* Main footer */}
      <div className="container-main py-14 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="w-fit block mb-4">
              <Logo size="sm" />
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              {t("tagline")}
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3">
              {[
                { Icon: Instagram, href: "https://instagram.com/fabricadeliberdade", label: "Instagram" },
                { Icon: Youtube, href: "https://youtube.com/@fabricadeliberdade", label: "YouTube" },
                { Icon: Twitter, href: "https://twitter.com/fabricadeliberdade", label: "Twitter" },
                { Icon: Send, href: "https://t.me/fabricadeliberdade", label: "Telegram" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 bg-dark-600 hover:bg-brand-500/20 border border-dark-400 hover:border-brand-500/40 rounded-lg flex items-center justify-center text-gray-500 hover:text-brand-400 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Content links */}
          <div>
            <h3 className="font-display font-semibold text-gray-200 text-sm uppercase tracking-wider mb-5">
              {t("sections.content")}
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/blog", label: t("links.blog") },
                { href: "/blog?categoria=ai-tools", label: "Ferramentas de IA" },
                { href: "/blog?categoria=productivity", label: "Produtividade" },
                { href: "/blog?categoria=make-money", label: "Ganhar Dinheiro" },
                { href: "/blog?categoria=tech-reviews", label: "Reviews" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href as any}
                    className="text-gray-500 hover:text-brand-400 text-sm transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools links */}
          <div>
            <h3 className="font-display font-semibold text-gray-200 text-sm uppercase tracking-wider mb-5">
              {t("sections.tools")}
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/ferramentas", label: "Todas as ferramentas" },
                { href: "/ferramentas?tipo=gratis", label: "Ferramentas grátis" },
                { href: "/ferramentas?tipo=ia", label: "Ferramentas de IA" },
                { href: "/ferramentas?tipo=produtividade", label: "Produtividade" },
                { href: "/ferramentas?tipo=automacao", label: "Automação" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href as any}
                    className="text-gray-500 hover:text-brand-400 text-sm transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="font-display font-semibold text-gray-200 text-sm uppercase tracking-wider mb-5">
              {t("sections.company")}
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/sobre", label: t("links.about") },
                { href: "/contato", label: t("links.contact") },
                { href: "/privacidade", label: t("links.privacy") },
                { href: "/termos", label: t("links.terms") },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href as any}
                    className="text-gray-500 hover:text-brand-400 text-sm transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-dark-400">
        <div className="container-main py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-600 text-sm">
              © {currentYear} Fábrica de Liberdade. {t("copyright")}
            </p>
            <p className="text-gray-700 text-xs flex items-center gap-1.5">
              {t("madeWith")} ☕
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
