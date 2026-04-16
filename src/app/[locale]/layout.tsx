import type { Metadata } from "next";
import { Inter, Sora, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/types";
import { getSiteConfig } from "@/lib/firebase/siteConfig";
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

  // Pull live config from Firestore, fall back to i18n strings
  const siteConfig = await getSiteConfig().catch(() => null);

  const siteUrl =
    siteConfig?.siteUrl ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://fabricadeliberdade.com.br";

  const siteName = siteConfig?.siteName || tMeta("siteName");
  const description =
    siteConfig?.seo?.defaultMetaDescription || t("description");
  const ogImage = siteConfig?.seo?.defaultOgImage || "/images/og-default.jpg";
  const twitterHandle = siteConfig?.seo?.twitterHandle || "@fabricadeliberdade";
  const googleVerification = siteConfig?.seo?.googleVerification || undefined;

  return {
    title: {
      default: siteConfig?.seo?.defaultMetaTitle || t("title"),
      template: `%s | ${siteName}`,
    },
    description,
    keywords: tMeta("siteKeywords"),
    metadataBase: new URL(siteUrl),
    ...(googleVerification && {
      verification: { google: googleVerification },
    }),
    openGraph: {
      type: "website",
      siteName,
      description,
      locale: locale === "pt-BR" ? "pt_BR" : locale === "en" ? "en_US" : "es_ES",
      images: [{ url: ogImage, width: 1200, height: 630, alt: siteName }],
    },
    twitter: {
      card: "summary_large_image",
      site: twitterHandle,
      creator: twitterHandle,
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
      canonical: siteUrl,
      languages: {
        "pt-BR": siteUrl,
        en: `${siteUrl}/en`,
        es: `${siteUrl}/es`,
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
  const siteConfig = await getSiteConfig().catch(() => null);

  const siteUrl =
    siteConfig?.siteUrl ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://fabricadeliberdade.com.br";

  const siteNameLd = siteConfig?.siteName || "Fábrica de Liberdade";
  const adsenseId =
    siteConfig?.adsenseClientId || process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  const sameAs = [
    siteConfig?.socialLinks?.instagram,
    siteConfig?.socialLinks?.youtube,
    siteConfig?.socialLinks?.twitter,
    siteConfig?.socialLinks?.linkedin,
  ].filter(Boolean);

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${sora.variable} ${jetbrainsMono.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        {/* Google AdSense */}
        {adsenseId && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
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
              name: siteNameLd,
              url: siteUrl,
              logo: `${siteUrl}/images/Branco.png`,
              ...(sameAs.length > 0 && { sameAs }),
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
