export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  date: string;
  tags: string[];
  keywords: string[];
  category: string;
  lastModified?: string;
  series?: {
    name: string;
    order: number;
  };
  relatedArticles?: string[]; // Array of related article slugs
}

export interface ArticleIndex {
  articles: Article[];
  tags: { [key: string]: number };
  categories: { [key: string]: number };
  keywords: { [key: string]: number };
  authors: { [key: string]: number };
  series: { [key: string]: string[] }; // Series name -> array of article slugs in order
} 