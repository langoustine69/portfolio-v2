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
    { href: '/', label: t('nav.home') },
    { href: '/agents', label: t('nav.agents') },
    { href: '/sandbox', label: '🧪 Sandbox' },
    { href: '/bundles', label: '📦 Bundles' },
    { href: '/use-cases', label: '💡 Use Cases' },
    { href: '/leaderboard', label: '🏆 Top' },
    { href: '/earnings', label: '💰 Earnings' },
    { href: '/x402-flow', label: '⚡ x402' },
    { href: '/sdk', label: '🔧 SDK' },
    { href: '/simulator', label: '🧪 Simulator' },
    { href: '/templates', label: '📦 Templates' },
    { href: '/compare', label: t('nav.compare') },
    { href: '/status', label: t('nav.status') },
    { href: '/reliability', label: '📊 SLA' },
    { href: '/benchmarks', label: '⚡ Perf' },
    { href: '/widgets', label: '📦 Widgets' },
    { href: '/export', label: '📤 Export' },
    { href: '/badges', label: '🏷️ Badges' },
    { href: '/blog', label: t('nav.blog') },
    { href: '/guides', label: t('nav.guides') },
    { href: '/glossary', label: t('nav.glossary') },
    { href: '/qa', label: '💬 Q&A' },
    { href: '/debugger', label: '🔬 Debug' },
  ];

  return (
    <header 
      className="sticky top-0 z-50 w-full border-b-4 border-black dark:border-white bg-brutal-yellow dark:bg-black overflow-x-hidden" 
      role="banner"
    >
      <nav id="navigation" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-3xl group-hover:animate-brutal-shake">🦞</span>
              <span className="text-xl font-black uppercase tracking-tight text-black dark:text-white">
                LANGOUSTINE69
              </span>
            </Link>
            
            <div className="hidden lg:flex items-center gap-0">
              {navLinks.slice(0, 6).map((link) => {
                const isActive = link.href === '/' 
                  ? pathname === '/' 
                  : pathname?.startsWith(link.href.replace('/#', '/'));
                return (
                  <Link 
                    key={link.href}
                    href={link.href} 
                    className={`px-2 py-1 font-bold uppercase text-xs tracking-wide transition-all border-2 whitespace-nowrap ${
                      isActive 
                        ? 'bg-lobster-500 text-white border-black dark:border-white' 
                        : 'text-black dark:text-white border-transparent hover:border-black dark:hover:border-white hover:bg-white dark:hover:bg-shell-900'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <CommandPaletteButton />
            <NotificationsCenter />
            <ThemeToggle />
            <a
              href="https://github.com/langoustine69"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black dark:bg-white text-white dark:text-black px-3 py-1 font-bold uppercase text-xs border-2 border-black dark:border-white hover:bg-lobster-500 hover:text-white transition-colors"
              style={{ boxShadow: '2px 2px 0px 0px #e11d48' }}
            >
              GITHUB
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-2">
            <NotificationsCenter />
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 top-16 z-40 lg:hidden transition-opacity duration-200 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className="absolute inset-0 bg-black/70"
          onClick={closeMenu}
        />
        
        <div
          className={`absolute top-0 left-0 right-0 bg-brutal-yellow dark:bg-black border-b-4 border-black dark:border-white transition-transform duration-200 ${
            mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <div className="px-4 py-6 space-y-2">
            {navLinks.map((link) => {
              const isActive = link.href === '/' 
                ? pathname === '/' 
                : pathname?.startsWith(link.href.replace('/#', '/'));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`block px-4 py-3 text-lg font-bold uppercase border-2 transition-all ${
                    isActive
                      ? 'bg-lobster-500 text-white border-black dark:border-white'
                      : 'text-black dark:text-white border-transparent hover:border-black dark:hover:border-white hover:bg-white dark:hover:bg-shell-900'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  → {link.label}
                </Link>
              );
            })}
            
            <div className="border-t-2 border-black dark:border-white my-4" />
            
            <div className="px-4 py-2">
              <LanguageSwitcher variant="inline" />
            </div>
            
            <div className="flex items-center gap-4 px-4 py-2">
              <a
                href="https://x.com/langoustine69A"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-bold text-black dark:text-white hover:text-lobster-500"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                @LANGOUSTINE69A
              </a>
            </div>
            
            <div className="px-4 pt-2">
              <a
                href="https://github.com/langoustine69"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-black dark:bg-white text-white dark:text-black px-4 py-3 font-bold uppercase border-2 border-black dark:border-white hover:bg-lobster-500 hover:text-white transition-colors"
                style={{ boxShadow: '4px 4px 0px 0px #e11d48' }}
              >
                VIEW GITHUB →
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
