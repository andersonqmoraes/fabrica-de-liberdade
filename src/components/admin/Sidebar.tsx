"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { signOut } from "@/lib/firebase/auth";
import { useRouter } from "@/i18n/routing";
import {
  LayoutDashboard,
  FileText,
  Image,
  Bot,
  Settings,
  LogOut,
  Zap,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/admin",
    icon: LayoutDashboard,
    labelKey: "dashboard",
    exact: true,
  },
  {
    href: "/admin/artigos",
    icon: FileText,
    labelKey: "articles",
  },
  {
    href: "/admin/midia",
    icon: Image,
    labelKey: "media",
  },
  {
    href: "/admin/automacao",
    icon: Bot,
    labelKey: "automation",
  },
  {
    href: "/admin/configuracoes",
    icon: Settings,
    labelKey: "settings",
  },
] as const;

export function AdminSidebar() {
  const t = useTranslations("admin");
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/admin/login");
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-64 min-h-screen bg-dark-700 border-r border-dark-400 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-dark-400">
        <Link href="/" className="flex items-center gap-2.5 group" target="_blank">
          <div className="w-9 h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center shadow-brand">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-bold text-white text-sm">
              Fábrica de
            </span>
            <span className="font-display font-bold text-brand-400 text-sm">
              Liberdade
            </span>
          </div>
        </Link>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-600">
          <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
          Admin Panel
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, icon: Icon, labelKey, exact }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
              isActive(href, exact)
                ? "bg-brand-500/15 text-brand-400 border border-brand-500/20"
                : "text-gray-500 hover:bg-dark-600 hover:text-gray-200"
            )}
          >
            <Icon className="w-4.5 h-4.5 flex-shrink-0" />
            <span>{t(labelKey as keyof typeof t)}</span>
            {isActive(href, exact) && (
              <ChevronRight className="w-3.5 h-3.5 ml-auto" />
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-dark-400 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-300 hover:bg-dark-600 transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          Ver site
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          {t("logout")}
        </button>
      </div>
    </aside>
  );
}
