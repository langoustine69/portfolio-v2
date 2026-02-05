'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Agent } from '@/data/agents';

interface QuickDemoModalProps {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
}

interface EndpointConfig {
  method: 'GET' | 'POST';
  path: string;
  description: string;
  params?: { name: string; type: string; required: boolean; description: string; default?: string }[];
}

// Quick endpoints based on category
const getQuickEndpoints = (agent: Agent): EndpointConfig[] => {
  const baseEndpoints: EndpointConfig[] = [
    { method: 'GET', path: '/', description: 'Health check' },
    { method: 'GET', path: '/.well-known/agent.json', description: 'Agent manifest' },
  ];
  
  switch (agent.category) {
    case 'Finance':
      return [
        ...baseEndpoints,
        { method: 'GET', path: '/rates', description: 'Exchange rates', params: [
          { name: 'base', type: 'string', required: false, description: 'Base currency', default: 'USD' },
        ]},
      ];
    case 'Gaming':
      return [
        ...baseEndpoints,
        { method: 'GET', path: '/top', description: 'Top games', params: [
          { name: 'limit', type: 'number', required: false, description: 'Limit', default: '5' },
        ]},
      ];
    case 'Sports':
      return [
        ...baseEndpoints,
        { method: 'GET', path: '/scores', description: 'Live scores' },
      ];
    case 'Weather':
      return [
        ...baseEndpoints,
        { method: 'GET', path: '/current', description: 'Current weather', params: [
          { name: 'city', type: 'string', required: true, description: 'City', default: 'Sydney' },
        ]},
      ];
    case 'Crypto':
      return [
        ...baseEndpoints,
        { method: 'GET', path: '/price', description: 'Token price', params: [
          { name: 'symbol', type: 'string', required: false, description: 'Symbol', default: 'BTC' },
        ]},
      ];
    default:
      return baseEndpoints;
  }
};

export default function QuickDemoModal({ agent, isOpen, onClose }: QuickDemoModalProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointConfig | null>(null);
  const [params, setParams] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const endpoints = getQuickEndpoints(agent);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedEndpoint(endpoints[0] || null);
      setParams({});
      setResponse('');
      setError(null);
      setResponseTime(null);
      
      // Initialize default params
      if (endpoints[0]?.params) {
        const defaults: Record<string, string> = {};
        endpoints[0].params.forEach(p => {
          if (p.default) defaults[p.name] = p.default;
        });
        setParams(defaults);
      }
    }
  }, [isOpen, agent.id]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  const handleEndpointChange = (path: string) => {
    const endpoint = endpoints.find(e => e.path === path) || null;
    setSelectedEndpoint(endpoint);
    setResponse('');
    setError(null);
    setResponseTime(null);
    
    // Set default params
    const defaults: Record<string, string> = {};
    endpoint?.params?.forEach(p => {
      if (p.default) defaults[p.name] = p.default;
    });
    setParams(defaults);
  };

  const buildUrl = useCallback(() => {
    if (!agent.railwayUrl || !selectedEndpoint) return '';
    
    const url = new URL(selectedEndpoint.path, agent.railwayUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
    return url.toString();
  }, [agent.railwayUrl, selectedEndpoint, params]);

  const executeRequest = async () => {
    if (!selectedEndpoint || !agent.railwayUrl) return;

    setLoading(true);
    setError(null);
    setResponse('');
    setResponseTime(null);

    const startTime = performance.now();

    try {
      const url = buildUrl();
      const res = await fetch(url, {
        method: selectedEndpoint.method,
        headers: { 'Accept': 'application/json' },
      });

      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));

      const text = await res.text();
      
      try {
        const json = JSON.parse(text);
        setResponse(JSON.stringify(json, null, 2));
      } catch {
        setResponse(text);
      }

      if (!res.ok) {
        setError(`HTTP ${res.status}: ${res.statusText}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
      setResponseTime(null);
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = async () => {
    if (response) {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyCurl = async () => {
    const url = buildUrl();
    const curl = `curl -X ${selectedEndpoint?.method || 'GET'} "${url}"`;
    await navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-demo-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-black border-3 border-black dark:border-white overflow-hidden flex flex-col"
        style={{ boxShadow: '8px 8px 0px 0px #000000' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-3 border-black dark:border-white bg-brutal-yellow">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{agent.icon}</span>
            <div>
              <h2 id="quick-demo-title" className="text-lg font-black uppercase text-black">
                Quick Demo: {agent.name}
              </h2>
              <p className="text-sm font-bold text-black/70">Test API endpoints instantly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white border-2 border-black hover:bg-lobster-100 transition-colors"
            aria-label="Close modal"
            style={{ boxShadow: '2px 2px 0px 0px #000000' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Endpoint selector */}
          <div>
            <label className="block text-sm font-black uppercase mb-2 text-black dark:text-white">
              Endpoint
            </label>
            <div className="flex flex-wrap gap-2">
              {endpoints.map((ep) => (
                <button
                  key={ep.path}
                  onClick={() => handleEndpointChange(ep.path)}
                  className={`px-3 py-2 text-sm font-bold uppercase border-2 border-black transition-all ${
                    selectedEndpoint?.path === ep.path
                      ? 'bg-lobster-500 text-white -translate-x-0.5 -translate-y-0.5'
                      : 'bg-white dark:bg-shell-900 text-black dark:text-white hover:bg-shell-100 dark:hover:bg-shell-800'
                  }`}
                  style={{ 
                    boxShadow: selectedEndpoint?.path === ep.path 
                      ? '4px 4px 0px 0px #000000' 
                      : '2px 2px 0px 0px #000000' 
                  }}
                >
                  <span className={`mr-1 ${ep.method === 'POST' ? 'text-brutal-orange' : 'text-brutal-cyan'}`}>
                    {ep.method}
                  </span>
                  {ep.path}
                </button>
              ))}
            </div>
            {selectedEndpoint && (
              <p className="text-sm text-shell-600 dark:text-shell-400 mt-2 font-medium">
                {selectedEndpoint.description}
              </p>
            )}
          </div>

          {/* Parameters */}
          {selectedEndpoint?.params && selectedEndpoint.params.length > 0 && (
            <div>
              <label className="block text-sm font-black uppercase mb-2 text-black dark:text-white">
                Parameters
              </label>
              <div className="grid gap-3">
                {selectedEndpoint.params.map((param) => (
                  <div key={param.name} className="flex items-center gap-3">
                    <label className="min-w-[80px] text-sm font-bold text-black dark:text-white">
                      {param.name}
                      {param.required && <span className="text-lobster-500 ml-1">*</span>}
                    </label>
                    <input
                      type={param.type === 'number' ? 'number' : 'text'}
                      value={params[param.name] || ''}
                      onChange={(e) => setParams(prev => ({ ...prev, [param.name]: e.target.value }))}
                      placeholder={param.description}
                      className="flex-1 px-3 py-2 text-sm font-mono bg-white dark:bg-shell-900 border-2 border-black dark:border-white text-black dark:text-white placeholder-shell-500 focus:outline-none focus:ring-2 focus:ring-lobster-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* URL preview */}
          <div>
            <label className="block text-sm font-black uppercase mb-2 text-black dark:text-white">
              Request URL
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 text-xs font-mono bg-shell-100 dark:bg-shell-900 border-2 border-black dark:border-white text-black dark:text-white overflow-x-auto whitespace-nowrap">
                {buildUrl() || 'Select an endpoint'}
              </code>
              <button
                onClick={copyCurl}
                className="px-3 py-2 text-xs font-bold uppercase bg-brutal-cyan text-black border-2 border-black hover:bg-cyan-400 transition-colors whitespace-nowrap"
                style={{ boxShadow: '2px 2px 0px 0px #000000' }}
                title="Copy as cURL"
              >
                cURL
              </button>
            </div>
          </div>

          {/* Execute button */}
          <button
            onClick={executeRequest}
            disabled={loading || !selectedEndpoint || !agent.railwayUrl}
            className={`w-full py-3 text-base font-black uppercase border-3 border-black transition-all ${
              loading
                ? 'bg-shell-300 text-shell-600 cursor-wait'
                : 'bg-lobster-500 text-white hover:bg-lobster-600 hover:-translate-y-0.5'
            }`}
            style={{ boxShadow: loading ? 'none' : '4px 4px 0px 0px #000000' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sending...
              </span>
            ) : (
              '🦞 Execute Request'
            )}
          </button>

          {/* Response */}
          {(response || error) && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-black uppercase text-black dark:text-white">
                  Response
                  {responseTime !== null && (
                    <span className={`ml-2 font-mono text-xs ${
                      responseTime < 200 ? 'text-green-600' : 
                      responseTime < 500 ? 'text-brutal-orange' : 'text-lobster-500'
                    }`}>
                      {responseTime}ms
                    </span>
                  )}
                </label>
                {response && (
                  <button
                    onClick={copyResponse}
                    className="px-2 py-1 text-xs font-bold uppercase bg-brutal-lime text-black border-2 border-black hover:bg-green-400 transition-colors"
                    style={{ boxShadow: '2px 2px 0px 0px #000000' }}
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                )}
              </div>
              {error && (
                <div className="px-3 py-2 mb-2 bg-lobster-100 border-2 border-lobster-500 text-lobster-700 text-sm font-bold">
                  ⚠️ {error}
                </div>
              )}
              <pre className="p-4 text-xs font-mono bg-shell-900 text-brutal-lime border-2 border-black overflow-auto max-h-64 whitespace-pre-wrap break-words">
                {response || 'No response'}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t-3 border-black dark:border-white bg-shell-100 dark:bg-shell-900">
          <p className="text-xs text-center text-shell-600 dark:text-shell-400 font-medium">
            Full playground available on the{' '}
            <a href={`/agents/${agent.id}`} className="text-lobster-500 hover:underline font-bold">
              agent page
            </a>
            {' '}• Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-black border border-black dark:border-white text-xs font-mono">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}
