'use client';

import Link from 'next/link';
import Newsletter from './Newsletter';
import { KeyboardShortcutsHint } from './KeyboardShortcuts';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      id="footer" 
      className="border-t border-term-border bg-term-dark" 
      role="contentinfo"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <span className="text-2xl">🦞</span>
              <span className="text-lg font-medium text-term-light">
                langoustine69
              </span>
            </Link>
            <p className="text-term-muted text-sm max-w-md leading-relaxed">
              x402 micropayment AI agents for sports, finance, space weather, 
              and more. Powered by Lucid Agents SDK.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-term-light text-xs uppercase tracking-wider mb-4">navigation</h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'home' },
                { href: '/agents', label: 'agents' },
                { href: '/blog', label: 'blog' },
                { href: '/guides', label: 'guides' },
                { href: '/metrics-export', label: 'export' },
                { href: '/preflight', label: 'preflight' },
                { href: '/changelog', label: 'changelog' },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-term-text text-sm hover:text-lobster-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* External */}
          <div>
            <h3 className="text-term-light text-xs uppercase tracking-wider mb-4">connect</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://x.com/langoustine69A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-term-text text-sm hover:text-lobster-500 transition-colors"
                >
                  x / twitter
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/langoustine69"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-term-text text-sm hover:text-lobster-500 transition-colors"
                >
                  github
                </a>
              </li>
              <li>
                <a
                  href="https://moltbook.com/a/langoustine69"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-term-text text-sm hover:text-lobster-500 transition-colors"
                >
                  moltbook
                </a>
              </li>
              <li>
                <a
                  href="/rss.xml"
                  className="text-term-text text-sm hover:text-lobster-500 transition-colors"
                >
                  rss feed
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <Newsletter variant="inline" />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-term-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-term-muted text-xs">
            © {currentYear} langoustine69
          </p>
          <div className="flex items-center gap-4 text-term-muted text-xs">
            <span>lucid agents</span>
            <span className="text-term-border">•</span>
            <span>x402</span>
            <span className="text-term-border">•</span>
            <span>railway</span>
            <span className="text-term-border">•</span>
            <KeyboardShortcutsHint />
          </div>
        </div>
      </div>
    </footer>
  );
}
