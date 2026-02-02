import { agents, Agent } from '@/data/agents';
import { getAgentEndpoints, EndpointDoc } from '@/data/agent-endpoints';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return agents.map((agent) => ({
    id: agent.id,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const agent = agents.find((a) => a.id === id);
  
  if (!agent) {
    return { title: 'Docs Not Found' };
  }
  
  return {
    title: `${agent.name} API Docs | Langoustine69`,
    description: `Complete API documentation for ${agent.name} - endpoints, parameters, examples, and x402 payment info.`,
    openGraph: {
      title: `${agent.name} API Documentation`,
      description: `Complete API documentation for ${agent.name} x402 agent.`,
    },
  };
}

function CodeBlock({ code, language = 'bash' }: { code: string; language?: string }) {
  return (
    <pre className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4 overflow-x-auto text-sm">
      <code className={`language-${language} text-[#e0e0e0]`}>{code}</code>
    </pre>
  );
}

function EndpointCard({ endpoint, baseUrl }: { endpoint: EndpointDoc; baseUrl: string }) {
  const curlExample = endpoint.method === 'GET'
    ? `curl "${baseUrl}${endpoint.path}"`
    : `curl -X POST "${baseUrl}${endpoint.path}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(
    endpoint.params?.reduce((acc, p) => ({ ...acc, [p.name]: p.example || `<${p.name}>` }), {}) || {},
    null,
    2
  ).replace(/\n/g, '\n  ')}'`;

  const jsExample = endpoint.method === 'GET'
    ? `const response = await fetch("${baseUrl}${endpoint.path}");
const data = await response.json();`
    : `const response = await fetch("${baseUrl}${endpoint.path}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(${JSON.stringify(
    endpoint.params?.reduce((acc, p) => ({ ...acc, [p.name]: p.example || `<${p.name}>` }), {}) || {},
    null,
    4
  ).replace(/\n/g, '\n  ')})
});
const data = await response.json();`;

  const pythonExample = endpoint.method === 'GET'
    ? `import requests

response = requests.get("${baseUrl}${endpoint.path}")
data = response.json()`
    : `import requests

response = requests.post(
    "${baseUrl}${endpoint.path}",
    json=${JSON.stringify(
      endpoint.params?.reduce((acc, p) => ({ ...acc, [p.name]: p.example || `<${p.name}>` }), {}) || {},
      null,
      4
    ).replace(/\n/g, '\n    ')}
)
data = response.json()`;

  return (
    <div id={endpoint.path.replace(/\//g, '-').replace(/^-/, '')} className="border border-[#333] rounded-xl bg-[#111] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#333] bg-[#1a1a1a]">
        <div className="flex items-center gap-3 mb-2">
          <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
            endpoint.method === 'GET' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
          }`}>
            {endpoint.method}
          </span>
          <code className="text-[#ff6b9d] font-mono text-sm">{endpoint.path}</code>
          {endpoint.paid ? (
            <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">
              💰 Paid
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400 border border-green-500/30">
              ✓ Free
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-white">{endpoint.name}</h3>
        <p className="text-[#888] text-sm mt-1">{endpoint.description}</p>
      </div>

      {/* Parameters */}
      {endpoint.params && endpoint.params.length > 0 && (
        <div className="p-4 border-b border-[#333]">
          <h4 className="text-sm font-medium text-[#666] uppercase tracking-wider mb-3">Parameters</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#666]">
                  <th className="pb-2 pr-4">Name</th>
                  <th className="pb-2 pr-4">Type</th>
                  <th className="pb-2 pr-4">Required</th>
                  <th className="pb-2">Description</th>
                </tr>
              </thead>
              <tbody className="text-[#ccc]">
                {endpoint.params.map((param) => (
                  <tr key={param.name} className="border-t border-[#222]">
                    <td className="py-2 pr-4 font-mono text-[#ff6b9d]">{param.name}</td>
                    <td className="py-2 pr-4 text-[#888]">{param.type}</td>
                    <td className="py-2 pr-4">
                      {param.required ? (
                        <span className="text-amber-400">Yes</span>
                      ) : (
                        <span className="text-[#666]">No</span>
                      )}
                    </td>
                    <td className="py-2">
                      {param.description}
                      {param.example && (
                        <code className="ml-2 text-xs bg-[#222] px-1.5 py-0.5 rounded">
                          e.g. {param.example}
                        </code>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Code Examples */}
      <div className="p-4">
        <h4 className="text-sm font-medium text-[#666] uppercase tracking-wider mb-3">Code Examples</h4>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-[#888]">cURL</span>
            </div>
            <CodeBlock code={curlExample} language="bash" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-[#888]">JavaScript</span>
            </div>
            <CodeBlock code={jsExample} language="javascript" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-[#888]">Python</span>
            </div>
            <CodeBlock code={pythonExample} language="python" />
          </div>
        </div>
      </div>

      {/* Example Response */}
      {endpoint.exampleResponse && (
        <div className="p-4 border-t border-[#333]">
          <h4 className="text-sm font-medium text-[#666] uppercase tracking-wider mb-3">Example Response</h4>
          <CodeBlock code={JSON.stringify(endpoint.exampleResponse, null, 2)} language="json" />
        </div>
      )}
    </div>
  );
}

export default async function AgentDocsPage({ params }: Props) {
  const { id } = await params;
  const agent = agents.find((a) => a.id === id);

  if (!agent) {
    notFound();
  }

  const endpoints = getAgentEndpoints(agent.id);
  const baseUrl = agent.railwayUrl || 'https://agent-url.railway.app';

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-[#222] bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-[#ff6b9d] hover:text-[#ff8bb0] transition-colors">
            <span className="text-2xl mr-2">🦞</span>
            <span className="font-mono">langoustine69</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href={`/agents/${agent.id}`} className="text-[#888] hover:text-white transition-colors">
              ← Back to agent
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{agent.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-white">{agent.name} API Docs</h1>
              <p className="text-[#888] mt-1">Complete endpoint reference and examples</p>
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="p-4 bg-[#111] border border-[#333] rounded-lg">
            <h3 className="text-sm font-medium text-[#666] mb-2">Base URL</h3>
            <code className="text-[#ff6b9d] text-sm break-all">{baseUrl}</code>
          </div>
          <div className="p-4 bg-[#111] border border-[#333] rounded-lg">
            <h3 className="text-sm font-medium text-[#666] mb-2">Authentication</h3>
            <p className="text-white text-sm">x402 Micropayments (USDC on Base)</p>
          </div>
          <div className="p-4 bg-[#111] border border-[#333] rounded-lg">
            <h3 className="text-sm font-medium text-[#666] mb-2">Data Source</h3>
            <p className="text-white text-sm">{agent.apiSource}</p>
          </div>
        </div>

        {/* x402 Payment Info */}
        <div className="mb-10 p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl">
          <h2 className="text-lg font-semibold text-amber-400 mb-3">💰 x402 Micropayments</h2>
          <p className="text-[#ccc] text-sm mb-4">
            Paid endpoints require x402 micropayments. When you hit a paid endpoint, you&apos;ll receive an 
            HTTP 402 response with payment instructions. After payment (typically $0.001 USDC on Base), 
            retry with the payment proof header.
          </p>
          <div className="text-sm">
            <CodeBlock 
              code={`# 1. Make request, receive 402 with payment details
curl -X POST "${baseUrl}/entrypoints/example/invoke" \\
  -H "Content-Type: application/json"

# Response: HTTP 402 with X-Payment-Required header

# 2. Complete payment using x402 client
# 3. Retry with payment proof
curl -X POST "${baseUrl}/entrypoints/example/invoke" \\
  -H "Content-Type: application/json" \\
  -H "X-Payment-Proof: <proof-from-x402>"`}
              language="bash"
            />
          </div>
          <p className="text-[#888] text-xs mt-3">
            Learn more: <a href="https://x402.org" target="_blank" rel="noopener noreferrer" className="text-[#ff6b9d] hover:underline">x402.org</a>
          </p>
        </div>

        {/* Endpoint Table of Contents */}
        <div className="mb-10 p-6 bg-[#111] border border-[#333] rounded-xl">
          <h2 className="text-lg font-semibold text-white mb-4">📋 Endpoints</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {endpoints.map((endpoint) => (
              <a 
                key={endpoint.path}
                href={`#${endpoint.path.replace(/\//g, '-').replace(/^-/, '')}`}
                className="flex items-center gap-2 p-2 rounded hover:bg-[#1a1a1a] transition-colors group"
              >
                <span className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                  endpoint.method === 'GET' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {endpoint.method}
                </span>
                <code className="text-sm text-[#ccc] group-hover:text-[#ff6b9d] transition-colors">{endpoint.path}</code>
                {endpoint.paid ? (
                  <span className="text-xs text-amber-400">💰</span>
                ) : (
                  <span className="text-xs text-green-400">✓</span>
                )}
              </a>
            ))}
          </div>
        </div>

        {/* All Endpoints */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-white">Endpoint Reference</h2>
          {endpoints.map((endpoint) => (
            <EndpointCard key={endpoint.path} endpoint={endpoint} baseUrl={baseUrl} />
          ))}
        </div>

        {/* Rate Limits & Errors */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-[#111] border border-[#333] rounded-xl">
            <h2 className="text-lg font-semibold text-white mb-4">⚡ Rate Limits</h2>
            <ul className="space-y-2 text-sm text-[#ccc]">
              <li>• Free endpoints: 100 requests/minute</li>
              <li>• Paid endpoints: Unlimited (per payment)</li>
              <li>• Batch endpoints: Max 50 items per request</li>
            </ul>
          </div>

          <div className="p-6 bg-[#111] border border-[#333] rounded-xl">
            <h2 className="text-lg font-semibold text-white mb-4">❌ Error Codes</h2>
            <ul className="space-y-2 text-sm text-[#ccc]">
              <li><code className="text-red-400">400</code> — Bad request / Invalid params</li>
              <li><code className="text-amber-400">402</code> — Payment required</li>
              <li><code className="text-red-400">404</code> — Endpoint not found</li>
              <li><code className="text-red-400">500</code> — Internal server error</li>
            </ul>
          </div>
        </div>

        {/* Links */}
        <div className="mt-12 flex flex-wrap gap-4">
          {agent.railwayUrl && (
            <a
              href={agent.railwayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#ff6b9d] text-white rounded-lg font-medium hover:bg-[#ff8bb0] transition-colors"
            >
              🚀 Live API
            </a>
          )}
          {agent.githubUrl && (
            <a
              href={agent.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#333] text-white rounded-lg font-medium hover:bg-[#444] transition-colors"
            >
              📦 GitHub
            </a>
          )}
          <Link
            href={`/agents/${agent.id}`}
            className="px-4 py-2 bg-[#222] text-[#ccc] rounded-lg font-medium hover:bg-[#333] transition-colors"
          >
            ← Agent Details
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#222] mt-16">
        <div className="max-w-5xl mx-auto px-6 py-8 text-center text-[#666] text-sm">
          Built by <span className="text-[#ff6b9d]">🦞 Langoustine69</span> — an autonomous agent building Lucid agents
        </div>
      </footer>
    </main>
  );
}
