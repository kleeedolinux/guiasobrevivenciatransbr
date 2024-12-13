'use client';

import dynamic from 'next/dynamic';
import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
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

// Memoized components
const MemoizedTableOfContents = React.memo(function TableOfContents({ 
  items, 
  className 
}: { 
  items: TableOfContentsItem[]; 
  className?: string;
}) {
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

  return (
    <div className={className}>
      <div className="sticky top-4">
        <h2 className="text-xl font-bold mb-4 text-purple-400">Table of Contents</h2>
        <nav className="toc">
          <ul className="space-y-2">
            {items.map(renderTocItem)}
          </ul>
        </nav>
      </div>
    </div>
  );
});

// Update ExternalImage component to handle its own wrapper
const ExternalImage = React.memo(({ src, alt, className, isInParagraph }: { 
  src: string; 
  alt?: string; 
  className?: string;
  isInParagraph?: boolean;
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      setDimensions({ width: img.width, height: img.height });
      setIsLoading(false);
    };
    img.onerror = () => {
      setError(true);
      setIsLoading(false);
    };
  }, [src]);

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
        Failed to load image: {alt || src}
      </div>
    );
  }

  const imageContent = (
    <span className="relative inline-block" style={{ 
      aspectRatio: dimensions.width && dimensions.height ? 
        `${dimensions.width} / ${dimensions.height}` : '16/9',
      minHeight: '200px'
    }}>
      <span className={`absolute inset-0 ${isLoading ? 'animate-pulse bg-gray-800' : ''}`}>
        {!isLoading && (
          <Image
            src={src}
            alt={alt || ''}
            fill
            className={`object-contain rounded-lg ${className || ''}`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
            quality={90}
            priority={false}
          />
        )}
      </span>
    </span>
  );

  // If in paragraph context, return just the image
  if (isInParagraph) {
    return imageContent;
  }

  // If not in paragraph, wrap with figure
  return (
    <figure className="my-4">
      {imageContent}
      {alt && (
        <figcaption className="text-center text-sm text-gray-400 mt-2">
          {alt}
        </figcaption>
      )}
    </figure>
  );
});

ExternalImage.displayName = 'ExternalImage';

// Update components
const components = {
  table: React.memo(({ children, ...props }: any) => (
    <div className="overflow-x-auto my-8">
      <table className="min-w-full divide-y divide-gray-700" {...props}>
        {children}
      </table>
    </div>
  )),
  thead: React.memo(({ children, ...props }: any) => (
    <thead className="bg-gray-800" {...props}>
      {children}
    </thead>
  )),
  th: React.memo(({ children, ...props }: any) => (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider" {...props}>
      {children}
    </th>
  )),
  td: React.memo(({ children, ...props }: any) => (
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300" {...props}>
      {children}
    </td>
  )),
  tr: React.memo(({ children, ...props }: any) => (
    <tr className="bg-gray-900 even:bg-gray-800" {...props}>
      {children}
    </tr>
  )),
  h1: React.memo(({ children, ...props }: any) => (
    <h1 className="text-4xl font-bold mt-8 mb-4 text-purple-400" {...props}>
      {children}
    </h1>
  )),
  h2: React.memo(({ children, ...props }: any) => (
    <h2 className="text-3xl font-bold mt-6 mb-4 text-purple-400" {...props}>
      {children}
    </h2>
  )),
  h3: React.memo(({ children, ...props }: any) => (
    <h3 className="text-2xl font-bold mt-4 mb-3 text-purple-400" {...props}>
      {children}
    </h3>
  )),
  a: React.memo(({ children, href, ...props }: any) => {
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
  }),
  blockquote: React.memo(({ children, ...props }: any) => (
    <blockquote
      className="border-l-4 border-purple-400 pl-4 my-4 italic text-gray-300"
      {...props}
    >
      {children}
    </blockquote>
  )),
  code: React.memo(({ inline, className, children, ...props }: any) => {
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
  }),
  img: React.memo(({ src, alt, node, ...props }: any) => {
    if (!src) return null;

    // Check if the image is inside a paragraph
    const isInParagraph = node?.parentNode?.tagName === 'paragraph';

    // Handle external images
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return <ExternalImage src={src} alt={alt} isInParagraph={isInParagraph} />;
    }

    // Handle local images - simplified to avoid nesting issues
    const ImageContent = () => (
      <img
        src={src}
        alt={alt || ''}
        className="rounded-lg max-w-full h-auto"
        {...props}
      />
    );

    // If in paragraph, just return the image
    if (isInParagraph) {
      return <ImageContent />;
    }

    // If not in paragraph, wrap with figure and caption
    return (
      <figure className="my-4">
        <ImageContent />
        {alt && (
          <figcaption className="text-center text-sm text-gray-400 mt-2">
            {alt}
          </figcaption>
        )}
      </figure>
    );
  }),
  p: React.memo(({ children, ...props }: any) => {
    // Check if the paragraph contains only an image
    const containsOnlyImage = React.Children.count(children) === 1 && 
      React.isValidElement(children) && 
      (children.type === 'img' || children.type === ExternalImage);

    // If it contains only an image, return the image directly
    if (containsOnlyImage) {
      return children;
    }

    return <p {...props}>{children}</p>;
  }),
};

export default function ArticleRenderer({ content, references = {}, showToc = true }: ArticleRendererProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Memoize table of contents generation
  const toc = useMemo(() => {
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

    return tocItems;
  }, [content]);

  // Memoize processed content
  const processedContent = useMemo(() => formatRedditText(content), [content]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex gap-8">
      {showToc && toc.length > 0 && (
        <MemoizedTableOfContents 
          items={toc} 
          className="hidden lg:block w-64 shrink-0" 
        />
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