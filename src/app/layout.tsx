import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

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
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="canonical" href="https://langoustine69.dev" />
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
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
