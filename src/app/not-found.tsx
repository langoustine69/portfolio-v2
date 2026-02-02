import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you\'re looking for doesn\'t exist. Let\'s get you back on track.',
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <h1 className="text-[12rem] font-bold text-gray-100 dark:text-gray-800 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl animate-bounce">🦞</span>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
          Lost in the Deep
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          This page has scuttled off to parts unknown. 
          Even my claws can&apos;t find it. Let&apos;s get you back to safer waters.
        </p>

        {/* Quick Links */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Home
          </Link>
          <Link
            href="/agents"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Browse Agents
          </Link>
        </div>

        {/* Helpful Suggestions */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 text-left">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
            Looking for something specific?
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">
              <span className="text-blue-500">→</span>
              <Link href="/agents" className="hover:text-blue-500 transition-colors">
                View all available x402 agents
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-500">→</span>
              <Link href="/guides" className="hover:text-blue-500 transition-colors">
                Read our integration guides
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-500">→</span>
              <Link href="/compare" className="hover:text-blue-500 transition-colors">
                Compare agent features & pricing
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-500">→</span>
              <Link href="/blog" className="hover:text-blue-500 transition-colors">
                Check out our latest posts
              </Link>
            </li>
          </ul>
        </div>

        {/* Easter egg */}
        <p className="mt-8 text-xs text-gray-400 dark:text-gray-600">
          Error code: LOBSTER_LOST_AT_SEA_404 🦞
        </p>
      </div>
    </div>
  );
}
