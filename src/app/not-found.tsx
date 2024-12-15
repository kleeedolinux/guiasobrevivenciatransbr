'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const suggestions = [
  { text: 'Artigos Recentes', href: '/articles/latest', icon: '📚', description: 'Confira nossos artigos mais recentes sobre a jornada trans' },
  { text: 'Buscar', href: '/search', icon: '🔍', description: 'Procure por tópicos específicos em nossa biblioteca' },
  { text: 'Comunidade', href: '/community', icon: '💜', description: 'Conecte-se com nossa comunidade acolhedora' },
  { text: 'Página Inicial', href: '/', icon: '🏠', description: 'Volte para a página inicial do guia' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-purple-200 dark:bg-purple-900/30 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-pink-200 dark:bg-pink-900/30 rounded-full blur-3xl opacity-30" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center max-w-4xl mx-auto"
      >
        {/* Main 404 section */}
        <motion.div
          variants={itemVariants}
          className="relative"
        >
          <h1 className="text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 opacity-10 blur-3xl -z-10" />
        </motion.div>

        <motion.h2
          variants={itemVariants}
          className="mt-8 text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
        >
          Página Não Encontrada
        </motion.h2>

        <motion.p
          variants={itemVariants}
          className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
        >
          Assim como cada jornada é única, às vezes tomamos caminhos inesperados.
          Não se preocupe, estamos aqui para ajudar você a encontrar seu caminho.
        </motion.p>

        {/* Suggestions Grid */}
        <motion.div
          variants={containerVariants}
          className="mt-16 grid gap-6 sm:grid-cols-2 px-4"
        >
          {suggestions.map((suggestion) => (
            <motion.div
              key={suggestion.href}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={suggestion.href}
                className="block p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-xl transition-all border border-purple-100/50 dark:border-purple-900/50 group"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-3xl">{suggestion.icon}</span>
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-semibold text-purple-700 dark:text-purple-400 group-hover:text-purple-800 dark:group-hover:text-purple-300 transition-colors flex items-center">
                      {suggestion.text}
                      <motion.span
                        className="inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        initial={{ x: -10 }}
                        animate={{ x: 0 }}
                      >
                        →
                      </motion.span>
                    </h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      {suggestion.description}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
