import './globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { Metadata } from 'next';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Guia de Sobrevivência Trans no Brasil',
  description: 'Informações baseadas em evidências sobre terapia hormonal transfeminina',
};

const navigation = [
  { name: 'Início', href: '/' },
  { name: 'Artigos', href: '/articles' },
  { name: 'Séries', href: '/articles/series' },
  { name: 'Recentes', href: '/articles/latest' },
  { name: 'Buscar', href: '/search' },
  { name: 'Comunidade', href: '/community' },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-gray-900 text-black dark:text-gray-100 min-h-screen`}>
        <ThemeProvider>
        <link rel="icon" href="/favicon.ico" sizes="any" />
          <header className="bg-white dark:bg-gray-800 shadow-lg">
            <nav className="container mx-auto px-4">
              <div className="flex items-center justify-between h-16">
                <div className="flex-shrink-0">
                  <Link href="/" className="text-2xl font-bold text-purple-700 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                    Guia de Sobrevivência Trans
                  </Link>
                </div>
                <div className="hidden md:flex md:items-center">
                  <div className="flex items-baseline space-x-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="text-black dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                  <div className="ml-4">
                    <ThemeToggle />
                  </div>
                </div>
              </div>
              {/* Mobile menu */}
              <div className="md:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-black dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="px-3 py-2">
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </nav>
          </header>
          <main className="container mx-auto px-4">{children}</main>
          <footer className="bg-white dark:bg-gray-800 mt-12">
            <div className="container mx-auto px-4 py-8">
              <div className="text-center text-black dark:text-gray-400">
                <p>© {new Date().getFullYear()} Guia de Sobrevivência Trans no Brasil. Todos os direitos reservados.</p>
                <p className="mt-2">
                  Este site fornece informações sobre terapia hormonal transfeminina apenas para fins educacionais.
                  Consulte profissionais de saúde para aconselhamento médico.
                </p>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
} 