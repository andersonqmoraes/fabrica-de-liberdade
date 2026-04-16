import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Shield } from "lucide-react";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fabricadeliberdade.com.br";
  const titles: Record<string, string> = {
    "pt-BR": "Política de Privacidade — Fábrica de Liberdade",
    en: "Privacy Policy — Freedom Factory",
    es: "Política de Privacidad — Fábrica de Libertad",
  };
  return {
    title: titles[locale] || titles["pt-BR"],
    description: "Como coletamos, usamos e protegemos seus dados na Fábrica de Liberdade.",
    alternates: { canonical: `${siteUrl}/privacidade` },
  };
}

export default async function PrivacyPage() {
  const updatedAt = "16 de abril de 2025";

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen">
        {/* Hero */}
        <section className="py-14 bg-dark-700 border-b border-dark-400">
          <div className="container-main max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 border border-brand-500/30 rounded-full text-brand-400 text-sm font-medium mb-5">
              <Shield className="w-4 h-4" />
              Política de Privacidade
            </div>
            <h1 className="font-display font-bold text-4xl text-white mb-3">
              Sua privacidade importa
            </h1>
            <p className="text-gray-500 text-sm">Última atualização: {updatedAt}</p>
          </div>
        </section>

        {/* Content */}
        <section className="py-14">
          <div className="container-main max-w-3xl mx-auto">
            <article className="prose prose-invert prose-gray max-w-none space-y-10">

              <div className="card p-6 space-y-3">
                <h2 className="font-display font-bold text-xl text-white">1. Quem somos</h2>
                <p className="text-gray-400 leading-relaxed">
                  A <strong className="text-gray-200">Fábrica de Liberdade</strong> é um site editorial independente sobre inteligência artificial, tecnologia e produtividade. Nossa URL é <a href="https://fabricadeliberdade.com.br" className="text-brand-400 hover:underline">fabricadeliberdade.com.br</a>.
                </p>
              </div>

              <div className="card p-6 space-y-3">
                <h2 className="font-display font-bold text-xl text-white">2. Dados coletados</h2>
                <p className="text-gray-400 leading-relaxed">Coletamos apenas os dados necessários para o funcionamento do site:</p>
                <ul className="space-y-2 text-gray-400">
                  {[
                    "E-mail (quando você se inscreve na newsletter, voluntariamente)",
                    "Dados de navegação anônimos via Google Analytics (IP anonimizado, páginas visitadas, tempo de sessão)",
                    "Preferências de idioma (armazenadas localmente no seu navegador)",
                    "Dados técnicos do servidor (logs de acesso, necessários para segurança e performance)",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-brand-400 rounded-full mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card p-6 space-y-3">
                <h2 className="font-display font-bold text-xl text-white">3. Como usamos seus dados</h2>
                <ul className="space-y-2 text-gray-400">
                  {[
                    "E-mail: envio de newsletter com frequência máxima semanal. Você pode cancelar a qualquer momento.",
                    "Analytics: entender quais conteúdos são mais relevantes para melhorar o site.",
                    "Logs técnicos: prevenir abusos e manter a segurança da plataforma.",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-brand-400 rounded-full mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-gray-400 leading-relaxed">
                  <strong className="text-gray-200">Não vendemos, alugamos ou compartilhamos</strong> seus dados pessoais com terceiros, exceto quando exigido por lei.
                </p>
              </div>

              <div className="card p-6 space-y-3">
                <h2 className="font-display font-bold text-xl text-white">4. Cookies</h2>
                <p className="text-gray-400 leading-relaxed">Utilizamos cookies para:</p>
                <ul className="space-y-2 text-gray-400">
                  {[
                    "Manter sua preferência de idioma",
                    "Analytics anônimo (Google Analytics com anonimização de IP)",
                    "Publicidade contextual via Google AdSense (se você não recusou cookies de publicidade)",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-brand-400 rounded-full mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-gray-400 leading-relaxed">
                  Você pode desabilitar cookies nas configurações do seu navegador. Isso pode impactar algumas funcionalidades do site.
                </p>
              </div>

              <div className="card p-6 space-y-3">
                <h2 className="font-display font-bold text-xl text-white">5. Links de afiliados</h2>
                <p className="text-gray-400 leading-relaxed">
                  Alguns links neste site são links de afiliados (Amazon, Mercado Livre, Hotmart, entre outros). Se você clicar e realizar uma compra, podemos receber uma comissão sem custo adicional para você. Isso não influencia nossas recomendações editoriais.
                </p>
              </div>

              <div className="card p-6 space-y-3">
                <h2 className="font-display font-bold text-xl text-white">6. Seus direitos (LGPD)</h2>
                <p className="text-gray-400 leading-relaxed">Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:</p>
                <ul className="space-y-2 text-gray-400">
                  {[
                    "Saber quais dados temos sobre você",
                    "Solicitar a correção de dados incompletos ou incorretos",
                    "Solicitar a exclusão dos seus dados",
                    "Cancelar sua inscrição na newsletter a qualquer momento",
                    "Portabilidade dos dados",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-brand-400 rounded-full mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-gray-400 leading-relaxed">
                  Para exercer esses direitos, entre em contato: <a href="mailto:privacidade@fabricadeliberdade.com.br" className="text-brand-400 hover:underline">privacidade@fabricadeliberdade.com.br</a>
                </p>
              </div>

              <div className="card p-6 space-y-3">
                <h2 className="font-display font-bold text-xl text-white">7. Segurança</h2>
                <p className="text-gray-400 leading-relaxed">
                  Utilizamos HTTPS em todo o site, autenticação segura via Firebase e boas práticas de segurança. Porém, nenhum sistema é 100% inviolável. Em caso de incidente de segurança que afete seus dados, você será notificado dentro de 72 horas.
                </p>
              </div>

              <div className="card p-6 space-y-3">
                <h2 className="font-display font-bold text-xl text-white">8. Alterações nesta política</h2>
                <p className="text-gray-400 leading-relaxed">
                  Podemos atualizar esta política periodicamente. A data de atualização sempre será indicada no topo da página. O uso continuado do site após mudanças constitui aceitação da nova política.
                </p>
              </div>

              <div className="card p-6 space-y-3">
                <h2 className="font-display font-bold text-xl text-white">9. Contato</h2>
                <p className="text-gray-400 leading-relaxed">
                  Dúvidas sobre esta política? Fale conosco em{" "}
                  <a href="mailto:privacidade@fabricadeliberdade.com.br" className="text-brand-400 hover:underline">
                    privacidade@fabricadeliberdade.com.br
                  </a>{" "}
                  ou pelo{" "}
                  <a href="/contato" className="text-brand-400 hover:underline">formulário de contato</a>.
                </p>
              </div>

            </article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
