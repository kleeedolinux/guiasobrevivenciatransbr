import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Article, ArticleIndex } from '../types/article';
import { Feed } from 'feed';

const ARTICLES_DIRECTORY = path.join(process.cwd(), 'content/articles');
const INDEX_FILE = path.join(process.cwd(), 'content/index.json');
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const RSS_FILE = path.join(PUBLIC_DIR, 'rss.xml');
const ATOM_FILE = path.join(PUBLIC_DIR, 'atom.xml');
const JSON_FEED_FILE = path.join(PUBLIC_DIR, 'feed.json');

export class ArticleManager {
  private static instance: ArticleManager;
  private index: ArticleIndex;

  private constructor() {
    this.ensureDirectories();
    this.index = this.loadIndex();
    this.loadAllArticles();
  }

  static getInstance(): ArticleManager {
    if (!ArticleManager.instance) {
      ArticleManager.instance = new ArticleManager();
    }
    return ArticleManager.instance;
  }

  private ensureDirectories() {
    if (!fs.existsSync(ARTICLES_DIRECTORY)) {
      fs.mkdirSync(ARTICLES_DIRECTORY, { recursive: true });
    }
    if (!fs.existsSync(PUBLIC_DIR)) {
      fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    }
  }

  private loadAllArticles() {
    const files = fs.readdirSync(ARTICLES_DIRECTORY);
    this.index.articles = [];

    files.forEach(file => {
      if (file.endsWith('.md')) {
        const filePath = path.join(ARTICLES_DIRECTORY, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(fileContent);
        const slug = path.basename(file, '.md');

        const article: Article = {
          id: data.id || Date.now().toString(),
          title: data.title,
          slug,
          content,
          excerpt: data.excerpt,
          author: data.author,
          date: data.date,
          tags: data.tags || [],
          keywords: data.keywords || [],
          category: data.category,
          lastModified: data.lastModified,
          series: data.series,
          relatedArticles: data.relatedArticles,
        };

        this.index.articles.push(article);
      }
    });

    this.updateIndexCounts();
  }

  private loadIndex(): ArticleIndex {
    if (fs.existsSync(INDEX_FILE)) {
      const indexContent = fs.readFileSync(INDEX_FILE, 'utf-8');
      return JSON.parse(indexContent);
    }
    return {
      articles: [],
      tags: {},
      categories: {},
      keywords: {},
      authors: {},
      series: {},
    };
  }

  private saveIndex() {
    fs.writeFileSync(INDEX_FILE, JSON.stringify(this.index, null, 2));
    this.generateFeeds();
  }

  private updateIndexCounts() {
    const newIndex: ArticleIndex = {
      articles: this.index.articles,
      tags: {},
      categories: {},
      keywords: {},
      authors: {},
      series: {},
    };

    this.index.articles.forEach((article) => {
      // Update tags count
      article.tags.forEach((tag) => {
        newIndex.tags[tag] = (newIndex.tags[tag] || 0) + 1;
      });

      // Update category count
      if (article.category) {
        newIndex.categories[article.category] = 
          (newIndex.categories[article.category] || 0) + 1;
      }

      // Update keywords count
      article.keywords.forEach((keyword) => {
        newIndex.keywords[keyword] = (newIndex.keywords[keyword] || 0) + 1;
      });

      // Update authors count
      newIndex.authors[article.author] = 
        (newIndex.authors[article.author] || 0) + 1;

      // Update series
      if (article.series) {
        if (!newIndex.series[article.series.name]) {
          newIndex.series[article.series.name] = [];
        }
        newIndex.series[article.series.name][article.series.order] = article.slug;
      }
    });

    this.index = newIndex;
    this.saveIndex();
  }

  private generateFeeds() {
    const feed = new Feed({
      title: "Transfeminine Science",
      description: "Original informational content on transfeminine hormone therapy",
      id: "https://your-domain.com/",
      link: "https://your-domain.com/",
      language: "en",
      favicon: "https://your-domain.com/favicon.ico",
      copyright: `All rights reserved ${new Date().getFullYear()}`,
      updated: new Date(),
      generator: "Transfeminine Science Feed Generator",
      feedLinks: {
        rss2: "https://your-domain.com/rss.xml",
        atom: "https://your-domain.com/atom.xml",
        json: "https://your-domain.com/feed.json",
      },
    });

    // Add articles to feed
    this.index.articles
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .forEach((article) => {
        feed.addItem({
          title: article.title,
          id: article.id,
          link: `https://your-domain.com/articles/${article.slug}`,
          description: article.excerpt,
          content: article.content,
          author: [{ name: article.author }],
          date: new Date(article.date),
          category: article.tags.map(tag => ({ name: tag })),
        });
      });

    // Write feed files
    fs.writeFileSync(RSS_FILE, feed.rss2());
    fs.writeFileSync(ATOM_FILE, feed.atom1());
    fs.writeFileSync(JSON_FEED_FILE, feed.json1());
  }

  createArticle(article: Omit<Article, 'id' | 'slug'>): Article {
    const id = Date.now().toString();
    const slug = this.generateSlug(article.title);
    
    const newArticle: Article = {
      ...article,
      id,
      slug,
    };

    const fileName = `${slug}.md`;
    const filePath = path.join(ARTICLES_DIRECTORY, fileName);

    const fileContent = matter.stringify(article.content, {
      title: article.title,
      author: article.author,
      date: article.date,
      tags: article.tags,
      keywords: article.keywords,
      category: article.category,
      excerpt: article.excerpt,
      series: article.series,
      relatedArticles: article.relatedArticles,
    });

    fs.writeFileSync(filePath, fileContent);

    this.index.articles.push(newArticle);
    this.updateIndexCounts();

    return newArticle;
  }

  getArticle(slug: string): Article | null {
    const filePath = path.join(ARTICLES_DIRECTORY, `${slug}.md`);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    return {
      id: data.id,
      title: data.title,
      slug,
      content,
      excerpt: data.excerpt,
      author: data.author,
      date: data.date,
      tags: data.tags,
      keywords: data.keywords,
      category: data.category,
      lastModified: data.lastModified,
      series: data.series,
      relatedArticles: data.relatedArticles,
    };
  }

  getRelatedArticles(article: Article): Article[] {
    if (!article.relatedArticles) return [];
    
    return article.relatedArticles
      .map(slug => this.getArticle(slug))
      .filter((a): a is Article => a !== null);
  }

  getSeriesArticles(seriesName: string): Article[] {
    const seriesSlugs = this.index.series[seriesName] || [];
    return seriesSlugs
      .map(slug => this.getArticle(slug))
      .filter((a): a is Article => a !== null)
      .sort((a, b) => {
        const aOrder = a.series?.order || 0;
        const bOrder = b.series?.order || 0;
        return aOrder - bOrder;
      });
  }

  searchArticles(query: string): Article[] {
    const searchTerms = query.toLowerCase().split(' ');
    
    return this.index.articles.filter(article => {
      const searchableText = [
        article.title,
        article.excerpt,
        article.content,
        ...article.tags,
        ...article.keywords,
        article.category,
        article.author
      ].join(' ').toLowerCase();

      return searchTerms.every(term => searchableText.includes(term));
    }).sort((a, b) => {
      // Sort by relevance (number of matches)
      const aMatches = searchTerms.filter(term => 
        a.title.toLowerCase().includes(term)).length * 2 +
        searchTerms.filter(term => 
          a.excerpt.toLowerCase().includes(term)).length;
      
      const bMatches = searchTerms.filter(term => 
        b.title.toLowerCase().includes(term)).length * 2 +
        searchTerms.filter(term => 
          b.excerpt.toLowerCase().includes(term)).length;

      return bMatches - aMatches;
    });
  }

  getAllArticles(): Article[] {
    return this.index.articles;
  }

  getArticlesByTag(tag: string): Article[] {
    return this.index.articles.filter((article) => 
      article.tags.includes(tag)
    );
  }

  getArticlesByCategory(category: string): Article[] {
    return this.index.articles.filter((article) => 
      article.category === category
    );
  }

  getArticlesByKeyword(keyword: string): Article[] {
    return this.index.articles.filter((article) => 
      article.keywords.includes(keyword)
    );
  }

  getArticlesByAuthor(author: string): Article[] {
    return this.index.articles.filter((article) => 
      article.author === author
    );
  }

  getTags(): { tag: string; count: number }[] {
    return Object.entries(this.index.tags)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }

  getCategories(): { category: string; count: number }[] {
    return Object.entries(this.index.categories)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }

  getKeywords(): { keyword: string; count: number }[] {
    return Object.entries(this.index.keywords)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count);
  }

  getSeries(): string[] {
    return Object.keys(this.index.series);
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
} 