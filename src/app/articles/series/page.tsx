import { getSeries, getSeriesArticles } from '@/utils/articleActions';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Séries de Artigos - Guia de Sobrevivência Trans',
  description: 'Navegue pelas séries de artigos sobre terapia hormonal transfeminina',
};

export default async function SeriesPage() {
  const seriesNames = await getSeries();
  const seriesArticles = await Promise.all(
    seriesNames.map(async name => ({
      name,
      articles: await getSeriesArticles(name)
    }))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-purple-400">Séries de Artigos</h1>

      {seriesArticles.length > 0 ? (
        <div className="space-y-8">
          {seriesArticles.map(({ name, articles }) => (
            <section key={name} className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-purple-400">{name}</h2>
              <div className="space-y-4">
                {articles.map((article, index) => (
                  <div key={article.slug} className="flex items-start gap-4">
                    <span className="w-8 h-8 flex items-center justify-center bg-purple-900 text-purple-100 rounded-full shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <Link
                        href={`/articles/${article.slug}`}
                        className="text-xl font-bold text-purple-400 hover:text-purple-300"
                      >
                        {article.title}
                      </Link>
                      <p className="text-gray-300 mt-2">{article.excerpt}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {article.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-700 text-purple-300 text-sm rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400">Nenhuma série de artigos disponível no momento.</p>
      )}
    </div>
  );
} 