"use client";

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const texts = ['Bem-vind', 'Bem-vinda', 'Bem-vinde', 'Bem-vindo'];
  const [displayText, setDisplayText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const currentText = texts[textIndex];
    const interval = setInterval(() => {
      if (charIndex < currentText.length) {
        setDisplayText((prev) => prev + currentText[charIndex]);
        setCharIndex((prev) => prev + 1);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setTextIndex((prev) => (prev + 1) % texts.length);
          setCharIndex(0);
          setDisplayText(''); // Reset display text for next word
        }, 1000); // Pause before typing the next word
      }
    }, 150); // Typing speed

    return () => clearInterval(interval);
  }, [textIndex, charIndex]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 hover:from-purple-700 hover:to-pink-700 dark:hover:from-purple-300 dark:hover:to-pink-300 transition-all">{displayText} ao Guia de Sobrevivência Trans</h1>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Seu recurso para informações e apoio na jornada trans.</p>
      </header>
      <div>
        <Link href="/articles">
          <button className="px-6 py-3 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition duration-300">
            Explore Artigos
          </button>
        </Link>
      </div>
    </div>
  );
}