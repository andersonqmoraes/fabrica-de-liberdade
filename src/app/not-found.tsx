import Link from "next/link";
import { Home, Zap } from "lucide-react";

// Root not-found (outside locale) — minimal, no next-intl context
export default function RootNotFound() {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-dark-800 text-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <div className="relative mb-8 inline-block">
            <div className="font-bold text-[120px] leading-none text-dark-500 select-none" style={{ fontFamily: "system-ui" }}>
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center">
                <Zap className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Página não encontrada</h1>
          <p className="text-gray-400 mb-8">A página que você procura não existe.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-medium transition-colors text-sm"
          >
            <Home className="w-4 h-4" />
            Voltar ao início
          </Link>
        </div>
      </body>
    </html>
  );
}
