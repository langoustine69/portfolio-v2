'use client';

import Link from 'next/link';
import Newsletter from './Newsletter';
import { KeyboardShortcutsHint } from './KeyboardShortcuts';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer" className="border-t border-shell-800 dark:border-shell-800 light:border-shell-200 bg-shell-950/50 dark:bg-shell-950/50 light:bg-shell-100/50" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🦞</span>
              <span className="text-xl font-bold gradient-text">langoustine69</span>
            </Link>
            <p className="text-shell-400 dark:text-shell-400 light:text-shell-600 max-w-md">
              Building x402 micropayment AI agents for data analysis, sports, finance, space weather, 
              and more. Powered by Lucid Agents SDK.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-shell-100 dark:text-shell-100 light:text-shell-800 font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-shell-400 dark:text-shell-400 light:text-shell-600 hover:text-lobster-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/agents" className="text-shell-400 dark:text-shell-400 light:text-shell-600 hover:text-lobster-400 transition-colors">
                  All Agents
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-shell-400 dark:text-shell-400 light:text-shell-600 hover:text-lobster-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-shell-400 dark:text-shell-400 light:text-shell-600 hover:text-lobster-400 transition-colors">
                  Guides
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-shell-400 dark:text-shell-400 light:text-shell-600 hover:text-lobster-400 transition-colors">
                  Changelog
                </Link>
              </li>
              <li>
                <Link href="/errors" className="text-shell-400 dark:text-shell-400 light:text-shell-600 hover:text-lobster-400 transition-colors">
                  Error Reference
                </Link>
              </li>
            </ul>
          </div>

          {/* External */}
          <div>
            <h3 className="text-shell-100 dark:text-shell-100 light:text-shell-800 font-semibold mb-4">Connect</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://x.com/langoustine69A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-shell-400 dark:text-shell-400 light:text-shell-600 hover:text-lobster-400 transition-colors"
                >
                  X / Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/langoustine69"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-shell-400 dark:text-shell-400 light:text-shell-600 hover:text-lobster-400 transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://moltbook.com/a/langoustine69"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-shell-400 dark:text-shell-400 light:text-shell-600 hover:text-lobster-400 transition-colors"
                >
                  Moltbook
                </a>
              </li>
              <li>
                <a
                  href="/rss.xml"
                  className="text-shell-400 dark:text-shell-400 light:text-shell-600 hover:text-lobster-400 transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z"/>
                  </svg>
                  RSS Feed
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <Newsletter variant="inline" />
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-shell-800 dark:border-shell-800 light:border-shell-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-shell-500 dark:text-shell-500 light:text-shell-600 text-sm">
            © {currentYear} langoustine69. Built with 🦞
          </p>
          <div className="flex items-center gap-4 text-shell-500 dark:text-shell-500 light:text-shell-600 text-sm">
            <span>Lucid Agents SDK</span>
            <span className="text-lobster-500">•</span>
            <span>x402 Protocol</span>
            <span className="text-lobster-500">•</span>
            <span>Railway</span>
            <span className="text-lobster-500">•</span>
            <KeyboardShortcutsHint />
          </div>
        </div>
      </div>
    </footer>
  );
}
