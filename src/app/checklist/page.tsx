'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  docsLink?: string;
  critical: boolean;
}

interface ChecklistCategory {
  id: string;
  title: string;
  icon: string;
  items: ChecklistItem[];
}

const checklist: ChecklistCategory[] = [
  {
    id: 'authentication',
    title: 'Authentication & Setup',
    icon: '🔐',
    items: [
      { id: 'wallet-connected', title: 'Wallet connection implemented', description: 'Your app connects to user wallets (MetaMask, WalletConnect, etc.)', critical: true },
      { id: 'base-network', title: 'Base network configured', description: 'App is configured for Base mainnet (chain ID 8453)', docsLink: '/x402-flow', critical: true },
      { id: 'usdc-approved', title: 'USDC spending approval flow', description: 'Users can approve USDC spending for x402 payments', critical: true },
      { id: 'env-vars', title: 'Environment variables secured', description: 'API keys and secrets are in env vars, not committed', critical: true },
    ],
  },
  {
    id: 'payment-flow',
    title: 'x402 Payment Flow',
    icon: '💳',
    items: [
      { id: '402-handling', title: '402 response handling', description: 'App correctly intercepts 402 Payment Required responses', docsLink: '/x402-flow', critical: true },
      { id: 'payment-signing', title: 'Payment signing implemented', description: 'Users can sign payment transactions when prompted', critical: true },
      { id: 'payment-retry', title: 'Automatic retry after payment', description: 'Request automatically retries with payment header after successful payment', critical: true },
      { id: 'payment-receipt', title: 'Payment receipts stored', description: 'Transaction hashes are logged for reconciliation', critical: false },
      { id: 'balance-check', title: 'Balance pre-check', description: 'Check USDC balance before making paid requests', critical: false },
    ],
  },
  {
    id: 'error-handling',
    title: 'Error Handling',
    icon: '🚨',
    items: [
      { id: 'network-errors', title: 'Network error handling', description: 'Graceful handling of timeouts and connection failures', critical: true },
      { id: 'rate-limit', title: 'Rate limit handling (429)', description: 'Implement backoff when hitting rate limits', docsLink: '/rate-calculator', critical: true },
      { id: 'invalid-response', title: 'Invalid response handling', description: 'Handle malformed or unexpected API responses', critical: true },
      { id: 'payment-failures', title: 'Payment failure recovery', description: 'Handle rejected transactions, insufficient funds, user cancellation', critical: true },
      { id: 'user-feedback', title: 'User-friendly error messages', description: 'Show clear, actionable error messages to users', critical: false },
    ],
  },
  {
    id: 'reliability',
    title: 'Reliability & Performance',
    icon: '⚡',
    items: [
      { id: 'retry-logic', title: 'Retry with exponential backoff', description: 'Implement retries for transient failures with exponential backoff', critical: true },
      { id: 'circuit-breaker', title: 'Circuit breaker pattern', description: 'Stop calling failing endpoints temporarily', docsLink: '/reliability', critical: false },
      { id: 'timeout-config', title: 'Appropriate timeouts', description: 'Set reasonable request timeouts (10-30s recommended)', critical: true },
      { id: 'caching', title: 'Response caching where appropriate', description: 'Cache immutable or rarely-changing responses', critical: false },
      { id: 'connection-pooling', title: 'HTTP connection pooling', description: 'Reuse HTTP connections for better performance', critical: false },
    ],
  },
  {
    id: 'monitoring',
    title: 'Monitoring & Logging',
    icon: '📊',
    items: [
      { id: 'request-logging', title: 'API request logging', description: 'Log all API requests with timing, status, and correlation IDs', docsLink: '/debugger', critical: true },
      { id: 'payment-logging', title: 'Payment event logging', description: 'Log all payment attempts, successes, and failures', critical: true },
      { id: 'error-alerting', title: 'Error alerting configured', description: 'Get notified when error rates spike', critical: false },
      { id: 'usage-tracking', title: 'Usage/spend tracking', description: 'Track API usage and spending for cost management', docsLink: '/spending', critical: false },
      { id: 'health-checks', title: 'Health check endpoint', description: 'Include agent health in your app health checks', docsLink: '/status', critical: false },
    ],
  },
  {
    id: 'security',
    title: 'Security',
    icon: '🛡️',
    items: [
      { id: 'https-only', title: 'HTTPS only', description: 'All API calls over HTTPS, no HTTP fallback', critical: true },
      { id: 'input-validation', title: 'Input validation', description: 'Validate and sanitize all user inputs before sending to API', critical: true },
      { id: 'response-validation', title: 'Response validation', description: 'Validate API responses before using data', critical: true },
      { id: 'no-secrets-client', title: 'No secrets in client code', description: 'Private keys and secrets never exposed to browser', critical: true },
      { id: 'cors-config', title: 'CORS properly configured', description: 'API calls work correctly with your domain', docsLink: '/preflight', critical: false },
    ],
  },
  {
    id: 'testing',
    title: 'Testing',
    icon: '🧪',
    items: [
      { id: 'sandbox-tested', title: 'Tested in sandbox mode', description: 'Verified integration using sandbox/testnet before production', docsLink: '/sandbox', critical: true },
      { id: 'happy-path', title: 'Happy path tested', description: 'Normal flow works end-to-end including payments', critical: true },
      { id: 'error-scenarios', title: 'Error scenarios tested', description: 'Tested 402, 429, 500, timeout, and network errors', critical: true },
      { id: 'edge-cases', title: 'Edge cases covered', description: 'Tested empty responses, large responses, special characters', critical: false },
      { id: 'load-tested', title: 'Load tested', description: 'Verified performance under expected traffic', critical: false },
    ],
  },
  {
    id: 'docs',
    title: 'Documentation',
    icon: '📚',
    items: [
      { id: 'integration-docs', title: 'Integration documented', description: 'Document how your app uses x402 agents', critical: false },
      { id: 'runbook', title: 'Runbook for incidents', description: 'Document what to do when agents are down or payments fail', critical: false },
      { id: 'changelog', title: 'Changelog maintained', description: 'Track changes to your integration over time', critical: false },
    ],
  },
];

export default function ChecklistPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('x402-production-checklist');
    if (saved) {
      try {
        setChecked(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse checklist state', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('x402-production-checklist', JSON.stringify(checked));
  }, [checked]);

  const toggleItem = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const resetChecklist = () => {
    if (confirm('Reset all progress? This cannot be undone.')) {
      setChecked({});
    }
  };

  // Calculate stats
  const allItems = checklist.flatMap((cat) => cat.items);
  const criticalItems = allItems.filter((item) => item.critical);
  const visibleItems = showCriticalOnly ? criticalItems : allItems;
  
  const totalChecked = allItems.filter((item) => checked[item.id]).length;
  const criticalChecked = criticalItems.filter((item) => checked[item.id]).length;
  const visibleChecked = visibleItems.filter((item) => checked[item.id]).length;
  
  const overallProgress = Math.round((totalChecked / allItems.length) * 100);
  const criticalProgress = Math.round((criticalChecked / criticalItems.length) * 100);

  const isProductionReady = criticalItems.every((item) => checked[item.id]);

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black uppercase mb-4 text-black dark:text-white">
            🚀 Production Readiness Checklist
          </h1>
          <p className="text-lg text-shell-600 dark:text-shell-400 max-w-2xl mx-auto">
            Ensure your x402 integration is production-ready. Check off each item as you complete it.
            Your progress is saved automatically.
          </p>
        </div>

        {/* Progress Dashboard */}
        <div className="mb-8 p-6 border-4 border-black dark:border-white bg-white dark:bg-shell-900"
             style={{ boxShadow: '6px 6px 0px 0px #000' }}>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Overall Progress */}
            <div>
              <div className="text-sm font-bold uppercase text-shell-500 mb-2">Overall Progress</div>
              <div className="text-4xl font-black text-black dark:text-white">{overallProgress}%</div>
              <div className="text-sm text-shell-500">{totalChecked} / {allItems.length} items</div>
              <div className="mt-2 h-3 bg-shell-200 dark:bg-shell-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-lobster-500 transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>

            {/* Critical Progress */}
            <div>
              <div className="text-sm font-bold uppercase text-shell-500 mb-2">Critical Items</div>
              <div className="text-4xl font-black text-black dark:text-white">{criticalProgress}%</div>
              <div className="text-sm text-shell-500">{criticalChecked} / {criticalItems.length} critical</div>
              <div className="mt-2 h-3 bg-shell-200 dark:bg-shell-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${criticalProgress === 100 ? 'bg-green-500' : 'bg-brutal-yellow'}`}
                  style={{ width: `${criticalProgress}%` }}
                />
              </div>
            </div>

            {/* Status */}
            <div className="flex flex-col justify-center items-center">
              {isProductionReady ? (
                <div className="text-center">
                  <div className="text-5xl mb-2">✅</div>
                  <div className="text-lg font-black uppercase text-green-600 dark:text-green-400">
                    Production Ready!
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-5xl mb-2">🚧</div>
                  <div className="text-lg font-black uppercase text-brutal-yellow">
                    Not Ready Yet
                  </div>
                  <div className="text-sm text-shell-500">
                    {criticalItems.length - criticalChecked} critical items remaining
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-8 items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCriticalOnly}
              onChange={(e) => setShowCriticalOnly(e.target.checked)}
              className="w-5 h-5 border-2 border-black dark:border-white accent-lobster-500"
            />
            <span className="font-bold text-black dark:text-white">Show critical only</span>
          </label>

          <button
            onClick={resetChecklist}
            className="px-4 py-2 border-2 border-black dark:border-white text-black dark:text-white font-bold uppercase text-sm hover:bg-lobster-500 hover:text-white hover:border-lobster-500 transition-colors"
          >
            Reset Progress
          </button>
        </div>

        {/* Checklist Categories */}
        <div className="space-y-8">
          {checklist.map((category) => {
            const categoryItems = showCriticalOnly 
              ? category.items.filter((item) => item.critical)
              : category.items;
            
            if (categoryItems.length === 0) return null;

            const categoryChecked = categoryItems.filter((item) => checked[item.id]).length;
            const categoryComplete = categoryChecked === categoryItems.length;

            return (
              <div 
                key={category.id}
                className={`border-4 border-black dark:border-white bg-white dark:bg-shell-900 overflow-hidden transition-opacity ${
                  categoryComplete ? 'opacity-75' : ''
                }`}
                style={{ boxShadow: categoryComplete ? 'none' : '4px 4px 0px 0px #000' }}
              >
                {/* Category Header */}
                <div className={`px-6 py-4 border-b-4 border-black dark:border-white ${
                  categoryComplete 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-brutal-yellow dark:bg-shell-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black uppercase text-black dark:text-white flex items-center gap-2">
                      <span>{category.icon}</span>
                      {category.title}
                      {categoryComplete && <span className="text-green-600">✓</span>}
                    </h2>
                    <span className="text-sm font-bold text-shell-600 dark:text-shell-400">
                      {categoryChecked} / {categoryItems.length}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y-2 divide-black dark:divide-white">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className={`px-6 py-4 flex gap-4 cursor-pointer hover:bg-shell-50 dark:hover:bg-shell-800 transition-colors ${
                        checked[item.id] ? 'bg-green-50 dark:bg-green-900/20' : ''
                      }`}
                      onClick={() => toggleItem(item.id)}
                    >
                      {/* Checkbox */}
                      <div className="flex-shrink-0 pt-1">
                        <div className={`w-6 h-6 border-2 border-black dark:border-white flex items-center justify-center ${
                          checked[item.id] ? 'bg-green-500 text-white' : 'bg-white dark:bg-shell-900'
                        }`}>
                          {checked[item.id] && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-bold text-black dark:text-white ${
                            checked[item.id] ? 'line-through opacity-60' : ''
                          }`}>
                            {item.title}
                          </span>
                          {item.critical && (
                            <span className="px-2 py-0.5 text-xs font-bold uppercase bg-lobster-500 text-white">
                              Critical
                            </span>
                          )}
                        </div>
                        <p className={`text-sm text-shell-600 dark:text-shell-400 mt-1 ${
                          checked[item.id] ? 'opacity-60' : ''
                        }`}>
                          {item.description}
                        </p>
                        {item.docsLink && !checked[item.id] && (
                          <Link
                            href={item.docsLink}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-sm text-lobster-500 hover:underline mt-1"
                          >
                            View docs →
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Share / Export */}
        <div className="mt-12 p-6 border-4 border-black dark:border-white bg-shell-100 dark:bg-shell-800"
             style={{ boxShadow: '4px 4px 0px 0px #000' }}>
          <h3 className="font-black uppercase text-lg text-black dark:text-white mb-4">
            📤 Export Your Progress
          </h3>
          <p className="text-sm text-shell-600 dark:text-shell-400 mb-4">
            Save or share your checklist progress with your team.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => {
                const summary = checklist.map(cat => {
                  const items = cat.items.map(item => 
                    `${checked[item.id] ? '✅' : '⬜'} ${item.title}${item.critical ? ' (CRITICAL)' : ''}`
                  ).join('\n');
                  return `## ${cat.icon} ${cat.title}\n${items}`;
                }).join('\n\n');
                const text = `# x402 Production Readiness Checklist\nProgress: ${overallProgress}% (${totalChecked}/${allItems.length})\nCritical: ${criticalProgress}% (${criticalChecked}/${criticalItems.length})\n\n${summary}`;
                navigator.clipboard.writeText(text);
                alert('Copied to clipboard as Markdown!');
              }}
              className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black font-bold uppercase text-sm border-2 border-black dark:border-white hover:bg-lobster-500 hover:text-white hover:border-lobster-500 transition-colors"
            >
              Copy as Markdown
            </button>
            <button
              onClick={() => {
                const data = {
                  exportedAt: new Date().toISOString(),
                  progress: { overall: overallProgress, critical: criticalProgress },
                  checked: Object.keys(checked).filter(k => checked[k]),
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'x402-checklist-progress.json';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 border-2 border-black dark:border-white text-black dark:text-white font-bold uppercase text-sm hover:bg-lobster-500 hover:text-white hover:border-lobster-500 transition-colors"
            >
              Download JSON
            </button>
          </div>
        </div>

        {/* Related Tools */}
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          <Link
            href="/preflight"
            className="p-4 border-4 border-black dark:border-white bg-white dark:bg-shell-900 hover:bg-brutal-yellow dark:hover:bg-shell-800 transition-colors"
            style={{ boxShadow: '4px 4px 0px 0px #000' }}
          >
            <div className="text-2xl mb-2">🔍</div>
            <div className="font-black uppercase text-black dark:text-white">Preflight Check</div>
            <div className="text-sm text-shell-600 dark:text-shell-400">Verify your environment</div>
          </Link>
          <Link
            href="/sandbox"
            className="p-4 border-4 border-black dark:border-white bg-white dark:bg-shell-900 hover:bg-brutal-yellow dark:hover:bg-shell-800 transition-colors"
            style={{ boxShadow: '4px 4px 0px 0px #000' }}
          >
            <div className="text-2xl mb-2">🧪</div>
            <div className="font-black uppercase text-black dark:text-white">Sandbox Mode</div>
            <div className="text-sm text-shell-600 dark:text-shell-400">Test without paying</div>
          </Link>
          <Link
            href="/debugger"
            className="p-4 border-4 border-black dark:border-white bg-white dark:bg-shell-900 hover:bg-brutal-yellow dark:hover:bg-shell-800 transition-colors"
            style={{ boxShadow: '4px 4px 0px 0px #000' }}
          >
            <div className="text-2xl mb-2">🔬</div>
            <div className="font-black uppercase text-black dark:text-white">Debug Tool</div>
            <div className="text-sm text-shell-600 dark:text-shell-400">Diagnose API issues</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
