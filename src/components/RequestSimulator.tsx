'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { agents, Agent } from '@/data/agents';

interface RequestParam {
  key: string;
  value: string;
  type: 'query' | 'header' | 'body';
  required?: boolean;
  description?: string;
}

interface EndpointConfig {
  id: string;
  name: string;
  method: 'GET' | 'POST';
  path: string;
  params: RequestParam[];
  description: string;
}

// Sample endpoint configs for demonstration
const endpointConfigs: Record<string, EndpointConfig[]> = {
  'crypto-price-agent': [
    {
      id: 'btc-price',
      name: 'Get BTC Price',
      method: 'GET',
      path: '/price/btc',
      description: 'Get current Bitcoin price in USD',
      params: [],
    },
    {
      id: 'multi-price',
      name: 'Multi-Coin Prices',
      method: 'GET',
      path: '/prices',
      description: 'Get prices for multiple coins',
      params: [
        { key: 'coins', value: 'bitcoin,ethereum', type: 'query', required: true, description: 'Comma-separated coin IDs' },
        { key: 'currency', value: 'usd', type: 'query', description: 'Target currency (default: usd)' },
      ],
    },
    {
      id: 'tvl',
      name: 'DeFi TVL',
      method: 'GET',
      path: '/defi/tvl',
      description: 'Get total DeFi TVL across chains',
      params: [
        { key: 'chain', value: '', type: 'query', description: 'Filter by chain (optional)' },
      ],
    },
  ],
  'weather-intel-agent': [
    {
      id: 'current',
      name: 'Current Weather',
      method: 'GET',
      path: '/weather/current',
      description: 'Get current weather conditions',
      params: [
        { key: 'lat', value: '-33.87', type: 'query', required: true, description: 'Latitude' },
        { key: 'lon', value: '151.21', type: 'query', required: true, description: 'Longitude' },
      ],
    },
    {
      id: 'forecast',
      name: 'Weather Forecast',
      method: 'GET',
      path: '/weather/forecast',
      description: 'Get multi-day weather forecast',
      params: [
        { key: 'lat', value: '-33.87', type: 'query', required: true, description: 'Latitude' },
        { key: 'lon', value: '151.21', type: 'query', required: true, description: 'Longitude' },
        { key: 'days', value: '7', type: 'query', description: 'Number of forecast days (1-14)' },
      ],
    },
  ],
  'word-intel': [
    {
      id: 'define',
      name: 'Word Definition',
      method: 'GET',
      path: '/word/define',
      description: 'Get word definitions and meanings',
      params: [
        { key: 'word', value: 'serendipity', type: 'query', required: true, description: 'Word to define' },
      ],
    },
    {
      id: 'synonyms',
      name: 'Synonyms',
      method: 'GET',
      path: '/word/synonyms',
      description: 'Get synonyms for a word',
      params: [
        { key: 'word', value: 'happy', type: 'query', required: true, description: 'Word to find synonyms for' },
        { key: 'limit', value: '10', type: 'query', description: 'Max results (default: 10)' },
      ],
    },
  ],
  'natural-events-intel': [
    {
      id: 'active',
      name: 'Active Events',
      method: 'GET',
      path: '/events/active',
      description: 'Get currently active natural events',
      params: [
        { key: 'category', value: '', type: 'query', description: 'Filter by category (wildfires, storms, etc.)' },
        { key: 'limit', value: '20', type: 'query', description: 'Max results' },
      ],
    },
    {
      id: 'nearby',
      name: 'Nearby Events',
      method: 'GET',
      path: '/events/nearby',
      description: 'Get natural events near a location',
      params: [
        { key: 'lat', value: '37.77', type: 'query', required: true, description: 'Latitude' },
        { key: 'lon', value: '-122.42', type: 'query', required: true, description: 'Longitude' },
        { key: 'radius', value: '500', type: 'query', description: 'Radius in km (default: 500)' },
      ],
    },
  ],
};

// Generic endpoints for agents without specific config
const genericEndpoints: EndpointConfig[] = [
  {
    id: 'health',
    name: 'Health Check',
    method: 'GET',
    path: '/health',
    description: 'Check if the agent is running',
    params: [],
  },
  {
    id: 'info',
    name: 'Agent Info',
    method: 'GET',
    path: '/info',
    description: 'Get agent metadata and capabilities',
    params: [],
  },
];

type CodeLanguage = 'curl' | 'javascript' | 'python' | 'go' | 'rust';

export function RequestSimulator() {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('crypto-price-agent');
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>('btc-price');
  const [params, setParams] = useState<Record<string, string>>({});
  const [headers, setHeaders] = useState<Record<string, string>>({});
  const [codeLanguage, setCodeLanguage] = useState<CodeLanguage>('curl');
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(1);

  const liveAgents = agents.filter(a => a.status === 'live');
  
  const selectedAgent = useMemo(() => 
    liveAgents.find(a => a.id === selectedAgentId),
    [selectedAgentId, liveAgents]
  );

  const endpoints = useMemo(() => 
    endpointConfigs[selectedAgentId] || genericEndpoints,
    [selectedAgentId]
  );

  const selectedEndpoint = useMemo(() => 
    endpoints.find(e => e.id === selectedEndpointId) || endpoints[0],
    [endpoints, selectedEndpointId]
  );

  // Build the full URL with query params
  const buildUrl = () => {
    if (!selectedAgent?.railwayUrl || !selectedEndpoint) return '';
    
    const baseUrl = selectedAgent.railwayUrl + selectedEndpoint.path;
    const queryParams = selectedEndpoint.params
      .filter(p => p.type === 'query')
      .map(p => {
        const value = params[p.key] ?? p.value;
        return value ? `${p.key}=${encodeURIComponent(value)}` : null;
      })
      .filter(Boolean)
      .join('&');
    
    return queryParams ? `${baseUrl}?${queryParams}` : baseUrl;
  };

  // Generate code snippets
  const generateCode = (lang: CodeLanguage): string => {
    const url = buildUrl();
    const method = selectedEndpoint?.method || 'GET';
    const headerEntries = Object.entries(headers).filter(([_, v]) => v);

    switch (lang) {
      case 'curl':
        let curlCmd = `curl -X ${method} "${url}"`;
        headerEntries.forEach(([k, v]) => {
          curlCmd += ` \\\n  -H "${k}: ${v}"`;
        });
        return curlCmd;

      case 'javascript':
        return `// Using fetch
const response = await fetch("${url}", {
  method: "${method}",
  headers: {
    ${headerEntries.map(([k, v]) => `"${k}": "${v}"`).join(',\n    ')}${headerEntries.length ? '' : '// Add headers if needed'}
  }
});

const data = await response.json();
console.log(data);`;

      case 'python':
        return `import requests

url = "${url}"
headers = {
    ${headerEntries.map(([k, v]) => `"${k}": "${v}"`).join(',\n    ')}${headerEntries.length ? '' : '# Add headers if needed'}
}

response = requests.${method.toLowerCase()}(url, headers=headers)
data = response.json()
print(data)`;

      case 'go':
        return `package main

import (
    "fmt"
    "io"
    "net/http"
)

func main() {
    req, _ := http.NewRequest("${method}", "${url}", nil)
    ${headerEntries.map(([k, v]) => `req.Header.Add("${k}", "${v}")`).join('\n    ')}
    
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()
    
    body, _ := io.ReadAll(resp.Body)
    fmt.Println(string(body))
}`;

      case 'rust':
        return `use reqwest;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    let response = client
        .${method.toLowerCase()}("${url}")
        ${headerEntries.map(([k, v]) => `.header("${k}", "${v}")`).join('\n        ')}
        .send()
        .await?;
    
    let body = response.text().await?;
    println!("{}", body);
    Ok(())
}`;

      default:
        return '';
    }
  };

  const code = generateCode(codeLanguage);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAgentChange = (agentId: string) => {
    setSelectedAgentId(agentId);
    const newEndpoints = endpointConfigs[agentId] || genericEndpoints;
    setSelectedEndpointId(newEndpoints[0]?.id || 'health');
    setParams({});
  };

  const handleEndpointChange = (endpointId: string) => {
    setSelectedEndpointId(endpointId);
    setParams({});
  };

  const languages: { id: CodeLanguage; label: string; icon: string }[] = [
    { id: 'curl', label: 'cURL', icon: '🔧' },
    { id: 'javascript', label: 'JavaScript', icon: '🟨' },
    { id: 'python', label: 'Python', icon: '🐍' },
    { id: 'go', label: 'Go', icon: '🔵' },
    { id: 'rust', label: 'Rust', icon: '🦀' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              step === s
                ? 'bg-amber-500 text-zinc-900 font-medium'
                : step > s
                ? 'bg-green-500/20 text-green-400'
                : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-sm border border-current">
              {step > s ? '✓' : s}
            </span>
            <span className="hidden sm:inline">
              {s === 1 ? 'Select Agent' : s === 2 ? 'Configure' : 'Export'}
            </span>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Panel - Configuration */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {step >= 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900 rounded-xl p-6 border border-zinc-800"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-zinc-900 text-sm flex items-center justify-center">1</span>
                  Select Agent
                </h3>
                
                <select
                  value={selectedAgentId}
                  onChange={(e) => handleAgentChange(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  {liveAgents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.icon} {agent.name} - {agent.category}
                    </option>
                  ))}
                </select>

                {selectedAgent && (
                  <div className="mt-4 p-4 bg-zinc-800/50 rounded-lg">
                    <p className="text-zinc-400 text-sm">{selectedAgent.description}</p>
                    <div className="flex gap-2 mt-3">
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                        ● Live
                      </span>
                      <span className="px-2 py-1 bg-zinc-700 text-zinc-400 text-xs rounded-full">
                        {selectedAgent.category}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setStep(2)}
                  className="mt-4 w-full py-2 bg-amber-500 text-zinc-900 font-medium rounded-lg hover:bg-amber-400 transition-colors"
                >
                  Next: Configure Endpoint →
                </button>
              </motion.div>
            )}

            {step >= 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900 rounded-xl p-6 border border-zinc-800"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-zinc-900 text-sm flex items-center justify-center">2</span>
                  Configure Request
                </h3>

                {/* Endpoint Selection */}
                <div className="mb-6">
                  <label className="block text-sm text-zinc-400 mb-2">Endpoint</label>
                  <div className="flex flex-wrap gap-2">
                    {endpoints.map((ep) => (
                      <button
                        key={ep.id}
                        onClick={() => handleEndpointChange(ep.id)}
                        className={`px-3 py-2 rounded-lg text-sm transition-all ${
                          selectedEndpointId === ep.id
                            ? 'bg-amber-500 text-zinc-900 font-medium'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        }`}
                      >
                        <span className={`inline-block px-1.5 py-0.5 rounded text-xs mr-2 ${
                          ep.method === 'GET' ? 'bg-green-500/30 text-green-400' : 'bg-blue-500/30 text-blue-400'
                        }`}>
                          {ep.method}
                        </span>
                        {ep.name}
                      </button>
                    ))}
                  </div>
                  {selectedEndpoint && (
                    <p className="text-sm text-zinc-500 mt-2">{selectedEndpoint.description}</p>
                  )}
                </div>

                {/* Parameters */}
                {selectedEndpoint && selectedEndpoint.params.length > 0 && (
                  <div className="space-y-4">
                    <label className="block text-sm text-zinc-400">Parameters</label>
                    {selectedEndpoint.params.map((param) => (
                      <div key={param.key} className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-white">
                            {param.key}
                            {param.required && <span className="text-red-400 ml-1">*</span>}
                          </label>
                          <span className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-500 rounded">
                            {param.type}
                          </span>
                        </div>
                        <input
                          type="text"
                          placeholder={param.value || param.description}
                          value={params[param.key] ?? param.value}
                          onChange={(e) => setParams({ ...params, [param.key]: e.target.value })}
                          className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                        {param.description && (
                          <span className="text-xs text-zinc-500">{param.description}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Custom Headers */}
                <details className="mt-6">
                  <summary className="text-sm text-zinc-400 cursor-pointer hover:text-zinc-300">
                    + Add Custom Headers
                  </summary>
                  <div className="mt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Header name"
                        className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500"
                        onBlur={(e) => {
                          if (e.target.value) {
                            setHeaders({ ...headers, [e.target.value]: '' });
                          }
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500"
                      />
                    </div>
                  </div>
                </details>

                <button
                  onClick={() => setStep(3)}
                  className="mt-6 w-full py-2 bg-amber-500 text-zinc-900 font-medium rounded-lg hover:bg-amber-400 transition-colors"
                >
                  Next: Export Code →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel - Preview & Code */}
        <div className="space-y-6">
          {/* URL Preview */}
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-400 mb-3">Request Preview</h3>
            <div className="flex items-center gap-2 bg-zinc-800 rounded-lg p-3 overflow-x-auto">
              <span className={`shrink-0 px-2 py-1 rounded text-xs font-medium ${
                selectedEndpoint?.method === 'GET' 
                  ? 'bg-green-500/30 text-green-400' 
                  : 'bg-blue-500/30 text-blue-400'
              }`}>
                {selectedEndpoint?.method || 'GET'}
              </span>
              <code className="text-sm text-white whitespace-nowrap">{buildUrl()}</code>
            </div>
          </div>

          {/* Code Export */}
          <motion.div
            initial={step >= 3 ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 rounded-xl p-6 border border-zinc-800"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-zinc-900 text-sm flex items-center justify-center">3</span>
                Export Code
              </h3>
              <button
                onClick={copyCode}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                }`}
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>

            {/* Language Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setCodeLanguage(lang.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    codeLanguage === lang.id
                      ? 'bg-amber-500 text-zinc-900 font-medium'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {lang.icon} {lang.label}
                </button>
              ))}
            </div>

            {/* Code Block */}
            <div className="relative">
              <pre className="bg-zinc-950 rounded-lg p-4 overflow-x-auto text-sm">
                <code className="text-zinc-300">{code}</code>
              </pre>
            </div>
          </motion.div>

          {/* Quick Tips */}
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/20">
            <h4 className="text-amber-400 font-medium text-sm mb-2">💡 Pro Tips</h4>
            <ul className="text-sm text-zinc-400 space-y-1">
              <li>• All agents support x402 micropayments - pay per request</li>
              <li>• Test in the <a href="/api-playground" className="text-amber-400 hover:underline">API Playground</a> first</li>
              <li>• Check <a href="/reliability" className="text-amber-400 hover:underline">rate limits</a> for each agent</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
