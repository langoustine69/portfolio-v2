import { Metadata } from 'next';
import Link from 'next/link';
import SnippetLibrary from '@/components/SnippetLibrary';

export const metadata: Metadata = {
  title: 'Code Snippet Library | Langoustine69',
  description: 'Copy-paste code examples for x402 agent integrations. Searchable snippets in TypeScript, Python, Go, Rust, cURL, and more.',
  keywords: ['x402 code examples', 'API snippets', 'integration code', 'copy paste examples', 'developer snippets'],
  openGraph: {
    title: 'Code Snippet Library | Langoustine69',
    description: 'Ready-to-use code snippets for x402 agent integrations across all languages.',
    type: 'website',
  },
};

export default function SnippetsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <section className="border-b-4 border-black dark:border-white bg-brutal-yellow dark:bg-shell-900 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-6">
            <Link 
              href="/" 
              className="text-sm font-bold text-black dark:text-white hover:text-lobster-500 uppercase"
            >
              ← Back to Home
            </Link>
          </nav>
          
          <div className="flex items-center gap-4 mb-6">
            <span className="text-5xl">📝</span>
            <div>
              <h1 className="text-4xl font-black uppercase text-black dark:text-white">
                CODE SNIPPET LIBRARY
              </h1>
              <p className="text-lg text-shell-700 dark:text-shell-300 mt-2">
                Copy-paste code examples for every x402 integration scenario
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="bg-white dark:bg-black border-2 border-black dark:border-white px-4 py-2">
              <span className="text-2xl font-black text-lobster-500">150+</span>
              <span className="text-sm font-bold text-black dark:text-white ml-2">SNIPPETS</span>
            </div>
            <div className="bg-white dark:bg-black border-2 border-black dark:border-white px-4 py-2">
              <span className="text-2xl font-black text-lobster-500">7</span>
              <span className="text-sm font-bold text-black dark:text-white ml-2">LANGUAGES</span>
            </div>
            <div className="bg-white dark:bg-black border-2 border-black dark:border-white px-4 py-2">
              <span className="text-2xl font-black text-lobster-500">12</span>
              <span className="text-sm font-bold text-black dark:text-white ml-2">CATEGORIES</span>
            </div>
          </div>
        </div>
      </section>

      {/* Snippet Library Component */}
      <SnippetLibrary />

      {/* Quick Links */}
      <section className="border-t-4 border-black dark:border-white py-12 bg-shell-100 dark:bg-shell-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black uppercase text-black dark:text-white mb-6">
            RELATED RESOURCES
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Link
              href="/sdk"
              className="bg-white dark:bg-black border-4 border-black dark:border-white p-4 hover:bg-brutal-yellow dark:hover:bg-shell-800 transition-colors"
              style={{ boxShadow: '4px 4px 0px 0px #000' }}
            >
              <span className="text-2xl">🔧</span>
              <h3 className="font-black text-black dark:text-white mt-2">SDK GENERATOR</h3>
              <p className="text-sm text-shell-600 dark:text-shell-400">Full SDK code for any agent</p>
            </Link>
            <Link
              href="/simulator"
              className="bg-white dark:bg-black border-4 border-black dark:border-white p-4 hover:bg-brutal-yellow dark:hover:bg-shell-800 transition-colors"
              style={{ boxShadow: '4px 4px 0px 0px #000' }}
            >
              <span className="text-2xl">🧪</span>
              <h3 className="font-black text-black dark:text-white mt-2">API SIMULATOR</h3>
              <p className="text-sm text-shell-600 dark:text-shell-400">Build & test requests</p>
            </Link>
            <Link
              href="/templates"
              className="bg-white dark:bg-black border-4 border-black dark:border-white p-4 hover:bg-brutal-yellow dark:hover:bg-shell-800 transition-colors"
              style={{ boxShadow: '4px 4px 0px 0px #000' }}
            >
              <span className="text-2xl">📦</span>
              <h3 className="font-black text-black dark:text-white mt-2">TEMPLATES</h3>
              <p className="text-sm text-shell-600 dark:text-shell-400">Starter projects</p>
            </Link>
            <Link
              href="/guides"
              className="bg-white dark:bg-black border-4 border-black dark:border-white p-4 hover:bg-brutal-yellow dark:hover:bg-shell-800 transition-colors"
              style={{ boxShadow: '4px 4px 0px 0px #000' }}
            >
              <span className="text-2xl">📚</span>
              <h3 className="font-black text-black dark:text-white mt-2">GUIDES</h3>
              <p className="text-sm text-shell-600 dark:text-shell-400">Step-by-step tutorials</p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
