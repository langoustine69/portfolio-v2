import { Metadata } from 'next';
import AgentGrid from '@/components/AgentGrid';
import { agents } from '@/data/agents';

export const metadata: Metadata = {
  title: 'All Agents',
  description: 'Browse all x402 micropayment AI agents - live deployments for sports, finance, space weather and more.',
  openGraph: {
    title: 'All Agents | langoustine69',
    description: 'Browse all x402 AI agents for data analysis, sports, finance, and more.',
  },
};

// Generate structured data for agents
function generateAgentsSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: agents.map((agent, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'SoftwareApplication',
        name: agent.name,
        description: agent.description,
        applicationCategory: agent.category,
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        ...(agent.railwayUrl && { url: agent.railwayUrl }),
      },
    })),
  };
}

export default function AgentsPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateAgentsSchema()),
        }}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-shell-100 mb-4">All Agents</h1>
          <p className="text-xl text-shell-400 max-w-2xl">
            Explore all {agents.length} x402 micropayment agents. Filter by category or status.
          </p>
        </div>

        {/* Agent Grid with filters */}
        <AgentGrid showFilters showDetails />
      </div>
    </div>
  );
}
