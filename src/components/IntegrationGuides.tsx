'use client';

import { useState } from 'react';

interface IntegrationGuidesProps {
  agentName: string;
  agentId: string;
  railwayUrl: string;
}

type Language = 'python' | 'javascript' | 'go' | 'ruby' | 'php' | 'curl' | 'lucid';

interface LanguageConfig {
  name: string;
  icon: string;
  color: string;
}

const languages: Record<Language, LanguageConfig> = {
  python: { name: 'Python', icon: '🐍', color: 'text-yellow-400' },
  javascript: { name: 'JavaScript', icon: '📜', color: 'text-yellow-300' },
  go: { name: 'Go', icon: '🐹', color: 'text-cyan-400' },
  ruby: { name: 'Ruby', icon: '💎', color: 'text-red-400' },
  php: { name: 'PHP', icon: '🐘', color: 'text-indigo-400' },
  curl: { name: 'cURL', icon: '🖥️', color: 'text-green-400' },
  lucid: { name: 'Lucid A2A', icon: '🤖', color: 'text-[#ff6b9d]' },
};

function generateCode(language: Language, agentName: string, railwayUrl: string): string {
  const baseUrl = railwayUrl;
  
  switch (language) {
    case 'python':
      return `import requests

# ${agentName} - x402 Integration
BASE_URL = "${baseUrl}"

# Health check (free)
health = requests.get(f"{BASE_URL}/health")
print(health.json())

# Free endpoint - no payment required
response = requests.post(
    f"{BASE_URL}/entrypoints/overview/invoke",
    headers={"Content-Type": "application/json"},
    json={}
)
print(response.json())

# Paid endpoint - x402 micropayment
# First request returns 402 with payment details
paid_response = requests.post(
    f"{BASE_URL}/entrypoints/detailed/invoke",
    headers={"Content-Type": "application/json"},
    json={"query": "your_query"}
)

if paid_response.status_code == 402:
    # Parse payment requirements from response
    payment_info = paid_response.json()
    # Use your x402 wallet to sign and pay
    print("Payment required:", payment_info)`;

    case 'javascript':
      return `// ${agentName} - x402 Integration
const BASE_URL = "${baseUrl}";

// Health check (free)
const health = await fetch(\`\${BASE_URL}/health\`);
console.log(await health.json());

// Free endpoint - no payment required
const freeResponse = await fetch(
  \`\${BASE_URL}/entrypoints/overview/invoke\`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
  }
);
console.log(await freeResponse.json());

// Paid endpoint with x402 client
import { x402Client } from "@anthropic-ai/x402-client";

const client = x402Client({
  privateKey: process.env.X402_PRIVATE_KEY,
});

const paidResponse = await client.post(
  \`\${BASE_URL}/entrypoints/detailed/invoke\`,
  { query: "your_query" }
);
console.log(paidResponse);`;

    case 'go':
      return `package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

// ${agentName} - x402 Integration
const baseURL = "${baseUrl}"

func main() {
	// Health check (free)
	healthResp, _ := http.Get(baseURL + "/health")
	defer healthResp.Body.Close()
	
	// Free endpoint
	payload := []byte(\`{}\`)
	resp, _ := http.Post(
		baseURL+"/entrypoints/overview/invoke",
		"application/json",
		bytes.NewBuffer(payload),
	)
	defer resp.Body.Close()
	
	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	fmt.Printf("Response: %+v\\n", result)
	
	// For paid endpoints, check for 402 status
	// and handle x402 payment flow
}`;

    case 'ruby':
      return `require 'net/http'
require 'json'
require 'uri'

# ${agentName} - x402 Integration
BASE_URL = "${baseUrl}"

# Health check (free)
uri = URI("#{BASE_URL}/health")
health = Net::HTTP.get_response(uri)
puts JSON.parse(health.body)

# Free endpoint
uri = URI("#{BASE_URL}/entrypoints/overview/invoke")
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true

request = Net::HTTP::Post.new(uri)
request["Content-Type"] = "application/json"
request.body = {}.to_json

response = http.request(request)
puts JSON.parse(response.body)

# Paid endpoints return 402 with payment details
# Integrate with x402 gem for automatic payments`;

    case 'php':
      return `<?php
// ${agentName} - x402 Integration
$baseUrl = "${baseUrl}";

// Health check (free)
$health = file_get_contents("$baseUrl/health");
echo json_decode($health, true);

// Free endpoint
$opts = [
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => json_encode([])
    ]
];
$context = stream_context_create($opts);
$response = file_get_contents(
    "$baseUrl/entrypoints/overview/invoke",
    false,
    $context
);
print_r(json_decode($response, true));

// For paid endpoints, handle 402 response
// and integrate x402 payment flow
?>`;

    case 'curl':
      return `# ${agentName} - x402 Integration

# Health check (free)
curl ${baseUrl}/health

# Free endpoint - overview
curl -X POST ${baseUrl}/entrypoints/overview/invoke \\
  -H "Content-Type: application/json" \\
  -d '{}'

# Paid endpoint - returns 402 with payment details
curl -X POST ${baseUrl}/entrypoints/detailed/invoke \\
  -H "Content-Type: application/json" \\
  -d '{"query": "your_query"}'

# After getting 402, include payment header
curl -X POST ${baseUrl}/entrypoints/detailed/invoke \\
  -H "Content-Type: application/json" \\
  -H "X-Payment: <signed_payment_token>" \\
  -d '{"query": "your_query"}'`;

    case 'lucid':
      return `// Agent-to-Agent (A2A) Integration with Lucid
import { LucidClient } from "@anthropic-ai/lucid-agents";

const client = new LucidClient({
  privateKey: process.env.LUCID_PRIVATE_KEY,
});

// Discover agent capabilities
const agentInfo = await client.discover("${railwayUrl}");
console.log("Available entrypoints:", agentInfo.entrypoints);

// Invoke agent with automatic x402 payment
const result = await client.invoke({
  agent: "${railwayUrl}",
  entrypoint: "detailed",
  params: { query: "your_query" },
  maxPayment: "0.01", // Max USD to pay
});

console.log("Result:", result);

// For multi-agent workflows
const workflow = client.workflow()
  .step("${agentName.toLowerCase().replace(/\s+/g, '-')}", {
    agent: "${railwayUrl}",
    entrypoint: "overview",
  })
  .step("process", {
    // Chain to another agent
    agent: "https://another-agent.railway.app",
    entrypoint: "analyze",
    input: (prev) => ({ data: prev }),
  });

const workflowResult = await workflow.run();`;

    default:
      return '';
  }
}

export default function IntegrationGuides({
  agentName,
  agentId,
  railwayUrl,
}: IntegrationGuidesProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('javascript');
  const [copied, setCopied] = useState(false);

  const code = generateCode(selectedLanguage, agentName, railwayUrl);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-[#666] uppercase tracking-wider flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
          Integration Guide
        </h2>
      </div>

      {/* Language Tabs */}
      <div className="bg-[#1a1a1a] border border-[#333] rounded-lg overflow-hidden">
        <div className="flex flex-wrap border-b border-[#333] bg-[#0f0f0f]">
          {(Object.keys(languages) as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 ${
                selectedLanguage === lang
                  ? 'bg-[#1a1a1a] text-white border-b-2 border-[#ff6b9d] -mb-px'
                  : 'text-[#666] hover:text-white hover:bg-[#1a1a1a]/50'
              }`}
              aria-pressed={selectedLanguage === lang}
            >
              <span className="text-base">{languages[lang].icon}</span>
              <span className="hidden sm:inline">{languages[lang].name}</span>
            </button>
          ))}
        </div>

        {/* Code Block */}
        <div className="relative">
          <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
            <span className={`text-xs ${languages[selectedLanguage].color} bg-[#0a0a0a] px-2 py-1 rounded`}>
              {languages[selectedLanguage].name}
            </span>
            <button
              onClick={handleCopy}
              className="p-2 bg-[#0a0a0a] border border-[#333] rounded hover:border-[#ff6b9d] transition-colors"
              aria-label="Copy code"
            >
              {copied ? (
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
            </button>
          </div>

          <pre className="p-4 pt-12 overflow-x-auto text-sm font-mono bg-[#0a0a0a] max-h-[500px]">
            <code className="text-[#ccc] whitespace-pre">{code}</code>
          </pre>
        </div>

        {/* Footer Tips */}
        <div className="px-4 py-3 bg-[#0f0f0f] border-t border-[#333]">
          <div className="flex items-start gap-2 text-xs text-[#666]">
            <svg
              className="w-4 h-4 text-[#ff6b9d] flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <strong className="text-[#888]">Tip:</strong>{' '}
              {selectedLanguage === 'lucid' ? (
                <>
                  Use the Lucid SDK for seamless agent-to-agent communication with automatic payment handling.
                  Get your API key at{' '}
                  <a href="https://lucidlayer.com" className="text-[#ff6b9d] hover:underline" target="_blank" rel="noopener noreferrer">
                    lucidlayer.com
                  </a>
                </>
              ) : (
                <>
                  Free endpoints return data immediately. Paid endpoints return <code className="bg-[#1a1a1a] px-1 rounded">402 Payment Required</code> with x402 payment details.
                  Check the <a href={`/agents/${agentId}/docs`} className="text-[#ff6b9d] hover:underline">API docs</a> for all available endpoints.
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
