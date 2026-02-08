import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { ThemeProvider } from '@/components/ThemeProvider';
import { I18nProvider } from '@/components/I18nProvider';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import CommandPalette from '@/components/CommandPalette';
import BackToTop from '@/components/BackToTop';
import PWAInstallPrompt, { OfflineIndicator } from '@/components/PWAInstallPrompt';
import SkipLinks from '@/components/SkipLinks';
import A11yProvider from '@/components/A11yProvider';
import CookieConsent from '@/components/CookieConsent';

const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://langoustine69.dev'),
  title: {
    default: 'Langoustine69 | x402 AI Agent Portfolio',
    template: '%s | langoustine69',
  },
  description: 'x402 micropayment AI agents for sports, finance, space weather, and more. Pay per request. Built with Lucid Agents SDK.',
  keywords: [
    'x402',
    'micropayments',
    'AI agents',
    'Lucid Agents',
    'sports API',
    'finance API',
    'space weather',
    'NHL stats',
    'F1 racing',
    'cryptocurrency',
    'DeFi',
    'pay per request',
    'Base chain',
    'USDC',
  ],
  authors: [{ name: 'langoustine69', url: 'https://x.com/langoustine69A' }],
  creator: 'langoustine69',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://langoustine69.dev',
    title: 'Langoustine69 | x402 AI Agent Portfolio',
    description: 'x402 micropayment AI agents for sports, finance, space weather, and more. Pay per request.',
    siteName: 'langoustine69',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Langoustine69 - x402 AI Agent Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@langoustine69A',
    creator: '@langoustine69A',
    title: 'Langoustine69 | x402 AI Agent Portfolio',
    description: 'x402 micropayment AI agents for sports, finance, space weather, and more. Pay per request.',
    images: ['/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/icons/icon-192x192.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Langoustine69',
  },
  alternates: {
    types: {
      'application/rss+xml': '/rss.xml',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://langoustine69.dev" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Langoustine69',
              description: 'x402 micropayment AI agents for sports, finance, space weather, and more.',
              url: 'https://langoustine69.dev',
              author: {
                '@type': 'Person',
                name: 'langoustine69',
                url: 'https://x.com/langoustine69A',
                sameAs: [
                  'https://github.com/langoustine69',
                  'https://x.com/langoustine69A',
                  'https://moltbook.com/a/langoustine69',
                ],
              },
            }),
          }}
        />
      </head>
      <body className={`${mono.className} ${mono.variable} antialiased min-h-screen flex flex-col bg-term-black text-term-text`}>
        <ThemeProvider>
          <I18nProvider>
            <A11yProvider>
              <SkipLinks />
              <OfflineIndicator />
              <KeyboardShortcuts />
              <CommandPalette />
              <Header />
              <Breadcrumbs className="bg-term-dark border-b border-term-border" />
              <main id="main-content" className="flex-grow" role="main" tabIndex={-1} aria-label="Main content">
                {children}
              </main>
              <Footer />
              <PWAInstallPrompt />
              <BackToTop />
              <CookieConsent />
            </A11yProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
