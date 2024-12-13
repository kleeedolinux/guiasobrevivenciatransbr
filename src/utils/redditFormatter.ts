'use client';

import React from 'react';
import Link from 'next/link';

export function formatRedditText(text: string): string {
  const redditPattern = /r\/([a-zA-Z0-9_]+)/g;
  return text.replace(redditPattern, (match, subreddit) => {
    return `[${match}](https://www.reddit.com/r/${subreddit}/)`;
  });
}

export function parseRedditLinks(text: string): Array<{ type: 'text' | 'reddit'; content: string }> {
  const redditPattern = /r\/([a-zA-Z0-9_]+)/g;
  const parts = text.split(redditPattern);
  
  return parts.map((part, index) => {
    if (index % 2 === 0) {
      return { type: 'text', content: part };
    } else {
      return { type: 'reddit', content: part };
    }
  });
} 