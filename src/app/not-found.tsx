'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const suggestions = [
  { text: 'Artigos Recentes', href: '/articles/latest', description: 'Confira nossos artigos mais recentes sobre a jornada trans' },
  { text: 'Buscar', href: '/search', description: 'Procure por tópicos específicos em nossa biblioteca' },
  { text: 'Séries', href: '/articles/series', description: 'Explore nossas séries de artigos organizados por tema' },
  { text: 'Página Inicial', href: '/', description: 'Volte para a página inicial do guia' },
];

const rainbowColors = [
  'from-pink-500 to-blue-500',   // Trans flag colors
  'from-blue-500 to-pink-500',
  'from-white to-pink-500',
  'from-pink-500 to-white',
];

export default function NotFound() {
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCurrentColorIndex((prev) => (prev + 1) % rainbowColors.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          {/* 404 Number with gradient animation */}
          <motion.h1
            className={`text-8xl font-bold bg-gradient-to-r ${rainbowColors[currentColorIndex]} bg-clip-text text-transparent transition-colors duration-1000`}
          >
            404
          </motion.h1>

          {/* Main message */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-3xl font-bold text-purple-700 dark:text-purple-400"
          >
            Página Não Encontrada
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-lg text-gray-600 dark:text-gray-400"
          >
            Assim como cada jornada é única, às vezes tomamos caminhos inesperados.
            Vamos ajudar você a encontrar o que procura?
          </motion.p>

          {/* Suggestions Grid */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Link
                  href={suggestion.href}
                  className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-purple-100 dark:border-purple-900 group"
                >
                  <h3 className="text-xl font-semibold text-purple-700 dark:text-purple-400 group-hover:text-purple-800 dark:group-hover:text-purple-300 transition-colors">
                    {suggestion.text} →
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {suggestion.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Rainbow Butterfly Animation */}
          <motion.div
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/4 right-1/4 opacity-50 pointer-events-none"
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              className={`transform rotate-45 bg-gradient-to-r ${rainbowColors[currentColorIndex]} bg-clip-text`}
            >
              <path
                d="M12 2L8 6l4 4-4 4 4 4 4-4-4-4 4-4z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
