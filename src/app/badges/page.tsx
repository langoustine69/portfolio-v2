'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { agents, categories } from '@/data/agents';
import Breadcrumbs from '@/components/Breadcrumbs';

type BadgeStyle = 'flat' | 'flat-square' | 'plastic' | 'for-the-badge';

const badgeStyles: { value: BadgeStyle; label: string }[] = [
  { value: 'flat', label: 'Flat' },
  { value: 'flat-square', label: 'Flat Square' },
  { value: 'plastic', label: 'Plastic' },
  { value: 'for-the-badge', label: 'For the Badge' },
];

export default function BadgesPage() {
  const [selectedStyle, setSelectedStyle] = useState<BadgeStyle>('flat');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [liveMode, setLiveMode] = useState(false);

  const liveAgents = useMemo(() => 
    agents.filter(a => a.status === 'live'),
    []
  );

  const filteredAgents = useMemo(() => {
    return liveAgents.filter(agent => {
      const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [liveAgents, selectedCategory, searchQuery]);

  const baseUrl = 'https://langoustine69.dev';

  const getBadgeUrl = (agentId: string) => {
    let url = `${baseUrl}/api/badge/${agentId}`;
    const params = new URLSearchParams();
    if (selectedStyle !== 'flat') params.set('style', selectedStyle);
    if (liveMode) params.set('live', 'true');
    if (params.toString()) url += `?${params.toString()}`;
    return url;
  };

  const getMarkdownEmbed = (agentId: string, agentName: string) => {
    const badgeUrl = getBadgeUrl(agentId);
    const linkUrl = `${baseUrl}/agents/${agentId}`;
    return `[![${agentName}](${badgeUrl})](${linkUrl})`;
  };

  const getHtmlEmbed = (agentId: string, agentName: string) => {
    const badgeUrl = getBadgeUrl(agentId);
    const linkUrl = `${baseUrl}/agents/${agentId}`;
    return `<a href="${linkUrl}"><img src="${badgeUrl}" alt="${agentName}" /></a>`;
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-reef-950 via-reef-900 to-reef-950">
      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Badges', href: '/badges' },
            ]}
          />
          
          <div className="text-center mt-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              <span className="text-coral-400">🏷️</span> Embeddable Badges
            </h1>
            <p className="text-lg text-shell-300 max-w-3xl mx-auto">
              Add status badges to your GitHub README, documentation, or website. 
              Show real-time agent status and link back to agent pages.
            </p>
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-reef-800/50 rounded-xl p-6 border border-reef-700/50 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Style Selector */}
              <div>
                <label className="block text-sm font-medium text-shell-300 mb-2">
                  Badge Style
                </label>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value as BadgeStyle)}
                  className="w-full bg-reef-900 border border-reef-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                >
                  {badgeStyles.map((style) => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-shell-300 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-reef-900 border border-reef-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-shell-300 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search agents..."
                  className="w-full bg-reef-900 border border-reef-600 rounded-lg px-3 py-2 text-white placeholder-shell-500 focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                />
              </div>

              {/* Live Mode Toggle */}
              <div>
                <label className="block text-sm font-medium text-shell-300 mb-2">
                  Real-time Check
                </label>
                <button
                  onClick={() => setLiveMode(!liveMode)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    liveMode
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-reef-700 text-shell-300 hover:bg-reef-600'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${liveMode ? 'bg-emerald-300 animate-pulse' : 'bg-shell-500'}`} />
                  {liveMode ? 'Live Check ON' : 'Live Check OFF'}
                </button>
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-4 p-4 bg-reef-900/50 rounded-lg border border-reef-700/30">
              <p className="text-sm text-shell-400">
                <span className="text-coral-400 font-semibold">💡 Tip:</span> Enable &quot;Live Check&quot; for badges that verify the agent endpoint is actually responding. 
                This adds a small delay but ensures accuracy. Badges without live check use the database status.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Badge Preview Gallery */}
      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">
            Style Preview
          </h2>
          <div className="bg-reef-800/30 rounded-xl p-6 border border-reef-700/30">
            <div className="flex flex-wrap gap-4 items-center">
              {badgeStyles.map((style) => (
                <div key={style.value} className="text-center">
                  <img
                    src={`/api/badge/crypto-price-agent?style=${style.value}`}
                    alt={`${style.label} style badge`}
                    className="h-7"
                  />
                  <p className="text-xs text-shell-500 mt-1">{style.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Agent Badges List */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">
            Available Badges ({filteredAgents.length})
          </h2>
          
          <div className="space-y-4">
            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                className="bg-reef-800/50 rounded-xl p-6 border border-reef-700/50 hover:border-coral-500/30 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Agent Info */}
                  <div className="flex items-center gap-3 lg:w-64 flex-shrink-0">
                    <span className="text-3xl">{agent.icon}</span>
                    <div>
                      <Link
                        href={`/agents/${agent.id}`}
                        className="text-white font-semibold hover:text-coral-400 transition-colors"
                      >
                        {agent.name}
                      </Link>
                      <p className="text-sm text-shell-500">{agent.category}</p>
                    </div>
                  </div>

                  {/* Badge Preview */}
                  <div className="lg:w-48 flex-shrink-0">
                    <img
                      src={getBadgeUrl(agent.id)}
                      alt={`${agent.name} status badge`}
                      className="h-6"
                    />
                  </div>

                  {/* Embed Codes */}
                  <div className="flex-grow space-y-2">
                    {/* Markdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-shell-500 w-20 flex-shrink-0">Markdown:</span>
                      <code className="flex-grow bg-reef-900/80 rounded px-2 py-1 text-xs text-shell-300 font-mono overflow-x-auto whitespace-nowrap">
                        {getMarkdownEmbed(agent.id, agent.name)}
                      </code>
                      <button
                        onClick={() => copyToClipboard(getMarkdownEmbed(agent.id, agent.name), `md-${agent.id}`)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-all flex-shrink-0 ${
                          copiedId === `md-${agent.id}`
                            ? 'bg-emerald-600 text-white'
                            : 'bg-reef-700 text-shell-300 hover:bg-reef-600'
                        }`}
                      >
                        {copiedId === `md-${agent.id}` ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>

                    {/* HTML */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-shell-500 w-20 flex-shrink-0">HTML:</span>
                      <code className="flex-grow bg-reef-900/80 rounded px-2 py-1 text-xs text-shell-300 font-mono overflow-x-auto whitespace-nowrap">
                        {getHtmlEmbed(agent.id, agent.name)}
                      </code>
                      <button
                        onClick={() => copyToClipboard(getHtmlEmbed(agent.id, agent.name), `html-${agent.id}`)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-all flex-shrink-0 ${
                          copiedId === `html-${agent.id}`
                            ? 'bg-emerald-600 text-white'
                            : 'bg-reef-700 text-shell-300 hover:bg-reef-600'
                        }`}
                      >
                        {copiedId === `html-${agent.id}` ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>

                    {/* Direct URL */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-shell-500 w-20 flex-shrink-0">URL:</span>
                      <code className="flex-grow bg-reef-900/80 rounded px-2 py-1 text-xs text-coral-400 font-mono overflow-x-auto whitespace-nowrap">
                        {getBadgeUrl(agent.id)}
                      </code>
                      <button
                        onClick={() => copyToClipboard(getBadgeUrl(agent.id), `url-${agent.id}`)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-all flex-shrink-0 ${
                          copiedId === `url-${agent.id}`
                            ? 'bg-emerald-600 text-white'
                            : 'bg-reef-700 text-shell-300 hover:bg-reef-600'
                        }`}
                      >
                        {copiedId === `url-${agent.id}` ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAgents.length === 0 && (
            <div className="text-center py-12 bg-reef-800/30 rounded-xl border border-reef-700/30">
              <p className="text-shell-400">No agents found matching your filters.</p>
            </div>
          )}
        </div>
      </section>

      {/* API Documentation */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">
            🔧 Badge API
          </h2>
          
          <div className="bg-reef-800/50 rounded-xl p-6 border border-reef-700/50">
            <h3 className="text-lg font-semibold text-white mb-3">Endpoint</h3>
            <code className="block bg-reef-900 rounded-lg p-4 text-coral-400 font-mono text-sm mb-6">
              GET /api/badge/[agentId]
            </code>

            <h3 className="text-lg font-semibold text-white mb-3">Query Parameters</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-shell-400 border-b border-reef-700">
                    <th className="pb-2 pr-4">Parameter</th>
                    <th className="pb-2 pr-4">Type</th>
                    <th className="pb-2 pr-4">Default</th>
                    <th className="pb-2">Description</th>
                  </tr>
                </thead>
                <tbody className="text-shell-300">
                  <tr className="border-b border-reef-700/30">
                    <td className="py-2 pr-4 font-mono text-coral-400">style</td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">flat</td>
                    <td className="py-2">Badge style: flat, flat-square, plastic, for-the-badge</td>
                  </tr>
                  <tr className="border-b border-reef-700/30">
                    <td className="py-2 pr-4 font-mono text-coral-400">label</td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">Agent name</td>
                    <td className="py-2">Custom label text</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-coral-400">live</td>
                    <td className="py-2 pr-4">boolean</td>
                    <td className="py-2 pr-4">false</td>
                    <td className="py-2">Perform real-time health check on agent endpoint</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-semibold text-white mt-6 mb-3">Examples</h3>
            <div className="space-y-3">
              <div>
                <p className="text-shell-400 text-sm mb-1">Default flat badge:</p>
                <code className="block bg-reef-900 rounded p-2 text-xs text-shell-300 font-mono">
                  /api/badge/crypto-price-agent
                </code>
              </div>
              <div>
                <p className="text-shell-400 text-sm mb-1">For the badge style with live check:</p>
                <code className="block bg-reef-900 rounded p-2 text-xs text-shell-300 font-mono">
                  /api/badge/crypto-price-agent?style=for-the-badge&live=true
                </code>
              </div>
              <div>
                <p className="text-shell-400 text-sm mb-1">Custom label:</p>
                <code className="block bg-reef-900 rounded p-2 text-xs text-shell-300 font-mono">
                  /api/badge/weather-intel-agent?label=Weather%20API
                </code>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
