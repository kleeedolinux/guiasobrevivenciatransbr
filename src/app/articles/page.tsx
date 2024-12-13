import { getAllArticles, getAllTags } from '@/utils/articleActions';
import Link from 'next/link';
import { Metadata } from 'next';
import { formatDate } from '@/utils/dateFormatter';
import RedditText from '@/components/RedditText';

export const metadata: Metadata = {
  title: 'Artigos - Guia de Sobrevivência Trans',
  description: 'Biblioteca completa de artigos sobre terapia hormonal transfeminina',
};

interface GroupedArticles {
  [year: string]: {
    [month: string]: Array<{
      slug: string;
      title: string;
      date: string;
      excerpt: string;
      tags: string[];
      series?: {
        name: string;
        order: number;
      };
    }>;
  };
}

export default async function ArticlesPage() {
  const articles = await getAllArticles();
  const allTags = await getAllTags();

  // Group articles by year and month
  const groupedArticles = articles.reduce<GroupedArticles>((acc, article) => {
    const date = new Date(article.date);
    const year = date.getFullYear().toString();
    const month = date.toLocaleString('pt-BR', { month: 'long' });

    if (!acc[year]) {
      acc[year] = {};
    }
    if (!acc[year][month]) {
      acc[year][month] = [];
    }

    acc[year][month].push({
      slug: article.slug,
      title: article.title,
      date: article.date,
      excerpt: article.excerpt,
      tags: article.tags,
      series: article.series
    });

    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-purple-400">Biblioteca de Artigos</h1>

      {/* Quick Links */}
      <div className="mb-12">
        <div className="bg-gray-800 rounded-lg p-6">
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

      {/* Tags Navigation */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-purple-400">Categorias</h2>
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <Link
              key={tag}
              href={`/search?tag=${encodeURIComponent(tag)}`}
              className="px-3 py-1 bg-gray-800 text-purple-300 rounded-full hover:bg-gray-700"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Articles by Year and Month */}
      <div className="space-y-12">
        {Object.entries(groupedArticles)
          .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
          .map(([year, months]) => (
            <section key={year}>
              <h2 className="text-3xl font-bold mb-6 text-purple-400">{year}</h2>
              <div className="space-y-8">
                {Object.entries(months).map(([month, monthArticles]) => (
                  <div key={month}>
                    <h3 className="text-xl font-bold mb-4 text-purple-300 capitalize">{month}</h3>
                    <div className="space-y-4">
                      {monthArticles.map(article => (
                        <article key={article.slug} className="bg-gray-800 rounded-lg p-6">
                          <h4 className="text-xl font-bold mb-2">
                            <Link
                              href={`/articles/${article.slug}`}
                              className="text-purple-400 hover:text-purple-300"
                            >
                              {article.title}
                            </Link>
                          </h4>
                          {article.series && (
                            <div className="text-sm text-gray-400 mb-2">
                              Parte da série: {article.series.name}
                            </div>
                          )}
                          <div className="text-gray-300 mb-4">
                            <RedditText text={article.excerpt} />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {article.tags.map(tag => (
                              <Link
                                key={tag}
                                href={`/search?tag=${encodeURIComponent(tag)}`}
                                className="text-sm px-2 py-1 bg-gray-700 text-purple-300 rounded-full hover:bg-gray-600"
                              >
                                {tag}
                              </Link>
                            ))}
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
      </div>
    </div>
  );
} 