'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { CommandPaletteButton } from './CommandPalette';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from './I18nProvider';
import NotificationsCenter, { NotificationsBadge } from './NotificationsCenter';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    
    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const closeMenu = () => setMobileMenuOpen(false);

  const navLinks = [
    { href: '/', label: 'home' },
    { href: '/agents', label: 'agents' },
    { href: '/sandbox', label: 'sandbox' },
    { href: '/bundles', label: 'bundles' },
    { href: '/sdk', label: 'sdk' },
    { href: '/status', label: 'status' },
  ];

  const moreLinks = [
    { href: '/use-cases', label: 'use-cases' },
    { href: '/leaderboard', label: 'leaderboard' },
    { href: '/earnings', label: 'earnings' },
    { href: '/x402-flow', label: 'x402' },
    { href: '/simulator', label: 'simulator' },
    { href: '/templates', label: 'templates' },
    { href: '/starters', label: 'starters' },
    { href: '/compare', label: 'compare' },
    { href: '/reliability', label: 'sla' },
    { href: '/benchmarks', label: 'perf' },
    { href: '/widgets', label: 'widgets' },
    { href: '/export', label: 'export' },
    { href: '/badges', label: 'badges' },
    { href: '/blog', label: 'blog' },
    { href: '/guides', label: 'guides' },
    { href: '/glossary', label: 'glossary' },
    { href: '/qa', label: 'q&a' },
    { href: '/debugger', label: 'debug' },
    { href: '/diff', label: 'diff' },
    { href: '/checklist', label: 'checklist' },
    { href: '/cheatsheet', label: 'reference' },
    { href: '/snippets', label: 'snippets' },
    { href: '/alerts', label: 'alerts' },
    { href: '/security', label: 'security' },
    { href: '/errors', label: 'errors' },
  ];

  return (
    <header 
      className="sticky top-0 z-50 w-full border-b border-term-border bg-term-black" 
      role="banner"
    >
      <nav id="navigation" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl">🦞</span>
              <span className="text-sm font-medium text-term-light tracking-tight">
                langoustine69
              </span>
              <span className="cursor" />
            </Link>
            
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = link.href === '/' 
                  ? pathname === '/' 
                  : pathname?.startsWith(link.href);
                return (
                  <Link 
                    key={link.href}
                    href={link.href} 
                    className={`px-3 py-1.5 text-xs transition-colors ${
                      isActive 
                        ? 'text-lobster-500 border-b border-lobster-500' 
                        : 'text-term-text hover:text-term-light'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <CommandPaletteButton />
            <NotificationsCenter />
            <ThemeToggle />
            <a
              href="https://github.com/langoustine69"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs text-term-text hover:text-term-light border border-term-border hover:border-term-muted transition-colors"
            >
              github
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-2">
            <NotificationsCenter />
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-term-text hover:text-term-light"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 top-14 z-40 lg:hidden transition-opacity duration-200 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className="absolute inset-0 bg-term-black/90"
          onClick={closeMenu}
        />
        
        <div
          className={`absolute top-0 left-0 right-0 bg-term-dark border-b border-term-border transition-transform duration-200 max-h-[80vh] overflow-y-auto ${
            mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <div className="px-4 py-4 space-y-1">
            {[...navLinks, ...moreLinks].map((link) => {
              const isActive = link.href === '/' 
                ? pathname === '/' 
                : pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`block px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'text-lobster-500'
                      : 'text-term-text hover:text-term-light'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="text-term-muted mr-2">$</span>
                  {link.label}
                </Link>
              );
            })}
            
            <div className="border-t border-term-border my-4" />
            
            <div className="px-3 py-2">
              <LanguageSwitcher variant="inline" />
            </div>
            
            <a
              href="https://github.com/langoustine69"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2 text-sm text-term-text hover:text-term-light"
            >
              <span className="text-term-muted mr-2">$</span>
              github →
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
