import { searchArticles } from '@/utils/articleActions';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase() || '';
  const tag = searchParams.get('tag')?.toLowerCase();

  const results = await searchArticles(query, tag);

  return NextResponse.json({
    results: results.map(article => ({
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      date: article.date,
      tags: article.tags,
      series: article.series,
      highlightedExcerpt: query ? highlightMatches(article.excerpt, query) : article.excerpt
    })),
    query,
    tag,
    total: results.length
  });
}

function highlightMatches(text: string, query: string): string {
  const words = query.split(/\s+/);
  let highlighted = text;
  
  words.forEach(word => {
    if (word.length > 2) { // Only highlight words longer than 2 characters
      const regex = new RegExp(`(${word})`, 'gi');
      highlighted = highlighted.replace(regex, '<mark>$1</mark>');
    }
  });
  
  return highlighted;
} 