import { ArticleManager } from '@/utils/articleManager';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Articles - Transfeminine Science',
  description: 'Browse all articles on transfeminine hormone therapy',
};

export default function ArticlesPage() {
  const articleManager = ArticleManager.getInstance();
  const articles = articleManager.getAllArticles();
  const tags = articleManager.getTags();
  const categories = articleManager.getCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-purple-400">Articles</h1>
      
      {/* Categories */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-purple-400">Categories</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map(({ category, count }) => (
            <Link
              key={category}
              href={`/articles/category/${category}`}
              className="px-3 py-1 bg-purple-900 text-purple-100 rounded-full hover:bg-purple-800"
            >
              {category} ({count})
            </Link>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-purple-400">Tags</h2>
        <div className="flex flex-wrap gap-2">
          {tags.map(({ tag, count }) => (
            <Link
              key={tag}
              href={`/articles/tag/${tag}`}
              className="px-3 py-1 bg-gray-800 text-purple-300 rounded-full hover:bg-gray-700"
            >
              {tag} ({count})
            </Link>
          ))}
        </div>
      </div>

      {/* Articles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <article
            key={article.id}
            className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2 text-purple-400">
                <Link href={`/articles/${article.slug}`}>
                  {article.title}
                </Link>
              </h2>
              <p className="text-gray-300 mb-4">{article.excerpt}</p>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-700 text-purple-300 text-sm rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-400">
                <span>{article.author}</span>
                <span className="mx-2">•</span>
                <span>{new Date(article.date).toLocaleDateString()}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
} 