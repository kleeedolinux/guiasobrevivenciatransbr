import { getArticle, getRelatedArticles, getSeriesArticles } from '@/utils/articleActions';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ArticleRenderer from '@/components/ArticleRenderer';
import { formatDate } from '@/utils/dateFormatter';
import RedditText from '@/components/RedditText';

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata(
  { params }: ArticlePageProps,
  parent: Promise<Metadata>
): Promise<Metadata> {
  const article = await getArticle(params.slug);

  if (!article) {
    return {
      title: 'Artigo Não Encontrado',
    };
  }

  return {
    title: `${article.title} - Guia de Sobrevivência Trans`,
    description: article.excerpt,
    keywords: article.keywords.join(', '),
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticle(params.slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article);
  const seriesArticles = article.series 
    ? await getSeriesArticles(article.series.name)
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-6xl mx-auto">
        {/* Series Navigation (if part of a series) */}
        {article.series && (
          <div className="mb-8 p-4 bg-gray-800 rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-purple-400">
              Parte {article.series.order + 1} de {article.series.name}
            </h2>
            <div className="space-y-2">
              {seriesArticles.map((seriesArticle, index) => (
                <div key={seriesArticle.slug} className="flex items-center">
                  <span className="w-8 text-gray-400">{index + 1}.</span>
                  {seriesArticle.slug === article.slug ? (
                    <span className="text-purple-400">{seriesArticle.title}</span>
                  ) : (
                    <Link
                      href={`/articles/${seriesArticle.slug}`}
                      className="text-gray-300 hover:text-purple-400"
                    >
                      {seriesArticle.title}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-purple-400">{article.title}</h1>
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
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Link
                key={tag}
                href={`/articles/tag/${tag}`}
                className="px-3 py-1 bg-gray-800 text-purple-300 rounded-full hover:bg-gray-700"
              >
                {tag}
              </Link>
            ))}
          </div>
          <div className="mt-4 text-gray-300">
            <RedditText text={article.excerpt} />
          </div>
        </header>

        <ArticleRenderer content={article.content} references={article.references} />

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-12 pt-8 border-t border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-purple-400">Artigos Relacionados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedArticles.map((related) => (
                <Link
                  key={related.slug}
                  href={`/articles/${related.slug}`}
                  className="block p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <h3 className="text-lg font-bold mb-2 text-purple-400">{related.title}</h3>
                  <p className="text-gray-300 text-sm">
                    <RedditText text={related.excerpt} />
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-8 pt-8 border-t border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-purple-400">Palavras-chave</h2>
          <div className="flex flex-wrap gap-2">
            {article.keywords.map((keyword) => (
              <Link
                key={keyword}
                href={`/articles/keyword/${keyword}`}
                className="px-3 py-1 bg-gray-800 text-purple-300 rounded-full hover:bg-gray-700"
              >
                {keyword}
              </Link>
            ))}
          </div>
        </footer>
      </article>
    </div>
  );
} 