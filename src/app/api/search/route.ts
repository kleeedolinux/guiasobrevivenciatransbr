import { ArticleManager } from '@/utils/articleManager';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json([]);
  }

  const articleManager = ArticleManager.getInstance();
  const results = articleManager.searchArticles(query);

  return NextResponse.json(results);
} 