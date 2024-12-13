'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';
import { formatRedditText } from '@/utils/redditFormatter';

// Prevent SSR for ReactMarkdown to avoid hydration issues
const DynamicMarkdown = dynamic(
  () => Promise.resolve(ReactMarkdown),
  { ssr: false }
);

interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
  items?: TableOfContentsItem[];
}

interface ArticleRendererProps {
  content: string;
  references?: { [key: string]: string };
  showToc?: boolean;
}

export default function ArticleRenderer({ content, references = {}, showToc = true }: ArticleRendererProps) {
  const [toc, setToc] = React.useState<TableOfContentsItem[]>([]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Generate table of contents from headings
  React.useEffect(() => {
    const headings = content.match(/^#{1,6}.+$/gm) || [];
    const tocItems: TableOfContentsItem[] = [];
    const stack: TableOfContentsItem[][] = [tocItems];

    headings.forEach(heading => {
      const level = heading.match(/^#+/)?.[0].length || 1;
      const title = heading.replace(/^#+\s*/, '');
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const item: TableOfContentsItem = { id, title, level, items: [] };

      while (stack.length > level) stack.pop();
      if (stack.length < level) {
        for (let i = stack.length; i < level; i++) {
          const parent = stack[stack.length - 1];
          const newLevel: TableOfContentsItem[] = [];
          if (parent.length > 0) {
            if (!parent[parent.length - 1].items) {
              parent[parent.length - 1].items = [];
            }
            parent[parent.length - 1].items!.push({ ...item, items: newLevel });
          }
          stack.push(newLevel);
        }
      }

      stack[stack.length - 1].push(item);
    });

    setToc(tocItems);
  }, [content]);

  // Process content for Reddit links before rendering
  const processedContent = formatRedditText(content);

  // Custom components for markdown rendering
  const components = {
    // Enhanced table rendering
    table: ({ children, ...props }: any) => (
      <div className="overflow-x-auto my-8">
        <table className="min-w-full divide-y divide-gray-700" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }: any) => (
      <thead className="bg-gray-800" {...props}>
        {children}
      </thead>
    ),
    th: ({ children, ...props }: any) => (
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }: any) => (
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300" {...props}>
        {children}
      </td>
    ),
    tr: ({ children, ...props }: any) => (
      <tr className="bg-gray-900 even:bg-gray-800" {...props}>
        {children}
      </tr>
    ),

    // Enhanced heading rendering
    h1: ({ children, ...props }: any) => (
      <h1 className="text-4xl font-bold mt-8 mb-4 text-purple-400" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }: any) => (
      <h2 className="text-3xl font-bold mt-6 mb-4 text-purple-400" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 className="text-2xl font-bold mt-4 mb-3 text-purple-400" {...props}>
        {children}
      </h3>
    ),

    // Enhanced link rendering
    a: ({ children, href, ...props }: any) => {
      // Handle reference-style links
      if (href?.startsWith('#ref-')) {
        const refKey = href.replace('#ref-', '');
        return (
          <sup>
            <a
              href={href}
              className="text-purple-400 hover:text-purple-300 ml-1"
              {...props}
            >
              [{refKey}]
            </a>
          </sup>
        );
      }
      return (
        <a
          href={href}
          className="text-purple-400 hover:text-purple-300 underline"
          {...props}
        >
          {children}
        </a>
      );
    },

    // Enhanced blockquote rendering
    blockquote: ({ children, ...props }: any) => (
      <blockquote
        className="border-l-4 border-purple-400 pl-4 my-4 italic text-gray-300"
        {...props}
      >
        {children}
      </blockquote>
    ),

    // Enhanced code block rendering
    code: ({ inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <div className="relative">
          <div className="absolute right-2 top-2 text-xs text-gray-500">
            {match[1]}
          </div>
          <pre className="mt-4 p-4 bg-gray-800 rounded-lg overflow-x-auto">
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
        </div>
      ) : (
        <code className="bg-gray-800 px-1 py-0.5 rounded text-sm" {...props}>
          {children}
        </code>
      );
    },
  };

  const renderTocItem = (item: TableOfContentsItem) => (
    <li key={item.id} className="my-1">
      <a
        href={`#${item.id}`}
        className="text-gray-300 hover:text-purple-400 transition-colors"
        style={{ marginLeft: `${(item.level - 1) * 1}rem` }}
      >
        {item.title}
      </a>
      {item.items && item.items.length > 0 && (
        <ul className="ml-4">{item.items.map(renderTocItem)}</ul>
      )}
    </li>
  );

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex gap-8">
      {showToc && toc.length > 0 && (
        <div className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-4">
            <h2 className="text-xl font-bold mb-4 text-purple-400">Table of Contents</h2>
            <nav className="toc">
              <ul className="space-y-2">
                {toc.map(renderTocItem)}
              </ul>
            </nav>
          </div>
        </div>
      )}
      
      <article className="min-w-0 flex-1">
        <div className="prose prose-invert prose-purple max-w-none">
          <DynamicMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[
              rehypeKatex,
              rehypeHighlight,
              rehypeSlug,
              [rehypeAutolinkHeadings, { behavior: 'wrap' }],
            ]}
            components={components}
          >
            {processedContent}
          </DynamicMarkdown>
        </div>

        {Object.keys(references).length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-purple-400">References</h2>
            <ol className="list-decimal list-inside space-y-2">
              {Object.entries(references).map(([key, value]) => (
                <li key={key} id={`ref-${key}`} className="text-gray-300">
                  {value}
                </li>
              ))}
            </ol>
          </div>
        )}
      </article>
    </div>
  );
} 