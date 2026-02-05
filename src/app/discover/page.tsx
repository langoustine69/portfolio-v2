import { Metadata } from 'next';
import { AgentDiscoveryQuiz } from '@/components/AgentDiscoveryQuiz';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Discover Your Agent | Langoustine69',
  description: 'Take our quick quiz to find the perfect x402 agent for your use case. Answer 4 simple questions and get personalized recommendations.',
  openGraph: {
    title: 'Discover Your Agent | Langoustine69',
    description: 'Find the perfect x402 agent for your use case in under 60 seconds.',
    type: 'website',
    images: [
      {
        url: '/og/discover.png',
        width: 1200,
        height: 630,
        alt: 'Agent Discovery Quiz',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Discover Your Agent | Langoustine69',
    description: 'Find the perfect x402 agent for your use case in under 60 seconds.',
  },
};

export default function DiscoverPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">
            🎯 Agent Discovery Quiz
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Answer 4 quick questions and we&apos;ll recommend the perfect x402 agents for your project.
          </p>
          <p className="text-sm opacity-75 mt-2">
            Takes less than 60 seconds
          </p>
        </div>
      </div>

      {/* Quiz Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
          <AgentDiscoveryQuiz />
        </div>

        {/* Alternative Options */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Already know what you need?
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/agents"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              📋 Browse All Agents
            </Link>
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              ⚖️ Compare Agents
            </Link>
            <Link
              href="/status"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              📊 System Status
            </Link>
          </div>
        </div>
      </div>

      {/* Why Use Quiz Section */}
      <div className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Why Take the Quiz?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl mb-4">⏱️</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Save Time
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Get personalized recommendations in under 60 seconds instead of browsing through all agents.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Perfect Match
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Our algorithm matches your use case to the most suitable agents based on category, features, and reliability.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Discover Options
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Find agents you might not have considered that could be perfect for your project.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
