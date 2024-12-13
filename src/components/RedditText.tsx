'use client';

import React from 'react';
import Link from 'next/link';
import { parseRedditLinks } from '@/utils/redditFormatter';

interface RedditTextProps {
  text: string;
  className?: string;
}

export default function RedditText({ text, className = '' }: RedditTextProps) {
  const parts = parseRedditLinks(text);
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return <React.Fragment key={index}>{part.content}</React.Fragment>;
        } else {
          return (
            <Link
              key={index}
              href={`https://www.reddit.com/r/${part.content}/`}
              className="text-purple-400 hover:text-purple-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              r/{part.content}
            </Link>
          );
        }
      })}
    </span>
  );
} 