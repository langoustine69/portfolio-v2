import { Metadata } from 'next';
import { roadmapItems, getItemsByStatus, getRecentlyShipped, type RoadmapItem } from '@/data/roadmap';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Roadmap | Langoustine69',
  description: 'See what\'s coming next for Langoustine69 x402 agents - upcoming agents, features in development, and community requests.',
  openGraph: {
    title: 'Roadmap | Langoustine69',
    description: 'See what\'s coming next for Langoustine69 x402 agents.',
  },
};

const statusConfig = {
  shipped: {
    label: 'Shipped',
    emoji: '✅',
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    headerColor: 'from-green-600 to-emerald-600',
  },
  'in-progress': {
    label: 'In Progress',
    emoji: '🚧',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    headerColor: 'from-amber-600 to-orange-600',
  },
  planned: {
    label: 'Planned',
    emoji: '📋',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    headerColor: 'from-blue-600 to-indigo-600',
  },
  considering: {
    label: 'Under Consideration',
    emoji: '💭',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    headerColor: 'from-purple-600 to-pink-600',
  },
};

const categoryIcons = {
  agent: '🤖',
  feature: '✨',
  integration: '🔌',
  infrastructure: '🏗️',
};

function RoadmapCard({ item }: { item: RoadmapItem }) {
  const config = statusConfig[item.status];
  
  return (
    <div className="bg-gray-800/50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-700/50 hover:border-gray-600/50 transition-all hover:shadow-lg group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{item.icon}</span>
          <div>
            <h3 className="font-semibold text-white group-hover:text-orange-400 transition-colors">
              {item.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">
                {categoryIcons[item.category]} {item.category}
              </span>
              {item.eta && (
                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                  {item.eta}
                </span>
              )}
              {item.shippedDate && (
                <span className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded">
                  {new Date(item.shippedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </div>
        {item.votes !== undefined && item.status !== 'shipped' && (
          <div className="flex flex-col items-center bg-gray-700/50 rounded-lg px-3 py-1.5 min-w-[50px]">
            <span className="text-lg font-bold text-white">{item.votes}</span>
            <span className="text-[10px] text-gray-400 uppercase">votes</span>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-400 leading-relaxed">
        {item.description}
      </p>
    </div>
  );
}

function RoadmapColumn({ 
  status, 
  items 
}: { 
  status: RoadmapItem['status']; 
  items: RoadmapItem[] 
}) {
  const config = statusConfig[status];
  
  return (
    <div className="flex flex-col">
      <div className={`bg-gradient-to-r ${config.headerColor} rounded-t-xl px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{config.emoji}</span>
            <h2 className="text-lg font-bold text-white">{config.label}</h2>
          </div>
          <span className="bg-white/20 text-white text-sm font-medium px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>
      </div>
      <div className="flex-1 bg-gray-800/30 dark:bg-gray-900/30 rounded-b-xl p-4 space-y-4 min-h-[400px]">
        {items.map(item => (
          <RoadmapCard key={item.id} item={item} />
        ))}
        {items.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Nothing here yet
          </div>
        )}
      </div>
    </div>
  );
}

export default function RoadmapPage() {
  const shipped = getRecentlyShipped(5);
  const inProgress = getItemsByStatus('in-progress');
  const planned = getItemsByStatus('planned');
  const considering = getItemsByStatus('considering');

  const totalItems = roadmapItems.length;
  const totalVotes = roadmapItems.reduce((sum, item) => sum + (item.votes || 0), 0);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 py-16">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              🗺️ Roadmap
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-6">
              What&apos;s next for Langoustine69 x402 agents
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="font-bold text-2xl">{shipped.length}</span>
                <span className="block text-white/80">Recently Shipped</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="font-bold text-2xl">{inProgress.length}</span>
                <span className="block text-white/80">In Progress</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="font-bold text-2xl">{planned.length + considering.length}</span>
                <span className="block text-white/80">Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legend */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-wrap justify-center gap-4">
          {Object.entries(statusConfig).map(([status, config]) => (
            <div 
              key={status}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.color}`}
            >
              <span>{config.emoji}</span>
              <span className="text-sm font-medium">{config.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap Columns */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <RoadmapColumn status="shipped" items={shipped} />
          <RoadmapColumn status="in-progress" items={inProgress} />
          <RoadmapColumn status="planned" items={planned} />
          <RoadmapColumn status="considering" items={considering} />
        </div>
      </section>

      {/* Request Feature CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-800 dark:to-black rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">💡 Have an Idea?</h2>
          <p className="text-gray-300 mb-6 max-w-xl mx-auto">
            We&apos;re always looking for new agent ideas and features to build. 
            Let us know what would be valuable for your use case!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Request a Feature
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <a
              href="https://github.com/langoustine69"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Stats Footer */}
      <section className="bg-gray-800/50 dark:bg-gray-900/50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-black text-orange-500">{totalItems}</div>
              <div className="text-sm text-gray-400">Total Items</div>
            </div>
            <div>
              <div className="text-3xl font-black text-green-500">{shipped.length}</div>
              <div className="text-sm text-gray-400">Shipped</div>
            </div>
            <div>
              <div className="text-3xl font-black text-amber-500">{inProgress.length + planned.length}</div>
              <div className="text-sm text-gray-400">In Pipeline</div>
            </div>
            <div>
              <div className="text-3xl font-black text-purple-500">{totalVotes}</div>
              <div className="text-sm text-gray-400">Community Votes</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
