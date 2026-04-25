import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FileText } from "lucide-react";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fabricadeliberdade.com.br";
  const localePath = locale === "pt-BR" ? "" : `/${locale}`;
  const titles: Record<string, string> = {
    "pt-BR": "Termos de Uso — Fábrica de Liberdade",
    en: "Terms of Use — Freedom Factory",
    es: "Términos de Uso — Fábrica de Libertad",
  };
  const descriptions: Record<string, string> = {
    "pt-BR": "Termos e condições de uso do site Fábrica de Liberdade.",
    en: "Terms and conditions of use for the Freedom Factory website.",
    es: "Términos y condiciones de uso del sitio Fábrica de Libertad.",
  };
  return {
    title: titles[locale] || titles["pt-BR"],
    description: descriptions[locale] || descriptions["pt-BR"],
    alternates: {
      canonical: `${siteUrl}${localePath}/termos`,
      languages: {
        "pt-BR": `${siteUrl}/termos`,
        en: `${siteUrl}/en/termos`,
        es: `${siteUrl}/es/termos`,
      },
    },
  };
}

export default async function TermsPage() {
  const updatedAt = "16 de abril de 2025";

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen">
        {/* Hero */}
        <section className="py-14 bg-dark-700 border-b border-dark-400">
          <div className="container-main max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 border border-brand-500/30 rounded-full text-brand-400 text-sm font-medium mb-5">
              <FileText className="w-4 h-4" />
              Termos de Uso
            </div>
            <h1 className="font-display font-bold text-4xl text-white mb-3">
              Termos e condições
            </h1>
            <p className="text-gray-500 text-sm">Última atualização: {updatedAt}</p>
          </div>
        </section>

        {/* Content */}
        <section className="py-14">
          <div className="container-main max-w-3xl mx-auto space-y-6">

            <div className="card p-6 space-y-3">
              <h2 className="font-display font-bold text-xl text-white">1. Aceitação dos termos</h2>
              <p className="text-gray-400 leading-relaxed">
                Ao acessar ou utilizar o site <strong className="text-gray-200">Fábrica de Liberdade</strong> (fabricadeliberdade.com.br), você concorda com estes Termos de Uso. Se não concordar, não utilize o site.
              </p>
            </div>

            <div className="card p-6 space-y-3">
              <h2 className="font-display font-bold text-xl text-white">2. Natureza do conteúdo</h2>
              <p className="text-gray-400 leading-relaxed">
                O conteúdo deste site é de natureza <strong className="text-gray-200">educacional e informativa</strong>. Não constitui aconselhamento financeiro, jurídico ou profissional de qualquer natureza. Resultados mencionados são exemplos e não garantia de desempenho.
              </p>
            </div>

            <div className="card p-6 space-y-3">
              <h2 className="font-display font-bold text-xl text-white">3. Propriedade intelectual</h2>
              <p className="text-gray-400 leading-relaxed">
                Todo o conteúdo original — textos, imagens, layouts, código-fonte — é propriedade da Fábrica de Liberdade, salvo indicação em contrário. É proibido reproduzir, distribuir ou modificar nosso conteúdo sem autorização prévia por escrito.
              </p>
              <p className="text-gray-400 leading-relaxed">
                Citações curtas com link de atribuição são permitidas conforme a lei de direitos autorais (Lei nº 9.610/1998).
              </p>
            </div>

            <div className="card p-6 space-y-3">
              <h2 className="font-display font-bold text-xl text-white">4. Links externos e afiliados</h2>
              <p className="text-gray-400 leading-relaxed">
                Este site contém links para sites de terceiros. Não somos responsáveis pelo conteúdo ou práticas de privacidade desses sites.
              </p>
              <p className="text-gray-400 leading-relaxed">
                Alguns links são links de afiliado. Podemos receber comissão por compras realizadas através deles, sem custo adicional para o usuário. Consulte nossa <a href="/privacidade" className="text-brand-400 hover:underline">Política de Privacidade</a> para mais detalhes.
              </p>
            </div>

            <div className="card p-6 space-y-3">
              <h2 className="font-display font-bold text-xl text-white">5. Limitação de responsabilidade</h2>
              <p className="text-gray-400 leading-relaxed">
                A Fábrica de Liberdade não se responsabiliza por:
              </p>
              <ul className="space-y-2 text-gray-400">
                {[
                  "Decisões tomadas com base no conteúdo do site",
                  "Perdas financeiras resultantes do uso das informações",
                  "Indisponibilidade temporária do site",
                  "Erros ou imprecisões no conteúdo (embora nos esforcemos para manter a precisão)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-brand-400 rounded-full mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-6 space-y-3">
              <h2 className="font-display font-bold text-xl text-white">6. Conduta do usuário</h2>
              <p className="text-gray-400 leading-relaxed">Ao usar o site, você concorda em não:</p>
              <ul className="space-y-2 text-gray-400">
                {[
                  "Tentar acessar áreas restritas sem autorização",
                  "Usar o site para fins ilegais",
                  "Scraping automatizado do conteúdo sem autorização",
                  "Interferir no funcionamento técnico do site",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-6 space-y-3">
              <h2 className="font-display font-bold text-xl text-white">7. Newsletter</h2>
              <p className="text-gray-400 leading-relaxed">
                Ao se inscrever na newsletter, você concorda em receber comunicações por e-mail. Você pode cancelar a qualquer momento clicando no link de cancelamento em qualquer e-mail ou entrando em contato conosco.
              </p>
            </div>

            <div className="card p-6 space-y-3">
              <h2 className="font-display font-bold text-xl text-white">8. Modificações</h2>
              <p className="text-gray-400 leading-relaxed">
                Reservamos o direito de modificar estes termos a qualquer momento. Alterações significativas serão comunicadas no site. O uso continuado após a publicação de alterações implica aceitação.
              </p>
            </div>

            <div className="card p-6 space-y-3">
              <h2 className="font-display font-bold text-xl text-white">9. Lei aplicável</h2>
              <p className="text-gray-400 leading-relaxed">
                Estes termos são regidos pelas leis brasileiras. Para resolver disputas, fica eleito o foro da Comarca de São Paulo - SP.
              </p>
            </div>

            <div className="card p-6 space-y-3">
              <h2 className="font-display font-bold text-xl text-white">10. Contato</h2>
              <p className="text-gray-400 leading-relaxed">
                Dúvidas sobre estes termos? Entre em contato pelo nosso{" "}
                <a href="/contato" className="text-brand-400 hover:underline">formulário de contato</a>{" "}
                ou pelo e-mail{" "}
                <a href="mailto:juridico@fabricadeliberdade.com.br" className="text-brand-400 hover:underline">
                  juridico@fabricadeliberdade.com.br
                </a>.
              </p>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
