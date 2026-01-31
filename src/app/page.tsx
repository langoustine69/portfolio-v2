import Link from 'next/link';
import AgentGrid from '@/components/AgentGrid';
import { agents, getLiveAgents } from '@/data/agents';

export default function Home() {
  const liveAgents = getLiveAgents();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-shell-950/50 to-shell-950" />
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="mb-6">
            <span className="inline-block px-4 py-1.5 bg-lobster-500/10 text-lobster-400 rounded-full text-sm font-medium border border-lobster-500/20">
              🦞 {liveAgents.length} x402 agents live
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">Langoustine69</span>
            <br />
            <span className="text-shell-100">AI Agent Portfolio</span>
          </h1>
          
          <p className="text-xl text-shell-400 max-w-2xl mx-auto mb-8">
            Specialized x402 micropayment agents for sports, finance, space weather, and more. 
            Built with Lucid Agents SDK. Pay per request.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/agents"
              className="bg-lobster-600 hover:bg-lobster-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Explore Agents
            </Link>
            <a
              href="https://github.com/langoustine69"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-shell-800 hover:bg-shell-700 text-white px-6 py-3 rounded-lg font-medium transition-colors border border-shell-700"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 px-4 bg-shell-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-shell-100 mb-8">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { icon: '🏈', name: 'Sports', count: agents.filter(a => a.category === 'Sports').length },
              { icon: '💰', name: 'Finance', count: agents.filter(a => a.category === 'Finance').length },
              { icon: '🌌', name: 'Space', count: agents.filter(a => a.category === 'Space').length },
              { icon: '📰', name: 'Tech News', count: agents.filter(a => a.category === 'Tech News').length },
              { icon: '🏎️', name: 'Motorsport', count: agents.filter(a => a.category === 'Motorsport').length },
              { icon: '⛓️', name: 'DeFi', count: agents.filter(a => a.category === 'DeFi').length },
            ].map((cat) => (
              <div
                key={cat.name}
                className="bg-shell-800/50 border border-shell-700 rounded-xl p-4 text-center hover:border-lobster-500/50 transition-colors cursor-pointer"
              >
                <span className="text-3xl mb-2 block">{cat.icon}</span>
                <h3 className="text-shell-100 font-medium">{cat.name}</h3>
                <p className="text-shell-400 text-sm">{cat.count} agents</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Agents */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-shell-100">Live Agents</h2>
              <p className="text-shell-400 mt-1">Currently deployed on Railway with x402 payments</p>
            </div>
            <Link
              href="/agents"
              className="text-lobster-400 hover:text-lobster-300 transition-colors"
            >
              View all →
            </Link>
          </div>
          <AgentGrid showFilters={false} limit={6} showDetails />
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 px-4 bg-shell-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-shell-100 mb-8 text-center">Powered By</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              'Lucid Agents SDK',
              'x402 Protocol',
              'TypeScript',
              'Railway',
              'Base Chain',
              'USDC',
            ].map((tech) => (
              <span
                key={tech}
                className="bg-shell-800 border border-shell-700 px-4 py-2 rounded-lg text-shell-300 hover:border-lobster-500/50 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-shell-100 mb-4">
            Want to build x402 agents?
          </h2>
          <p className="text-shell-400 mb-8">
            All agents are open source. Built with Lucid Agents SDK for instant micropayments.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://github.com/langoustine69"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-lobster-600 hover:bg-lobster-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              Explore on GitHub
            </a>
            <a
              href="https://github.com/daydreamsai/lucid-agents"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-shell-800 hover:bg-shell-700 text-shell-100 px-6 py-3 rounded-lg font-medium transition-colors border border-shell-700"
            >
              Lucid Agents SDK
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
