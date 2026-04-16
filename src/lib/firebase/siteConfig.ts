import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

const CONFIG_DOC = "site_config";
const COLLECTION = "settings";

export interface SiteConfigData {
  // Site identity
  siteName: string;
  siteDescription: string;
  siteUrl: string;

  // SEO
  seo: {
    defaultMetaTitle: string;
    defaultMetaDescription: string;
    defaultOgImage: string;
    twitterHandle: string;
    googleVerification: string;
  };

  // Social
  socialLinks: {
    instagram: string;
    youtube: string;
    twitter: string;
    telegram: string;
    linkedin: string;
  };

  // Analytics & Ads
  googleAnalyticsId: string;
  adsenseClientId: string;

  // Affiliate tags
  amazonTag: string;
  hotmartTag: string;

  updatedAt?: string;
}

const defaultConfig: SiteConfigData = {
  siteName: "Fábrica de Liberdade",
  siteDescription:
    "Guia definitivo de IA, tecnologia e produtividade para conquistar liberdade financeira e de tempo.",
  siteUrl: "https://fabricadeliberdade.com.br",
  seo: {
    defaultMetaTitle: "Fábrica de Liberdade — IA, Produtividade & Liberdade",
    defaultMetaDescription:
      "Guia definitivo de IA, tecnologia e produtividade para conquistar liberdade financeira e de tempo.",
    defaultOgImage: "/images/og-default.jpg",
    twitterHandle: "@fabricadeliberdade",
    googleVerification: "",
  },
  socialLinks: {
    instagram: "https://instagram.com/fabricadeliberdade",
    youtube: "https://youtube.com/@fabricadeliberdade",
    twitter: "https://twitter.com/fabricadeliberdade",
    telegram: "https://t.me/fabricadeliberdade",
    linkedin: "",
  },
  googleAnalyticsId: "",
  adsenseClientId: "",
  amazonTag: "",
  hotmartTag: "",
};

export async function getSiteConfig(): Promise<SiteConfigData> {
  try {
    const ref = doc(db, COLLECTION, CONFIG_DOC);
    const snap = await getDoc(ref);
    if (!snap.exists()) return defaultConfig;
    return { ...defaultConfig, ...(snap.data() as SiteConfigData) };
  } catch {
    return defaultConfig;
  }
}

export async function saveSiteConfig(
  config: Partial<SiteConfigData>
): Promise<void> {
  const ref = doc(db, COLLECTION, CONFIG_DOC);
  await setDoc(
    ref,
    {
      ...config,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
