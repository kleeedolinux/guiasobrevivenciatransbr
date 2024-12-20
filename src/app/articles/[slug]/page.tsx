import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ArticleRenderer from '@/components/ArticleRenderer';
import TableOfContents from '@/components/TableOfContents';
import { getArticle } from '@/utils/articleActions';
import { formatDate } from '@/utils/dateFormatter';
import { calculateReadingTime } from '@/utils/readingTime';
import PageTransition, { FadeIn, SlideIn } from '@/components/PageTransition';
import RedditText from '@/components/RedditText';
import Link from 'next/link';
import ReportButton from '@/components/ReportButton';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const article = await getArticle((await props.params).slug);

  if (!article) {
    return {
      title: 'Artigo não encontrado',
      description: 'O artigo que você está procurando não foi encontrado.',
    };
  }

  return {
    title: `${article.title} - Guia de Sobrevivência Trans`,
    description: article.excerpt || 'Leia mais sobre este artigo no Guia de Sobrevivência Trans.',
  };
}

export async function generateStaticParams() {
  return [];
}

export default async function Page({ params, searchParams }: Props) {
  const article = await getArticle((await params).slug);

  if (!article) {
    notFound();
  }

  return (
    <PageTransition className="container mx-auto px-4 py-8 max-w-4xl">
      <article className="bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-xl p-8 backdrop-blur-lg">
        <FadeIn>
          <header className="mb-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
                  {article.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-700 dark:text-gray-400">
                  <time className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(article.date).toLocaleDateString('pt-BR')}
                  </time>
                  {article.author && (
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {article.author}
                    </span>
                  )}
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {calculateReadingTime(article.content)}
                  </span>
                </div>
              </div>
              <ReportButton
                articleTitle={article.title}
                articleUrl={`/articles/${(await params).slug}`}
              />
            </div>
          </header>
        </FadeIn>

        <SlideIn direction="up" delay={0.2}>
          <div className="prose dark:prose-invert prose-gray dark:prose-gray max-w-none">
            <ArticleRenderer content={article.content} references={article.references} />
          </div>
        </SlideIn>

        <FadeIn delay={0.4}>
          <footer className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2 mb-6">
              {article.tags?.map((tag) => (
                <Link
                  key={tag}
                  href={`/search?tag=${encodeURIComponent(tag)}`}
                  className="inline-block bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Link
                href="/articles"
                className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar para Artigos
              </Link>

              {article.series && (
                <div className="text-gray-700 dark:text-gray-400">
                  Parte da série: {article.series.name} ({article.series.order})
                </div>
              )}
            </div>
          </footer>
        </FadeIn>
      </article>
    </PageTransition>
  );
}