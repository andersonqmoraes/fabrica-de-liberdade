import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "./config";
import type { Article, ArticleCategory, ArticleStatus, Locale } from "@/types";

const COLLECTION = "articles";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toArticle(id: string, data: Record<string, any>): Article {
  return {
    ...data,
    id,
    publishedAt:
      data.publishedAt instanceof Timestamp
        ? data.publishedAt.toDate().toISOString()
        : (data.publishedAt as string) || new Date().toISOString(),
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : (data.createdAt as string) || new Date().toISOString(),
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : (data.updatedAt as string) || new Date().toISOString(),
  } as Article;
}

// --- Read ---

export async function getArticles(options?: {
  status?: ArticleStatus;
  category?: ArticleCategory;
  locale?: Locale;
  limitCount?: number;
}): Promise<Article[]> {
  // Usa apenas orderBy para evitar índice composto (where + orderBy = índice necessário no Firestore)
  // Filtragem de status/category é feita em memória
  const constraints: QueryConstraint[] = [orderBy("publishedAt", "desc")];

  if (options?.limitCount && !options?.status && !options?.category) {
    constraints.push(limit(options.limitCount));
  }

  const q = query(collection(db, COLLECTION), ...constraints);
  const snapshot = await getDocs(q);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let articles = snapshot.docs.map((d: any) => toArticle(d.id, d.data()));

  // Filtra em memória para evitar índices compostos
  if (options?.status) {
    articles = articles.filter((a) => a.status === options.status);
  }
  if (options?.category) {
    articles = articles.filter((a) => a.category === options.category);
  }
  if (options?.limitCount) {
    articles = articles.slice(0, options.limitCount);
  }

  return articles;
}

export async function getPublishedArticles(limitCount?: number): Promise<Article[]> {
  return getArticles({ status: "published", limitCount });
}

// Busca artigos para a aba de ideias — query simples sem índice composto
export async function getArticlesForIdeas(limitCount = 20): Promise<Pick<Article, "id" | "category" | "tags" | "translations">[]> {
  const constraints: QueryConstraint[] = [
    where("status", "==", "published"),
    limit(limitCount),
  ];
  const q = query(collection(db, COLLECTION), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      category: data.category,
      tags: data.tags || [],
      translations: data.translations || {},
    };
  });
}

export async function getFeaturedArticles(count = 3): Promise<Article[]> {
  const constraints: QueryConstraint[] = [
    where("status", "==", "published"),
    orderBy("views", "desc"),
    limit(count),
  ];
  const q = query(collection(db, COLLECTION), ...constraints);
  const snapshot = await getDocs(q);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return snapshot.docs.map((d: any) => toArticle(d.id, d.data()));
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const q = query(collection(db, COLLECTION), where("slug", "==", slug), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return toArticle(d.id, d.data());
}

export async function getArticleById(id: string): Promise<Article | null> {
  const docRef = doc(db, COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return toArticle(snapshot.id, snapshot.data());
}

export async function getRelatedArticles(
  articleId: string,
  category: ArticleCategory,
  count = 3
): Promise<Article[]> {
  // Query simples por categoria sem where(status) para evitar índice composto
  const constraints: QueryConstraint[] = [
    where("category", "==", category),
    limit(count + 5),
  ];
  const q = query(collection(db, COLLECTION), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((d: any) => toArticle(d.id, d.data()))
    .filter((a: Article) => a.id !== articleId && a.status === "published")
    .slice(0, count);
}

// --- Write ---

export async function createArticle(
  data: Omit<Article, "id" | "createdAt" | "updatedAt" | "views">
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    views: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateArticle(
  id: string,
  data: Partial<Article>
): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteArticle(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function incrementViews(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, { views: increment(1) });
}

// --- Stats ---

export async function getArticleStats() {
  const allQ = query(collection(db, COLLECTION));
  const publishedQ = query(
    collection(db, COLLECTION),
    where("status", "==", "published")
  );
  const draftQ = query(
    collection(db, COLLECTION),
    where("status", "==", "draft")
  );

  const [all, published, drafts] = await Promise.all([
    getDocs(allQ),
    getDocs(publishedQ),
    getDocs(draftQ),
  ]);

  const totalViews = all.docs.reduce(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (sum: number, d: any) => sum + ((d.data().views as number) || 0),
    0
  );

  return {
    totalArticles: all.size,
    publishedArticles: published.size,
    draftArticles: drafts.size,
    totalViews,
  };
}
