export interface Article {
  slug: string;
  title: string;
  date: Date;
  author: string;
  excerpt: string;
  content: string;
  tags: string[];
  keywords: string[];
  series?: {
    name: string;
    order: number;
  };
  lastModified?: Date;
  references: { [key: string]: string };
}

export interface ArticleIndex {
  articles: Article[];
  tags: { [key: string]: number };
  categories: { [key: string]: number };
  keywords: { [key: string]: number };
  authors: { [key: string]: number };
  series: { [key: string]: string[] }; // Series name -> array of article slugs in order
} 