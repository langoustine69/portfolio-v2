'use client';

import { useState } from 'react';
import { Agent } from '@/data/agents';
import Link from 'next/link';
import HealthIndicator from '@/components/HealthIndicator';
import RateLimitDisplay from '@/components/RateLimitDisplay';

interface DeepCompareClientProps {
  agents: Agent[];
}

type Tab = 'overview' | 'features' | 'ratelimits' | 'changelog' | 'integration';

export default function DeepCompareClient({ agents }: DeepCompareClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [copiedUrl, setCopiedUrl] = useState(false);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'features', label: 'Features', icon: '✨' },
    { id: 'ratelimits', label: 'Rate Limits', icon: '⏱️' },
    { id: 'changelog', label: 'Changelog', icon: '📜' },
    { id: 'integration', label: 'Integration', icon: '🔌' },
  ];

  const copyShareUrl = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Get all unique features
  const allFeatures = Array.from(
    new Set(agents.flatMap(a => a.features))
  ).sort();

  return (
    <div className="space-y-8">
      {/* Copy URL button */}
      <div className="flex justify-end">
        <button
          onClick={copyShareUrl}
          className="flex items-center gap-2 text-sm bg-shell-800 hover:bg-shell-700 text-shell-300 px-4 py-2 rounded-lg transition-colors"
        >
          {copiedUrl ? (
            <>
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy Link
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-shell-800 pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              activeTab === tab.id
                ? 'bg-lobster-600 text-white'
                : 'bg-shell-800 text-shell-400 hover:bg-shell-700 hover:text-shell-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-shell-900/50 dark:bg-shell-900/50 light:bg-white border border-shell-800 dark:border-shell-800 light:border-shell-200 rounded-xl overflow-hidden">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-shell-800">
                  <th className="text-left p-4 text-shell-400 font-medium min-w-[150px]">
                    Property
                  </th>
                  {agents.map(agent => (
                    <th key={agent.id} className="text-center p-4 min-w-[200px]">
                      <Link href={`/agents/${agent.id}`} className="hover:opacity-80 transition-opacity">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-3xl">{agent.icon}</span>
                          <span className="font-semibold text-shell-100">{agent.name}</span>
                        </div>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-shell-800/50">
                  <td className="p-4 text-shell-300 font-medium">Status</td>
                  {agents.map(agent => (
                    <td key={agent.id} className="p-4 text-center">
                      <div className="flex justify-center">
                        <HealthIndicator
                          endpoint={agent.railwayUrl}
                          staticStatus={agent.status}
                          showResponseTime
                        />
                      </div>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-shell-800/50">
                  <td className="p-4 text-shell-300 font-medium">Category</td>
                  {agents.map(agent => (
                    <td key={agent.id} className="p-4 text-center text-shell-200">
                      {agent.category}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-shell-800/50">
                  <td className="p-4 text-shell-300 font-medium">API Source</td>
                  {agents.map(agent => (
                    <td key={agent.id} className="p-4 text-center">
                      <span className="bg-shell-800/50 px-2 py-1 rounded text-xs text-shell-300">
                        {agent.apiSource}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-shell-800/50">
                  <td className="p-4 text-shell-300 font-medium">ERC-8004</td>
                  {agents.map(agent => (
                    <td key={agent.id} className="p-4 text-center">
                      {agent.erc8004Tx ? (
                        <a
                          href={agent.erc8004Tx}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-green-400 hover:text-green-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Verified
                        </a>
                      ) : (
                        <span className="text-shell-500">—</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-shell-800/50">
                  <td className="p-4 text-shell-300 font-medium align-top">Description</td>
                  {agents.map(agent => (
                    <td key={agent.id} className="p-4 text-center text-sm text-shell-400">
                      {agent.description}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-shell-300 font-medium">Links</td>
                  {agents.map(agent => (
                    <td key={agent.id} className="p-4">
                      <div className="flex flex-col items-center gap-2">
                        <Link
                          href={`/agents/${agent.id}`}
                          className="inline-flex items-center gap-1 text-sm text-lobster-400 hover:text-lobster-300"
                        >
                          View Details →
                        </Link>
                        {agent.railwayUrl && (
                          <a
                            href={agent.railwayUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-shell-400 hover:text-shell-300"
                          >
                            🔗 API
                          </a>
                        )}
                        {agent.githubUrl && (
                          <a
                            href={agent.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-shell-400 hover:text-shell-300"
                          >
                            📂 Source
                          </a>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-shell-800">
                  <th className="text-left p-4 text-shell-400 font-medium min-w-[200px]">
                    Feature
                  </th>
                  {agents.map(agent => (
                    <th key={agent.id} className="text-center p-4 min-w-[150px]">
                      <span className="text-xl">{agent.icon}</span>
                      <span className="block text-sm text-shell-200 mt-1">{agent.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allFeatures.map(feature => (
                  <tr key={feature} className="border-b border-shell-800/50">
                    <td className="p-4 text-shell-300">{feature}</td>
                    {agents.map(agent => (
                      <td key={agent.id} className="p-4 text-center">
                        {agent.features.includes(feature) ? (
                          <span className="text-green-400">
                            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        ) : (
                          <span className="text-shell-600">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-shell-800/30">
                  <td className="p-4 text-shell-300 font-semibold">Total Features</td>
                  {agents.map(agent => (
                    <td key={agent.id} className="p-4 text-center font-semibold text-lobster-400">
                      {agent.features.length}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Rate Limits Tab */}
        {activeTab === 'ratelimits' && (
          <div className="p-6">
            <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${agents.length}, minmax(250px, 1fr))` }}>
              {agents.map(agent => (
                <div key={agent.id} className="bg-shell-800/50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{agent.icon}</span>
                    <h3 className="font-semibold text-shell-100">{agent.name}</h3>
                  </div>
                  <RateLimitDisplay rateLimit={agent.rateLimit} variant="detailed" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Changelog Tab */}
        {activeTab === 'changelog' && (
          <div className="p-6">
            <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${agents.length}, minmax(280px, 1fr))` }}>
              {agents.map(agent => (
                <div key={agent.id} className="bg-shell-800/50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{agent.icon}</span>
                    <h3 className="font-semibold text-shell-100">{agent.name}</h3>
                  </div>
                  {agent.changelog && agent.changelog.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {agent.changelog.map((entry, idx) => (
                        <div key={idx} className="border-l-2 border-shell-700 pl-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded font-mono ${
                              entry.type === 'major' ? 'bg-red-500/20 text-red-400' :
                              entry.type === 'minor' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              v{entry.version}
                            </span>
                            <span className="text-xs text-shell-500">{entry.date}</span>
                          </div>
                          <ul className="text-sm text-shell-400 space-y-1">
                            {entry.changes.map((change, cIdx) => (
                              <li key={cIdx} className="flex items-start gap-2">
                                <span className="text-shell-600">•</span>
                                <span>{change}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-shell-500 text-sm italic">No changelog available</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Integration Tab */}
        {activeTab === 'integration' && (
          <div className="p-6">
            <div className="space-y-8">
              {agents.map(agent => (
                <div key={agent.id} className="bg-shell-800/50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{agent.icon}</span>
                    <h3 className="font-semibold text-shell-100">{agent.name}</h3>
                    {agent.railwayUrl && (
                      <code className="text-xs bg-shell-900 px-2 py-1 rounded text-shell-400 font-mono">
                        {agent.railwayUrl}
                      </code>
                    )}
                  </div>
                  
                  {agent.railwayUrl ? (
                    <div className="space-y-4">
                      <div className="bg-shell-900 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-shell-400 font-semibold uppercase tracking-wider">
                            cURL Example
                          </span>
                        </div>
                        <pre className="text-sm text-shell-300 overflow-x-auto">
                          <code>{`# Health check
curl ${agent.railwayUrl}/health

# Get data (x402 - may require payment)
curl -X POST ${agent.railwayUrl}/entrypoints/overview/invoke \\
  -H "Content-Type: application/json" \\
  -d '{}'`}</code>
                        </pre>
                      </div>
                      
                      <div className="bg-shell-900 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-shell-400 font-semibold uppercase tracking-wider">
                            JavaScript
                          </span>
                        </div>
                        <pre className="text-sm text-shell-300 overflow-x-auto">
                          <code>{`const response = await fetch("${agent.railwayUrl}/entrypoints/overview/invoke", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({})
});
const data = await response.json();`}</code>
                        </pre>
                      </div>
                      
                      <Link
                        href={`/agents/${agent.id}`}
                        className="inline-flex items-center gap-2 text-sm text-lobster-400 hover:text-lobster-300"
                      >
                        View full integration guides →
                      </Link>
                    </div>
                  ) : (
                    <p className="text-shell-500 text-sm italic">
                      No live endpoint available
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add more agents CTA */}
      <div className="text-center py-8">
        <Link
          href="/compare"
          className="inline-flex items-center gap-2 bg-lobster-600 hover:bg-lobster-500 text-white px-6 py-3 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Compare Different Agents
        </Link>
      </div>
    </div>
  );
}
