'use server';

import { Article } from '@/types/article';
import matter from 'gray-matter';
import { promises as fs } from 'fs';
import path from 'path';

// Private state
let articles: Map<string, Article> | null = null;
let series: Map<string, Article[]> | null = null;
let tags: Map<string, Set<string>> | null = null;
let keywords: Map<string, Set<string>> | null = null;

async function ensureInitialized() {
  if (articles !== null) return;

  articles = new Map();
  series = new Map();
  tags = new Map();
  keywords = new Map();

  const articlesDir = path.join(process.cwd(), 'content/articles');
  const articleFiles = await fs.readdir(articlesDir);

  for (const filename of articleFiles) {
    if (!filename.endsWith('.md')) continue;

    const filePath = path.join(articlesDir, filename);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    const slug = filename.replace('.md', '');

    const article: Article = {
      slug,
      title: data.title,
      date: new Date(data.date),
      author: data.author,
      excerpt: data.excerpt,
      content,
      tags: data.tags || [],
      keywords: data.keywords || [],
      series: data.series ? {
        name: data.series.name,
        order: data.series.order
      } : undefined,
      lastModified: data.lastModified ? new Date(data.lastModified) : undefined,
      references: data.references || {}
    };

    // Store article
    articles.set(slug, article);

    // Index by series
    if (article.series) {
      const seriesArticles = series.get(article.series.name) || [];
      seriesArticles.push(article);
      series.set(article.series.name, seriesArticles);
    }

    // Index by tags
    article.tags.forEach(tag => {
      const tagSlugs = tags!.get(tag) || new Set();
      tagSlugs.add(slug);
      tags!.set(tag, tagSlugs);
    });

    // Index by keywords
    article.keywords.forEach(keyword => {
      const keywordSlugs = keywords!.get(keyword) || new Set();
      keywordSlugs.add(slug);
      keywords!.set(keyword, keywordSlugs);
    });
  }

  // Sort series articles by order
  series.forEach((articles, seriesName) => {
    series!.set(seriesName, articles.sort((a, b) => 
      (a.series?.order || 0) - (b.series?.order || 0)
    ));
  });
}

export async function getArticle(slug: string): Promise<Article | undefined> {
  await ensureInitialized();
  return articles!.get(slug);
}

export async function getAllArticles(): Promise<Article[]> {
  await ensureInitialized();
  return Array.from(articles!.values())
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function getLatestArticles(limit: number = 10): Promise<Article[]> {
  const allArticles = await getAllArticles();
  return allArticles.slice(0, limit);
}

export async function getSeries(): Promise<string[]> {
  await ensureInitialized();
  return Array.from(series!.keys());
}

export async function getSeriesArticles(seriesName: string): Promise<Article[]> {
  await ensureInitialized();
  return series!.get(seriesName) || [];
}

export async function getArticlesByTag(tag: string): Promise<Article[]> {
  await ensureInitialized();
  const slugs = tags!.get(tag);
  if (!slugs) return [];
  return Array.from(slugs)
    .map(slug => articles!.get(slug)!)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function getAllTags(): Promise<string[]> {
  await ensureInitialized();
  return Array.from(tags!.keys()).sort();
}

export async function getRelatedArticles(article: Article, limit: number = 4): Promise<Article[]> {
  await ensureInitialized();
  const relatedSlugs = new Set<string>();
  const addRelated = (slug: string) => {
    if (slug !== article.slug && !relatedSlugs.has(slug)) {
      relatedSlugs.add(slug);
    }
  };

  // Add articles from same series first
  if (article.series) {
    const seriesArticles = await getSeriesArticles(article.series.name);
    seriesArticles.forEach(a => addRelated(a.slug));
  }

  // Add articles with matching tags
  article.tags.forEach(tag => {
    const tagSlugs = tags!.get(tag);
    if (tagSlugs) {
      tagSlugs.forEach(addRelated);
    }
  });

  // Add articles with matching keywords
  article.keywords.forEach(keyword => {
    const keywordSlugs = keywords!.get(keyword);
    if (keywordSlugs) {
      keywordSlugs.forEach(addRelated);
    }
  });

  return Array.from(relatedSlugs)
    .map(slug => articles!.get(slug)!)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);
}

export async function searchArticles(query: string, tag?: string): Promise<Article[]> {
  await ensureInitialized();
  let allArticles = Array.from(articles!.values());

  // Filter by tag first if provided
  if (tag) {
    const tagSlugs = tags!.get(tag);
    if (tagSlugs) {
      allArticles = allArticles.filter(article => tagSlugs.has(article.slug));
    } else {
      return [];
    }
  }

  if (!query) return allArticles;

  const searchTerms = query.toLowerCase().split(/\s+/);
  const results = new Map<string, number>(); // slug -> relevance score

  allArticles.forEach(article => {
    let score = 0;
    const searchableText = [
      article.title,
      article.excerpt,
      ...article.tags,
      ...article.keywords,
    ].join(' ').toLowerCase();

    searchTerms.forEach(term => {
      if (article.title.toLowerCase().includes(term)) score += 3;
      if (article.excerpt.toLowerCase().includes(term)) score += 2;
      if (article.tags.some(tag => tag.toLowerCase().includes(term))) score += 2;
      if (article.keywords.some(keyword => keyword.toLowerCase().includes(term))) score += 2;
      if (article.content.toLowerCase().includes(term)) score += 1;
    });

    if (score > 0) {
      results.set(article.slug, score);
    }
  });

  return Array.from(results.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([slug]) => articles!.get(slug)!);
} 