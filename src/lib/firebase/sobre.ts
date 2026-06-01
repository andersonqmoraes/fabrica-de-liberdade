import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

export interface SobreData {
  headline: { "pt-BR": string; en: string; es: string };
  subheadline: { "pt-BR": string; en: string; es: string };
  story: { "pt-BR": string; en: string; es: string };
  stats: {
    readers: string;
    articles: string;
    tools: string;
    languages: string;
  };
}

const DOC_ID = "sobre";
const COL = "site_config";

const DEFAULTS: SobreData = {
  headline: {
    "pt-BR": "Nossa missão é sua liberdade",
    en: "Our mission is your freedom",
    es: "Nuestra misión es tu libertad",
  },
  subheadline: {
    "pt-BR": "A Fábrica de Liberdade é um blog editorial independente sobre inteligência artificial, produtividade e tecnologia — mantido por Anderson Quintino, com o propósito de tornar acessível o que os grandes players já dominam.",
    en: "Freedom Factory is an independent editorial blog about artificial intelligence, productivity, and technology — maintained by Anderson Quintino, with the purpose of making accessible what global players already master.",
    es: "Fábrica de Libertad es un blog editorial independiente sobre inteligencia artificial, productividad y tecnología — mantenido por Anderson Quintino, con el propósito de hacer accesible lo que los grandes actores ya dominan.",
  },
  story: {
    "pt-BR": "A Fábrica de Liberdade nasceu da observação de que as ferramentas de IA e produtividade que estão transformando empresas inteiras ainda parecem inacessíveis para a maioria das pessoas.\n\nFundado em 2025 por Anderson Quintino, este é um blog editorial independente, mantido individualmente, sem patrocinadores fixos. Cada artigo passa por curadoria e revisão antes de ser publicado, e os reviews são baseados em testes reais das ferramentas analisadas.\n\nO conteúdo é publicado em português, inglês e espanhol para alcançar leitores no mundo lusófono e hispânico que querem aprender, na prática, a usar tecnologia para ganhar tempo e criar novas oportunidades.",
    en: "Freedom Factory was born from the observation that AI and productivity tools transforming entire industries still feel inaccessible to most people.\n\nFounded in 2025 by Anderson Quintino, this is an independent editorial blog, individually maintained, with no fixed sponsors. Every article goes through curation and review before publication, and reviews are based on real tests of the tools analyzed.\n\nContent is published in Portuguese, English, and Spanish to reach readers in the Lusophone and Hispanic world who want to learn, in practice, how to use technology to gain time and create new opportunities.",
    es: "Fábrica de Libertad nació de la observación de que las herramientas de IA y productividad que están transformando industrias enteras siguen siendo inaccesibles para la mayoría de las personas.\n\nFundado en 2025 por Anderson Quintino, este es un blog editorial independiente, mantenido individualmente, sin patrocinadores fijos. Cada artículo pasa por curaduría y revisión antes de publicarse, y los reviews se basan en pruebas reales de las herramientas analizadas.\n\nEl contenido se publica en portugués, inglés y español para llegar a lectores del mundo lusófono e hispánico que quieren aprender, en la práctica, a usar tecnología para ganar tiempo y crear nuevas oportunidades.",
  },
  stats: {
    readers: "",
    articles: "",
    tools: "",
    languages: "3",
  },
};

export async function getSobreData(): Promise<SobreData> {
  try {
    const snap = await getDoc(doc(db, COL, DOC_ID));
    if (snap.exists()) return snap.data() as SobreData;
  } catch { /* use defaults */ }
  return DEFAULTS;
}

export async function saveSobreData(data: SobreData): Promise<void> {
  await setDoc(doc(db, COL, DOC_ID), { ...data, updatedAt: serverTimestamp() });
}

export { DEFAULTS as SOBRE_DEFAULTS };
