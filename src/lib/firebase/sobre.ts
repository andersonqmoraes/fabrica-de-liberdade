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
    "pt-BR": "A Fábrica de Liberdade nasceu com um propósito simples: ajudar pessoas comuns a usarem tecnologia e inteligência artificial para conquistar mais tempo, mais dinheiro e mais escolhas.",
    en: "Freedom Factory was born with a simple purpose: to help ordinary people use technology and artificial intelligence to gain more time, more money, and more choices.",
    es: "La Fábrica de Libertad nació con un propósito simple: ayudar a personas comunes a usar tecnología e inteligencia artificial para ganar más tiempo, más dinero y más opciones.",
  },
  story: {
    "pt-BR": "Tudo começou com uma pergunta simples: por que as ferramentas de IA e produtividade que estão transformando empresas bilionárias ainda são um mistério para a maioria das pessoas?\n\nFundada em 2024, a Fábrica de Liberdade foi criada para preencher esse gap. Produzimos conteúdo em português, inglês e espanhol para que qualquer pessoa no mundo lusófono e hispânico possa acessar o mesmo conhecimento que os grandes players globais.\n\nHoje, ajudamos mais de 50.000 leitores mensais a dominar ferramentas de IA, aumentar sua produtividade e criar novas fontes de renda utilizando tecnologia.",
    en: "It all started with a simple question: why are the AI and productivity tools transforming billion-dollar companies still a mystery to most people?\n\nFounded in 2024, Freedom Factory was created to fill this gap. We produce content in Portuguese, English, and Spanish so that anyone in the Lusophone and Hispanic world can access the same knowledge as the global players.\n\nToday, we help over 50,000 monthly readers master AI tools, increase their productivity, and create new income streams using technology.",
    es: "Todo comenzó con una pregunta simple: ¿por qué las herramientas de IA y productividad que están transformando empresas billonarias siguen siendo un misterio para la mayoría de las personas?\n\nFundada en 2024, la Fábrica de Libertad fue creada para llenar este vacío. Producimos contenido en portugués, inglés y español para que cualquier persona en el mundo lusófono e hispánico pueda acceder al mismo conocimiento que los grandes jugadores globales.\n\nHoy, ayudamos a más de 50,000 lectores mensuales a dominar herramientas de IA, aumentar su productividad y crear nuevas fuentes de ingresos usando tecnología.",
  },
  stats: {
    readers: "50k+",
    articles: "500+",
    tools: "200+",
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
