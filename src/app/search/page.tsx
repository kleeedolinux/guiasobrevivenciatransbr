'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { formatDate } from '@/utils/dateFormatter';

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

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialTag = searchParams.get('tag') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [activeTag, setActiveTag] = useState(initialTag);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);

  // Load available tags
  useEffect(() => {
    async function loadTags() {
      try {
        const response = await fetch('/api/tags');
        const data = await response.json();
        setAvailableTags(data.tags);
      } catch (error) {
        console.error('Error loading tags:', error);
      } finally {
        setIsLoadingTags(false);
      }
    }

    loadTags();
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      if (query !== initialQuery) {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (activeTag) params.set('tag', activeTag);
        const newUrl = `/search${params.toString() ? `?${params.toString()}` : ''}`;
        router.push(newUrl, { scroll: false });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, initialQuery, activeTag, router]);

  // Fetch results when debounced query or tag changes
  useEffect(() => {
    async function fetchResults() {
      if (!debouncedQuery && !activeTag) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedQuery) params.set('q', debouncedQuery);
        if (activeTag) params.set('tag', activeTag);
        const response = await fetch(`/api/search?${params.toString()}`);
        const data = await response.json();
        setResults(data.results);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResults();
  }, [debouncedQuery, activeTag]);

  // Handle tag click
  const handleTagClick = (tag: string) => {
    if (activeTag === tag) {
      setActiveTag('');
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      router.push(`/search${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
    } else {
      setActiveTag(tag);
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      params.set('tag', tag);
      router.push(`/search?${params.toString()}`, { scroll: false });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-purple-400">Buscar Artigos</h1>

      <div className="grid gap-8 md:grid-cols-[300px,1fr]">
        {/* Left Sidebar - Search Options */}
        <div className="space-y-8">
          {/* Text Search */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-purple-400">Busca por Texto</h2>
            <div className="relative">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Digite para buscar artigos..."
                className="w-full px-4 py-3 bg-gray-800 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              {isLoading && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-purple-400"></div>
                </div>
              )}
            </div>
          </div>

          {/* Tag Search */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-purple-400">Busca por Categoria</h2>
            <div className="bg-gray-800 rounded-lg p-4">
              {isLoadingTags ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-purple-400"></div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={`text-sm px-3 py-1 rounded-full transition-colors ${
                        activeTag === tag
                          ? 'bg-purple-900 text-purple-100'
                          : 'bg-gray-700 text-purple-300 hover:bg-gray-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {(activeTag || query) && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-purple-400">Filtros Ativos</h2>
              <div className="space-y-2">
                {activeTag && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Categoria:</span>
                    <button
                      onClick={() => handleTagClick(activeTag)}
                      className="flex items-center gap-1 px-3 py-1 bg-purple-900 text-purple-100 rounded-full hover:bg-purple-800"
                    >
                      {activeTag}
                      <span className="text-sm">×</span>
                    </button>
                  </div>
                )}
                {query && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Texto:</span>
                    <button
                      onClick={() => setQuery('')}
                      className="flex items-center gap-1 px-3 py-1 bg-purple-900 text-purple-100 rounded-full hover:bg-purple-800"
                    >
                      {query}
                      <span className="text-sm">×</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Results */}
        <div>
          {/* Search Results Info */}
          {(debouncedQuery || activeTag) && (
            <div className="mb-4 text-gray-400">
              {results.length === 0 ? (
                <p>
                  Nenhum resultado encontrado
                  {debouncedQuery && ` para "${debouncedQuery}"`}
                  {activeTag && ` na categoria "${activeTag}"`}
                </p>
              ) : (
                <p>
                  {results.length} {results.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                  {debouncedQuery && ` para "${debouncedQuery}"`}
                  {activeTag && ` na categoria "${activeTag}"`}
                </p>
              )}
            </div>
          )}

          {/* Results */}
          <div className="space-y-6">
            {results.map((result) => (
              <article key={result.slug} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
                <h2 className="text-2xl font-bold mb-2">
                  <Link
                    href={`/articles/${result.slug}`}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    {result.title}
                  </Link>
                </h2>
                {result.series && (
                  <div className="text-sm text-gray-400 mb-2">
                    Parte da série: {result.series.name}
                  </div>
                )}
                <div
                  className="text-gray-300 mb-4"
                  dangerouslySetInnerHTML={{ __html: result.highlightedExcerpt }}
                />
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-sm text-gray-400">
                    {formatDate(result.date)}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {result.tags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className={`text-sm px-2 py-1 rounded-full transition-colors ${
                          activeTag === tag
                            ? 'bg-purple-900 text-purple-100'
                            : 'bg-gray-700 text-purple-300 hover:bg-gray-600'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {!debouncedQuery && !activeTag && (
            <div className="text-center text-gray-400 mt-8">
              <p>Digite algo para buscar artigos ou selecione uma categoria...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 