import { ArticleManager } from '@/utils/articleManager';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Latest Articles - Transfeminine Science',
  description: 'Most recent articles on transfeminine hormone therapy',
};

export default async function LatestArticlesPage() {
  const articleManager = ArticleManager.getInstance();
  const articles = articleManager.getAllArticles()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-purple-400">Latest Articles</h1>

      <div className="space-y-8">
        {articles.map((article) => (
          <article
            key={article.id}
            className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow p-6"
          >
            <h2 className="text-2xl font-bold mb-2 text-purple-400">
              <Link href={`/articles/${article.slug}`}>
                {article.title}
              </Link>
            </h2>
            <div className="flex items-center gap-4 text-gray-400 mb-4">
              <span>{article.author}</span>
              <span>•</span>
              <span>{new Date(article.date).toLocaleDateString()}</span>
              {article.lastModified && (
                <>
                  <span>•</span>
                  <span>Updated: {new Date(article.lastModified).toLocaleDateString()}</span>
                </>
              )}
            </div>
            <p className="text-gray-300 mb-4">{article.excerpt}</p>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/articles/tag/${tag}`}
                  className="px-3 py-1 bg-gray-700 text-purple-300 rounded-full hover:bg-gray-600"
                >
                  {tag}
                </Link>
              ))}
            </div>
            {article.series && (
              <div className="mt-4 text-sm text-purple-300">
                Part of series: {article.series.name}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
} 