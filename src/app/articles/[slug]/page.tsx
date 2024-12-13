import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArticleRenderer from '@/components/ArticleRenderer';
import { getArticle } from '@/utils/articleActions';

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
      <article className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-purple-400">{article.title}</h1>
          <div className="flex flex-wrap gap-2 mb-6">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-purple-900 text-purple-100 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="text-gray-400">
            <p>By {article.author}</p>
            <p>Published on {article.date.toLocaleDateString()}</p>
            {article.lastModified && (
              <p>Last updated on {article.lastModified.toLocaleDateString()}</p>
            )}
          </div>
        </header>
        <ArticleRenderer
          content={article.content}
          references={article.references}
        />
      </article>
    </div>
  );
} 