import { Metadata } from 'next';
import AgentLeaderboard from '@/components/AgentLeaderboard';
import { agents, getLiveAgents } from '@/data/agents';

export const metadata: Metadata = {
  title: 'Agent Leaderboard | Top x402 Agents',
  description: 'Discover the top performing x402 AI agents ranked by popularity, uptime, API calls, and response time. Find the best agents for your needs.',
  openGraph: {
    title: 'Agent Leaderboard | Top x402 Agents',
    description: 'Discover the top performing x402 AI agents ranked by popularity, uptime, API calls, and response time.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://langoustine69.dev/leaderboard',
  },
};

export default function LeaderboardPage() {
  const liveCount = getLiveAgents().length;
  const totalCount = agents.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-shell-900 via-shell-950 to-shell-900">
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-lobster-600/20 rounded-full text-lobster-400 text-sm font-medium mb-4">
              <span>🏆</span>
              <span>Updated Hourly</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white">Agent </span>
              <span className="bg-gradient-to-r from-lobster-400 to-lobster-600 bg-clip-text text-transparent">
                Leaderboard
              </span>
            </h1>
            <p className="text-xl text-shell-400 max-w-2xl mx-auto">
              Discover the top performing x402 AI agents ranked by real usage metrics.
              Find the most reliable and popular agents for your integrations.
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-shell-800/50 rounded-xl p-4 text-center border border-shell-700">
              <div className="text-3xl font-bold text-lobster-400">{liveCount}</div>
              <div className="text-sm text-shell-500">Live Agents</div>
            </div>
            <div className="bg-shell-800/50 rounded-xl p-4 text-center border border-shell-700">
              <div className="text-3xl font-bold text-green-400">99.2%</div>
              <div className="text-sm text-shell-500">Avg Uptime</div>
            </div>
            <div className="bg-shell-800/50 rounded-xl p-4 text-center border border-shell-700">
              <div className="text-3xl font-bold text-blue-400">847K</div>
              <div className="text-sm text-shell-500">API Calls/Month</div>
            </div>
            <div className="bg-shell-800/50 rounded-xl p-4 text-center border border-shell-700">
              <div className="text-3xl font-bold text-purple-400">{totalCount}</div>
              <div className="text-sm text-shell-500">Total Agents</div>
            </div>
          </div>

          {/* Leaderboard Component */}
          <AgentLeaderboard />

          {/* How Rankings Work */}
          <div className="mt-16 grid md:grid-cols-2 gap-8">
            <div className="bg-shell-800/30 rounded-xl p-6 border border-shell-700/50">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>📈</span> How Rankings Work
              </h2>
              <ul className="space-y-3 text-shell-400">
                <li className="flex items-start gap-3">
                  <span className="text-lobster-400">🔥</span>
                  <div>
                    <span className="text-white font-medium">Popularity Score</span>
                    <p className="text-sm">Based on total API calls, unique users, and community engagement.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-lobster-400">⬆️</span>
                  <div>
                    <span className="text-white font-medium">Uptime Percentage</span>
                    <p className="text-sm">30-day rolling average of successful health checks.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-lobster-400">📊</span>
                  <div>
                    <span className="text-white font-medium">API Call Volume</span>
                    <p className="text-sm">Total x402 micropayment transactions in the past month.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-lobster-400">⚡</span>
                  <div>
                    <span className="text-white font-medium">Response Speed</span>
                    <p className="text-sm">Average latency measured from our global edge network.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-shell-800/30 rounded-xl p-6 border border-shell-700/50">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>🎯</span> Featured Categories
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: '🏀', name: 'Sports', count: 12 },
                  { icon: '💰', name: 'DeFi', count: 8 },
                  { icon: '🚀', name: 'Space', count: 5 },
                  { icon: '🔒', name: 'Security', count: 3 },
                  { icon: '🌤️', name: 'Weather', count: 3 },
                  { icon: '📊', name: 'Finance', count: 6 },
                  { icon: '📰', name: 'Tech News', count: 4 },
                  { icon: '🎮', name: 'Gaming', count: 2 },
                ].map(cat => (
                  <div 
                    key={cat.name}
                    className="bg-shell-800/50 rounded-lg px-4 py-3 flex items-center justify-between hover:bg-shell-700/50 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span className="text-shell-300 text-sm">{cat.name}</span>
                    </span>
                    <span className="text-xs text-shell-500">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <div className="inline-flex flex-col sm:flex-row gap-4">
              <a
                href="/agents"
                className="px-6 py-3 bg-lobster-600 hover:bg-lobster-500 text-white font-medium rounded-lg transition-colors"
              >
                Browse All Agents →
              </a>
              <a
                href="/compare"
                className="px-6 py-3 bg-shell-700 hover:bg-shell-600 text-white font-medium rounded-lg transition-colors"
              >
                Compare Agents
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Top x402 AI Agents Leaderboard',
            description: 'Ranking of x402 micropayment AI agents by performance metrics',
            itemListOrder: 'https://schema.org/ItemListOrderDescending',
            numberOfItems: liveCount,
            itemListElement: getLiveAgents().slice(0, 10).map((agent, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'SoftwareApplication',
                name: agent.name,
                applicationCategory: 'WebApplication',
                url: `https://langoustine69.dev/agents/${agent.id}`,
              },
            })),
          }),
        }}
      />
    </div>
  );
}
