import EnvGenerator from '@/components/EnvGenerator';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Environment & Deployment Config Generator | langoustine69.dev',
  description: 'Generate .env files, Dockerfiles, docker-compose.yml, CI/CD pipelines, and platform configs for x402 agent integration. One-click deployment configuration for Vercel, Railway, Fly.io, AWS, and more.',
  keywords: ['x402', 'environment variables', 'deployment', 'docker', 'vercel', 'railway', 'fly.io', 'configuration', 'ci/cd'],
  openGraph: {
    title: 'Environment & Deployment Config Generator',
    description: 'Generate deployment configurations for x402 agent integration',
    type: 'website',
  },
};

export default function EnvGeneratorPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Env Generator', href: '/env-generator' },
          ]}
        />

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ⚙️ Environment & Deployment Config
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Generate ready-to-use configuration files for any platform. 
            One click to get your .env, Dockerfile, CI/CD pipeline, and platform configs.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
              ▲ Vercel
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm">
              🚂 Railway
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm">
              🪰 Fly.io
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full text-sm">
              ☁️ AWS
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300 rounded-full text-sm">
              🐳 Docker
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm">
              ☸️ Kubernetes
            </span>
          </div>
        </div>

        <EnvGenerator />

        {/* Related Tools */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Related Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/starters"
              className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            >
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2 group-hover:text-blue-600">
                <span>🚀</span> Starter Templates
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Full project scaffolding for popular frameworks with x402 integration.
              </p>
            </Link>
            <Link
              href="/preflight"
              className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            >
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2 group-hover:text-blue-600">
                <span>✈️</span> Preflight Check
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Verify your environment is ready for x402 integration before deployment.
              </p>
            </Link>
            <Link
              href="/checklist"
              className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            >
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2 group-hover:text-blue-600">
                <span>✅</span> Production Checklist
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                40+ items to verify before going live with your x402 integration.
              </p>
            </Link>
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
                What&apos;s the difference between sandbox and production mode?
                <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-gray-600 dark:text-gray-400">
                <strong>Sandbox mode</strong> gives you free API calls for development and testing. 
                No wallet or payments required. <strong>Production mode</strong> uses your wallet 
                with real USDC on Base network for micropayments.
              </div>
            </details>
            <details className="group border border-gray-200 dark:border-gray-700 rounded-lg">
              <summary className="p-4 cursor-pointer font-medium flex items-center justify-between">
                How do I set environment variables on my platform?
                <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-gray-600 dark:text-gray-400">
                Each platform has its own secrets/environment management:
                <ul className="mt-2 space-y-1 ml-4 list-disc">
                  <li><strong>Vercel:</strong> Settings → Environment Variables</li>
                  <li><strong>Railway:</strong> Variables tab in your service</li>
                  <li><strong>Fly.io:</strong> <code>flyctl secrets set KEY=value</code></li>
                  <li><strong>AWS:</strong> Parameter Store or Secrets Manager</li>
                </ul>
              </div>
            </details>
            <details className="group border border-gray-200 dark:border-gray-700 rounded-lg">
              <summary className="p-4 cursor-pointer font-medium flex items-center justify-between">
                Should I enable caching?
                <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-gray-600 dark:text-gray-400">
                Caching can significantly reduce costs for repeated identical requests. Enable it if 
                your use case can tolerate slightly stale data. For real-time data needs (like live 
                sports scores), keep caching disabled or use very short TTLs.
              </div>
            </details>
            <details className="group border border-gray-200 dark:border-gray-700 rounded-lg">
              <summary className="p-4 cursor-pointer font-medium flex items-center justify-between">
                What if I accidentally commit my wallet private key?
                <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-gray-600 dark:text-gray-400">
                <strong>Act immediately:</strong>
                <ol className="mt-2 space-y-1 ml-4 list-decimal">
                  <li>Transfer all funds from the compromised wallet to a new wallet</li>
                  <li>Remove the commit from git history using <code>git filter-branch</code> or BFG Repo-Cleaner</li>
                  <li>Generate a new wallet and update your secrets</li>
                  <li>Force-push the cleaned history</li>
                </ol>
                Consider the old key permanently compromised even after removal.
              </div>
            </details>
          </div>
        </div>
      </div>
    </main>
  );
}
