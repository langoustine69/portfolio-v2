'use client';

import { useState, useCallback } from 'react';
import { agents, Agent } from '@/data/agents';
import { useSandboxCredits } from '@/hooks/useSandboxCredits';

interface SandboxEndpoint {
  method: 'GET' | 'POST';
  path: string;
  description: string;
  example?: string;
}

const getSandboxEndpoints = (agent: Agent): SandboxEndpoint[] => {
  const base = [
    { method: 'GET' as const, path: '/', description: 'Health check', example: 'curl -X GET' },
  ];
  
  switch (agent.category) {
    case 'DeFi':
      return [...base, 
        { method: 'GET' as const, path: '/prices?coins=bitcoin,ethereum', description: 'Get crypto prices' },
        { method: 'GET' as const, path: '/defi/tvl', description: 'DeFi total value locked' },
      ];
    case 'Weather':
      return [...base,
        { method: 'GET' as const, path: '/current?city=Sydney', description: 'Current weather' },
        { method: 'GET' as const, path: '/forecast?city=Tokyo&days=3', description: '3-day forecast' },
      ];
    case 'Language':
      return [...base,
        { method: 'GET' as const, path: '/define/serendipity', description: 'Word definition' },
        { method: 'GET' as const, path: '/synonyms/happy', description: 'Find synonyms' },
      ];
    case 'Geoscience':
      return [...base,
        { method: 'GET' as const, path: '/events', description: 'Active natural events' },
        { method: 'GET' as const, path: '/events/category/wildfires', description: 'Wildfires only' },
      ];
    case 'Aviation':
      return [...base,
        { method: 'GET' as const, path: '/flights/live?airline=QF', description: 'Live Qantas flights' },
      ];
    case 'Space':
      return [...base,
        { method: 'GET' as const, path: '/launches/upcoming', description: 'Upcoming launches' },
      ];
    default:
      return [...base,
        { method: 'GET' as const, path: '/data', description: 'Fetch data' },
      ];
  }
};

export default function SandboxMode() {
  const liveAgents = agents.filter(a => a.status === 'live' && a.railwayUrl);
  const { getRemaining, useCredit, getTotalUsed, maxFreeCallsPerAgent, isLoaded } = useSandboxCredits();
  
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(liveAgents[0] || null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<SandboxEndpoint | null>(null);
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);

  const endpoints = selectedAgent ? getSandboxEndpoints(selectedAgent) : [];
  const remaining = selectedAgent ? getRemaining(selectedAgent.id) : 0;

  const handleTryRequest = useCallback(async () => {
    if (!selectedAgent || !selectedEndpoint) return;
    
    const canUse = useCredit(selectedAgent.id);
    if (!canUse) {
      setShowPaymentPrompt(true);
      return;
    }

    setLoading(true);
    setError(null);
    setResponse('');
    setShowPaymentPrompt(false);

    const startTime = performance.now();

    try {
      const url = `${selectedAgent.railwayUrl}${selectedEndpoint.path}`;
      const res = await fetch(url, {
        method: selectedEndpoint.method,
        headers: { 'Accept': 'application/json' },
      });

      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));

      if (!res.ok) {
        // Check for 402 Payment Required
        if (res.status === 402) {
          const paymentData = await res.json();
          setResponse(JSON.stringify({
            status: 402,
            message: 'Payment Required',
            paymentInfo: paymentData,
            note: 'In production, your agent would automatically handle this x402 payment flow'
          }, null, 2));
          return;
        }
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }, [selectedAgent, selectedEndpoint, useCredit]);

  if (!isLoaded) {
    return (
      <div className="animate-pulse">
        <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sandbox Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🧪</span>
          <h2 className="text-2xl font-bold">Agent Sandbox Mode</h2>
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
            FREE TIER
          </span>
        </div>
        <p className="text-emerald-100">
          Try any x402 agent for free! Get {maxFreeCallsPerAgent} API calls per agent per day — no wallet required.
        </p>
        <div className="mt-4 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            <span>{getTotalUsed()} total calls made today</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🔓</span>
            <span>No payment info needed</span>
          </div>
        </div>
      </div>

      {/* Agent Selection */}
      <div className="grid md:grid-cols-3 gap-4">
        {liveAgents.map(agent => {
          const agentRemaining = getRemaining(agent.id);
          const isSelected = selectedAgent?.id === agent.id;
          
          return (
            <button
              key={agent.id}
              onClick={() => {
                setSelectedAgent(agent);
                setSelectedEndpoint(null);
                setResponse('');
                setError(null);
                setShowPaymentPrompt(false);
              }}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{agent.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{agent.name}</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{agent.category}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex gap-1">
                  {[...Array(maxFreeCallsPerAgent)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < agentRemaining
                          ? 'bg-emerald-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {agentRemaining}/{maxFreeCallsPerAgent} left
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Endpoint Selection & Testing */}
      {selectedAgent && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedAgent.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {selectedAgent.name}
                  </h3>
                  <code className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedAgent.railwayUrl}
                  </code>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  remaining > 2
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                    : remaining > 0
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                }`}>
                  {remaining} free calls left
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Endpoint buttons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Endpoint
              </label>
              <div className="flex flex-wrap gap-2">
                {endpoints.map((ep, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedEndpoint(ep)}
                    className={`px-3 py-2 rounded-lg text-sm font-mono transition-all ${
                      selectedEndpoint === ep
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span className={`mr-2 text-xs font-bold ${
                      ep.method === 'GET' ? 'text-green-400' : 'text-blue-400'
                    }`}>
                      {ep.method}
                    </span>
                    {ep.path}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected endpoint info */}
            {selectedEndpoint && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-600 dark:text-gray-400">{selectedEndpoint.description}</p>
                  <button
                    onClick={handleTryRequest}
                    disabled={loading || remaining <= 0}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${
                      loading
                        ? 'bg-gray-400 cursor-wait'
                        : remaining <= 0
                        ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Running...
                      </span>
                    ) : remaining <= 0 ? (
                      'No credits left'
                    ) : (
                      '🚀 Try it free'
                    )}
                  </button>
                </div>
                <code className="block text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                  curl -X {selectedEndpoint.method} &quot;{selectedAgent.railwayUrl}{selectedEndpoint.path}&quot;
                </code>
              </div>
            )}

            {/* Payment prompt */}
            {showPaymentPrompt && (
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">💳</span>
                  <div>
                    <h4 className="text-lg font-bold mb-2">Free tier exhausted!</h4>
                    <p className="text-purple-100 mb-4">
                      You&apos;ve used all {maxFreeCallsPerAgent} free calls for {selectedAgent.name}. 
                      Ready to go unlimited with x402 micropayments?
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <a
                        href="/x402-flow"
                        className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors"
                      >
                        Learn about x402 payments →
                      </a>
                      <a
                        href={`/agents/${selectedAgent.id}`}
                        className="px-4 py-2 bg-white/20 rounded-lg font-medium hover:bg-white/30 transition-colors"
                      >
                        View agent details
                      </a>
                    </div>
                    <p className="text-xs text-purple-200 mt-3">
                      💡 Tip: Free calls reset daily at midnight UTC
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Response */}
            {(response || error) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Response</h4>
                  {responseTime && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ⚡ {responseTime}ms
                    </span>
                  )}
                </div>
                {error ? (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-700 dark:text-red-300">{error}</p>
                  </div>
                ) : (
                  <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm max-h-96 overflow-y-auto">
                    <code>{response}</code>
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          How Sandbox Mode Works
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
              1
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Pick an agent</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose from any of our live x402 agents
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
              2
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Try for free</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get {maxFreeCallsPerAgent} free API calls per agent, per day
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
              3
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Go unlimited</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                When ready, pay-per-call with x402 micropayments
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
