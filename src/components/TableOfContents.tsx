'use client';

import { useEffect, useState } from 'react';

interface HeadingInfo {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  articleContent: string;
}

export default function TableOfContents({ articleContent }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<HeadingInfo[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Function to extract headings from markdown content
    const extractHeadings = (content: string): HeadingInfo[] => {
      const headingRegex = /^(#{1,6})\s+(.+)$/gm;
      const headings: HeadingInfo[] = [];
      let match;

      while ((match = headingRegex.exec(content)) !== null) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        headings.push({ id, text, level });
      }

      return headings;
    };

    const headingInfo = extractHeadings(articleContent);
    setHeadings(headingInfo);

    // Set up intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            // Update URL hash without scrolling
            const url = new URL(window.location.href);
            url.hash = entry.target.id;
            window.history.replaceState({}, '', url.toString());
          }
        });
      },
      {
        rootMargin: '-20% 0px -80% 0px',
        threshold: 0.5,
      }
    );

    // Observe all section headings after a short delay to ensure they're rendered
    setTimeout(() => {
      headingInfo.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) {
          observer.observe(element);
        }
      });

      // If there's a hash in the URL, scroll to it after a short delay
      if (window.location.hash) {
        const id = window.location.hash.slice(1);
        const element = document.getElementById(id);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveId(id);
          }, 100);
        }
      }
    }, 100);

    return () => observer.disconnect();
  }, [articleContent]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Update URL hash
      window.history.pushState({}, '', `#${id}`);
      // Scroll to element with offset for fixed header
      const header = document.querySelector('header');
      const headerHeight = header ? header.offsetHeight : 0;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight - 24; // 24px extra padding

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      setActiveId(id);
    }
  };

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-8 pl-4 border-l border-gray-200 dark:border-gray-800">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Índice
      </h2>
      <ul className="space-y-2 max-h-[calc(100vh-8rem)] overflow-y-auto">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{
              paddingLeft: `${(heading.level - 1) * 0.75}rem`,
            }}
          >
            <button
              onClick={() => handleClick(heading.id)}
              className={`text-left w-full px-2 py-1 text-sm rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 break-words ${
                activeId === heading.id
                  ? 'text-purple-600 dark:text-purple-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
