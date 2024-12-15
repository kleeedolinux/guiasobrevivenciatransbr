'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import PageTransition, { FadeIn, SlideIn, ScaleIn } from '../../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
}

interface TagCount {
  tag: string;
  count: number;
}

function SearchInput({ 
  searchTerm, 
  setSearchTerm, 
  handleSearch, 
  loading 
}: { 
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearch: () => void;
  loading: boolean;
}) {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Pesquisar por título, conteúdo ou tags..."
          className="w-full px-6 py-4 rounded-full border-2 border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 pr-12"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

function TagList({ 
  tags, 
  currentTag, 
  onTagClick 
}: { 
  tags: TagCount[];
  currentTag: string | null;
  onTagClick: (tag: string) => void;
}) {
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-6 shadow-lg backdrop-blur-lg">
      <h3 className="text-lg font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
        Filtrar por Tag
      </h3>
      <div className="max-h-[calc(100vh-16rem)] overflow-y-auto space-y-2 pr-2">
        {tags
          .sort((a, b) => b.count - a.count)
          .map(({ tag, count }) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                currentTag === tag
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 shadow-md'
                  : 'hover:bg-purple-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => onTagClick(tag)}
            >
              <span className="text-sm font-medium">{tag}</span>
              <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400">
                {count}
              </span>
            </motion.div>
          ))}
      </div>
    </div>
  );
}

function SearchResultCard({ result }: { result: SearchResult }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-6 shadow-lg backdrop-blur-lg hover:shadow-xl transition-all duration-300"
    >
      <Link href={`/articles/${result.slug}`}>
        <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
          {result.title}
        </h2>
      </Link>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{result.excerpt}</p>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {result.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
            >
              {tag}
            </span>
          ))}
        </div>
        <time className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(result.date).toLocaleDateString('pt-BR')}
        </time>
      </div>
    </motion.div>
  );
}

function SearchResults() {
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

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (currentTag === tag) {
      params.delete('tag');
    } else {
      params.set('tag', tag);
    }
    router.push(`/search?${params.toString()}`);
  };

  return (
    <PageTransition>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
                Pesquisar Artigos
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Encontre artigos por título, conteúdo ou tags
              </p>
              <SearchInput
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                handleSearch={handleSearch}
                loading={loading}
              />
            </div>
          </FadeIn>

          <div className="flex flex-col lg:flex-row gap-8">
            <SlideIn direction="left" className="w-full lg:w-64 shrink-0">
              <div className="sticky top-24">
                <TagList
                  tags={allTags}
                  currentTag={currentTag}
                  onTagClick={handleTagClick}
                />
              </div>
            </SlideIn>

            <div className="flex-grow">
              <AnimatePresence mode="wait">
                {loading ? (
                  <ScaleIn className="flex justify-center items-center py-12">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  </ScaleIn>
                ) : results.length > 0 ? (
                  <div className="grid gap-6">
                    {results.map((result) => (
                      <SearchResultCard key={result.slug} result={result} />
                    ))}
                  </div>
                ) : (
                  <ScaleIn className="text-center py-12">
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-8 shadow-lg backdrop-blur-lg">
                      <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                        Nenhum resultado encontrado
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Tente ajustar sua pesquisa ou remover os filtros
                      </p>
                    </div>
                  </ScaleIn>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}