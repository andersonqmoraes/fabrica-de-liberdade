import type { Locale } from "@/types";

export interface Author {
  id: string;
  slug: string;
  name: string;
  email: string;
  role: Record<Locale, string>;
  bio: Record<Locale, string>;
  expertise: Record<Locale, string[]>;
  avatar?: string;
  sameAs: string[];
  location: string;
}

export const AUTHORS: Record<string, Author> = {
  anderson: {
    id: "anderson",
    slug: "anderson",
    name: "Anderson Quintino",
    email: "andersonqm@gmail.com",
    role: {
      "pt-BR": "Fundador e editor responsável",
      en: "Founder and editor-in-chief",
      es: "Fundador y editor responsable",
    },
    bio: {
      "pt-BR":
        "Anderson Quintino é o fundador e editor responsável da Fábrica de Liberdade. Há mais de uma década trabalha com desenvolvimento de software e automação, e desde 2023 dedica boa parte do tempo a testar e revisar ferramentas de IA aplicadas a produtividade, conteúdo e geração de renda online. Escreve cada artigo com base em testes próprios das ferramentas analisadas e mantém uma posição editorial independente — sem patrocínios fixos e sem guest posts pagos.",
      en:
        "Anderson Quintino is the founder and editor-in-chief of Freedom Factory. He has worked with software development and automation for over a decade, and since 2023 has been dedicating much of his time to testing and reviewing AI tools applied to productivity, content, and online income. He writes every article based on his own tests of the tools analyzed and maintains an independent editorial position — no fixed sponsors, no paid guest posts.",
      es:
        "Anderson Quintino es el fundador y editor responsable de Fábrica de Libertad. Lleva más de una década trabajando con desarrollo de software y automatización, y desde 2023 dedica gran parte de su tiempo a probar y reseñar herramientas de IA aplicadas a la productividad, el contenido y la generación de ingresos en línea. Escribe cada artículo basado en sus propias pruebas de las herramientas analizadas y mantiene una posición editorial independiente — sin patrocinadores fijos ni guest posts pagados.",
    },
    expertise: {
      "pt-BR": [
        "Ferramentas de IA generativa",
        "Automação de processos",
        "Desenvolvimento de software",
        "Estratégias de monetização online",
        "Produtividade pessoal",
      ],
      en: [
        "Generative AI tools",
        "Process automation",
        "Software development",
        "Online monetization strategies",
        "Personal productivity",
      ],
      es: [
        "Herramientas de IA generativa",
        "Automatización de procesos",
        "Desarrollo de software",
        "Estrategias de monetización en línea",
        "Productividad personal",
      ],
    },
    sameAs: [
      "https://instagram.com/fabricadeliberdade",
      "https://youtube.com/@fabricadeliberdade",
    ],
    location: "Brasil",
  },
};

export const DEFAULT_AUTHOR_ID = "anderson";

export function getAuthor(id?: string): Author {
  if (id && AUTHORS[id]) return AUTHORS[id];
  return AUTHORS[DEFAULT_AUTHOR_ID];
}
