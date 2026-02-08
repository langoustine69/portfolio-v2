'use client';

import { useState, useMemo } from 'react';

interface Snippet {
  id: string;
  title: string;
  description: string;
  category: string;
  language: string;
  code: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const snippets: Snippet[] = [
  // Authentication & Setup
  {
    id: 'basic-request-ts',
    title: 'Basic API Request',
    description: 'Simple fetch request to an x402 agent endpoint',
    category: 'Getting Started',
    language: 'typescript',
    difficulty: 'beginner',
    tags: ['fetch', 'basic', 'request'],
    code: `async function callAgent(endpoint: string) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'your query here' })
  });
  
  if (response.status === 402) {
    // Handle payment required
    const paymentInfo = await response.json();
    return { needsPayment: true, ...paymentInfo };
  }
  
  return response.json();
}`,
  },
  {
    id: 'basic-request-python',
    title: 'Basic API Request',
    description: 'Simple requests call to an x402 agent',
    category: 'Getting Started',
    language: 'python',
    difficulty: 'beginner',
    tags: ['requests', 'basic', 'python'],
    code: `import requests

def call_agent(endpoint: str, query: str) -> dict:
    response = requests.post(
        endpoint,
        json={"query": query},
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code == 402:
        # Handle payment required
        return {"needs_payment": True, **response.json()}
    
    return response.json()`,
  },
  {
    id: 'basic-request-curl',
    title: 'Basic API Request',
    description: 'cURL command for quick testing',
    category: 'Getting Started',
    language: 'bash',
    difficulty: 'beginner',
    tags: ['curl', 'bash', 'testing'],
    code: `curl -X POST https://agent.lucid.sh/api/v1/invoke \\
  -H "Content-Type: application/json" \\
  -d '{"query": "your query here"}'`,
  },
  
  // Payment Handling
  {
    id: 'payment-flow-ts',
    title: 'Complete x402 Payment Flow',
    description: 'Handle 402 responses and sign payments with viem',
    category: 'Payments',
    language: 'typescript',
    difficulty: 'intermediate',
    tags: ['payment', 'x402', 'viem', 'wallet'],
    code: `import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

async function payAndRetry(endpoint: string, payload: object) {
  // Initial request
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (response.status !== 402) {
    return response.json();
  }
  
  // Parse payment requirements
  const { x402 } = await response.json();
  
  // Setup wallet
  const account = privateKeyToAccount(process.env.PRIVATE_KEY as \`0x\${string}\`);
  const client = createWalletClient({
    account,
    chain: base,
    transport: http()
  });
  
  // Sign payment message
  const signature = await client.signMessage({
    message: JSON.stringify({
      amount: x402.price,
      recipient: x402.payTo,
      nonce: Date.now()
    })
  });
  
  // Retry with payment
  const paidResponse = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-PAYMENT': signature
    },
    body: JSON.stringify(payload)
  });
  
  return paidResponse.json();
}`,
  },
  {
    id: 'payment-flow-python',
    title: 'Complete x402 Payment Flow',
    description: 'Handle 402 and sign payments with eth-account',
    category: 'Payments',
    language: 'python',
    difficulty: 'intermediate',
    tags: ['payment', 'x402', 'web3', 'python'],
    code: `from eth_account import Account
from eth_account.messages import encode_defunct
import requests
import json
import os
import time

def pay_and_retry(endpoint: str, payload: dict) -> dict:
    # Initial request
    response = requests.post(endpoint, json=payload)
    
    if response.status_code != 402:
        return response.json()
    
    # Parse payment requirements
    x402 = response.json().get("x402", {})
    
    # Sign payment message
    account = Account.from_key(os.environ["PRIVATE_KEY"])
    message = json.dumps({
        "amount": x402["price"],
        "recipient": x402["payTo"],
        "nonce": int(time.time() * 1000)
    })
    signed = account.sign_message(encode_defunct(text=message))
    
    # Retry with payment
    paid_response = requests.post(
        endpoint,
        json=payload,
        headers={"X-PAYMENT": signed.signature.hex()}
    )
    
    return paid_response.json()`,
  },
  
  // Error Handling
  {
    id: 'error-handling-ts',
    title: 'Robust Error Handling',
    description: 'Handle all common API errors gracefully',
    category: 'Error Handling',
    language: 'typescript',
    difficulty: 'intermediate',
    tags: ['errors', 'retry', 'handling'],
    code: `class AgentError extends Error {
  constructor(
    public code: string,
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'AgentError';
  }
}

async function safeCall<T>(endpoint: string, payload: object): Promise<T> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      
      switch (response.status) {
        case 402:
          throw new AgentError('PAYMENT_REQUIRED', 402, 'Payment required');
        case 429:
          const retryAfter = response.headers.get('Retry-After');
          throw new AgentError('RATE_LIMITED', 429, \`Rate limited. Retry after \${retryAfter}s\`);
        case 500:
          throw new AgentError('SERVER_ERROR', 500, error.message || 'Internal server error');
        default:
          throw new AgentError('UNKNOWN', response.status, error.message || 'Request failed');
      }
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof AgentError) throw error;
    throw new AgentError('NETWORK', 0, 'Network error - check your connection');
  }
}`,
  },
  {
    id: 'retry-logic-ts',
    title: 'Exponential Backoff Retry',
    description: 'Automatically retry failed requests with backoff',
    category: 'Error Handling',
    language: 'typescript',
    difficulty: 'intermediate',
    tags: ['retry', 'backoff', 'resilience'],
    code: `async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry payment errors
      if (error instanceof Error && error.message.includes('402')) {
        throw error;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      console.log(\`Attempt \${attempt + 1} failed, retrying in \${delay}ms...\`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  
  throw lastError!;
}

// Usage
const result = await withRetry(() => callAgent('https://...'), 3);`,
  },
  
  // Rate Limiting
  {
    id: 'rate-limiter-ts',
    title: 'Client-Side Rate Limiter',
    description: 'Prevent hitting rate limits with a token bucket',
    category: 'Rate Limiting',
    language: 'typescript',
    difficulty: 'advanced',
    tags: ['rate-limit', 'throttle', 'queue'],
    code: `class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private queue: Array<() => void> = [];
  
  constructor(
    private maxTokens: number = 60,
    private refillRate: number = 1000 // 1 token per second
  ) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }
  
  private refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const newTokens = Math.floor(elapsed / this.refillRate);
    this.tokens = Math.min(this.maxTokens, this.tokens + newTokens);
    this.lastRefill = now;
  }
  
  async acquire(): Promise<void> {
    this.refill();
    
    if (this.tokens > 0) {
      this.tokens--;
      return;
    }
    
    // Wait for next token
    return new Promise(resolve => {
      this.queue.push(resolve);
      setTimeout(() => {
        this.refill();
        const next = this.queue.shift();
        if (next) {
          this.tokens--;
          next();
        }
      }, this.refillRate);
    });
  }
}

// Usage
const limiter = new RateLimiter(60, 1000);
async function rateLimitedCall(endpoint: string) {
  await limiter.acquire();
  return fetch(endpoint);
}`,
  },
  
  // Batch Processing
  {
    id: 'batch-requests-ts',
    title: 'Batch API Requests',
    description: 'Process multiple requests with concurrency control',
    category: 'Batch Processing',
    language: 'typescript',
    difficulty: 'advanced',
    tags: ['batch', 'concurrent', 'parallel'],
    code: `async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency = 5
): Promise<R[]> {
  const results: R[] = [];
  const executing: Promise<void>[] = [];
  
  for (const item of items) {
    const p = processor(item).then(result => {
      results.push(result);
    });
    
    executing.push(p);
    
    if (executing.length >= concurrency) {
      await Promise.race(executing);
      // Remove completed promises
      executing.splice(
        executing.findIndex(e => e === p),
        1
      );
    }
  }
  
  await Promise.all(executing);
  return results;
}

// Usage
const queries = ['query1', 'query2', 'query3', ...];
const results = await batchProcess(
  queries,
  q => callAgent('https://...', q),
  5 // 5 concurrent requests
);`,
  },
  
  // Caching
  {
    id: 'response-cache-ts',
    title: 'Response Cache with TTL',
    description: 'Cache API responses to reduce costs',
    category: 'Caching',
    language: 'typescript',
    difficulty: 'intermediate',
    tags: ['cache', 'ttl', 'performance'],
    code: `class ResponseCache<T> {
  private cache = new Map<string, { data: T; expires: number }>();
  
  constructor(private ttlMs: number = 60000) {}
  
  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + this.ttlMs
    });
  }
  
  async getOrFetch(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.get(key);
    if (cached) return cached;
    
    const data = await fetcher();
    this.set(key, data);
    return data;
  }
}

// Usage
const cache = new ResponseCache<AgentResponse>(5 * 60 * 1000); // 5 min TTL

const result = await cache.getOrFetch(
  \`agent:\${query}\`,
  () => callAgent('https://...', query)
);`,
  },
  
  // Streaming
  {
    id: 'streaming-response-ts',
    title: 'Handle Streaming Responses',
    description: 'Process SSE/streaming responses from agents',
    category: 'Streaming',
    language: 'typescript',
    difficulty: 'advanced',
    tags: ['stream', 'sse', 'realtime'],
    code: `async function* streamAgent(
  endpoint: string,
  payload: object
): AsyncGenerator<string> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream'
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok || !response.body) {
    throw new Error(\`Stream failed: \${response.status}\`);
  }
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\\n');
    buffer = lines.pop() || '';
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data !== '[DONE]') {
          yield data;
        }
      }
    }
  }
}

// Usage
for await (const chunk of streamAgent('https://...', { query: '...' })) {
  const parsed = JSON.parse(chunk);
  console.log(parsed.content);
}`,
  },
  
  // Webhooks
  {
    id: 'webhook-handler-ts',
    title: 'Webhook Handler',
    description: 'Receive and verify agent webhooks',
    category: 'Webhooks',
    language: 'typescript',
    difficulty: 'intermediate',
    tags: ['webhook', 'callback', 'async'],
    code: `import { createHmac } from 'crypto';

function verifyWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === \`sha256=\${expected}\`;
}

// Express handler
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-webhook-signature'] as string;
  const payload = req.body.toString();
  
  if (!verifyWebhook(payload, signature, process.env.WEBHOOK_SECRET!)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  const event = JSON.parse(payload);
  
  switch (event.type) {
    case 'agent.response':
      handleAgentResponse(event.data);
      break;
    case 'payment.completed':
      handlePaymentComplete(event.data);
      break;
  }
  
  res.json({ received: true });
});`,
  },
  
  // Testing
  {
    id: 'mock-agent-ts',
    title: 'Mock Agent for Testing',
    description: 'Create a mock agent for unit tests',
    category: 'Testing',
    language: 'typescript',
    difficulty: 'beginner',
    tags: ['mock', 'test', 'jest'],
    code: `// agent.mock.ts
export const mockAgent = {
  call: jest.fn().mockResolvedValue({
    success: true,
    data: { result: 'mocked response' }
  }),
  
  callWithPayment: jest.fn().mockResolvedValue({
    success: true,
    data: { result: 'paid response' },
    payment: { amount: '0.001', currency: 'USDC' }
  }),
  
  callWith402: jest.fn().mockResolvedValue({
    success: false,
    status: 402,
    x402: { price: '0.001', payTo: '0x...' }
  })
};

// In your test file
import { mockAgent } from './agent.mock';

describe('AgentService', () => {
  it('handles successful response', async () => {
    const result = await mockAgent.call({ query: 'test' });
    expect(result.success).toBe(true);
    expect(result.data.result).toBe('mocked response');
  });
  
  it('handles 402 payment required', async () => {
    const result = await mockAgent.callWith402({ query: 'test' });
    expect(result.status).toBe(402);
    expect(result.x402.price).toBe('0.001');
  });
});`,
  },
  
  // A2A Communication
  {
    id: 'a2a-call-ts',
    title: 'Agent-to-Agent Call',
    description: 'Call another agent from your agent (A2A)',
    category: 'A2A',
    language: 'typescript',
    difficulty: 'advanced',
    tags: ['a2a', 'agent', 'orchestration'],
    code: `import { LucidAgent, a2a } from '@lucid/agents';

const myAgent = new LucidAgent({
  name: 'orchestrator-agent',
  entrypoints: {
    async orchestrate({ input }) {
      // Call crypto-prices agent
      const prices = await a2a.call({
        agent: 'crypto-prices',
        method: 'getPrice',
        params: { symbol: input.symbol }
      });
      
      // Call sentiment agent
      const sentiment = await a2a.call({
        agent: 'crypto-sentiment',
        method: 'analyze',
        params: { symbol: input.symbol }
      });
      
      // Combine results
      return {
        symbol: input.symbol,
        price: prices.data.price,
        sentiment: sentiment.data.score,
        recommendation: prices.data.price > 0 && sentiment.data.score > 0.5
          ? 'bullish'
          : 'bearish'
      };
    }
  }
});`,
  },
  
  // Monitoring
  {
    id: 'usage-tracking-ts',
    title: 'Usage Tracking',
    description: 'Track API calls and costs locally',
    category: 'Monitoring',
    language: 'typescript',
    difficulty: 'intermediate',
    tags: ['tracking', 'usage', 'analytics'],
    code: `interface UsageEntry {
  timestamp: number;
  agent: string;
  endpoint: string;
  cost: number;
  latencyMs: number;
  success: boolean;
}

class UsageTracker {
  private entries: UsageEntry[] = [];
  
  track(entry: Omit<UsageEntry, 'timestamp'>): void {
    this.entries.push({
      ...entry,
      timestamp: Date.now()
    });
    
    // Persist to localStorage or send to backend
    this.persist();
  }
  
  getStats(periodMs: number = 24 * 60 * 60 * 1000) {
    const cutoff = Date.now() - periodMs;
    const recent = this.entries.filter(e => e.timestamp > cutoff);
    
    return {
      totalCalls: recent.length,
      totalCost: recent.reduce((sum, e) => sum + e.cost, 0),
      avgLatency: recent.reduce((sum, e) => sum + e.latencyMs, 0) / recent.length,
      successRate: recent.filter(e => e.success).length / recent.length,
      byAgent: this.groupBy(recent, 'agent')
    };
  }
  
  private groupBy(entries: UsageEntry[], key: keyof UsageEntry) {
    return entries.reduce((acc, entry) => {
      const k = String(entry[key]);
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
  
  private persist() {
    localStorage.setItem('usage', JSON.stringify(this.entries.slice(-1000)));
  }
}`,
  },
  
  // Go snippets
  {
    id: 'basic-request-go',
    title: 'Basic API Request',
    description: 'HTTP request to x402 agent in Go',
    category: 'Getting Started',
    language: 'go',
    difficulty: 'beginner',
    tags: ['go', 'http', 'basic'],
    code: `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

type AgentRequest struct {
    Query string \`json:"query"\`
}

type AgentResponse struct {
    Data   interface{} \`json:"data"\`
    Status int         \`json:"status"\`
}

func CallAgent(endpoint, query string) (*AgentResponse, error) {
    payload := AgentRequest{Query: query}
    body, _ := json.Marshal(payload)
    
    resp, err := http.Post(
        endpoint,
        "application/json",
        bytes.NewBuffer(body),
    )
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    if resp.StatusCode == 402 {
        // Handle payment required
        fmt.Println("Payment required")
    }
    
    var result AgentResponse
    json.NewDecoder(resp.Body).Decode(&result)
    return &result, nil
}`,
  },
  
  // Rust snippets
  {
    id: 'basic-request-rust',
    title: 'Basic API Request',
    description: 'HTTP request to x402 agent in Rust',
    category: 'Getting Started',
    language: 'rust',
    difficulty: 'beginner',
    tags: ['rust', 'reqwest', 'basic'],
    code: `use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
struct AgentRequest {
    query: String,
}

#[derive(Deserialize)]
struct AgentResponse {
    data: serde_json::Value,
}

async fn call_agent(endpoint: &str, query: &str) -> Result<AgentResponse, reqwest::Error> {
    let client = Client::new();
    let payload = AgentRequest { query: query.to_string() };
    
    let response = client
        .post(endpoint)
        .json(&payload)
        .send()
        .await?;
    
    if response.status() == 402 {
        // Handle payment required
        println!("Payment required");
    }
    
    response.json().await
}

#[tokio::main]
async fn main() {
    let result = call_agent("https://agent.lucid.sh/api/v1/invoke", "test query")
        .await
        .unwrap();
    println!("{:?}", result);
}`,
  },
  
  // Environment setup
  {
    id: 'env-setup',
    title: 'Environment Setup',
    description: 'Configure environment variables for x402',
    category: 'Getting Started',
    language: 'bash',
    difficulty: 'beginner',
    tags: ['env', 'setup', 'config'],
    code: `# .env.local

# Your wallet private key (keep secret!)
PRIVATE_KEY=0x...

# Optional: Override default RPC
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY

# Optional: Agent endpoints
AGENT_BASE_URL=https://agent.lucid.sh

# Optional: Webhook secret for callbacks
WEBHOOK_SECRET=your-webhook-secret

# Load in Node.js
# npm install dotenv
# require('dotenv').config()

# Load in Python
# pip install python-dotenv
# from dotenv import load_dotenv
# load_dotenv()`,
  },
];

const categories = [...new Set(snippets.map(s => s.category))];
const languages = [...new Set(snippets.map(s => s.language))];

const languageLabels: Record<string, string> = {
  typescript: 'TypeScript',
  python: 'Python',
  go: 'Go',
  rust: 'Rust',
  bash: 'Bash/cURL',
  javascript: 'JavaScript',
};

const languageColors: Record<string, string> = {
  typescript: 'bg-blue-500',
  python: 'bg-yellow-500',
  go: 'bg-cyan-500',
  rust: 'bg-orange-500',
  bash: 'bg-green-500',
  javascript: 'bg-yellow-400',
};

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-500',
  intermediate: 'bg-yellow-500',
  advanced: 'bg-red-500',
};

export default function SnippetLibrary() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredSnippets = useMemo(() => {
    return snippets.filter(snippet => {
      const matchesSearch = search === '' || 
        snippet.title.toLowerCase().includes(search.toLowerCase()) ||
        snippet.description.toLowerCase().includes(search.toLowerCase()) ||
        snippet.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      
      const matchesCategory = selectedCategory === '' || snippet.category === selectedCategory;
      const matchesLanguage = selectedLanguage === '' || snippet.language === selectedLanguage;
      
      return matchesSearch && matchesCategory && matchesLanguage;
    });
  }, [search, selectedCategory, selectedLanguage]);

  const copyToClipboard = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search snippets... (e.g., 'payment', 'retry', 'cache')"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 pl-12 border-4 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white font-mono focus:outline-none focus:ring-4 focus:ring-lobster-500"
            />
            <svg className="absolute left-4 top-4 w-5 h-5 text-shell-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-bold text-shell-600 dark:text-shell-400">CATEGORY:</span>
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-1 text-xs font-bold uppercase border-2 transition-colors ${
                  selectedCategory === '' 
                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' 
                    : 'border-black dark:border-white text-black dark:text-white hover:bg-shell-100 dark:hover:bg-shell-800'
                }`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xs font-bold uppercase border-2 transition-colors ${
                    selectedCategory === cat 
                      ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' 
                      : 'border-black dark:border-white text-black dark:text-white hover:bg-shell-100 dark:hover:bg-shell-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-bold text-shell-600 dark:text-shell-400">LANGUAGE:</span>
            <button
              onClick={() => setSelectedLanguage('')}
              className={`px-3 py-1 text-xs font-bold uppercase border-2 transition-colors ${
                selectedLanguage === '' 
                  ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' 
                  : 'border-black dark:border-white text-black dark:text-white hover:bg-shell-100 dark:hover:bg-shell-800'
              }`}
            >
              All
            </button>
            {languages.map(lang => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-3 py-1 text-xs font-bold uppercase border-2 transition-colors flex items-center gap-2 ${
                  selectedLanguage === lang 
                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' 
                    : 'border-black dark:border-white text-black dark:text-white hover:bg-shell-100 dark:hover:bg-shell-800'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${languageColors[lang]}`}></span>
                {languageLabels[lang] || lang}
              </button>
            ))}
          </div>
        </div>
        
        {/* Results count */}
        <div className="mb-6 text-shell-600 dark:text-shell-400 font-mono text-sm">
          Showing {filteredSnippets.length} of {snippets.length} snippets
        </div>
        
        {/* Snippet grid */}
        <div className="grid gap-6">
          {filteredSnippets.map(snippet => (
            <div
              key={snippet.id}
              className="border-4 border-black dark:border-white bg-white dark:bg-shell-900"
              style={{ boxShadow: '4px 4px 0px 0px #000' }}
            >
              {/* Header */}
              <div className="flex items-start justify-between p-4 border-b-2 border-black dark:border-white">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`w-3 h-3 rounded-full ${languageColors[snippet.language]}`}></span>
                    <span className="text-xs font-mono text-shell-600 dark:text-shell-400">
                      {languageLabels[snippet.language] || snippet.language}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase text-white ${difficultyColors[snippet.difficulty]}`}>
                      {snippet.difficulty}
                    </span>
                    <span className="text-xs font-mono text-lobster-500">
                      {snippet.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-black dark:text-white">
                    {snippet.title}
                  </h3>
                  <p className="text-sm text-shell-600 dark:text-shell-400 mt-1">
                    {snippet.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {snippet.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="px-2 py-0.5 bg-shell-100 dark:bg-shell-800 text-xs font-mono text-shell-600 dark:text-shell-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(snippet.code, snippet.id)}
                  className={`px-4 py-2 font-bold text-sm uppercase border-2 border-black dark:border-white transition-colors ${
                    copiedId === snippet.id
                      ? 'bg-green-500 text-white'
                      : 'bg-lobster-500 text-white hover:bg-lobster-600'
                  }`}
                >
                  {copiedId === snippet.id ? '✓ COPIED' : 'COPY'}
                </button>
              </div>
              
              {/* Code */}
              <div className="relative">
                <pre className={`p-4 overflow-x-auto bg-shell-900 dark:bg-black text-shell-100 font-mono text-sm ${
                  expandedId === snippet.id ? '' : 'max-h-64'
                }`}>
                  <code>{snippet.code}</code>
                </pre>
                {snippet.code.split('\n').length > 10 && expandedId !== snippet.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-shell-900 dark:from-black to-transparent flex items-end justify-center pb-2">
                    <button
                      onClick={() => setExpandedId(snippet.id)}
                      className="px-4 py-1 bg-white dark:bg-shell-800 border-2 border-black dark:border-white text-xs font-bold uppercase text-black dark:text-white hover:bg-brutal-yellow transition-colors"
                    >
                      Show full code ↓
                    </button>
                  </div>
                )}
                {expandedId === snippet.id && (
                  <button
                    onClick={() => setExpandedId(null)}
                    className="absolute bottom-2 right-2 px-3 py-1 bg-shell-700 text-xs font-bold text-white hover:bg-shell-600 transition-colors"
                  >
                    Collapse ↑
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {filteredSnippets.length === 0 && (
          <div className="text-center py-12">
            <span className="text-6xl">🦞</span>
            <p className="text-xl font-bold text-shell-600 dark:text-shell-400 mt-4">
              No snippets match your search
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('');
                setSelectedLanguage('');
              }}
              className="mt-4 px-6 py-2 bg-lobster-500 text-white font-bold uppercase border-2 border-black dark:border-white hover:bg-lobster-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
