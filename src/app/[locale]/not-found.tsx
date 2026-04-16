import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Link } from "@/i18n/routing";
import { Home, Search, ArrowLeft, Zap } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen flex items-center">
        <div className="container-main py-20">
          <div className="max-w-lg mx-auto text-center">
            {/* Animated 404 */}
            <div className="relative mb-8 inline-block">
              <div className="font-display font-bold text-[120px] lg:text-[160px] leading-none text-dark-500 select-none">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center shadow-brand">
                  <Zap className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <h1 className="font-display font-bold text-3xl text-white mb-3">
              Página não encontrada
            </h1>
            <p className="text-gray-400 mb-10 leading-relaxed">
              Ops! A página que você está procurando não existe ou foi movida.
              Que tal explorar nosso conteúdo?
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" className="btn-primary text-sm">
                <Home className="w-4 h-4" />
                Ir para o início
              </Link>
              <Link href="/blog" className="btn-secondary text-sm">
                <Search className="w-4 h-4" />
                Explorar blog
              </Link>
            </div>

            {/* Quick links */}
            <div className="mt-14 pt-8 border-t border-dark-400">
              <p className="text-gray-600 text-sm mb-4">Links úteis</p>
              <div className="flex flex-wrap gap-3 justify-center">
                {[
                  { href: "/blog?categoria=ai-tools", label: "Ferramentas de IA" },
                  { href: "/blog?categoria=productivity", label: "Produtividade" },
                  { href: "/ferramentas", label: "Ferramentas" },
                  { href: "/sobre", label: "Sobre nós" },
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href as Parameters<typeof Link>[0]["href"]}
                    className="badge bg-dark-600 text-gray-400 border border-dark-400 hover:border-brand-500/30 hover:text-brand-400 transition-all text-sm py-1.5 px-3"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
