import { client } from "./client";

export interface SanityAuthor {
  name: string;
  role?: string;
  bio?: string;
  avatar?: unknown;
}

export interface SanityArticle {
  _id: string;
  title: string;
  slug: string;
  tag: string;
  excerpt: string;
  date: string | null; // null when the article has no publish date
  readTime: string | null; // null when no read time is set
  country?: string;
  programCategory?: string;
  body?: unknown;
  author?: SanityAuthor;
}

export 
const LATEST_ARTICLES_QUERY = `*[_type == "article" && !(_id in path("drafts.**"))] | order(coalesce(publishedAt, _createdAt) desc)[0...4] {
  _id,
  title,
  "slug": slug.current,
  tag,
  excerpt,
  "date": coalesce(publishedAt, _createdAt),
  "readTime": estimatedReadTime,
  country,
  programCategory,
  "author": author->{
    name,
    role,
    bio
  }
}`;

const ARTICLE_BY_SLUG_QUERY = `*[_type == "article" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
  _id,
  title,
  "slug": slug.current,
  tag,
  excerpt,
  "date": coalesce(publishedAt, _createdAt),
  "readTime": estimatedReadTime,
  country,
  programCategory,
  body,
  "author": author->{
    name,
    role,
    bio
  }
}`;

const PILLAR_GUIDE_BY_COUNTRY_QUERY = `*[_type == "pillarGuide" && country == $country && !(_id in path("drafts.**"))][0] {
  _id,
  title,
  "slug": slug.current,
  country,
  heroSubtitle,
  overview,
  costOfLivingINR,
  visaWorkRights,
  faqs,
  updatedAt
}`;

const ALL_ARTICLES_QUERY = `*[_type == "article" && !(_id in path("drafts.**"))] | order(coalesce(publishedAt, _createdAt) desc) {
  _id,
  title,
  "slug": slug.current,
  tag,
  excerpt,
  "date": coalesce(publishedAt, _createdAt),
  "readTime": estimatedReadTime,
  country,
  programCategory,
  "author": author->{
    name,
    role,
    bio
  }
}`;

function formatArticleDate(rawDate?: string | null): string | null {
  if (!rawDate) return null;
  if (rawDate.length <= 10 && !rawDate.includes("-")) return rawDate;
  try {
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return rawDate;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return rawDate;
  }
}

export async function getAllArticles(): Promise<SanityArticle[]> {
  try {
    const data = await client.fetch(
      ALL_ARTICLES_QUERY,
      {},
      {
        next: { revalidate: 60 },
      },
    );
    if (Array.isArray(data) && data.length > 0) {
      const formatted = data.map((a: SanityArticle) => ({
        ...a,
        date: formatArticleDate(a.date),
      }));
      return formatted;
    }
    return [];
  } catch (error) {
    console.warn("Sanity getAllArticles fetch failed:", error);
    return [];
  }
}

export async function getLatestArticles(): Promise<SanityArticle[]> {
  try {
    const data = await client.fetch(
      LATEST_ARTICLES_QUERY,
      {},
      {
        // Revalidate ISR every 60 seconds
        next: { revalidate: 60 },
      },
    );
    if (Array.isArray(data) && data.length > 0) {
      return data.map((a: SanityArticle) => ({
        ...a,
        date: formatArticleDate(a.date),
      }));
    }
    return [];
  } catch (error) {
    console.warn("Sanity article fetch failed:", error);
    return [];
  }
}

export async function getArticleBySlug(
  slug: string,
): Promise<SanityArticle | null> {
  try {
    const data = await client.fetch(
      ARTICLE_BY_SLUG_QUERY,
      { slug },
      {
        next: { revalidate: 60 },
      },
    );
    if (data) {
      return {
        ...data,
        date: formatArticleDate(data.date),
      };
    }
  } catch (error) {
    console.warn(`Sanity fetch for slug '${slug}' failed:`, error);
  }

  return null;
}
