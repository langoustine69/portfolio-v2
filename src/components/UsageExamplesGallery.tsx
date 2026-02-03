'use client';

import { useState } from 'react';

interface UsageExamplesGalleryProps {
  agentName: string;
  agentId: string;
  railwayUrl?: string;
  features: string[];
}

type Language = 'curl' | 'javascript' | 'python' | 'typescript';

const languageLabels: Record<Language, string> = {
  curl: 'cURL',
  javascript: 'JavaScript',
  python: 'Python',
  typescript: 'TypeScript',
};

const languageIcons: Record<Language, string> = {
  curl: '🖥️',
  javascript: '🟨',
  python: '🐍',
  typescript: '🔷',
};

function generateExamples(railwayUrl: string, agentName: string): Record<Language, { title: string; code: string }[]> {
  const baseUrl = railwayUrl || 'https://your-agent.up.railway.app';
  
  return {
    curl: [
      {
        title: 'Health Check',
        code: `curl ${baseUrl}/health`,
      },
      {
        title: 'Get Overview (Free)',
        code: `curl -X POST ${baseUrl}/entrypoints/overview/invoke \\
  -H "Content-Type: application/json" \\
  -d '{}'`,
      },
      {
        title: 'Paid Request with x402',
        code: `# First, get payment details
curl -X POST ${baseUrl}/entrypoints/report/invoke \\
  -H "Content-Type: application/json" \\
  -d '{}' \\
  -D -

# Then pay and include the X-Payment header
curl -X POST ${baseUrl}/entrypoints/report/invoke \\
  -H "Content-Type: application/json" \\
  -H "X-Payment: <payment-token>" \\
  -d '{}'`,
      },
    ],
    javascript: [
      {
        title: 'Basic Request (Node.js)',
        code: `const response = await fetch('${baseUrl}/entrypoints/overview/invoke', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
});

const data = await response.json();
console.log(data);`,
      },
      {
        title: 'With x402 Payment (lucid-agents)',
        code: `import { Client } from '@anthropic/lucid-agents';

const client = new Client({
  baseUrl: '${baseUrl}',
  payment: { type: 'x402', wallet: yourWallet }
});

// Automatic payment handling
const result = await client.invoke('report', {});
console.log(result);`,
      },
      {
        title: 'Error Handling',
        code: `async function callAgent() {
  try {
    const res = await fetch('${baseUrl}/entrypoints/overview/invoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    if (res.status === 402) {
      const paymentInfo = res.headers.get('X-Payment-Required');
      console.log('Payment required:', paymentInfo);
      return;
    }

    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    return await res.json();
  } catch (err) {
    console.error('Agent call failed:', err);
  }
}`,
      },
    ],
    python: [
      {
        title: 'Basic Request (requests)',
        code: `import requests

response = requests.post(
    '${baseUrl}/entrypoints/overview/invoke',
    headers={'Content-Type': 'application/json'},
    json={}
)

data = response.json()
print(data)`,
      },
      {
        title: 'Async Request (aiohttp)',
        code: `import aiohttp
import asyncio

async def call_agent():
    async with aiohttp.ClientSession() as session:
        async with session.post(
            '${baseUrl}/entrypoints/overview/invoke',
            headers={'Content-Type': 'application/json'},
            json={}
        ) as response:
            data = await response.json()
            return data

result = asyncio.run(call_agent())
print(result)`,
      },
      {
        title: 'With Retry Logic',
        code: `import requests
from time import sleep

def call_with_retry(endpoint, max_retries=3):
    url = f'${baseUrl}/entrypoints/{endpoint}/invoke'
    
    for attempt in range(max_retries):
        try:
            response = requests.post(
                url,
                headers={'Content-Type': 'application/json'},
                json={},
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            if attempt == max_retries - 1:
                raise
            sleep(2 ** attempt)  # Exponential backoff
    
    return None

data = call_with_retry('overview')
print(data)`,
      },
    ],
    typescript: [
      {
        title: 'Type-Safe Request',
        code: `interface AgentResponse {
  success: boolean;
  data: Record<string, unknown>;
  timestamp: string;
}

async function callAgent(): Promise<AgentResponse> {
  const response = await fetch('${baseUrl}/entrypoints/overview/invoke', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });

  if (!response.ok) {
    throw new Error(\`HTTP error: \${response.status}\`);
  }

  return response.json() as Promise<AgentResponse>;
}

const data = await callAgent();
console.log(data);`,
      },
      {
        title: 'Zod Validation',
        code: `import { z } from 'zod';

const AgentResponseSchema = z.object({
  success: z.boolean(),
  data: z.record(z.unknown()),
  timestamp: z.string()
});

type AgentResponse = z.infer<typeof AgentResponseSchema>;

async function callAgentWithValidation(): Promise<AgentResponse> {
  const response = await fetch('${baseUrl}/entrypoints/overview/invoke', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });

  const json = await response.json();
  return AgentResponseSchema.parse(json);
}`,
      },
    ],
  };
}

export default function UsageExamplesGallery({ 
  agentName, 
  agentId, 
  railwayUrl, 
  features 
}: UsageExamplesGalleryProps) {
  const [activeLanguage, setActiveLanguage] = useState<Language>('curl');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const examples = generateExamples(railwayUrl || '', agentName);
  const languages: Language[] = ['curl', 'javascript', 'python', 'typescript'];

  const copyToClipboard = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!railwayUrl) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-sm font-medium text-[#666] dark:text-[#666] light:text-shell-500 uppercase tracking-wider mb-4">
        Usage Examples
      </h2>
      
      <div className="bg-[#1a1a1a] dark:bg-[#1a1a1a] light:bg-shell-50 border border-[#333] dark:border-[#333] light:border-shell-200 rounded-lg overflow-hidden">
        {/* Language Tabs */}
        <div className="flex border-b border-[#333] dark:border-[#333] light:border-shell-200 overflow-x-auto">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLanguage(lang)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap
                ${activeLanguage === lang 
                  ? 'bg-[#0a0a0a] dark:bg-[#0a0a0a] light:bg-white text-[#ff6b9d] border-b-2 border-[#ff6b9d]' 
                  : 'text-[#888] dark:text-[#888] light:text-shell-500 hover:text-white dark:hover:text-white light:hover:text-shell-900 hover:bg-[#222] dark:hover:bg-[#222] light:hover:bg-shell-100'
                }
              `}
            >
              <span>{languageIcons[lang]}</span>
              <span>{languageLabels[lang]}</span>
            </button>
          ))}
        </div>

        {/* Examples List */}
        <div className="p-4 space-y-4">
          {examples[activeLanguage].map((example, index) => (
            <div 
              key={index} 
              className="bg-[#0a0a0a] dark:bg-[#0a0a0a] light:bg-white border border-[#222] dark:border-[#222] light:border-shell-200 rounded-lg overflow-hidden"
            >
              {/* Example Header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#222] dark:border-[#222] light:border-shell-200">
                <span className="text-sm font-medium text-[#ccc] dark:text-[#ccc] light:text-shell-700">
                  {example.title}
                </span>
                <button
                  onClick={() => copyToClipboard(example.code, index)}
                  className={`
                    flex items-center gap-1.5 px-2 py-1 text-xs rounded transition-all
                    ${copiedIndex === index 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'text-[#666] hover:text-white hover:bg-[#222] dark:hover:bg-[#222] light:hover:bg-shell-100'
                    }
                  `}
                >
                  {copiedIndex === index ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
              
              {/* Code Block */}
              <pre className="p-4 overflow-x-auto text-sm">
                <code className="text-[#e0e0e0] dark:text-[#e0e0e0] light:text-shell-800 font-mono whitespace-pre">
                  {example.code}
                </code>
              </pre>
            </div>
          ))}
        </div>

        {/* Tips Section */}
        <div className="px-4 pb-4">
          <div className="bg-[#0a0a0a] dark:bg-[#0a0a0a] light:bg-shell-100 border border-[#222] dark:border-[#222] light:border-shell-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div className="text-sm text-[#888] dark:text-[#888] light:text-shell-600">
                <p className="font-medium text-[#ccc] dark:text-[#ccc] light:text-shell-700 mb-1">Quick Tips</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Free endpoints: <code className="text-[#ff6b9d] bg-[#1a1a1a] px-1 rounded">overview</code>, <code className="text-[#ff6b9d] bg-[#1a1a1a] px-1 rounded">health</code></li>
                  <li>Paid endpoints return <code className="text-[#ff6b9d] bg-[#1a1a1a] px-1 rounded">402 Payment Required</code> with x402 details</li>
                  <li>Check <code className="text-[#ff6b9d] bg-[#1a1a1a] px-1 rounded">X-RateLimit-*</code> headers for rate limit info</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
