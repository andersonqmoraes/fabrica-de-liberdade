import type { Metadata } from "next";
import { Inter, Sora, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/types";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.homePage" });
  const tMeta = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: {
      default: t("title"),
      template: `%s | ${tMeta("siteName")}`,
    },
    description: t("description"),
    keywords: tMeta("siteKeywords"),
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "https://fabricadeliberdade.com.br"
    ),
    openGraph: {
      type: "website",
      siteName: tMeta("siteName"),
      locale: locale === "pt-BR" ? "pt_BR" : locale === "en" ? "en_US" : "es_ES",
    },
    twitter: {
      card: "summary_large_image",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: process.env.NEXT_PUBLIC_SITE_URL,
      languages: {
        "pt-BR": `${process.env.NEXT_PUBLIC_SITE_URL}`,
        en: `${process.env.NEXT_PUBLIC_SITE_URL}/en`,
        es: `${process.env.NEXT_PUBLIC_SITE_URL}/es`,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${sora.variable} ${jetbrainsMono.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        {/* Google AdSense */}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
          />
        )}
        {/* JSON-LD — Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Fábrica de Liberdade",
              url: "https://fabricadeliberdade.com.br",
              logo: "https://fabricadeliberdade.com.br/images/logo.png",
              sameAs: [
                "https://www.instagram.com/fabricadeliberdade",
                "https://www.youtube.com/@fabricadeliberdade",
              ],
            }),
          }}
        />
      </head>
      <body className="bg-dark-800 text-gray-100 antialiased min-h-screen">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
