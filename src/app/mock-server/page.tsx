import { Metadata } from 'next';
import MockServerGenerator from '@/components/MockServerGenerator';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mock Server Generator | Test x402 Agents Locally | Langoustine69',
  description: 'Generate local mock servers for x402 agents. Test your integrations offline with realistic mock responses. Supports Express, Fastify, and standalone Node.js.',
  openGraph: {
    title: 'Mock Server Generator | Test x402 Agents Locally',
    description: 'Generate local mock servers for x402 agents. Test your integrations offline with realistic mock responses.',
  },
  keywords: ['mock server', 'api testing', 'local development', 'x402 agents', 'offline testing', 'api mocking'],
};

export default function MockServerPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumbs 
          items={[
            { label: 'Home', href: '/' },
            { label: 'Mock Server', href: '/mock-server' },
          ]}
        />
        
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            🎭 Mock Server Generator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
            Generate local mock servers to test your x402 integrations offline. 
            Perfect for CI/CD pipelines, development environments, and testing without hitting production APIs.
          </p>
        </div>

        <MockServerGenerator />

        {/* Benefits Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Fast & Offline</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Mock servers run locally with zero latency. No network calls, no rate limits, no costs.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="text-3xl mb-3">🔄</div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Realistic Responses</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Mock data matches the real API structure. Test edge cases, errors, and payment flows.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="text-3xl mb-3">🧪</div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">CI/CD Ready</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Use in automated tests. No flaky network failures, consistent responses every time.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                What frameworks are supported?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We generate mock servers for Express.js, Fastify, and standalone Node.js (http module). 
                All include TypeScript type definitions.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                Can I customize the mock responses?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! The generated code is yours to modify. Edit the mock data in the handlers to match your test scenarios.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                Does it simulate x402 payments?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                The mock server includes a configurable payment simulation mode. Enable it to test your 402 handling 
                and payment retry logic without spending real funds.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                How do I add more endpoints?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                The generated code includes helper functions for adding new mock endpoints. 
                Check the README in the generated project for examples.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Ready to test against the real APIs?
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="/sandbox"
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
            >
              Try Sandbox (Free) →
            </Link>
            <Link
              href="/playground"
              className="px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
            >
              API Playground
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
