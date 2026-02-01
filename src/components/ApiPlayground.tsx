'use client';

import { useState, useCallback } from 'react';
import { agents, Agent } from '@/data/agents';

interface EndpointConfig {
  method: 'GET' | 'POST';
  path: string;
  description: string;
  params?: { name: string; type: string; required: boolean; description: string }[];
}

// Define common endpoints for each agent type
const getEndpoints = (agent: Agent): EndpointConfig[] => {
  const baseEndpoints: EndpointConfig[] = [
    { method: 'GET', path: '/', description: 'Health check and agent info' },
    { method: 'GET', path: '/.well-known/agent.json', description: 'Agent manifest (A2A discovery)' },
  ];
  
  // Add category-specific endpoints
  switch (agent.category) {
    case 'Finance':
      return [
        ...baseEndpoints,
        { method: 'GET', path: '/rates', description: 'Get current exchange rates', params: [
          { name: 'base', type: 'string', required: false, description: 'Base currency (default: USD)' },
          { name: 'symbols', type: 'string', required: false, description: 'Comma-separated target currencies' },
        ]},
        { method: 'GET', path: '/convert', description: 'Convert amount between currencies', params: [
          { name: 'from', type: 'string', required: true, description: 'Source currency code' },
          { name: 'to', type: 'string', required: true, description: 'Target currency code' },
          { name: 'amount', type: 'number', required: true, description: 'Amount to convert' },
        ]},
      ];
    case 'Gaming':
      return [
        ...baseEndpoints,
        { method: 'GET', path: '/top', description: 'Get top games by player count', params: [
          { name: 'limit', type: 'number', required: false, description: 'Number of results (default: 10)' },
        ]},
        { method: 'GET', path: '/game', description: 'Get specific game details', params: [
          { name: 'appid', type: 'number', required: true, description: 'Steam app ID' },
        ]},
      ];
    case 'Sports':
      return [
        ...baseEndpoints,
        { method: 'GET', path: '/scores', description: 'Get live scores', params: [
          { name: 'league', type: 'string', required: false, description: 'League code (nfl, nba, mlb, nhl, epl)' },
        ]},
        { method: 'GET', path: '/schedule', description: 'Get upcoming games', params: [
          { name: 'league', type: 'string', required: true, description: 'League code' },
          { name: 'date', type: 'string', required: false, description: 'Date (YYYY-MM-DD)' },
        ]},
      ];
    case 'Weather':
      return [
        ...baseEndpoints,
        { method: 'GET', path: '/current', description: 'Get current weather', params: [
          { name: 'city', type: 'string', required: true, description: 'City name' },
        ]},
        { method: 'GET', path: '/forecast', description: 'Get weather forecast', params: [
          { name: 'city', type: 'string', required: true, description: 'City name' },
          { name: 'days', type: 'number', required: false, description: 'Forecast days (default: 5)' },
        ]},
      ];
    default:
      return [
        ...baseEndpoints,
        { method: 'GET', path: '/data', description: 'Get agent data' },
      ];
  }
};

export default function ApiPlayground() {
  const liveAgents = agents.filter(a => a.status === 'live' && a.railwayUrl);
  
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(liveAgents[0] || null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointConfig | null>(null);
  const [params, setParams] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const endpoints = selectedAgent ? getEndpoints(selectedAgent) : [];

  const handleAgentChange = useCallback((agentId: string) => {
    const agent = liveAgents.find(a => a.id === agentId) || null;
    setSelectedAgent(agent);
    setSelectedEndpoint(null);
    setParams({});
    setResponse('');
    setError(null);
    setResponseTime(null);
  }, [liveAgents]);

  const handleEndpointChange = useCallback((path: string) => {
    const endpoint = endpoints.find(e => e.path === path) || null;
    setSelectedEndpoint(endpoint);
    setParams({});
    setResponse('');
    setError(null);
    setResponseTime(null);
  }, [endpoints]);

  const handleParamChange = useCallback((name: string, value: string) => {
    setParams(prev => ({ ...prev, [name]: value }));
  }, []);

  const buildUrl = useCallback(() => {
    if (!selectedAgent?.railwayUrl || !selectedEndpoint) return '';
    
    let url = `${selectedAgent.railwayUrl}${selectedEndpoint.path}`;
    const queryParams = Object.entries(params)
      .filter(([, value]) => value.trim() !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    
    if (queryParams) {
      url += `?${queryParams}`;
    }
    
    return url;
  }, [selectedAgent, selectedEndpoint, params]);

  const executeRequest = useCallback(async () => {
    if (!selectedAgent?.railwayUrl || !selectedEndpoint) return;
    
    setLoading(true);
    setError(null);
    setResponse('');
    setResponseTime(null);
    
    const startTime = performance.now();
    
    try {
      const url = buildUrl();
      const res = await fetch(url, {
        method: selectedEndpoint.method,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));
      
      const contentType = res.headers.get('content-type');
      let data;
      
      if (contentType?.includes('application/json')) {
        data = await res.json();
        setResponse(JSON.stringify(data, null, 2));
      } else {
        data = await res.text();
        setResponse(data);
      }
      
      if (!res.ok) {
        setError(`HTTP ${res.status}: ${res.statusText}`);
      }
    } catch (err) {
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }, [selectedAgent, selectedEndpoint, buildUrl]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  if (liveAgents.length === 0) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            🧪 API Playground
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400">
            No live agents available for testing.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="playground" className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">
          🧪 API Playground
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Test agent endpoints in real-time. All requests use x402 micropayments.
        </p>

        <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Agent & Endpoint Selection */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Agent Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Agent
                </label>
                <select
                  value={selectedAgent?.id || ''}
                  onChange={(e) => handleAgentChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {liveAgents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.icon} {agent.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Endpoint Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Endpoint
                </label>
                <select
                  value={selectedEndpoint?.path || ''}
                  onChange={(e) => handleEndpointChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose an endpoint...</option>
                  {endpoints.map(endpoint => (
                    <option key={endpoint.path} value={endpoint.path}>
                      {endpoint.method} {endpoint.path}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedEndpoint && (
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                {selectedEndpoint.description}
              </p>
            )}
          </div>

          {/* Parameters */}
          {selectedEndpoint?.params && selectedEndpoint.params.length > 0 && (
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Parameters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedEndpoint.params.map(param => (
                  <div key={param.name}>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {param.name}
                      {param.required && <span className="text-red-500 ml-1">*</span>}
                      <span className="text-gray-400 dark:text-gray-500 ml-2 text-xs">
                        ({param.type})
                      </span>
                    </label>
                    <input
                      type={param.type === 'number' ? 'number' : 'text'}
                      value={params[param.name] || ''}
                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                      placeholder={param.description}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Request URL Preview */}
          {selectedEndpoint && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs font-mono font-bold text-white bg-green-600 rounded">
                  {selectedEndpoint.method}
                </span>
                <code className="flex-1 text-sm font-mono text-gray-700 dark:text-gray-300 truncate">
                  {buildUrl()}
                </code>
                <button
                  onClick={() => copyToClipboard(buildUrl())}
                  className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  title="Copy URL"
                >
                  📋
                </button>
              </div>
            </div>
          )}

          {/* Execute Button */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={executeRequest}
              disabled={!selectedEndpoint || loading}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all ${
                !selectedEndpoint || loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Executing...
                </span>
              ) : (
                '▶ Execute Request'
              )}
            </button>
          </div>

          {/* Response */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Response
              </h3>
              <div className="flex items-center gap-4 text-sm">
                {responseTime !== null && (
                  <span className="text-gray-500 dark:text-gray-400">
                    ⏱️ {responseTime}ms
                  </span>
                )}
                {error && (
                  <span className="text-red-500">
                    ❌ {error}
                  </span>
                )}
                {response && !error && (
                  <span className="text-green-500">
                    ✅ Success
                  </span>
                )}
              </div>
            </div>
            <div className="relative">
              <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-sm font-mono min-h-[200px] max-h-[400px]">
                {response || (
                  <span className="text-gray-500">
                    {selectedEndpoint 
                      ? '// Click "Execute Request" to see the response'
                      : '// Select an endpoint to get started'}
                  </span>
                )}
              </pre>
              {response && (
                <button
                  onClick={() => copyToClipboard(response)}
                  className="absolute top-2 right-2 px-2 py-1 text-xs text-gray-400 hover:text-white bg-gray-800 rounded"
                  title="Copy response"
                >
                  📋 Copy
                </button>
              )}
            </div>
          </div>

          {/* Payment Notice */}
          <div className="px-6 pb-6">
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                💰 <strong>x402 Micropayments:</strong> All API calls use HTTP 402 payment protocol. 
                Requests may require small USDC payments on Base. 
                <a href="https://www.x402.org" target="_blank" rel="noopener noreferrer" className="underline ml-1 hover:text-amber-600">
                  Learn more about x402
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Quick Examples */}
        <div className="max-w-5xl mx-auto mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📚 Quick Examples
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Currency Conversion</h4>
              <code className="text-xs text-gray-600 dark:text-gray-400 block">
                GET /convert?from=USD&to=EUR&amount=100
              </code>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Top Steam Games</h4>
              <code className="text-xs text-gray-600 dark:text-gray-400 block">
                GET /top?limit=5
              </code>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Live Sports Scores</h4>
              <code className="text-xs text-gray-600 dark:text-gray-400 block">
                GET /scores?league=nba
              </code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
