'use client';

import { StarterTemplates } from '@/components/StarterTemplates';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Metadata } from 'next';

export default function StartersPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Starter Templates', href: '/starters' },
          ]}
        />

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🚀 Starter Templates
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Copy-paste project scaffolding for quick x402 integration. Choose your
            framework and get a working foundation in seconds.
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm">
              ✓ Production-ready code
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
              ✓ x402 payment flow included
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm">
              ✓ Error handling built-in
            </span>
          </div>
        </div>

        <StarterTemplates />

        {/* Tips Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <span>💡</span> Start Simple
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Begin with the framework you know best. All templates include the same
              x402 payment flow — just different syntax.
            </p>
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <span>🔐</span> Secure Your Keys
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Never commit wallet keys to git. Use environment variables and add
              .env files to your .gitignore.
            </p>
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <span>🧪</span> Test First
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Use sandbox mode for development. Test your integration with free
              credits before connecting a real wallet.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <details className="group border border-gray-200 dark:border-gray-700 rounded-lg">
              <summary className="p-4 cursor-pointer font-medium flex items-center justify-between">
                What&apos;s the difference between these and the SDK Generator?
                <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-gray-600 dark:text-gray-400">
                The SDK Generator creates client code for calling a specific agent. These
                starter templates are full project scaffolding including server setup,
                environment config, and the x402 payment client — everything you need to
                start a new project.
              </div>
            </details>
            <details className="group border border-gray-200 dark:border-gray-700 rounded-lg">
              <summary className="p-4 cursor-pointer font-medium flex items-center justify-between">
                Do I need a wallet to use these templates?
                <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-gray-600 dark:text-gray-400">
                For development, you can use sandbox mode with free credits. For production,
                you&apos;ll need a wallet with USDC on Base network to pay for agent calls.
              </div>
            </details>
            <details className="group border border-gray-200 dark:border-gray-700 rounded-lg">
              <summary className="p-4 cursor-pointer font-medium flex items-center justify-between">
                Can I mix frameworks?
                <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-gray-600 dark:text-gray-400">
                Absolutely! You might use Next.js for your frontend and Go for your
                high-performance backend. The x402 client is the same concept across all
                languages — just copy the relevant files.
              </div>
            </details>
          </div>
        </div>
      </div>
    </main>
  );
}
