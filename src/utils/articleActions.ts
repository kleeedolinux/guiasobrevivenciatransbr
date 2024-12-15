'use server';

import { Article } from '@/types/article';
import matter from 'gray-matter';
import { promises as fs } from 'fs';
import path from 'path';
import { cache } from 'react';

// Cache the article loading
export const loadArticles = cache(async () => {
  const articlesDir = path.join(process.cwd(), 'content/articles');
  const articleFiles = await fs.readdir(articlesDir);
  const articles = new Map<string, Article>();
  const series = new Map<string, Article[]>();
  const tags = new Map<string, Set<string>>();
  const keywords = new Map<string, Set<string>>();

  // Helper function to parse dates in various formats and return a valid Date object
  function parseDateString(dateStr: string): Date {
    // Remove any quotes from the date string
    dateStr = dateStr.replace(/['"]/g, '');
    
    // Try parsing DD-MM-YYYY format
    const ddmmyyyy = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
    const ddmmyyyyMatch = dateStr.match(ddmmyyyy);
    if (ddmmyyyyMatch) {
      const [_, day, month, year] = ddmmyyyyMatch;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // Try parsing YYYY-MM-DD format
    const yyyymmdd = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
    const yyyymmddMatch = dateStr.match(yyyymmdd);
    if (yyyymmddMatch) {
      const [_, year, month, day] = yyyymmddMatch;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // If no patterns match, try native Date parsing as fallback
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }

    // If all parsing fails, throw an error
    throw new Error(`Invalid date format: ${dateStr}`);
  }

  await Promise.all(articleFiles.map(async (filename) => {
    if (!filename.endsWith('.md')) return;

    const filePath = path.join(articlesDir, filename);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    const slug = filename.replace('.md', '');

    const article: Article = {
      slug,
      title: data.title,
      date: parseDateString(data.date),
      author: data.author,
      excerpt: data.excerpt,
      content,
      tags: (data.tags || []).map(tag => tag.toLowerCase()), // Normalize tags to lowercase
      keywords: (data.keywords || []).map(keyword => keyword.toLowerCase()), // Normalize keywords to lowercase
      series: data.series ? {
        name: data.series.name,
        order: data.series.order
      } : undefined,
      lastModified: data.lastModified ? parseDateString(data.lastModified) : undefined,
      references: data.references || {}
    };

    articles.set(slug, article);

    // Index by series
    if (article.series) {
      const seriesArticles = series.get(article.series.name) || [];
      seriesArticles.push(article);
      series.set(article.series.name, seriesArticles);
    }

    // Index by tags
    article.tags.forEach(tag => {
      const tagSlugs = tags.get(tag) || new Set();
      tagSlugs.add(slug);
      tags.set(tag, tagSlugs);
    });

    // Index by keywords
    article.keywords.forEach(keyword => {
      const keywordSlugs = keywords.get(keyword) || new Set();
      keywordSlugs.add(slug);
      keywords.set(keyword, keywordSlugs);
    });
  }));

  // Sort series articles by order
  series.forEach((articles, seriesName) => {
    series.set(seriesName, articles.sort((a, b) => 
      (a.series?.order || 0) - (b.series?.order || 0)
    ));
  });

  return { articles, series, tags, keywords };
});

export async function getArticle(slug: string): Promise<Article | undefined> {
  const { articles } = await loadArticles();
  return articles.get(slug);
}

export async function getAllArticles(): Promise<Article[]> {
  const { articles } = await loadArticles();
  return Array.from(articles.values())
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function getLatestArticles(limit: number = 10): Promise<Article[]> {
  const allArticles = await getAllArticles();
  return allArticles.slice(0, limit);
}

export async function getSeries(): Promise<string[]> {
  const { series } = await loadArticles();
  return Array.from(series.keys());
}

export async function getSeriesArticles(seriesName: string): Promise<Article[]> {
  const { series } = await loadArticles();
  return series.get(seriesName) || [];
}

export async function getArticlesByTag(tag: string): Promise<Article[]> {
  const { articles, tags } = await loadArticles();
  const slugs = tags.get(tag.toLowerCase());
  if (!slugs) return [];
  return Array.from(slugs)
    .map(slug => articles.get(slug)!)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function getAllTags(): Promise<string[]> {
  const { tags } = await loadArticles();
  return Array.from(tags.keys()).sort();
}

export async function getRelatedArticles(article: Article, limit: number = 4): Promise<Article[]> {
  const { articles, tags, keywords } = await loadArticles();
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
    const tagSlugs = tags.get(tag);
    if (tagSlugs) {
      tagSlugs.forEach(addRelated);
    }
  });

  // Add articles with matching keywords
  article.keywords.forEach(keyword => {
    const keywordSlugs = keywords.get(keyword);
    if (keywordSlugs) {
      keywordSlugs.forEach(addRelated);
    }
  });

  return Array.from(relatedSlugs)
    .map(slug => articles.get(slug)!)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);
}

// Optimized search function with pre-computed search text
const getSearchableText = (article: Article): string => {
  return [
    article.title,
    article.excerpt,
    ...article.tags,
    ...article.keywords,
  ].join(' ').toLowerCase();
};

export async function searchArticles(query: string, tag?: string): Promise<Article[]> {
  const { articles } = await loadArticles();
  const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const normalizedTag = tag?.toLowerCase();

  // Get all articles as an array
  let results = Array.from(articles.values());

  // Filter by tag if provided
  if (normalizedTag) {
    results = results.filter(article => 
      article.tags.some(t => t.toLowerCase() === normalizedTag)
    );
  }

  // If no search terms, return the tag-filtered results
  if (searchTerms.length === 0) {
    return results.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  // Score and filter articles based on search terms
  const scoredResults = results.map(article => {
    const searchableText = getSearchableText(article).toLowerCase();
    let score = 0;

    // Calculate score based on matches
    for (const term of searchTerms) {
      // Title matches get higher score
      const titleMatches = (article.title.toLowerCase().match(new RegExp(term, 'g')) || []).length;
      score += titleMatches * 3;

      // Tag matches get medium score
      const tagMatches = article.tags.filter(tag => tag.toLowerCase().includes(term)).length;
      score += tagMatches * 2;

      // Content matches get base score
      const contentMatches = (searchableText.match(new RegExp(term, 'g')) || []).length;
      score += contentMatches;
    }

    return { article, score };
  });

  // Filter out zero-score results and sort by score
  return scoredResults
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.article.date.getTime() - a.article.date.getTime())
    .map(({ article }) => article);
}