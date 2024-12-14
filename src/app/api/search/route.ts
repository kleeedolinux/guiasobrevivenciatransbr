import { searchArticles } from '@/utils/articleActions';
import { NextResponse } from 'next/server';

function highlightMatches(text: string, query: string): string {
  if (!query) return text;
  
  const searchTerms = query.toLowerCase().split(/\s+/);
  let highlightedText = text;
  
  searchTerms.forEach(term => {
    const regex = new RegExp(`(${term})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-500/30">$1</mark>');
  });
  
  return highlightedText;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() || '';
    const tag = searchParams.get('tag')?.toLowerCase() || '';

    console.log('Search request:', { query, tag }); // Debug log

    const results = await searchArticles(query, tag);

    console.log('Search results count:', results.length); // Debug log

    return NextResponse.json({
      results: results.map(article => ({
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        date: article.date,
        tags: article.tags,
        series: article.series,
        highlightedExcerpt: highlightMatches(article.excerpt, query)
      })),
      query,
      tag,
      count: results.length
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}