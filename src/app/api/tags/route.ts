import { getAllTags } from '@/utils/articleActions';
import { NextResponse } from 'next/server';

export async function GET() {
  const tags = await getAllTags();
  return NextResponse.json({ tags });
} 