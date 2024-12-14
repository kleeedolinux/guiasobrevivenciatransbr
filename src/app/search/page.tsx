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

        // Calculate tag counts from all articles
        const tagCounts: { [key: string]: number } = {};
        data.results.forEach((result: SearchResult) => {
          result.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        });
        
        const sortedTags = Object.entries(tagCounts)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count);
        
        setAllTags(sortedTags);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, currentTag]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.append('q', searchTerm);
    if (currentTag) params.append('tag', currentTag);
    router.push(`/search?${params.toString()}`);
  };

  const handleTagClick = (selectedTag: string) => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (selectedTag !== currentTag) {
      params.append('tag', selectedTag);
    }
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="sticky top-8 space-y-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div>
                <h3 className="text-lg font-semibold mb-3">Buscar</h3>
                <form onSubmit={handleSearch}>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Digite sua busca..."
                      className="w-full p-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Buscar
                    </button>
                  </div>
                </form>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Tags</h3>
                <div className="space-y-2">
                  {allTags.map(({ tag: tagName, count }) => (
                    <button
                      key={tagName}
                      onClick={() => handleTagClick(tagName)}
                      className={`w-full text-left px-3 py-2 rounded-lg flex justify-between items-center transition-colors ${
                        tagName === currentTag
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span>{tagName}</span>
                      <span className="text-sm bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {currentTag && (
              <div className="mb-4">
                <span className="text-sm">
                  Filtrando por tag: 
                  <span className="font-semibold ml-1">{currentTag}</span>
                  <button
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (query) params.append('q', query);
                      router.push(`/search?${params.toString()}`);
                    }}
                    className="ml-2 text-blue-500 hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-8">
                {results.map((result) => (
                  <article key={result.slug} className="border-b dark:border-gray-700 pb-6">
                    <Link href={`/articles/${result.slug}`}>
                      <h2 className="text-2xl font-bold hover:text-blue-500 dark:hover:text-blue-400 mb-2">
                        {result.title}
                      </h2>
                    </Link>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {formatDate(result.date)}
                    </div>
                    <p 
                      className="text-gray-700 dark:text-gray-300 mb-4 [&_mark]:bg-yellow-200 dark:[&_mark]:bg-yellow-500/30" 
                      dangerouslySetInnerHTML={{ __html: result.highlightedExcerpt }} 
                    />
                    <div className="flex flex-wrap gap-2">
                      {result.tags.map((tagName) => (
                        <button
                          key={tagName}
                          onClick={() => handleTagClick(tagName)}
                          className={`text-sm px-3 py-1 rounded-full transition-colors ${
                            tagName === currentTag
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {tagName}
                        </button>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            ) : query || currentTag ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">Nenhum resultado encontrado.</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Tente usar termos diferentes ou remover filtros.
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  Digite algo para buscar ou selecione uma tag.
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
    <Suspense fallback={
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
};

export default SearchPage;