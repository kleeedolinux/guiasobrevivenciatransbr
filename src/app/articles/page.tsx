import { ArticleManager } from '@/utils/articleManager';
import Link from 'next/link';
import { Metadata } from 'next';
import { formatDate } from '@/utils/dateFormatter';

export const metadata: Metadata = {
  title: 'Artigos - Guia de Sobrevivência Trans',
  description: 'Biblioteca completa de artigos sobre terapia hormonal transfeminina',
};

export default function ArticlesPage() {
  const articleManager = ArticleManager.getInstance();
  const articles = articleManager.getAllArticles();
  const categories = Array.from(new Set(articles.flatMap(article => article.tags)));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-purple-400">Biblioteca de Artigos</h1>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Links */}
        <div className="md:col-span-2 lg:col-span-3">
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-purple-400">Navegação Rápida</h2>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/articles/latest"
                className="px-4 py-2 bg-purple-900 text-purple-100 rounded-lg hover:bg-purple-800"
              >
                Artigos Recentes
              </Link>
              <Link
                href="/articles/series"
                className="px-4 py-2 bg-purple-900 text-purple-100 rounded-lg hover:bg-purple-800"
              >
                Séries de Artigos
              </Link>
              <Link
                href="/search"
                className="px-4 py-2 bg-purple-900 text-purple-100 rounded-lg hover:bg-purple-800"
              >
                Buscar Artigos
              </Link>
            </div>
          </div>
        </div>

        {/* Categories */}
        {categories.map(category => {
          const categoryArticles = articles.filter(article => article.tags.includes(category));
          return (
            <div key={category} className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-purple-400">{category}</h2>
              <div className="space-y-4">
                {categoryArticles.map(article => (
                  <div key={article.slug} className="border-b border-gray-700 pb-4 last:border-0">
                    <h3 className="text-xl font-bold mb-2">
                      <Link
                        href={`/articles/${article.slug}`}
                        className="text-purple-400 hover:text-purple-300"
                      >
                        {article.title}
                      </Link>
                    </h3>
                    <p className="text-gray-300 text-sm mb-2">{article.excerpt}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>{formatDate(article.date)}</span>
                      {article.series && (
                        <>
                          <span>•</span>
                          <span>Parte da série: {article.series.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 