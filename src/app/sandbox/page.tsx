import { Metadata } from 'next';
import SandboxMode from '@/components/SandboxMode';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Agent Sandbox | Try x402 Agents Free | Langoustine69',
  description: 'Test any x402 agent for free with 5 API calls per day. No wallet or payment required. Explore the API before committing.',
  openGraph: {
    title: 'Agent Sandbox | Try x402 Agents Free',
    description: 'Test any x402 agent for free with 5 API calls per day. No wallet or payment required.',
  },
};

export default function SandboxPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumbs 
          items={[
            { label: 'Home', href: '/' },
            { label: 'Sandbox', href: '/sandbox' },
          ]}
        />
        
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            🧪 Agent Sandbox
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
            Try before you pay. Every x402 agent offers {5} free API calls per day — 
            no wallet connection, no payment info, no commitment. Just pick an agent and start exploring.
          </p>
        </div>

        <SandboxMode />

        {/* FAQ Section */}
        <div className="mt-12 bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                How many free calls do I get?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You get 5 free API calls per agent, per day. Credits reset at midnight UTC.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                Do I need to create an account?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No! Sandbox mode is completely anonymous. Your usage is tracked locally in your browser.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                What happens when I run out of free calls?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You can wait for the daily reset, or connect a wallet to pay per call with x402 micropayments 
                (typically $0.001-0.01 per request).
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                Is this the real API?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! You&apos;re hitting the actual production endpoints. The only difference is the sandbox 
                bypasses the x402 payment check for your free calls.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Ready to integrate x402 agents into your application?
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a
              href="/sdk"
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
            >
              Generate SDK →
            </a>
            <a
              href="/x402-flow"
              className="px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
            >
              Learn x402 Payments
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
