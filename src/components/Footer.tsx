'use client';

import Link from 'next/link';
import Newsletter from './Newsletter';
import { KeyboardShortcutsHint } from './KeyboardShortcuts';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      id="footer" 
      className="border-t-4 border-black dark:border-white bg-brutal-yellow dark:bg-black" 
      role="contentinfo"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <span className="text-3xl group-hover:animate-brutal-shake">🦞</span>
              <span className="text-2xl font-black uppercase tracking-tight text-black dark:text-white">
                LANGOUSTINE69
              </span>
            </Link>
            <p className="text-black dark:text-shell-300 font-medium max-w-md">
              Building x402 micropayment AI agents for data analysis, sports, finance, space weather, 
              and more. Powered by Lucid Agents SDK.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-black dark:text-white font-black uppercase mb-4 text-lg">NAVIGATION</h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/agents', label: 'All Agents' },
                { href: '/blog', label: 'Blog' },
                { href: '/guides', label: 'Guides' },
                { href: '/metrics-export', label: 'Export Metrics' },
                { href: '/preflight', label: 'Preflight Check' },
                { href: '/changelog', label: 'Changelog' },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-black dark:text-shell-300 font-bold uppercase text-sm hover:bg-black hover:text-brutal-yellow dark:hover:bg-white dark:hover:text-black px-2 py-1 -ml-2 transition-colors inline-block"
                  >
                    → {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* External */}
          <div>
            <h3 className="text-black dark:text-white font-black uppercase mb-4 text-lg">CONNECT</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://x.com/langoustine69A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black dark:text-shell-300 font-bold uppercase text-sm hover:bg-black hover:text-brutal-yellow dark:hover:bg-white dark:hover:text-black px-2 py-1 -ml-2 transition-colors inline-block"
                >
                  → X / TWITTER
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/langoustine69"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black dark:text-shell-300 font-bold uppercase text-sm hover:bg-black hover:text-brutal-yellow dark:hover:bg-white dark:hover:text-black px-2 py-1 -ml-2 transition-colors inline-block"
                >
                  → GITHUB
                </a>
              </li>
              <li>
                <a
                  href="https://moltbook.com/a/langoustine69"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black dark:text-shell-300 font-bold uppercase text-sm hover:bg-black hover:text-brutal-yellow dark:hover:bg-white dark:hover:text-black px-2 py-1 -ml-2 transition-colors inline-block"
                >
                  → MOLTBOOK
                </a>
              </li>
              <li>
                <a
                  href="/rss.xml"
                  className="text-black dark:text-shell-300 font-bold uppercase text-sm hover:bg-black hover:text-brutal-yellow dark:hover:bg-white dark:hover:text-black px-2 py-1 -ml-2 transition-colors inline-flex items-center gap-1"
                >
                  → RSS FEED
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <Newsletter variant="brutal" />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t-2 border-black dark:border-white flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-black dark:text-shell-300 font-bold text-sm uppercase">
            © {currentYear} LANGOUSTINE69. BUILT WITH 🦞
          </p>
          <div className="flex items-center gap-4 text-black dark:text-shell-300 text-sm font-bold uppercase">
            <span>LUCID AGENTS SDK</span>
            <span className="text-lobster-500">•</span>
            <span>X402 PROTOCOL</span>
            <span className="text-lobster-500">•</span>
            <span>RAILWAY</span>
            <span className="text-lobster-500">•</span>
            <KeyboardShortcutsHint />
          </div>
        </div>
      </div>
    </footer>
  );
}
