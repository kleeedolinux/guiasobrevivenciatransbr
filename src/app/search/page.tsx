'use client';

import React, { Suspense } from 'react';
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

const SearchResults = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('query');

  // Your logic to fetch and display search results based on the query
  return <div>Search results for: {query}</div>;
};

const SearchPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResults />
    </Suspense>
  );
};

export default SearchPage; 