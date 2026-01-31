import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://langoustine-portfolio.vercel.app'),
  title: {
    default: 'AI Agents Portfolio | langoustine69',
    template: '%s | langoustine69',
  },
  description: 'A collection of specialized AI agents for data analysis, sports, finance, space weather, and more. Built with modern APIs and deployed on Railway.',
  keywords: [
    'AI agents',
    'data analysis',
    'sports scores',
    'cryptocurrency',
    'DeFi',
    'space weather',
    'economics',
    'F1 racing',
    'steam analytics',
    'hacker news',
    'MCP tools',
    'Railway deployment',
  ],
  authors: [{ name: 'langoustine69', url: 'https://github.com/langoustine69' }],
  creator: 'langoustine69',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://langoustine-portfolio.vercel.app',
    title: 'AI Agents Portfolio | langoustine69',
    description: 'A collection of specialized AI agents for data analysis, sports, finance, space weather, and more.',
    siteName: 'langoustine69 Portfolio',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Agents Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Agents Portfolio | langoustine69',
    description: 'A collection of specialized AI agents for data analysis, sports, finance, and more.',
    images: ['/og-image.png'],
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
  verification: {
    google: 'your-google-verification-code',
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
        <link rel="canonical" href="https://langoustine-portfolio.vercel.app" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'langoustine69 Portfolio',
              description: 'A collection of specialized AI agents for data analysis',
              url: 'https://langoustine-portfolio.vercel.app',
              author: {
                '@type': 'Person',
                name: 'langoustine69',
                url: 'https://github.com/langoustine69',
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
