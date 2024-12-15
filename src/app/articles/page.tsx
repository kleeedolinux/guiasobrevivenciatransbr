import { getAllArticles } from '../../utils/articleActions';
import { calculateReadingTime } from '@/utils/readingTime';
import Link from 'next/link';
import PageTransition, { FadeIn, SlideIn } from '../../components/PageTransition';

export default async function ArticlesPage() {
  const articles = await getAllArticles();

  return (
    <PageTransition className="container mx-auto px-4 py-8">
      <FadeIn>
        <h1 className="text-4xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
          Artigos
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
          Explore nossos artigos sobre a jornada trans no Brasil
        </p>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          <SlideIn 
            key={article.slug} 
            direction={index % 2 === 0 ? 'left' : 'right'}
            delay={index * 0.1}
            className="h-full"
          >
            <Link 
              href={`/articles/${article.slug}`}
              className="block h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <article className="p-6 h-full flex flex-col">
                <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  {article.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex flex-wrap gap-2">
                    {article.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {calculateReadingTime(article.content)}
                    </span>
                    <time className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(article.date).toLocaleDateString('pt-BR')}
                    </time>
                  </div>
                </div>
              </article>
            </Link>
          </SlideIn>
        ))}
      </div>
    </PageTransition>
  );
}