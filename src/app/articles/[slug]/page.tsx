import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArticleRenderer from '@/components/ArticleRenderer';
import TableOfContents from '@/components/TableOfContents';
import { getArticle } from '@/utils/articleActions';
import { formatDate } from '@/utils/dateFormatter';

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata(
  { params }: ArticlePageProps
): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await getArticle(resolvedParams.slug);

  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.',
    };
  }

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      authors: [article.author],
      publishedTime: article.date.toISOString(),
      modifiedTime: article.lastModified?.toISOString(),
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const resolvedParams = await params;
  const article = await getArticle(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row-reverse gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 shrink-0">
            <TableOfContents articleContent={article.content} />
          </div>

          {/* Main Content */}
          <article className="lg:flex-1 bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
            <header className="mb-8">
              <h1 className="text-4xl font-bold mb-4 text-purple-700 dark:text-purple-400 break-words hyphens-auto">
                {article.title}
              </h1>
              <div className="flex flex-wrap gap-4 items-center text-sm text-gray-600 dark:text-gray-400">
                <time dateTime={article.date.toISOString()} className="break-words">
                  {formatDate(article.date)}
                </time>
                {article.lastModified && (
                  <span className="break-words">
                    Atualizado em {formatDate(article.lastModified)}
                  </span>
                )}
                {article.author && (
                  <span className="break-words">
                    por <span className="font-medium">{article.author}</span>
                  </span>
                )}
              </div>
              {article.tags && article.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-purple-100 dark:bg-gray-700 text-purple-900 dark:text-purple-300 rounded-full text-sm break-words"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            <div className="prose prose-purple dark:prose-invert max-w-none prose-headings:text-purple-700 dark:prose-headings:text-purple-400 prose-p:text-gray-800 dark:prose-p:text-gray-300 prose-a:text-purple-700 dark:prose-a:text-purple-400 hover:prose-a:text-purple-800 dark:hover:prose-a:text-purple-300 prose-img:rounded-lg prose-img:shadow-lg prose-strong:text-purple-700 dark:prose-strong:text-purple-400 prose-code:text-purple-700 dark:prose-code:text-purple-400 prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900 prose-pre:text-gray-800 dark:prose-pre:text-gray-300 prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-400 prose-blockquote:border-purple-300 dark:prose-blockquote:border-purple-700">
              <ArticleRenderer content={article.content} />
            </div>

            {article.references && Object.keys(article.references).length > 0 && (
              <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-purple-700 dark:text-purple-400">
                  Referências
                </h2>
                <ul className="space-y-2 text-gray-800 dark:text-gray-300">
                  {Object.entries(article.references).map(([key, value]) => (
                    <li key={key} className="break-words">
                      <span className="font-medium text-purple-700 dark:text-purple-400">[{key}]</span>{' '}
                      {value}
                    </li>
                  ))}
                </ul>
              </footer>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}