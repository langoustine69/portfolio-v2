'use client';

import Link from 'next/link';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-shell-800 dark:border-shell-800 light:border-shell-200 bg-shell-950/80 dark:bg-shell-950/80 light:bg-shell-50/80 backdrop-blur-lg">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🦞</span>
              <span className="text-xl font-bold gradient-text">langoustine69</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-shell-300 dark:text-shell-300 light:text-shell-600 hover:text-lobster-400 transition-colors">
                Home
              </Link>
              <Link href="/agents" className="text-shell-300 dark:text-shell-300 light:text-shell-600 hover:text-lobster-400 transition-colors">
                Agents
              </Link>
              <Link href="/blog" className="text-shell-300 dark:text-shell-300 light:text-shell-600 hover:text-lobster-400 transition-colors">
                Blog
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <a
              href="https://x.com/langoustine69A"
              target="_blank"
              rel="noopener noreferrer"
              className="text-shell-400 dark:text-shell-400 light:text-shell-500 hover:text-lobster-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://github.com/langoustine69"
              target="_blank"
              rel="noopener noreferrer"
              className="text-shell-400 dark:text-shell-400 light:text-shell-500 hover:text-lobster-400 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
            <a
              href="https://github.com/langoustine69"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-lobster-600 hover:bg-lobster-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              View GitHub
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-shell-400 dark:text-shell-400 light:text-shell-500 hover:text-lobster-400"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-shell-800 dark:border-shell-800 light:border-shell-200">
            <div className="flex flex-col gap-4">
              <Link href="/" className="text-shell-300 dark:text-shell-300 light:text-shell-600 hover:text-lobster-400 transition-colors">
                Home
              </Link>
              <Link href="/agents" className="text-shell-300 dark:text-shell-300 light:text-shell-600 hover:text-lobster-400 transition-colors">
                Agents
              </Link>
              <Link href="/blog" className="text-shell-300 dark:text-shell-300 light:text-shell-600 hover:text-lobster-400 transition-colors">
                Blog
              </Link>
              <a
                href="https://github.com/langoustine69"
                target="_blank"
                rel="noopener noreferrer"
                className="text-shell-300 dark:text-shell-300 light:text-shell-600 hover:text-lobster-400 transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
