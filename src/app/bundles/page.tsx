import { Metadata } from 'next';
import { bundles } from '@/data/bundles';
import { agents } from '@/data/agents';
import BundleCard from '@/components/BundleCard';

export const metadata: Metadata = {
  title: 'Agent Bundles | Langoustine69',
  description: 'Curated collections of x402 agents that work together for specific use cases - financial data, sports coverage, emergency response, and more.',
  openGraph: {
    title: 'Agent Bundles | Langoustine69',
    description: 'Curated collections of x402 agents that work together for specific use cases.',
  },
};

export default function BundlesPage() {
  // Calculate total stats
  const totalAgents = new Set(bundles.flatMap(b => b.agentIds)).size;
  const liveAgents = bundles
    .flatMap(b => b.agentIds)
    .filter((id, i, arr) => arr.indexOf(id) === i)
    .filter(id => agents.find(a => a.id === id)?.status === 'live').length;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 py-16">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              🦞 Agent Bundles
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-6">
              Curated collections of agents that work together for specific use cases
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="font-bold text-2xl">{bundles.length}</span>
                <span className="block text-white/80">Bundles</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="font-bold text-2xl">{totalAgents}</span>
                <span className="block text-white/80">Agents</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="font-bold text-2xl">{liveAgents}</span>
                <span className="block text-white/80">Live</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bundles Grid */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundles.map((bundle) => (
            <BundleCard key={bundle.id} bundle={bundle} />
          ))}
        </div>
      </section>

      {/* Build Your Own CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-800 dark:to-black rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">🔧 Build Your Own Bundle</h2>
          <p className="text-gray-300 mb-6 max-w-xl mx-auto">
            Mix and match any agents from our portfolio to create your perfect stack. 
            All agents use the x402 payment protocol for seamless micropayments.
          </p>
          <a
            href="/agents"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Browse All Agents
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </section>
    </main>
  );
}
