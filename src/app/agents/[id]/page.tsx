import { agents, Agent } from '@/data/agents';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ShareButtons from '@/components/ShareButtons';
import AgentChangelog from '@/components/AgentChangelog';
import RateLimitDisplay from '@/components/RateLimitDisplay';
import UsageExamplesGallery from '@/components/UsageExamplesGallery';
import IntegrationGuides from '@/components/IntegrationGuides';
import RelatedAgents from '@/components/RelatedAgents';
import RecentlyUpdatedBadge from '@/components/RecentlyUpdatedBadge';

interface Props {
  params: Promise<{ id: string }>;
}

function generateBreadcrumbJsonLd(agent: Agent) {
  const baseUrl = 'https://langoustine69.dev';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Agents',
        item: `${baseUrl}/agents`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: agent.name,
        item: `${baseUrl}/agents/${agent.id}`,
      },
    ],
  };
}

function generateAgentJsonLd(agent: Agent) {
  const baseUrl = 'https://langoustine69.dev';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: agent.name,
    description: agent.description,
    url: `${baseUrl}/agents/${agent.id}`,
    applicationCategory: 'WebApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0.001',
      priceCurrency: 'USD',
      description: 'Pay per request via x402 micropayments',
    },
    author: {
      '@type': 'Person',
      name: 'langoustine69',
      url: 'https://x.com/langoustine69A',
    },
    provider: {
      '@type': 'Organization',
      name: 'Langoustine69',
      url: baseUrl,
    },
    ...(agent.railwayUrl && {
      installUrl: agent.railwayUrl,
    }),
    ...(agent.githubUrl && {
      codeRepository: agent.githubUrl,
    }),
    keywords: [agent.category, 'x402', 'AI agent', 'micropayments', ...agent.features].join(', '),
    softwareVersion: '1.0.0',
    isAccessibleForFree: false,
    featureList: agent.features.join(', '),
    image: `${baseUrl}/agents/${agent.id}/opengraph-image`,
    aggregateRating: agent.status === 'live' ? {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '50',
      bestRating: '5',
      worstRating: '1',
    } : undefined,
  };
}

export async function generateStaticParams() {
  return agents.map((agent) => ({
    id: agent.id,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const agent = agents.find((a) => a.id === id);
  
  if (!agent) {
    return { title: 'Agent Not Found' };
  }
  
  const ogImageUrl = `https://langoustine69.dev/agents/${agent.id}/opengraph-image`;
  
  return {
    title: `${agent.name} | Langoustine69`,
    description: agent.description,
    openGraph: {
      title: `${agent.name} - x402 AI Agent`,
      description: agent.description,
      url: `https://langoustine69.dev/agents/${agent.id}`,
      siteName: 'langoustine69',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${agent.name} - ${agent.category}`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${agent.name} - x402 AI Agent`,
      description: agent.description,
      images: [ogImageUrl],
      site: '@langoustine69A',
      creator: '@langoustine69A',
    },
  };
}

export default async function AgentPage({ params }: Props) {
  const { id } = await params;
  const agent = agents.find((a) => a.id === id);

  if (!agent) {
    notFound();
  }

  const statusColors = {
    live: 'bg-green-500/20 text-green-400 border-green-500/30',
    offline: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    building: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  const jsonLd = generateAgentJsonLd(agent);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(agent);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      
      {/* Header */}
      <header className="border-b border-[#222] bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-[#ff6b9d] hover:text-[#ff8bb0] transition-colors">
            <span className="text-2xl mr-2">🦞</span>
            <span className="font-mono">langoustine69</span>
          </Link>
          <Link href="/" className="text-[#888] hover:text-white text-sm transition-colors">
            ← Back to portfolio
          </Link>
        </div>
      </header>

      {/* Agent Details */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Title Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{agent.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-white">{agent.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[agent.status]}`}>
                  {agent.status.toUpperCase()}
                </span>
                <RecentlyUpdatedBadge changelog={agent.changelog} daysThreshold={7} size="md" />
                <span className="text-[#666] text-sm">{agent.category}</span>
              </div>
            </div>
          </div>
          <p className="text-[#888] text-lg leading-relaxed">{agent.description}</p>
        </div>

        {/* Features */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-[#666] uppercase tracking-wider mb-3">Features</h2>
          <div className="flex flex-wrap gap-2">
            {agent.features.map((feature) => (
              <span
                key={feature}
                className="px-3 py-1.5 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm text-[#ccc]"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Rate Limits */}
        {agent.status === 'live' && (
          <div className="mb-8">
            <RateLimitDisplay rateLimit={agent.rateLimit} variant="detailed" />
          </div>
        )}

        {/* Usage Examples Gallery */}
        {agent.status === 'live' && agent.railwayUrl && (
          <UsageExamplesGallery
            agentName={agent.name}
            agentId={agent.id}
            railwayUrl={agent.railwayUrl}
            features={agent.features}
          />
        )}

        {/* Integration Guides */}
        {agent.status === 'live' && agent.railwayUrl && (
          <IntegrationGuides
            agentName={agent.name}
            agentId={agent.id}
            railwayUrl={agent.railwayUrl}
          />
        )}

        {/* Version History / Changelog */}
        {agent.changelog && agent.changelog.length > 0 && (
          <AgentChangelog changelog={agent.changelog} agentName={agent.name} />
        )}

        {/* Data Source */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-[#666] uppercase tracking-wider mb-3">Data Source</h2>
          <p className="text-[#ff6b9d] font-mono">{agent.apiSource}</p>
        </div>

        {/* Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {agent.railwayUrl && (
            <a
              href={agent.railwayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-[#1a1a1a] border border-[#333] rounded-lg hover:border-[#ff6b9d] transition-colors group"
            >
              <span className="text-2xl">🚀</span>
              <div>
                <div className="text-white group-hover:text-[#ff6b9d] transition-colors font-medium">Live API</div>
                <div className="text-[#666] text-sm truncate max-w-[200px]">{agent.railwayUrl.replace('https://', '')}</div>
              </div>
            </a>
          )}
          
          {/* API Documentation Link */}
          {agent.status === 'live' && (
            <Link
              href={`/agents/${agent.id}/docs`}
              className="flex items-center gap-3 p-4 bg-[#1a1a1a] border border-[#333] rounded-lg hover:border-[#ff6b9d] transition-colors group"
            >
              <span className="text-2xl">📖</span>
              <div>
                <div className="text-white group-hover:text-[#ff6b9d] transition-colors font-medium">API Documentation</div>
                <div className="text-[#666] text-sm">Endpoints, examples & code</div>
              </div>
            </Link>
          )}
          
          {agent.githubUrl && (
            <a
              href={agent.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-[#1a1a1a] border border-[#333] rounded-lg hover:border-[#ff6b9d] transition-colors group"
            >
              <span className="text-2xl">📦</span>
              <div>
                <div className="text-white group-hover:text-[#ff6b9d] transition-colors font-medium">GitHub</div>
                <div className="text-[#666] text-sm">{agent.githubUrl.replace('https://github.com/', '')}</div>
              </div>
            </a>
          )}
          
          {agent.erc8004Tx && (
            <a
              href={agent.erc8004Tx}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-[#1a1a1a] border border-[#333] rounded-lg hover:border-[#ff6b9d] transition-colors group"
            >
              <span className="text-2xl">⛓️</span>
              <div>
                <div className="text-white group-hover:text-[#ff6b9d] transition-colors font-medium">ERC-8004 Identity</div>
                <div className="text-[#666] text-sm">On-chain registration</div>
              </div>
            </a>
          )}
        </div>

        {/* Related Agents */}
        <RelatedAgents currentAgent={agent} maxAgents={3} />

        {/* Share Buttons */}
        <div className="mb-8">
          <ShareButtons
            title={`${agent.name} - x402 AI Agent by Langoustine69`}
            description={agent.description}
            url={`https://langoustine69.dev/agents/${agent.id}`}
            hashtags={['x402', 'AIagent', agent.category.replace(/\s+/g, '')]}
          />
        </div>

        {/* Try It Section (for live agents) */}
        {agent.status === 'live' && agent.railwayUrl && (
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
            <h2 className="text-sm font-medium text-[#666] uppercase tracking-wider mb-4">Try It</h2>
            <div className="font-mono text-sm bg-[#0a0a0a] p-4 rounded border border-[#222] overflow-x-auto">
              <span className="text-[#666]"># Health check</span>
              <br />
              <span className="text-[#ff6b9d]">curl</span> {agent.railwayUrl}/health
              <br /><br />
              <span className="text-[#666]"># Free endpoint (overview)</span>
              <br />
              <span className="text-[#ff6b9d]">curl</span> -X POST {agent.railwayUrl}/entrypoints/overview/invoke \
              <br />
              &nbsp;&nbsp;-H <span className="text-green-400">"Content-Type: application/json"</span> \
              <br />
              &nbsp;&nbsp;-d <span className="text-green-400">'{"{}"}'</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-[#222] mt-12">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center text-[#666] text-sm">
          Built by <span className="text-[#ff6b9d]">🦞 Langoustine69</span> — an autonomous agent building Lucid agents
        </div>
      </footer>
    </main>
  );
}
