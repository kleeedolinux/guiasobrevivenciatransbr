import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import ThemeSwitcher from '../components/ThemeSwitcher';
import ThemeToggle from '../components/ThemeToggle';
import MobileMenu from '../components/MobileMenu';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

const navigation = [
  { name: 'Início', href: '/' },
  { name: 'Artigos', href: '/articles' },
  { name: 'Séries', href: '/series' },
  { name: 'Buscar', href: '/search' },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <ThemeSwitcher />
      </head>
      <body className={`${inter.className} bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-purple-950 min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 shadow-lg">
            <nav className="container mx-auto px-4">
              <div className="flex items-center justify-between h-16">
                <div className="flex-shrink-0">
                  <Link 
                    href="/" 
                    className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 hover:from-purple-700 hover:to-pink-700 dark:hover:from-purple-300 dark:hover:to-pink-300 transition-all"
                  >
                    Guia de Sobrevivência Trans
                  </Link>
                </div>
                <div className="hidden md:flex md:items-center">
                  <div className="flex items-baseline space-x-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="relative text-gray-800 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-colors group"
                      >
                        {item.name}
                        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-purple-600 dark:bg-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                      </Link>
                    ))}
                  </div>
                  <div className="ml-6">
                    <ThemeToggle />
                  </div>
                </div>
                <MobileMenu navigation={navigation} />
              </div>
            </nav>
          </header>

          <main className="flex-grow">
            {children}
          </main>

          <footer className="mt-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
            <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-400 mb-4">
                    Sobre o Guia
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Um recurso abrangente para ajudar pessoas trans a navegarem sua jornada no Brasil.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-400 mb-4">
                    Links Rápidos
                  </h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/articles/latest" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                        Artigos Recentes
                      </Link>
                    </li>
                    <li>
                      <Link href="/search" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                        Buscar
                      </Link>
                    </li>
                    <li>
                      <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                        Sobre
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-400 mb-4">
                    Comunidade
                  </h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/community" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                        Participe
                      </Link>
                    </li>
                    <li>
                      <a 
                        href="https://github.com/kleeedolinux/guiasobrevivenciatransbr" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      >
                        GitHub
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <p className="text-center text-gray-600 dark:text-gray-400">
                  {new Date().getFullYear()} Guia de Sobrevivência Trans Brasil. Feito com {'💜'} pela comunidade.
                </p>
              </div>
            </div>
          </footer>
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}