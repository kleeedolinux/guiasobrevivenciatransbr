'use client';

import React, { Suspense } from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { formatDate } from '@/utils/dateFormatter';
import { useTheme } from 'next-themes';

interface SearchResult {
  slug: string;
  title: string;
  excerpt: string;
  highlightedExcerpt: string;
  date: string;
  tags: string[];
  series?: {
    name: string;
    order: number;
  };
}

interface TagCount {
  tag: string;
  count: number;
}

const SearchResults = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const currentTag = searchParams.get('tag');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(query);
  const [allTags, setAllTags] = useState<TagCount[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (currentTag) params.append('tag', currentTag);
        
        const response = await fetch(`/api/search?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Search request failed');
        }
        const data = await response.json();
        setResults(data.results);
        
        // Update tags with counts
        const tagCounts = new Map<string, number>();
        data.results.forEach((result: SearchResult) => {
          result.tags.forEach(tag => {
            const normalizedTag = tag.toLowerCase();
            tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) || 0) + 1);
          });
        });
        
        const uniqueTags = Array.from(tagCounts.entries()).map(([tag, count]) => ({
          tag,
          count
        }));
        setAllTags(uniqueTags);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, currentTag]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('q', searchTerm);
    if (currentTag) params.append('tag', currentTag);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 text-purple-600 dark:text-purple-400">Pesquisar Artigos</h1>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Pesquisar por título, conteúdo ou tags..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Buscar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Tags Sidebar */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="sticky top-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-purple-600 dark:text-purple-400">Filtrar por Tag</h3>
                <div className="max-h-[calc(100vh-16rem)] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-200">
                  {allTags
                    .sort((a, b) => b.count - a.count)
                    .map(({ tag, count }) => (
                      <div
                        key={tag}
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                          currentTag === tag
                            ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => {
                          const params = new URLSearchParams(searchParams.toString());
                          if (currentTag === tag) {
                            params.delete('tag');
                          } else {
                            params.set('tag', tag);
                          }
                          router.push(`/search?${params.toString()}`);
                        }}
                      >
                        <span className="text-sm font-medium">{tag}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700">
                          {count}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="flex-grow">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-6">
                {results.map((result) => (
                  <Link
                    key={result.slug}
                    href={`/articles/${result.slug}`}
                    className="block bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <article>
                      <h2 className="text-xl font-semibold mb-2 text-purple-600 dark:text-purple-400">
                        {result.title}
                      </h2>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {formatDate(result.date)}
                      </div>
                      <div
                        className="text-gray-700 dark:text-gray-300 mb-4"
                        dangerouslySetInnerHTML={{ __html: result.highlightedExcerpt }}
                      />
                      <div className="flex flex-wrap gap-2">
                        {result.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-2">Nenhum resultado encontrado</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Tente diferentes palavras-chave ou remova alguns filtros
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchPage = () => {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SearchResults />
    </Suspense>
  );
};

export default SearchPage;