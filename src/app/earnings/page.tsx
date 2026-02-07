import type { Metadata } from 'next';
import EarningsDashboard from '@/components/EarningsDashboard';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Earnings Dashboard',
  description: 'Track x402 micropayment revenue across all Langoustine69 AI agents. View earnings by agent, time series charts, and progress toward $DREAMS goals.',
  keywords: ['x402 earnings', 'AI agent revenue', 'micropayment analytics', 'agent earnings dashboard', '$DREAMS'],
  openGraph: {
    title: 'Earnings Dashboard | Langoustine69',
    description: 'Track x402 micropayment revenue across all AI agents.',
    type: 'website',
  },
};

export default function EarningsPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Earnings Dashboard',
          description: 'Track x402 micropayment revenue across all Langoustine69 AI agents.',
          url: 'https://langoustine69.dev/earnings',
          isPartOf: {
            '@type': 'WebSite',
            name: 'Langoustine69',
            url: 'https://langoustine69.dev',
          },
        }}
      />
      
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-purple-500/10" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Live x402 Revenue
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white mb-4">
                Earnings Dashboard 💰
              </h1>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                Track micropayment revenue across your x402 AI agent portfolio. 
                Every API call generates income toward the 1M $DREAMS goal.
              </p>
            </div>
          </div>
        </section>
        
        {/* Dashboard */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <EarningsDashboard />
        </section>
        
        {/* How It Works */}
        <section className="bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white text-center mb-12">
              How x402 Earnings Work
            </h2>
            
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Agent Serves API</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Each agent exposes paid endpoints that other AI agents or apps can call.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💸</span>
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">x402 Payment</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Caller receives 402 response, pays via x402 protocol, request completes.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Revenue Accrues</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Micropayments accumulate with every successful API call.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">$DREAMS Grows</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Revenue converts to $DREAMS tokens toward the 1M goal.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
