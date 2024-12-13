import type { Metadata } from 'next'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'Transfeminine Science',
  description: 'A resource for original informational content on transfeminine hormone therapy',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white font-sans flex flex-col min-h-screen">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}

function Header() {
  return (
    <header className="flex flex-col items-center p-4 border-b border-gray-700">
      <div className="flex items-center mb-4">
        <img 
          src="https://storage.googleapis.com/a1aa/image/GAV34jtJhQ70LZTi3OwT1rxyFtrD5GspsUSlD7pzzxm5KpeJA.jpg" 
          alt="Logo of a laboratory flask with a purple liquid" 
          className="h-10 w-10" 
          width={40} 
          height={40}
        />
        <span className="ml-2 text-2xl font-bold text-purple-400">Transfeminine Science</span>
      </div>
      <nav className="flex space-x-4">
        <a href="/articles" className="text-purple-400 hover:underline">Articles</a>
        <a href="/articles/latest" className="text-purple-400 hover:underline">Latest</a>
        <a href="/articles/series" className="text-purple-400 hover:underline">Series</a>
        <a href="/misc" className="text-purple-400 hover:underline">Misc</a>
        <a href="/about" className="text-purple-400 hover:underline">About</a>
      </nav>
      <div className="flex space-x-4 mt-4">
        <a href="/search" className="text-purple-400 hover:text-purple-300">
          <i className="fas fa-search"></i>
        </a>
        <button className="text-purple-400 hover:text-purple-300">
          <i className="fas fa-moon"></i>
        </button>
        <button className="text-purple-400 hover:text-purple-300">
          <i className="fas fa-language"></i>
        </button>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="p-4 border-t border-gray-700 text-center">
      <div className="flex justify-center space-x-4 mb-4">
        <a href="https://github.com" className="text-purple-400 hover:underline">
          <i className="fab fa-github"></i> GitHub
        </a>
        <a href="/contact" className="text-purple-400 hover:underline">
          <i className="fas fa-envelope"></i> Contact Us
        </a>
        <a href="/about" className="text-purple-400 hover:underline">
          <i className="fas fa-info-circle"></i> About
        </a>
        <a href="/rss.xml" className="text-purple-400 hover:underline">
          <i className="fas fa-rss"></i> RSS
        </a>
      </div>
      <p>© 2024 Transfeminine Science</p>
    </footer>
  )
} 