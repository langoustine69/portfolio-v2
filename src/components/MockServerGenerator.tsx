'use client';

import { useState, useMemo } from 'react';
import { agents, Agent } from '@/data/agents';

type Framework = 'express' | 'fastify' | 'node';
type ResponseMode = 'success' | 'mixed' | 'error';

interface MockEndpoint {
  method: string;
  path: string;
  description: string;
  mockResponse: Record<string, unknown>;
}

const getAgentMockEndpoints = (agent: Agent): MockEndpoint[] => {
  const baseEndpoints: MockEndpoint[] = [
    {
      method: 'GET',
      path: '/',
      description: 'Health check',
      mockResponse: {
        status: 'ok',
        agent: agent.name,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      },
    },
  ];

  // Category-specific mock endpoints
  switch (agent.category) {
    case 'DeFi':
      return [
        ...baseEndpoints,
        {
          method: 'GET',
          path: '/prices',
          description: 'Crypto prices',
          mockResponse: {
            bitcoin: { usd: 98500, change_24h: 2.4 },
            ethereum: { usd: 3420, change_24h: -1.2 },
            timestamp: new Date().toISOString(),
          },
        },
        {
          method: 'GET',
          path: '/defi/tvl',
          description: 'DeFi TVL',
          mockResponse: {
            total_tvl: 245000000000,
            chains: [
              { name: 'Ethereum', tvl: 85000000000 },
              { name: 'Solana', tvl: 12000000000 },
              { name: 'Base', tvl: 8500000000 },
            ],
          },
        },
      ];
    case 'Weather':
      return [
        ...baseEndpoints,
        {
          method: 'GET',
          path: '/current',
          description: 'Current weather',
          mockResponse: {
            location: 'Sydney, AU',
            temperature: 24,
            humidity: 65,
            condition: 'Partly Cloudy',
            wind_speed: 12,
            uv_index: 6,
          },
        },
        {
          method: 'GET',
          path: '/forecast',
          description: 'Weather forecast',
          mockResponse: {
            location: 'Sydney, AU',
            forecast: [
              { day: 'Today', high: 26, low: 18, condition: 'Sunny' },
              { day: 'Tomorrow', high: 28, low: 20, condition: 'Clear' },
              { day: 'Day 3', high: 25, low: 17, condition: 'Rain' },
            ],
          },
        },
      ];
    case 'Sports':
      return [
        ...baseEndpoints,
        {
          method: 'GET',
          path: '/scores',
          description: 'Live scores',
          mockResponse: {
            games: [
              { home: 'Team A', away: 'Team B', score: '3-2', status: 'Final' },
              { home: 'Team C', away: 'Team D', score: '1-1', status: 'Q4 5:30' },
            ],
          },
        },
        {
          method: 'GET',
          path: '/standings',
          description: 'League standings',
          mockResponse: {
            standings: [
              { rank: 1, team: 'Champions FC', wins: 22, losses: 4, points: 70 },
              { rank: 2, team: 'Runners Up', wins: 20, losses: 6, points: 64 },
            ],
          },
        },
      ];
    case 'Finance':
      return [
        ...baseEndpoints,
        {
          method: 'GET',
          path: '/rates',
          description: 'FX rates',
          mockResponse: {
            base: 'USD',
            rates: { EUR: 0.92, GBP: 0.79, JPY: 149.5, AUD: 1.54 },
            timestamp: new Date().toISOString(),
          },
        },
        {
          method: 'GET',
          path: '/convert',
          description: 'Currency conversion',
          mockResponse: {
            from: 'USD',
            to: 'EUR',
            amount: 100,
            result: 92.15,
            rate: 0.9215,
          },
        },
      ];
    case 'Space':
      return [
        ...baseEndpoints,
        {
          method: 'GET',
          path: '/launches/upcoming',
          description: 'Upcoming launches',
          mockResponse: {
            launches: [
              {
                name: 'Starship Test Flight',
                provider: 'SpaceX',
                date: '2026-02-15',
                location: 'Starbase, TX',
              },
              {
                name: 'Crew-10',
                provider: 'SpaceX',
                date: '2026-02-20',
                location: 'Kennedy Space Center',
              },
            ],
          },
        },
      ];
    case 'Security':
      return [
        ...baseEndpoints,
        {
          method: 'GET',
          path: '/vulns',
          description: 'Recent vulnerabilities',
          mockResponse: {
            vulnerabilities: [
              { cve: 'CVE-2026-1234', severity: 'HIGH', package: 'example-lib' },
              { cve: 'CVE-2026-1235', severity: 'MEDIUM', package: 'another-pkg' },
            ],
          },
        },
        {
          method: 'GET',
          path: '/kev',
          description: 'CISA KEV catalog',
          mockResponse: {
            count: 1150,
            recent: [
              { cve: 'CVE-2026-0001', vendor: 'Vendor A', due_date: '2026-02-28' },
            ],
          },
        },
      ];
    case 'Knowledge':
    case 'Language':
      return [
        ...baseEndpoints,
        {
          method: 'GET',
          path: '/search',
          description: 'Search content',
          mockResponse: {
            query: 'example',
            results: [
              { title: 'Example Article', summary: 'This is a mock article about...', id: 'abc123' },
              { title: 'Another Result', summary: 'More mock content here...', id: 'def456' },
            ],
          },
        },
      ];
    default:
      return [
        ...baseEndpoints,
        {
          method: 'GET',
          path: '/data',
          description: 'Fetch data',
          mockResponse: {
            items: [
              { id: 1, name: 'Item 1', value: 100 },
              { id: 2, name: 'Item 2', value: 200 },
            ],
            total: 2,
            page: 1,
          },
        },
      ];
  }
};

const generateExpressServer = (
  selectedAgents: Agent[],
  port: number,
  simulate402: boolean
): string => {
  const endpoints: string[] = [];
  
  selectedAgents.forEach(agent => {
    const agentEndpoints = getAgentMockEndpoints(agent);
    agentEndpoints.forEach(ep => {
      endpoints.push(`
// ${agent.name} - ${ep.description}
app.${ep.method.toLowerCase()}('/${agent.id}${ep.path}', (req, res) => {
  ${simulate402 ? `if (shouldReturn402()) {
    return res.status(402).json({
      error: 'Payment Required',
      x402Version: '1',
      accepts: [{ scheme: 'exact', network: 'base', asset: 'USDC', amount: '1000', payTo: '0x...' }],
    });
  }` : ''}
  res.json(${JSON.stringify(ep.mockResponse, null, 4).split('\n').join('\n  ')});
});`);
    });
  });

  return `// Generated Mock Server for x402 Agents
// Framework: Express.js
// Generated: ${new Date().toISOString()}

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || ${port};

app.use(cors());
app.use(express.json());

// Response mode: 'success' | 'mixed' | 'error'
const RESPONSE_MODE = process.env.RESPONSE_MODE || 'success';
${simulate402 ? `
// Simulate x402 payment required (for testing payment flows)
const SIMULATE_402 = process.env.SIMULATE_402 === 'true';
const PAYMENT_FREQUENCY = parseFloat(process.env.PAYMENT_FREQUENCY || '0.3'); // 30% of requests

function shouldReturn402() {
  if (!SIMULATE_402) return false;
  return Math.random() < PAYMENT_FREQUENCY;
}
` : ''}
// Error simulation for mixed/error modes
function maybeError(res) {
  if (RESPONSE_MODE === 'error' || (RESPONSE_MODE === 'mixed' && Math.random() > 0.7)) {
    const errors = [
      { status: 500, message: 'Internal Server Error' },
      { status: 503, message: 'Service Unavailable' },
      { status: 429, message: 'Rate Limit Exceeded' },
    ];
    const err = errors[Math.floor(Math.random() * errors.length)];
    res.status(err.status).json({ error: err.message });
    return true;
  }
  return false;
}

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'x402 Mock Server',
    agents: ${JSON.stringify(selectedAgents.map(a => a.id))},
    mode: RESPONSE_MODE,
  });
});

// Agent endpoints
${endpoints.join('\n')}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

app.listen(PORT, () => {
  console.log(\`🎭 x402 Mock Server running on http://localhost:\${PORT}\`);
  console.log(\`   Mode: \${RESPONSE_MODE}\`);
  ${simulate402 ? `console.log(\`   402 Simulation: \${SIMULATE_402 ? 'enabled' : 'disabled'}\`);` : ''}
});
`;
};

const generateFastifyServer = (
  selectedAgents: Agent[],
  port: number,
  simulate402: boolean
): string => {
  const routes: string[] = [];
  
  selectedAgents.forEach(agent => {
    const agentEndpoints = getAgentMockEndpoints(agent);
    agentEndpoints.forEach(ep => {
      routes.push(`
  // ${agent.name} - ${ep.description}
  fastify.${ep.method.toLowerCase()}('/${agent.id}${ep.path}', async (request, reply) => {
    ${simulate402 ? `if (shouldReturn402()) {
      return reply.code(402).send({
        error: 'Payment Required',
        x402Version: '1',
        accepts: [{ scheme: 'exact', network: 'base', asset: 'USDC', amount: '1000', payTo: '0x...' }],
      });
    }` : ''}
    return ${JSON.stringify(ep.mockResponse, null, 4).split('\n').join('\n    ')};
  });`);
    });
  });

  return `// Generated Mock Server for x402 Agents
// Framework: Fastify
// Generated: ${new Date().toISOString()}

const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');

const PORT = process.env.PORT || ${port};
${simulate402 ? `
const SIMULATE_402 = process.env.SIMULATE_402 === 'true';
const PAYMENT_FREQUENCY = parseFloat(process.env.PAYMENT_FREQUENCY || '0.3');

function shouldReturn402() {
  if (!SIMULATE_402) return false;
  return Math.random() < PAYMENT_FREQUENCY;
}
` : ''}
async function start() {
  await fastify.register(cors, { origin: true });

  // Health check
  fastify.get('/', async () => ({
    status: 'ok',
    message: 'x402 Mock Server (Fastify)',
    agents: ${JSON.stringify(selectedAgents.map(a => a.id))},
  }));

  // Agent routes
  ${routes.join('\n')}

  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(\`🎭 x402 Mock Server running on http://localhost:\${PORT}\`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
`;
};

const generateNodeServer = (
  selectedAgents: Agent[],
  port: number,
  simulate402: boolean
): string => {
  const routeHandlers: string[] = [];
  
  selectedAgents.forEach(agent => {
    const agentEndpoints = getAgentMockEndpoints(agent);
    agentEndpoints.forEach(ep => {
      const fullPath = `/${agent.id}${ep.path}`;
      routeHandlers.push(`  '${fullPath}': () => (${JSON.stringify(ep.mockResponse)}),`);
    });
  });

  return `// Generated Mock Server for x402 Agents
// Framework: Node.js (http module, zero dependencies)
// Generated: ${new Date().toISOString()}

const http = require('http');
const url = require('url');

const PORT = process.env.PORT || ${port};
${simulate402 ? `
const SIMULATE_402 = process.env.SIMULATE_402 === 'true';
const PAYMENT_FREQUENCY = parseFloat(process.env.PAYMENT_FREQUENCY || '0.3');

function shouldReturn402() {
  if (!SIMULATE_402) return false;
  return Math.random() < PAYMENT_FREQUENCY;
}
` : ''}
// Route handlers
const routes = {
  '/': () => ({
    status: 'ok',
    message: 'x402 Mock Server (Node.js)',
    agents: ${JSON.stringify(selectedAgents.map(a => a.id))},
  }),
${routeHandlers.join('\n')}
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  ${simulate402 ? `// Simulate x402 payment required
  if (shouldReturn402()) {
    res.writeHead(402);
    res.end(JSON.stringify({
      error: 'Payment Required',
      x402Version: '1',
      accepts: [{ scheme: 'exact', network: 'base', asset: 'USDC', amount: '1000', payTo: '0x...' }],
    }));
    return;
  }
  ` : ''}
  const handler = routes[pathname];
  if (handler) {
    res.writeHead(200);
    res.end(JSON.stringify(handler()));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not Found', path: pathname }));
  }
});

server.listen(PORT, () => {
  console.log(\`🎭 x402 Mock Server running on http://localhost:\${PORT}\`);
});
`;
};

const generateReadme = (selectedAgents: Agent[], framework: Framework, port: number): string => {
  const frameworkName = framework === 'express' ? 'Express.js' : framework === 'fastify' ? 'Fastify' : 'Node.js';
  const deps = framework === 'express' ? 'express cors' : framework === 'fastify' ? 'fastify @fastify/cors' : '';
  
  return `# x402 Mock Server

Generated mock server for testing x402 agent integrations.

## Agents Included
${selectedAgents.map(a => `- **${a.name}** (${a.category}) - ${a.id}`).join('\n')}

## Quick Start

\`\`\`bash
${deps ? `npm install ${deps}` : '# No dependencies required!'}
node server.js
\`\`\`

Server runs on http://localhost:${port}

## Endpoints

| Agent | Path | Description |
|-------|------|-------------|
${selectedAgents.flatMap(agent => 
  getAgentMockEndpoints(agent).map(ep => 
    `| ${agent.name} | \`GET /${agent.id}${ep.path}\` | ${ep.description} |`
  )
).join('\n')}

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| \`PORT\` | ${port} | Server port |
| \`RESPONSE_MODE\` | success | success, mixed, or error |
| \`SIMULATE_402\` | false | Enable x402 payment simulation |
| \`PAYMENT_FREQUENCY\` | 0.3 | Fraction of requests that return 402 |

## Testing x402 Payment Flow

Enable 402 simulation to test your payment retry logic:

\`\`\`bash
SIMULATE_402=true PAYMENT_FREQUENCY=0.5 node server.js
\`\`\`

## Adding Custom Endpoints

Edit \`server.js\` and add new route handlers. Example:

\`\`\`javascript
// Custom endpoint
app.get('/custom/endpoint', (req, res) => {
  res.json({ custom: 'data' });
});
\`\`\`

## License

MIT - Use freely for development and testing.

Generated by [langoustine69.dev](https://langoustine69.dev/mock-server)
`;
};

const generatePackageJson = (framework: Framework, port: number): string => {
  const deps = framework === 'express' 
    ? { express: '^4.18.2', cors: '^2.8.5' }
    : framework === 'fastify'
    ? { fastify: '^4.24.0', '@fastify/cors': '^8.4.0' }
    : {};

  return JSON.stringify({
    name: 'x402-mock-server',
    version: '1.0.0',
    description: 'Mock server for x402 agent testing',
    main: 'server.js',
    scripts: {
      start: 'node server.js',
      'start:402': 'SIMULATE_402=true node server.js',
      'start:errors': 'RESPONSE_MODE=mixed node server.js',
    },
    dependencies: deps,
  }, null, 2);
};

export default function MockServerGenerator() {
  const liveAgents = agents.filter(a => a.status === 'live');
  const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set([liveAgents[0]?.id].filter(Boolean)));
  const [framework, setFramework] = useState<Framework>('express');
  const [port, setPort] = useState(3001);
  const [simulate402, setSimulate402] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'server' | 'readme' | 'package'>('server');
  const [copied, setCopied] = useState(false);

  const filteredAgents = useMemo(() => {
    if (!searchQuery) return liveAgents;
    const q = searchQuery.toLowerCase();
    return liveAgents.filter(a => 
      a.name.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q)
    );
  }, [liveAgents, searchQuery]);

  const selectedAgents = useMemo(() => 
    liveAgents.filter(a => selectedAgentIds.has(a.id)),
    [liveAgents, selectedAgentIds]
  );

  const toggleAgent = (agentId: string) => {
    setSelectedAgentIds(prev => {
      const next = new Set(prev);
      if (next.has(agentId)) {
        next.delete(agentId);
      } else {
        next.add(agentId);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedAgentIds(new Set(filteredAgents.map(a => a.id)));
  };

  const clearAll = () => {
    setSelectedAgentIds(new Set());
  };

  const generatedCode = useMemo(() => {
    if (selectedAgents.length === 0) return '// Select at least one agent to generate mock server code';
    
    switch (framework) {
      case 'express':
        return generateExpressServer(selectedAgents, port, simulate402);
      case 'fastify':
        return generateFastifyServer(selectedAgents, port, simulate402);
      case 'node':
        return generateNodeServer(selectedAgents, port, simulate402);
    }
  }, [selectedAgents, framework, port, simulate402]);

  const readmeContent = useMemo(() => 
    generateReadme(selectedAgents, framework, port),
    [selectedAgents, framework, port]
  );

  const packageJsonContent = useMemo(() => 
    generatePackageJson(framework, port),
    [framework, port]
  );

  const getActiveContent = () => {
    switch (activeTab) {
      case 'server': return generatedCode;
      case 'readme': return readmeContent;
      case 'package': return packageJsonContent;
    }
  };

  const getActiveFilename = () => {
    switch (activeTab) {
      case 'server': return 'server.js';
      case 'readme': return 'README.md';
      case 'package': return 'package.json';
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(getActiveContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    const blob = new Blob([getActiveContent()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getActiveFilename();
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    // Download all files as separate downloads
    const files = [
      { name: 'server.js', content: generatedCode },
      { name: 'README.md', content: readmeContent },
      { name: 'package.json', content: packageJsonContent },
    ];
    
    files.forEach((file, i) => {
      setTimeout(() => {
        const blob = new Blob([file.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }, i * 200);
    });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left: Agent Selection */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          1. Select Agents to Mock
        </h2>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={selectAll}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
          >
            Select All ({filteredAgents.length})
          </button>
          <button
            onClick={clearAll}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
          >
            Clear
          </button>
        </div>

        <div className="h-64 overflow-y-auto space-y-2 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
          {filteredAgents.map(agent => (
            <label
              key={agent.id}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                selectedAgentIds.has(agent.id)
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedAgentIds.has(agent.id)}
                onChange={() => toggleAgent(agent.id)}
                className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-xl">{agent.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-white truncate">
                  {agent.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {agent.category}
                </div>
              </div>
            </label>
          ))}
        </div>

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          {selectedAgentIds.size} agent{selectedAgentIds.size !== 1 ? 's' : ''} selected
        </div>

        {/* Configuration */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">2. Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Framework
              </label>
              <div className="flex gap-2">
                {(['express', 'fastify', 'node'] as Framework[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setFramework(f)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      framework === f
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {f === 'express' ? 'Express' : f === 'fastify' ? 'Fastify' : 'Node.js'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Port
              </label>
              <input
                type="number"
                value={port}
                onChange={(e) => setPort(parseInt(e.target.value) || 3001)}
                className="w-24 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={simulate402}
                onChange={(e) => setSimulate402(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Include x402 payment simulation
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Right: Generated Code */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            3. Generated Code
          </h2>
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
            <button
              onClick={downloadFile}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
            >
              Download
            </button>
            <button
              onClick={downloadAll}
              className="px-3 py-1 text-sm bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white"
            >
              Download All
            </button>
          </div>
        </div>

        {/* File tabs */}
        <div className="flex gap-1 mb-4 border-b border-gray-200 dark:border-gray-700">
          {(['server', 'readme', 'package'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab === 'server' ? 'server.js' : tab === 'readme' ? 'README.md' : 'package.json'}
            </button>
          ))}
        </div>

        <div className="relative">
          <pre className="h-[500px] overflow-auto bg-gray-950 text-gray-300 p-4 rounded-lg text-sm font-mono">
            <code>{getActiveContent()}</code>
          </pre>
        </div>

        {/* Quick Start */}
        {selectedAgents.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Quick Start</h4>
            <code className="text-sm text-gray-600 dark:text-gray-400 block">
              {framework === 'node' ? (
                <>node server.js</>
              ) : (
                <>npm install && npm start</>
              )}
            </code>
            <p className="text-xs text-gray-500 mt-2">
              Then hit http://localhost:{port}/{selectedAgents[0]?.id}/
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
