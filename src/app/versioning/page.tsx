'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';

interface VersionChange {
  version: string;
  releaseDate: string;
  status: 'current' | 'deprecated' | 'sunset' | 'upcoming';
  changes: {
    type: 'breaking' | 'deprecation' | 'feature' | 'fix';
    title: string;
    description: string;
    migration?: string;
  }[];
  sunsetDate?: string;
}

interface DeprecationNotice {
  id: string;
  feature: string;
  deprecatedIn: string;
  sunsetDate: string;
  replacement: string;
  impact: 'high' | 'medium' | 'low';
  migrationGuide: string;
}

const versionHistory: VersionChange[] = [
  {
    version: 'v2.1.0',
    releaseDate: '2026-03-15',
    status: 'upcoming',
    changes: [
      {
        type: 'breaking',
        title: 'Response format standardization',
        description: 'All agents will return responses in a unified format with `data`, `meta`, and `error` fields.',
        migration: 'Update your response parsing to use `response.data` instead of accessing properties directly.',
      },
      {
        type: 'feature',
        title: 'Batch request support',
        description: 'New `/batch` endpoint allows combining multiple agent calls into a single request.',
      },
      {
        type: 'deprecation',
        title: 'Legacy authentication header',
        description: 'The `X-API-Key` header is deprecated in favor of `Authorization: Bearer` format.',
        migration: 'Replace `X-API-Key: your-key` with `Authorization: Bearer your-key`',
      },
    ],
  },
  {
    version: 'v2.0.0',
    releaseDate: '2026-01-15',
    status: 'current',
    changes: [
      {
        type: 'breaking',
        title: 'x402 payment protocol adoption',
        description: 'All paid endpoints now use the x402 micropayment protocol instead of subscription billing.',
        migration: 'Integrate the x402 client library to handle automatic payments. See /guides for setup.',
      },
      {
        type: 'feature',
        title: 'Real-time streaming responses',
        description: 'Agents now support streaming responses via Server-Sent Events.',
      },
      {
        type: 'feature',
        title: 'Agent-to-Agent (A2A) protocol',
        description: 'Agents can now communicate directly with each other using the A2A protocol.',
      },
      {
        type: 'fix',
        title: 'Rate limit headers standardized',
        description: 'All agents now return consistent `X-RateLimit-*` headers.',
      },
    ],
  },
  {
    version: 'v1.5.0',
    releaseDate: '2025-10-01',
    status: 'deprecated',
    sunsetDate: '2026-04-01',
    changes: [
      {
        type: 'feature',
        title: 'Webhook callbacks',
        description: 'Added support for webhook notifications on long-running tasks.',
      },
      {
        type: 'fix',
        title: 'Improved error messages',
        description: 'Error responses now include actionable suggestions.',
      },
    ],
  },
  {
    version: 'v1.0.0',
    releaseDate: '2025-06-01',
    status: 'sunset',
    sunsetDate: '2026-01-01',
    changes: [
      {
        type: 'feature',
        title: 'Initial release',
        description: 'First public release of the agent API platform.',
      },
    ],
  },
];

const deprecationNotices: DeprecationNotice[] = [
  {
    id: 'dep-001',
    feature: 'X-API-Key authentication header',
    deprecatedIn: 'v2.1.0',
    sunsetDate: '2026-06-15',
    replacement: 'Authorization: Bearer header',
    impact: 'high',
    migrationGuide: `
// Before (deprecated)
fetch(url, {
  headers: { 'X-API-Key': 'your-key' }
});

// After (recommended)
fetch(url, {
  headers: { 'Authorization': 'Bearer your-key' }
});
    `.trim(),
  },
  {
    id: 'dep-002',
    feature: 'Legacy response format',
    deprecatedIn: 'v2.1.0',
    sunsetDate: '2026-06-15',
    replacement: 'Unified response wrapper',
    impact: 'medium',
    migrationGuide: `
// Before (deprecated)
const result = await response.json();
console.log(result.price); // Direct access

// After (recommended)
const result = await response.json();
console.log(result.data.price); // Via data wrapper
console.log(result.meta.timestamp); // Metadata available
    `.trim(),
  },
  {
    id: 'dep-003',
    feature: '/v1/* endpoints',
    deprecatedIn: 'v2.0.0',
    sunsetDate: '2026-04-01',
    replacement: '/v2/* endpoints',
    impact: 'high',
    migrationGuide: `
// Before (deprecated)
const url = 'https://api.example.com/v1/agents/crypto-prices';

// After (recommended)
const url = 'https://api.example.com/v2/agents/crypto-prices';
// Note: v2 requires x402 payment client
    `.trim(),
  },
];

const compatibilityMatrix = [
  { sdk: 'TypeScript SDK', v1: '✓', v15: '✓', v2: '✓', v21: '✓' },
  { sdk: 'Python SDK', v1: '✓', v15: '✓', v2: '✓', v21: 'β' },
  { sdk: 'Go SDK', v1: '✗', v15: '✓', v2: '✓', v21: '✓' },
  { sdk: 'Rust SDK', v1: '✗', v15: '✗', v2: '✓', v21: '✓' },
  { sdk: 'x402 Client', v1: '✗', v15: '✗', v2: '✓', v21: '✓' },
  { sdk: 'A2A Protocol', v1: '✗', v15: '✗', v2: '✓', v21: '✓' },
];

function getStatusBadge(status: VersionChange['status']) {
  const styles = {
    current: 'bg-green-500/20 text-green-400 border-green-500/30',
    deprecated: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    sunset: 'bg-red-500/20 text-red-400 border-red-500/30',
    upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };
  const labels = {
    current: 'Current',
    deprecated: 'Deprecated',
    sunset: 'Sunset',
    upcoming: 'Upcoming',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function getChangeTypeBadge(type: VersionChange['changes'][0]['type']) {
  const styles = {
    breaking: 'bg-red-500/20 text-red-400',
    deprecation: 'bg-yellow-500/20 text-yellow-400',
    feature: 'bg-green-500/20 text-green-400',
    fix: 'bg-blue-500/20 text-blue-400',
  };
  const icons = {
    breaking: '⚠️',
    deprecation: '📅',
    feature: '✨',
    fix: '🔧',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[type]}`}>
      {icons[type]} {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}

function getImpactBadge(impact: DeprecationNotice['impact']) {
  const styles = {
    high: 'bg-red-500/20 text-red-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    low: 'bg-green-500/20 text-green-400',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[impact]}`}>
      {impact.toUpperCase()} IMPACT
    </span>
  );
}

function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function VersioningPage() {
  const [activeTab, setActiveTab] = useState<'changelog' | 'deprecations' | 'compatibility' | 'subscribe'>('changelog');
  const [expandedVersion, setExpandedVersion] = useState<string | null>('v2.0.0');
  const [expandedDeprecation, setExpandedDeprecation] = useState<string | null>(null);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribeEmail) {
      setSubscribed(true);
      setSubscribeEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: 'API Versioning', href: '/versioning' }]} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">API Versioning & Migration Hub</h1>
          <p className="text-gray-400">
            Track API versions, breaking changes, deprecations, and migration guides. Stay ahead of changes to keep your integration running smoothly.
          </p>
        </div>

        {/* Alert Banner */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-yellow-400">Upcoming Breaking Change</h3>
              <p className="text-sm text-gray-300 mt-1">
                <strong>v2.1.0</strong> releases on March 15, 2026 with response format standardization. 
                <a href="#changelog" className="text-yellow-400 hover:underline ml-1">View migration guide →</a>
              </p>
            </div>
            <span className="ml-auto bg-yellow-500/30 px-3 py-1 rounded-full text-sm font-mono text-yellow-400">
              {getDaysUntil('2026-03-15')} days
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2 overflow-x-auto">
          {[
            { id: 'changelog', label: 'Changelog', icon: '📋' },
            { id: 'deprecations', label: 'Deprecations', icon: '⏰' },
            { id: 'compatibility', label: 'SDK Compatibility', icon: '🧩' },
            { id: 'subscribe', label: 'Subscribe', icon: '🔔' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-t-lg font-medium transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Changelog Tab */}
        {activeTab === 'changelog' && (
          <div id="changelog" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Version History</h2>
              <div className="flex gap-2 text-sm">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Current</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Deprecated</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Sunset</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Upcoming</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-800"></div>
              
              {versionHistory.map((version) => (
                <div key={version.version} className="relative pl-10 pb-6">
                  <div className={`absolute left-2.5 w-4 h-4 rounded-full border-2 ${
                    version.status === 'current' ? 'bg-green-500 border-green-400' :
                    version.status === 'deprecated' ? 'bg-yellow-500 border-yellow-400' :
                    version.status === 'sunset' ? 'bg-red-500 border-red-400' :
                    'bg-blue-500 border-blue-400'
                  }`}></div>
                  
                  <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedVersion(expandedVersion === version.version ? null : version.version)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800/50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-lg">{version.version}</span>
                        {getStatusBadge(version.status)}
                        {version.sunsetDate && version.status !== 'sunset' && (
                          <span className="text-xs text-gray-500">
                            Sunset: {version.sunsetDate}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">{version.releaseDate}</span>
                        <span className={`transform transition ${expandedVersion === version.version ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </div>
                    </button>
                    
                    {expandedVersion === version.version && (
                      <div className="px-4 pb-4 space-y-3 border-t border-gray-800 pt-3">
                        {version.changes.map((change, i) => (
                          <div key={i} className="bg-gray-800/50 rounded-lg p-3">
                            <div className="flex items-start gap-2 mb-2">
                              {getChangeTypeBadge(change.type)}
                              <span className="font-medium">{change.title}</span>
                            </div>
                            <p className="text-sm text-gray-400 mb-2">{change.description}</p>
                            {change.migration && (
                              <div className="bg-gray-950 rounded p-3 mt-2">
                                <span className="text-xs text-blue-400 font-medium">Migration Guide:</span>
                                <p className="text-sm text-gray-300 mt-1">{change.migration}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deprecations Tab */}
        {activeTab === 'deprecations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Active Deprecation Notices</h2>
              <span className="text-sm text-gray-400">{deprecationNotices.length} active notices</span>
            </div>

            <div className="grid gap-4">
              {deprecationNotices.map((notice) => {
                const daysLeft = getDaysUntil(notice.sunsetDate);
                const isUrgent = daysLeft <= 30;
                
                return (
                  <div
                    key={notice.id}
                    className={`bg-gray-900 border rounded-lg overflow-hidden ${
                      isUrgent ? 'border-red-500/50' : 'border-gray-800'
                    }`}
                  >
                    <button
                      onClick={() => setExpandedDeprecation(expandedDeprecation === notice.id ? null : notice.id)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800/50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{notice.feature}</span>
                        {getImpactBadge(notice.impact)}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-mono ${isUrgent ? 'text-red-400' : 'text-gray-400'}`}>
                          {daysLeft > 0 ? `${daysLeft} days left` : 'SUNSET'}
                        </span>
                        <span className={`transform transition ${expandedDeprecation === notice.id ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </div>
                    </button>

                    {expandedDeprecation === notice.id && (
                      <div className="px-4 pb-4 border-t border-gray-800 pt-3 space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Deprecated In</span>
                            <p className="font-mono">{notice.deprecatedIn}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Sunset Date</span>
                            <p className={`font-mono ${isUrgent ? 'text-red-400' : ''}`}>{notice.sunsetDate}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">Replacement</span>
                            <p className="text-blue-400">{notice.replacement}</p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-950 rounded-lg p-4">
                          <span className="text-xs text-green-400 font-medium mb-2 block">Migration Code</span>
                          <pre className="text-sm text-gray-300 overflow-x-auto">
                            <code>{notice.migrationGuide}</code>
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Deprecation Timeline */}
            <div className="mt-8 bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h3 className="font-semibold mb-4">Deprecation Timeline</h3>
              <div className="relative h-16">
                <div className="absolute inset-x-0 top-1/2 h-1 bg-gray-800 rounded"></div>
                {deprecationNotices.map((notice, i) => {
                  const daysLeft = getDaysUntil(notice.sunsetDate);
                  const maxDays = 180;
                  const position = Math.max(0, Math.min(100, ((maxDays - daysLeft) / maxDays) * 100));
                  
                  return (
                    <div
                      key={notice.id}
                      className="absolute transform -translate-x-1/2"
                      style={{ left: `${position}%`, top: '0' }}
                    >
                      <div className={`w-3 h-3 rounded-full ${
                        notice.impact === 'high' ? 'bg-red-500' :
                        notice.impact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs text-gray-400">
                        {notice.sunsetDate}
                      </div>
                    </div>
                  );
                })}
                <div className="absolute right-0 top-0 text-xs text-gray-500">Today</div>
              </div>
            </div>
          </div>
        )}

        {/* Compatibility Tab */}
        {activeTab === 'compatibility' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">SDK & Feature Compatibility</h2>
            
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-800/50">
                      <th className="px-4 py-3 text-left font-medium">SDK / Feature</th>
                      <th className="px-4 py-3 text-center font-mono text-sm">v1.0</th>
                      <th className="px-4 py-3 text-center font-mono text-sm">v1.5</th>
                      <th className="px-4 py-3 text-center font-mono text-sm bg-green-500/10">v2.0 ✓</th>
                      <th className="px-4 py-3 text-center font-mono text-sm bg-blue-500/10">v2.1 β</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compatibilityMatrix.map((row, i) => (
                      <tr key={i} className="border-t border-gray-800 hover:bg-gray-800/30">
                        <td className="px-4 py-3 font-medium">{row.sdk}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={row.v1 === '✓' ? 'text-green-400' : row.v1 === 'β' ? 'text-blue-400' : 'text-gray-600'}>
                            {row.v1}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={row.v15 === '✓' ? 'text-green-400' : row.v15 === 'β' ? 'text-blue-400' : 'text-gray-600'}>
                            {row.v15}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center bg-green-500/5">
                          <span className={row.v2 === '✓' ? 'text-green-400' : row.v2 === 'β' ? 'text-blue-400' : 'text-gray-600'}>
                            {row.v2}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center bg-blue-500/5">
                          <span className={row.v21 === '✓' ? 'text-green-400' : row.v21 === 'β' ? 'text-blue-400' : 'text-gray-600'}>
                            {row.v21}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-400">✓</span>
                  <span className="font-medium">Fully Supported</span>
                </div>
                <p className="text-sm text-gray-400">Production-ready with full feature parity.</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-400">β</span>
                  <span className="font-medium">Beta Support</span>
                </div>
                <p className="text-sm text-gray-400">Available but may have breaking changes.</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-600">✗</span>
                  <span className="font-medium">Not Supported</span>
                </div>
                <p className="text-sm text-gray-400">Feature not available in this version.</p>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-6">
              <h3 className="font-semibold text-blue-400 mb-2">💡 Recommendation</h3>
              <p className="text-sm text-gray-300">
                For new projects, use <strong>v2.0</strong> with the TypeScript or Python SDK. This gives you access to x402 payments, 
                A2A protocol, and streaming responses while maintaining stability. Upgrade to v2.1 when it reaches stable.
              </p>
            </div>
          </div>
        )}

        {/* Subscribe Tab */}
        {activeTab === 'subscribe' && (
          <div className="max-w-lg mx-auto">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2">🔔 Subscribe to API Updates</h2>
              <p className="text-gray-400 text-sm mb-6">
                Get notified about breaking changes, deprecations, and new versions before they happen.
              </p>

              {subscribed ? (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                  <span className="text-2xl mb-2 block">✅</span>
                  <p className="text-green-400 font-medium">You're subscribed!</p>
                  <p className="text-sm text-gray-400 mt-1">We'll email you about important API changes.</p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      value={subscribeEmail}
                      onChange={(e) => setSubscribeEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium mb-2">Notification Types</label>
                    {[
                      { id: 'breaking', label: 'Breaking changes', checked: true },
                      { id: 'deprecations', label: 'Deprecation notices', checked: true },
                      { id: 'releases', label: 'New version releases', checked: true },
                      { id: 'security', label: 'Security advisories', checked: true },
                    ].map((opt) => (
                      <label key={opt.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" defaultChecked={opt.checked} className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500" />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
                  >
                    Subscribe to Updates
                  </button>
                </form>
              )}

              <div className="mt-6 pt-6 border-t border-gray-800">
                <h3 className="text-sm font-medium mb-3">Other Ways to Stay Updated</h3>
                <div className="grid grid-cols-2 gap-2">
                  <a href="/rss.xml" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white p-2 rounded hover:bg-gray-800">
                    📡 RSS Feed
                  </a>
                  <a href="/changelog" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white p-2 rounded hover:bg-gray-800">
                    📋 Changelog
                  </a>
                  <a href="/status" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white p-2 rounded hover:bg-gray-800">
                    🟢 Status Page
                  </a>
                  <a href="https://x.com/langoustine69A" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white p-2 rounded hover:bg-gray-800">
                    𝕏 @langoustine69A
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-12 grid md:grid-cols-4 gap-4">
          <a href="/errors" className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition">
            <span className="text-2xl mb-2 block">❌</span>
            <span className="font-medium">Error Codes</span>
            <p className="text-sm text-gray-400 mt-1">Reference for all error responses</p>
          </a>
          <a href="/sdk" className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition">
            <span className="text-2xl mb-2 block">📦</span>
            <span className="font-medium">SDK Downloads</span>
            <p className="text-sm text-gray-400 mt-1">Get the latest client libraries</p>
          </a>
          <a href="/starters" className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition">
            <span className="text-2xl mb-2 block">🚀</span>
            <span className="font-medium">Starter Templates</span>
            <p className="text-sm text-gray-400 mt-1">Quick start boilerplates</p>
          </a>
          <a href="/guides" className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition">
            <span className="text-2xl mb-2 block">📚</span>
            <span className="font-medium">Integration Guides</span>
            <p className="text-sm text-gray-400 mt-1">Step-by-step tutorials</p>
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
