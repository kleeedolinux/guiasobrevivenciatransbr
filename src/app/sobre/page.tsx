'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const missions = [
  {
    title: "Unificação",
    description: "Criar um espaço centralizado para todo o conteúdo trans em português brasileiro",
    icon: "🌈"
  },
  {
    title: "Educação",
    description: "Compartilhar conhecimento e informações precisas sobre a experiência trans",
    icon: "📚"
  },
  {
    title: "Comunidade",
    description: "Construir uma comunidade forte e acolhedora para pessoas trans e aliades",
    icon: "💜"
  },
  {
    title: "Acessibilidade",
    description: "Tornar informações vitais acessíveis a todas as pessoas que precisam",
    icon: "🌟"
  }
];

const socialLinks = [
  { name: 'GitHub', url: 'https://github.com/kleeedolinux', icon: '💻' },
  { name: 'Twitter', url: 'https://twitter.com/klee11z', icon: '🐦' }
];

export default function SobreMim() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-purple-200 dark:bg-purple-900/30 rounded-full blur-3xl opacity-30" />
          <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-pink-200 dark:bg-pink-900/30 rounded-full blur-3xl opacity-30" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center"
          >
            <motion.h1
              variants={fadeIn}
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-6"
            >
              Júlia Klee
            </motion.h1>
            <motion.p
              variants={fadeIn}
              className="text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Criadora do Guia de Sobrevivência Trans, unificando e democratizando o acesso à informação trans em português
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Mission Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <motion.h2
          variants={fadeIn}
          className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
        >
          Nossa Missão
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {missions.map((mission, index) => (
            <motion.div
              key={mission.title}
              variants={fadeIn}
              whileHover={{ scale: 1.02 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-purple-100/50 dark:border-purple-900/50"
            >
              <span className="text-4xl mb-4 block">{mission.icon}</span>
              <h3 className="text-xl font-semibold text-purple-700 dark:text-purple-400 mb-2">
                {mission.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {mission.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* About Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <motion.div
          variants={fadeIn}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-purple-100/50 dark:border-purple-900/50"
        >
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            Sobre o Projeto
          </h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300">
              O Guia de Sobrevivência Trans nasceu da necessidade de ter um espaço centralizado e confiável para informações sobre a experiência trans em português. Como pessoa trans, entendo a importância de ter acesso a informações precisas e acolhedoras em nossa língua materna.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-4">
              Nossa missão é criar uma biblioteca digital abrangente que sirva como guia para pessoas trans, familiares, profissionais de saúde e aliades. Acreditamos que o conhecimento é poder, e que todas as pessoas merecem ter acesso a informações que podem transformar suas vidas.
            </p>
          </div>
        </motion.div>
      </motion.section>

      {/* Connect Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <motion.h2
          variants={fadeIn}
          className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
        >
          Vamos Conectar
        </motion.h2>

        <motion.div
          variants={fadeIn}
          className="flex justify-center space-x-6"
        >
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">
                {link.icon}
              </span>
              <span className="font-medium">{link.name}</span>
            </a>
          ))}
        </motion.div>
      </motion.section>

      {/* Call to Action */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center"
      >
        <motion.div
          variants={fadeIn}
          className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 p-8 rounded-2xl shadow-lg"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Faça Parte dessa Jornada
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Junte-se a nós na missão de criar o maior e mais completo guia trans em português do Brasil.
          </p>
          <Link
            href="/community"
            className="inline-block bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-purple-50 transition-colors"
          >
            Participe da Comunidade
          </Link>
        </motion.div>
      </motion.section>
    </div>
  );
}
