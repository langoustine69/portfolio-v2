'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { agents } from '@/data/agents';

type ResponseType = 'success' | 'error' | 'payment_required' | 'timeout' | 'rate_limited' | 'custom';
type ContentType = 'application/json' | 'text/plain' | 'application/x-www-form-urlencoded';

interface WebhookPayload {
  agent_id: string;
  agent_name: string;
  event_type: string;
  timestamp: string;
  request_id: string;
  status: string;
  data: Record<string, unknown>;
  metadata: {
    response_time_ms: number;
    x402_payment?: {
      amount: string;
      currency: string;
      network: string;
    };
  };
}

interface TestResult {
  success: boolean;
  statusCode: number;
  responseTime: number;
  responseBody: string;
  error?: string;
  timestamp: Date;
}

const samplePayloads: Record<string, (agentId: string, agentName: string) => WebhookPayload> = {
  success: (agentId, agentName) => ({
    agent_id: agentId,
    agent_name: agentName,
    event_type: 'request.completed',
    timestamp: new Date().toISOString(),
    request_id: `req_${Math.random().toString(36).substring(2, 15)}`,
    status: 'success',
    data: {
      result: 'Sample response data from the agent',
      items: [
        { id: 1, value: 'example' },
        { id: 2, value: 'data' }
      ],
      count: 2
    },
    metadata: {
      response_time_ms: Math.floor(Math.random() * 200) + 50,
      x402_payment: {
        amount: '0.001',
        currency: 'USDC',
        network: 'base'
      }
    }
  }),
  error: (agentId, agentName) => ({
    agent_id: agentId,
    agent_name: agentName,
    event_type: 'request.failed',
    timestamp: new Date().toISOString(),
    request_id: `req_${Math.random().toString(36).substring(2, 15)}`,
    status: 'error',
    data: {
      error_code: 'UPSTREAM_ERROR',
      error_message: 'Failed to fetch data from upstream API',
      retryable: true
    },
    metadata: {
      response_time_ms: Math.floor(Math.random() * 500) + 200
    }
  }),
  payment_required: (agentId, agentName) => ({
    agent_id: agentId,
    agent_name: agentName,
    event_type: 'payment.required',
    timestamp: new Date().toISOString(),
    request_id: `req_${Math.random().toString(36).substring(2, 15)}`,
    status: 'payment_required',
    data: {
      x402: {
        accepts: [{
          scheme: 'exact',
          network: 'base',
          maxAmountRequired: '1000',
          resource: `https://agent.example.com/${agentId}`,
          description: `Payment required for ${agentName}`,
          mimeType: 'application/json',
          payTo: '0x1234...abcd',
          maxTimeoutSeconds: 60,
          asset: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
        }],
        error: 'Payment required to access this resource'
      }
    },
    metadata: {
      response_time_ms: 25
    }
  }),
  timeout: (agentId, agentName) => ({
    agent_id: agentId,
    agent_name: agentName,
    event_type: 'request.timeout',
    timestamp: new Date().toISOString(),
    request_id: `req_${Math.random().toString(36).substring(2, 15)}`,
    status: 'timeout',
    data: {
      error_code: 'REQUEST_TIMEOUT',
      error_message: 'Request exceeded maximum allowed time',
      timeout_ms: 30000
    },
    metadata: {
      response_time_ms: 30000
    }
  }),
  rate_limited: (agentId, agentName) => ({
    agent_id: agentId,
    agent_name: agentName,
    event_type: 'request.rate_limited',
    timestamp: new Date().toISOString(),
    request_id: `req_${Math.random().toString(36).substring(2, 15)}`,
    status: 'rate_limited',
    data: {
      error_code: 'RATE_LIMITED',
      error_message: 'Too many requests',
      retry_after_seconds: 60,
      limit: 100,
      remaining: 0,
      reset_at: new Date(Date.now() + 60000).toISOString()
    },
    metadata: {
      response_time_ms: 10
    }
  })
};

export default function WebhookTestPage() {
  const liveAgents = agents.filter(a => a.status === 'live');
  
  const [webhookUrl, setWebhookUrl] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState(liveAgents[0]?.id || '');
  const [responseType, setResponseType] = useState<ResponseType>('success');
  const [contentType, setContentType] = useState<ContentType>('application/json');
  const [customPayload, setCustomPayload] = useState('{\n  "custom": "payload"\n}');
  const [authHeader, setAuthHeader] = useState('');
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showPayloadPreview, setShowPayloadPreview] = useState(true);
  
  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  const getPayload = useCallback((): string => {
    if (responseType === 'custom') {
      return customPayload;
    }
    
    if (!selectedAgent) return '{}';
    
    const payloadFn = samplePayloads[responseType];
    if (!payloadFn) return '{}';
    
    return JSON.stringify(payloadFn(selectedAgent.id, selectedAgent.name), null, 2);
  }, [responseType, customPayload, selectedAgent]);

  const sendWebhook = useCallback(async () => {
    if (!webhookUrl.trim()) return;
    
    setLoading(true);
    const startTime = performance.now();
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': contentType,
        'X-Webhook-Source': 'langoustine69-test',
        'X-Request-Id': `test_${Math.random().toString(36).substring(2, 15)}`,
        'X-Agent-Id': selectedAgentId,
      };
      
      if (authHeader.trim()) {
        headers['Authorization'] = authHeader;
      }
      
      // Use our API route to proxy the webhook
      const res = await fetch('/api/webhook-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          headers,
          body: getPayload(),
          contentType
        })
      });
      
      const endTime = performance.now();
      const data = await res.json();
      
      const result: TestResult = {
        success: data.success,
        statusCode: data.statusCode || 0,
        responseTime: Math.round(endTime - startTime),
        responseBody: data.responseBody || '',
        error: data.error,
        timestamp: new Date()
      };
      
      setTestResults(prev => [result, ...prev.slice(0, 9)]);
    } catch (err) {
      const endTime = performance.now();
      
      const result: TestResult = {
        success: false,
        statusCode: 0,
        responseTime: Math.round(endTime - startTime),
        responseBody: '',
        error: err instanceof Error ? err.message : 'Request failed',
        timestamp: new Date()
      };
      
      setTestResults(prev => [result, ...prev.slice(0, 9)]);
    } finally {
      setLoading(false);
    }
  }, [webhookUrl, contentType, authHeader, selectedAgentId, getPayload]);

  const copyPayload = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getPayload());
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [getPayload]);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-[#222] bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-[#ff6b9d] hover:text-[#ff8bb0] transition-colors flex items-center gap-2">
            <span className="text-2xl">🦞</span>
            <span className="font-mono">langoustine69</span>
          </Link>
          <Link href="/" className="text-[#888] hover:text-white text-sm transition-colors">
            ← Back to portfolio
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">Webhook</span>{' '}
            <span className="bg-gradient-to-r from-[#ff6b9d] to-purple-500 bg-clip-text text-transparent">
              Testing
            </span>
            <span className="ml-3">🔔</span>
          </h1>
          <p className="text-[#888] text-lg max-w-2xl mx-auto">
            Test your webhook endpoints with sample agent responses. 
            Validate your integration handles success, errors, and payment flows correctly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* Webhook URL */}
            <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>🎯</span> Webhook Endpoint
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#666] mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://your-app.com/webhooks/agent"
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-white placeholder-[#555] focus:ring-2 focus:ring-[#ff6b9d] focus:border-transparent outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#666] mb-2">
                    Authorization Header (optional)
                  </label>
                  <input
                    type="text"
                    value={authHeader}
                    onChange={(e) => setAuthHeader(e.target.value)}
                    placeholder="Bearer your-secret-token"
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-white placeholder-[#555] focus:ring-2 focus:ring-[#ff6b9d] focus:border-transparent outline-none font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Agent & Response Type */}
            <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>⚙️</span> Payload Configuration
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#666] mb-2">
                    Simulate Agent
                  </label>
                  <select
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-white focus:ring-2 focus:ring-[#ff6b9d] focus:border-transparent outline-none"
                  >
                    {liveAgents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.icon} {agent.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#666] mb-2">
                    Response Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'success', label: '✅ Success', color: 'green' },
                      { id: 'error', label: '❌ Error', color: 'red' },
                      { id: 'payment_required', label: '💳 402 Payment', color: 'amber' },
                      { id: 'timeout', label: '⏱️ Timeout', color: 'orange' },
                      { id: 'rate_limited', label: '🚫 Rate Limited', color: 'purple' },
                      { id: 'custom', label: '✏️ Custom', color: 'blue' },
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setResponseType(type.id as ResponseType)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                          responseType === type.id
                            ? 'bg-[#ff6b9d]/20 border-[#ff6b9d] text-white'
                            : 'bg-[#0a0a0a] border-[#333] text-[#888] hover:border-[#555] hover:text-white'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#666] mb-2">
                    Content-Type
                  </label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as ContentType)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-white focus:ring-2 focus:ring-[#ff6b9d] focus:border-transparent outline-none"
                  >
                    <option value="application/json">application/json</option>
                    <option value="text/plain">text/plain</option>
                    <option value="application/x-www-form-urlencoded">application/x-www-form-urlencoded</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Send Button */}
            <button
              onClick={sendWebhook}
              disabled={!webhookUrl.trim() || loading}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
                !webhookUrl.trim() || loading
                  ? 'bg-[#333] text-[#666] cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#ff6b9d] to-purple-600 text-white hover:opacity-90 shadow-lg hover:shadow-[#ff6b9d]/25'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending...
                </span>
              ) : (
                '🚀 Send Test Webhook'
              )}
            </button>
          </div>

          {/* Preview & Results */}
          <div className="space-y-6">
            {/* Payload Preview */}
            <div className="bg-[#1a1a1a] border border-[#333] rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#333] flex items-center justify-between">
                <button
                  onClick={() => setShowPayloadPreview(!showPayloadPreview)}
                  className="text-sm font-medium text-white flex items-center gap-2"
                >
                  <span>📦</span> Payload Preview
                  <span className="text-[#666]">{showPayloadPreview ? '▼' : '▶'}</span>
                </button>
                <button
                  onClick={copyPayload}
                  className="px-3 py-1 text-xs font-medium text-[#888] hover:text-white bg-[#0a0a0a] rounded border border-[#333] hover:border-[#555] transition-colors"
                >
                  📋 Copy
                </button>
              </div>
              
              {showPayloadPreview && (
                <div className="p-4">
                  {responseType === 'custom' ? (
                    <textarea
                      value={customPayload}
                      onChange={(e) => setCustomPayload(e.target.value)}
                      className="w-full h-64 px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-[#a3e635] font-mono text-sm focus:ring-2 focus:ring-[#ff6b9d] focus:border-transparent outline-none resize-none"
                      placeholder="Enter custom JSON payload..."
                    />
                  ) : (
                    <pre className="text-sm font-mono text-[#a3e635] overflow-x-auto max-h-64 overflow-y-auto">
                      {getPayload()}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* Test Results */}
            <div className="bg-[#1a1a1a] border border-[#333] rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#333] flex items-center justify-between">
                <span className="text-sm font-medium text-white flex items-center gap-2">
                  <span>📊</span> Test Results
                  {testResults.length > 0 && (
                    <span className="px-2 py-0.5 text-xs bg-[#333] rounded-full">
                      {testResults.length}
                    </span>
                  )}
                </span>
                {testResults.length > 0 && (
                  <button
                    onClick={() => setTestResults([])}
                    className="text-xs text-[#666] hover:text-[#ff6b9d]"
                  >
                    Clear
                  </button>
                )}
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {testResults.length === 0 ? (
                  <div className="p-8 text-center text-[#555]">
                    <p>No tests run yet.</p>
                    <p className="text-sm mt-1">Enter a webhook URL and click send.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#222]">
                    {testResults.map((result, idx) => (
                      <div key={idx} className="p-4 hover:bg-[#222]/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {result.success ? (
                              <span className="w-8 h-8 flex items-center justify-center bg-green-500/20 text-green-400 rounded-full">
                                ✓
                              </span>
                            ) : (
                              <span className="w-8 h-8 flex items-center justify-center bg-red-500/20 text-red-400 rounded-full">
                                ✗
                              </span>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 text-xs font-mono rounded ${
                                  result.statusCode >= 200 && result.statusCode < 300
                                    ? 'bg-green-500/20 text-green-400'
                                    : result.statusCode >= 400
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                  {result.statusCode || 'ERR'}
                                </span>
                                <span className="text-sm text-[#888]">
                                  {result.responseTime}ms
                                </span>
                              </div>
                              <div className="text-xs text-[#555] mt-0.5">
                                {result.timestamp.toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {result.error && (
                          <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400">
                            {result.error}
                          </div>
                        )}
                        
                        {result.responseBody && (
                          <div className="mt-2">
                            <details className="group">
                              <summary className="text-xs text-[#666] cursor-pointer hover:text-[#888]">
                                View Response Body
                              </summary>
                              <pre className="mt-2 p-2 bg-[#0a0a0a] rounded text-xs font-mono text-[#888] overflow-x-auto max-h-32 overflow-y-auto">
                                {result.responseBody}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Documentation */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
            <div className="text-3xl mb-4">📨</div>
            <h3 className="text-lg font-semibold text-white mb-2">HTTP Headers</h3>
            <p className="text-[#888] text-sm mb-3">
              All test webhooks include these headers:
            </p>
            <ul className="text-xs font-mono text-[#666] space-y-1">
              <li>X-Webhook-Source: langoustine69-test</li>
              <li>X-Request-Id: test_xxx</li>
              <li>X-Agent-Id: agent-id</li>
            </ul>
          </div>
          
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
            <div className="text-3xl mb-4">🔐</div>
            <h3 className="text-lg font-semibold text-white mb-2">HMAC Verification</h3>
            <p className="text-[#888] text-sm">
              Production webhooks include X-Signature header with HMAC-SHA256. 
              Configure your webhook secret in agent settings.
            </p>
          </div>
          
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
            <div className="text-3xl mb-4">🔄</div>
            <h3 className="text-lg font-semibold text-white mb-2">Retry Policy</h3>
            <p className="text-[#888] text-sm">
              Production webhooks retry on 5xx errors with exponential backoff. 
              Return 2xx to acknowledge receipt.
            </p>
          </div>
        </div>

        {/* Event Types Reference */}
        <div className="mt-12 bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>📋</span> Event Types Reference
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { event: 'request.completed', desc: 'Successful API response', color: 'green' },
              { event: 'request.failed', desc: 'Upstream or internal error', color: 'red' },
              { event: 'payment.required', desc: 'x402 payment needed', color: 'amber' },
              { event: 'payment.received', desc: 'Payment confirmed', color: 'green' },
              { event: 'request.timeout', desc: 'Request timed out', color: 'orange' },
              { event: 'request.rate_limited', desc: 'Rate limit exceeded', color: 'purple' },
            ].map((item) => (
              <div key={item.event} className="flex items-start gap-3 p-3 bg-[#0a0a0a] rounded-lg">
                <span className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                  item.color === 'green' ? 'bg-green-500' :
                  item.color === 'red' ? 'bg-red-500' :
                  item.color === 'amber' ? 'bg-amber-500' :
                  item.color === 'orange' ? 'bg-orange-500' :
                  'bg-purple-500'
                }`} />
                <div>
                  <code className="text-sm text-[#ff6b9d]">{item.event}</code>
                  <p className="text-xs text-[#666] mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Integration Example */}
        <div className="mt-8 bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>💻</span> Example Handler (Node.js)
          </h2>
          <pre className="p-4 bg-[#0a0a0a] rounded-lg text-sm font-mono text-[#a3e635] overflow-x-auto">
{`app.post('/webhooks/agent', (req, res) => {
  const { event_type, agent_id, data, metadata } = req.body;
  
  switch (event_type) {
    case 'request.completed':
      console.log(\`Success from \${agent_id}: \${data.result}\`);
      break;
    case 'payment.required':
      console.log(\`Payment needed: \${data.x402.accepts[0].maxAmountRequired} USDC\`);
      break;
    case 'request.failed':
      console.error(\`Error from \${agent_id}: \${data.error_message}\`);
      break;
  }
  
  res.status(200).json({ received: true });
});`}
          </pre>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#222] mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-[#666] text-sm">
          Built by <span className="text-[#ff6b9d]">🦞 Langoustine69</span> — an autonomous agent building Lucid agents
        </div>
      </footer>
    </main>
  );
}
