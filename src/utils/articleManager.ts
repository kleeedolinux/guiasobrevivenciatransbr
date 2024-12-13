'use server';

import { Article } from '@/types/article';
import matter from 'gray-matter';
import { promises as fs } from 'fs';
import path from 'path';

export class ArticleManager {
  private static instance: ArticleManager;
  private articles: Map<string, Article> = new Map();
  private series: Map<string, Article[]> = new Map();
  private tags: Map<string, Set<string>> = new Map(); // tag -> set of slugs
  private keywords: Map<string, Set<string>> = new Map(); // keyword -> set of slugs
  private initialized: boolean = false;

  private constructor() {}

  public static getInstance(): ArticleManager {
    if (!ArticleManager.instance) {
      ArticleManager.instance = new ArticleManager();
    }
    return ArticleManager.instance;
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      await this.loadArticles();
      this.initialized = true;
    }
  }

  private async loadArticles() {
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
      this.articles.set(slug, article);

      // Index by series
      if (article.series) {
        const seriesArticles = this.series.get(article.series.name) || [];
        seriesArticles.push(article);
        this.series.set(article.series.name, seriesArticles);
      }

      // Index by tags
      article.tags.forEach(tag => {
        const tagSlugs = this.tags.get(tag) || new Set();
        tagSlugs.add(slug);
        this.tags.set(tag, tagSlugs);
      });

      // Index by keywords
      article.keywords.forEach(keyword => {
        const keywordSlugs = this.keywords.get(keyword) || new Set();
        keywordSlugs.add(slug);
        this.keywords.set(keyword, keywordSlugs);
      });
    }

    // Sort series articles by order
    this.series.forEach((articles, seriesName) => {
      this.series.set(seriesName, articles.sort((a, b) => 
        (a.series?.order || 0) - (b.series?.order || 0)
      ));
    });
  }

  public async getArticle(slug: string): Promise<Article | undefined> {
    await this.ensureInitialized();
    return this.articles.get(slug);
  }

  public async getAllArticles(): Promise<Article[]> {
    await this.ensureInitialized();
    return Array.from(this.articles.values())
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  public async getLatestArticles(limit: number = 10): Promise<Article[]> {
    const articles = await this.getAllArticles();
    return articles.slice(0, limit);
  }

  public async getSeries(): Promise<string[]> {
    await this.ensureInitialized();
    return Array.from(this.series.keys());
  }

  public async getSeriesArticles(seriesName: string): Promise<Article[]> {
    await this.ensureInitialized();
    return this.series.get(seriesName) || [];
  }

  public async getArticlesByTag(tag: string): Promise<Article[]> {
    await this.ensureInitialized();
    const slugs = this.tags.get(tag);
    if (!slugs) return [];
    return Array.from(slugs)
      .map(slug => this.articles.get(slug)!)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  public async getAllTags(): Promise<string[]> {
    await this.ensureInitialized();
    return Array.from(this.tags.keys()).sort();
  }

  public async getRelatedArticles(article: Article, limit: number = 4): Promise<Article[]> {
    await this.ensureInitialized();
    const relatedSlugs = new Set<string>();
    const addRelated = (slug: string) => {
      if (slug !== article.slug && !relatedSlugs.has(slug)) {
        relatedSlugs.add(slug);
      }
    };

    // Add articles from same series first
    if (article.series) {
      const seriesArticles = await this.getSeriesArticles(article.series.name);
      seriesArticles.forEach(a => addRelated(a.slug));
    }

    // Add articles with matching tags
    article.tags.forEach(tag => {
      const tagSlugs = this.tags.get(tag);
      if (tagSlugs) {
        tagSlugs.forEach(addRelated);
      }
    });

    // Add articles with matching keywords
    article.keywords.forEach(keyword => {
      const keywordSlugs = this.keywords.get(keyword);
      if (keywordSlugs) {
        keywordSlugs.forEach(addRelated);
      }
    });

    return Array.from(relatedSlugs)
      .map(slug => this.articles.get(slug)!)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }

  public async searchArticles(query: string, tag?: string): Promise<Article[]> {
    await this.ensureInitialized();
    let articles = Array.from(this.articles.values());

    // Filter by tag first if provided
    if (tag) {
      const tagSlugs = this.tags.get(tag);
      if (tagSlugs) {
        articles = articles.filter(article => tagSlugs.has(article.slug));
      } else {
        return [];
      }
    }

    if (!query) return articles;

    const searchTerms = query.toLowerCase().split(/\s+/);
    const results = new Map<string, number>(); // slug -> relevance score

    articles.forEach(article => {
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
      .map(([slug]) => this.articles.get(slug)!);
  }
} 