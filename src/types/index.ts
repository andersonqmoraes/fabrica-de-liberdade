// ============================================
// FÁBRICA DE LIBERDADE — Types & Interfaces
// ============================================

export type Locale = "pt-BR" | "en" | "es";

export type ArticleStatus = "published" | "draft" | "scheduled";

export type ArticleCategory =
  | "ai-tools"
  | "productivity"
  | "tech-reviews"
  | "make-money"
  | "automation"
  | "software";

export type AffiliateType = "amazon" | "mercadolivre" | "aliexpress" | "hotmart" | "saas";

export interface Article {
  id: string;
  slug: string;
  status: ArticleStatus;

  // Conteúdo multilíngue
  translations: {
    [key in Locale]?: ArticleTranslation;
  };

  // Metadados
  category: ArticleCategory;
  tags: string[];
  featuredImage: string;
  featuredImageAlt?: string;

  // Monetização
  affiliateLinks?: AffiliateLink[];
  hasAdsense: boolean;

  // SEO
  canonicalUrl?: string;
  structuredData?: Record<string, unknown>;

  // Analytics
  views: number;
  readTime: number; // minutos

  // Timestamps
  publishedAt: string; // ISO date
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;

  // Automação
  generatedByAI: boolean;
  aiModel?: string;
  targetKeyword?: string;
}

export interface ArticleTranslation {
  title: string;
  excerpt: string;
  content: string; // Markdown
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
}

export interface AffiliateLink {
  id: string;
  type: AffiliateType;
  productName: string;
  productImage?: string;
  url: string;
  price?: string;
  rating?: number;
  badge?: string; // "Mais vendido", "Melhor custo-benefício", etc.
}

export interface ArticleCardProps {
  article: Article;
  locale: Locale;
  variant?: "default" | "featured" | "compact" | "horizontal";
}

export interface Category {
  slug: ArticleCategory;
  icon: string;
  color: string;
  articleCount?: number;
}

export interface EmailSubscriber {
  id: string;
  email: string;
  name?: string;
  locale: Locale;
  source: string; // "homepage", "article", "popup", etc.
  tags: string[];
  subscribedAt: string;
  confirmed: boolean;
}

export interface SiteStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  emailSubscribers: number;
  thisMonthViews: number;
  avgReadTime: number;
}

export interface AutomationJob {
  id: string;
  type: "content" | "image" | "seo" | "social";
  status: "pending" | "running" | "completed" | "failed";
  keyword?: string;
  locale?: Locale;
  result?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  type: string;
  uploadedAt: string;
  usedIn?: string[]; // article IDs
}

export interface SiteConfig {
  adsenseClientId: string;
  googleAnalyticsId: string;
  mailchimpListId: string;
  amazonTag: string;
  mercadoLivreTag: string;
  aliexpressTag: string;
  hotmartTag: string;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
    telegram?: string;
  };
  seo: {
    defaultOgImage: string;
    twitterHandle?: string;
  };
}

// Next.js page params
export interface PageParams {
  locale: Locale;
}

export interface ArticlePageParams extends PageParams {
  slug: string;
}

export interface AdminArticlePageParams extends PageParams {
  id: string;
}
