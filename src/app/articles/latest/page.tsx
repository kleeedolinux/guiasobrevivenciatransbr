import { getLatestArticles } from '@/utils/articleActions';
import Link from 'next/link';
import { Metadata } from 'next';
import { formatDate } from '@/utils/dateFormatter';

export const metadata: Metadata = {
  title: 'Artigos Recentes - Guia de Sobrevivência Trans',
  description: 'Últimos artigos publicados sobre terapia hormonal transfeminina',
};

export default async function LatestArticlesPage() {
  const articles = await getLatestArticles();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-purple-400">Artigos Recentes</h1>

      <div className="space-y-8">
        {articles.map(article => (
          <article key={article.slug} className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-2">
              <Link
                href={`/articles/${article.slug}`}
                className="text-purple-400 hover:text-purple-300"
              >
                {article.title}
              </Link>
            </h2>
            <div className="flex items-center gap-4 text-gray-400 mb-4">
              <span>{article.author}</span>
              <span>•</span>
              <span>{formatDate(article.date)}</span>
              {article.lastModified && (
                <>
                  <span>•</span>
                  <span>Atualizado: {formatDate(article.lastModified)}</span>
                </>
              )}
            </div>
            <p className="text-gray-300 mb-4">{article.excerpt}</p>
            <div className="flex flex-wrap gap-2">
              {article.tags.map(tag => (
                <Link
                  key={tag}
                  href={`/articles/tag/${tag}`}
                  className="px-3 py-1 bg-gray-700 text-purple-300 rounded-full hover:bg-gray-600"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
} 