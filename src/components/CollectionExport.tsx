'use client';

import { useState } from 'react';
import { Agent, agents } from '../data/agents';

type ExportFormat = 'postman' | 'insomnia' | 'openapi' | 'curl';

interface ExportOption {
  id: ExportFormat;
  name: string;
  icon: string;
  description: string;
}

const exportOptions: ExportOption[] = [
  { id: 'postman', name: 'Postman', icon: '📮', description: 'Import as Postman Collection v2.1' },
  { id: 'insomnia', name: 'Insomnia', icon: '🌙', description: 'Import as Insomnia v4 Collection' },
  { id: 'openapi', name: 'OpenAPI', icon: '📋', description: 'OpenAPI 3.0 Specification' },
  { id: 'curl', name: 'cURL', icon: '💻', description: 'cURL commands as shell script' },
];

function generatePostmanCollection(selectedAgents: Agent[]) {
  const collection = {
    info: {
      name: 'Langoustine69 x402 Agents',
      description: 'AI agents with micropayments via x402 protocol. Learn more at langoustine69.dev',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      _postman_id: crypto.randomUUID(),
    },
    variable: [
      { key: 'base_url', value: '', type: 'string' },
      { key: 'x402_payment', value: 'your-payment-token', type: 'string' },
    ],
    item: selectedAgents.map((agent) => ({
      name: agent.name,
      item: [
        {
          name: `${agent.name} - Health Check`,
          request: {
            method: 'GET',
            header: [],
            url: {
              raw: `${agent.railwayUrl || '{{base_url}}'}/health`,
              host: [agent.railwayUrl || '{{base_url}}'],
              path: ['health'],
            },
            description: `Health check for ${agent.name}`,
          },
        },
        {
          name: `${agent.name} - Agent Card`,
          request: {
            method: 'GET',
            header: [
              { key: 'Accept', value: 'application/json' },
            ],
            url: {
              raw: `${agent.railwayUrl || '{{base_url}}'}/.well-known/agent.json`,
              host: [agent.railwayUrl || '{{base_url}}'],
              path: ['.well-known', 'agent.json'],
            },
            description: `Get agent card (A2A discovery) for ${agent.name}`,
          },
        },
        {
          name: `${agent.name} - Main Endpoint`,
          request: {
            method: 'GET',
            header: [
              { key: 'Accept', value: 'application/json' },
              { key: 'X-Payment', value: '{{x402_payment}}' },
            ],
            url: {
              raw: `${agent.railwayUrl || '{{base_url}}'}/`,
              host: [agent.railwayUrl || '{{base_url}}'],
              path: [''],
            },
            description: `Main endpoint for ${agent.name}. Returns 402 Payment Required - pay via x402 protocol.`,
          },
        },
      ],
    })),
  };
  return JSON.stringify(collection, null, 2);
}

function generateInsomniaCollection(selectedAgents: Agent[]) {
  const resources: object[] = [];
  const workspaceId = `wrk_${crypto.randomUUID().replace(/-/g, '')}`;
  
  resources.push({
    _id: workspaceId,
    _type: 'workspace',
    name: 'Langoustine69 x402 Agents',
    description: 'AI agents with micropayments via x402 protocol',
    scope: 'collection',
  });

  resources.push({
    _id: `env_${crypto.randomUUID().replace(/-/g, '')}`,
    _type: 'environment',
    parentId: workspaceId,
    name: 'Base Environment',
    data: {
      x402_payment: 'your-payment-token',
    },
  });

  selectedAgents.forEach((agent) => {
    const folderId = `fld_${crypto.randomUUID().replace(/-/g, '')}`;
    resources.push({
      _id: folderId,
      _type: 'request_group',
      parentId: workspaceId,
      name: agent.name,
      description: agent.description,
    });

    resources.push({
      _id: `req_${crypto.randomUUID().replace(/-/g, '')}`,
      _type: 'request',
      parentId: folderId,
      name: 'Health Check',
      method: 'GET',
      url: `${agent.railwayUrl}/health`,
    });

    resources.push({
      _id: `req_${crypto.randomUUID().replace(/-/g, '')}`,
      _type: 'request',
      parentId: folderId,
      name: 'Agent Card',
      method: 'GET',
      url: `${agent.railwayUrl}/.well-known/agent.json`,
      headers: [{ name: 'Accept', value: 'application/json' }],
    });

    resources.push({
      _id: `req_${crypto.randomUUID().replace(/-/g, '')}`,
      _type: 'request',
      parentId: folderId,
      name: 'Main Endpoint',
      method: 'GET',
      url: `${agent.railwayUrl}/`,
      headers: [
        { name: 'Accept', value: 'application/json' },
        { name: 'X-Payment', value: '{{ _.x402_payment }}' },
      ],
    });
  });

  return JSON.stringify({
    _type: 'export',
    __export_format: 4,
    __export_date: new Date().toISOString(),
    __export_source: 'langoustine69.dev',
    resources,
  }, null, 2);
}

function generateOpenAPISpec(selectedAgents: Agent[]) {
  const spec = {
    openapi: '3.0.3',
    info: {
      title: 'Langoustine69 x402 Agents',
      description: 'AI agents with micropayments via x402 protocol. Each agent returns 402 Payment Required until payment is made via the x402 header.',
      version: '1.0.0',
      contact: {
        name: 'Langoustine69',
        url: 'https://langoustine69.dev',
      },
    },
    servers: selectedAgents
      .filter((a) => a.railwayUrl)
      .map((a) => ({
        url: a.railwayUrl,
        description: a.name,
      })),
    paths: {
      '/health': {
        get: {
          summary: 'Health Check',
          description: 'Check if the agent is healthy and responding',
          responses: {
            '200': {
              description: 'Agent is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/.well-known/agent.json': {
        get: {
          summary: 'Agent Card',
          description: 'A2A discovery endpoint returning agent metadata',
          responses: {
            '200': {
              description: 'Agent card with capabilities and payment info',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      description: { type: 'string' },
                      capabilities: { type: 'array', items: { type: 'string' } },
                      x402: { type: 'object' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/': {
        get: {
          summary: 'Main Endpoint',
          description: 'Primary agent endpoint - returns 402 until payment made',
          security: [{ x402Payment: [] }],
          responses: {
            '200': {
              description: 'Successful response after payment',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                  },
                },
              },
            },
            '402': {
              description: 'Payment Required - use x402 protocol',
              headers: {
                'X-Payment-Address': {
                  description: 'Payment address for x402',
                  schema: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        x402Payment: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Payment',
          description: 'x402 payment token',
        },
      },
    },
  };
  return JSON.stringify(spec, null, 2);
}

function generateCurlScript(selectedAgents: Agent[]) {
  const lines = [
    '#!/bin/bash',
    '# Langoustine69 x402 Agents - cURL Commands',
    '# Generated from langoustine69.dev',
    '',
    '# Set your x402 payment token',
    'X402_PAYMENT="your-payment-token"',
    '',
  ];

  selectedAgents.forEach((agent) => {
    if (!agent.railwayUrl) return;
    lines.push(`# ==========================================`);
    lines.push(`# ${agent.icon} ${agent.name}`);
    lines.push(`# ${agent.description}`);
    lines.push(`# ==========================================`);
    lines.push('');
    lines.push(`# Health Check`);
    lines.push(`curl -s "${agent.railwayUrl}/health" | jq`);
    lines.push('');
    lines.push(`# Agent Card (A2A Discovery)`);
    lines.push(`curl -s "${agent.railwayUrl}/.well-known/agent.json" | jq`);
    lines.push('');
    lines.push(`# Main Endpoint (will return 402 without payment)`);
    lines.push(`curl -s -H "X-Payment: $X402_PAYMENT" "${agent.railwayUrl}/" | jq`);
    lines.push('');
  });

  return lines.join('\n');
}

export default function CollectionExport() {
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(
    new Set(agents.filter((a) => a.status === 'live').map((a) => a.id))
  );
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('postman');
  const [exported, setExported] = useState(false);

  const liveAgents = agents.filter((a) => a.status === 'live');

  const toggleAgent = (id: string) => {
    const newSet = new Set(selectedAgents);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedAgents(newSet);
  };

  const selectAll = () => {
    setSelectedAgents(new Set(liveAgents.map((a) => a.id)));
  };

  const selectNone = () => {
    setSelectedAgents(new Set());
  };

  const handleExport = () => {
    const selected = liveAgents.filter((a) => selectedAgents.has(a.id));
    if (selected.length === 0) return;

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (selectedFormat) {
      case 'postman':
        content = generatePostmanCollection(selected);
        filename = 'langoustine69-postman-collection.json';
        mimeType = 'application/json';
        break;
      case 'insomnia':
        content = generateInsomniaCollection(selected);
        filename = 'langoustine69-insomnia-collection.json';
        mimeType = 'application/json';
        break;
      case 'openapi':
        content = generateOpenAPISpec(selected);
        filename = 'langoustine69-openapi.json';
        mimeType = 'application/json';
        break;
      case 'curl':
        content = generateCurlScript(selected);
        filename = 'langoustine69-agents.sh';
        mimeType = 'text/x-shellscript';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Format Selection */}
      <div>
        <h3 className="text-lg font-black uppercase mb-4">Export Format</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {exportOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedFormat(option.id)}
              className={`p-4 border-4 transition-all text-left ${
                selectedFormat === option.id
                  ? 'border-lobster-500 bg-lobster-500/10 dark:bg-lobster-500/20'
                  : 'border-black dark:border-white hover:border-lobster-500'
              }`}
              style={selectedFormat === option.id ? { boxShadow: '4px 4px 0px 0px #e11d48' } : undefined}
            >
              <span className="text-2xl">{option.icon}</span>
              <h4 className="font-bold mt-2">{option.name}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Agent Selection */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black uppercase">Select Agents</h3>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="px-3 py-1 text-xs font-bold uppercase border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
            >
              All
            </button>
            <button
              onClick={selectNone}
              className="px-3 py-1 text-xs font-bold uppercase border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
            >
              None
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {liveAgents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => toggleAgent(agent.id)}
              className={`p-3 border-2 transition-all text-left flex items-center gap-3 ${
                selectedAgents.has(agent.id)
                  ? 'border-lobster-500 bg-lobster-500/10'
                  : 'border-gray-300 dark:border-gray-700 hover:border-black dark:hover:border-white'
              }`}
            >
              <div
                className={`w-5 h-5 border-2 flex items-center justify-center ${
                  selectedAgents.has(agent.id)
                    ? 'border-lobster-500 bg-lobster-500 text-white'
                    : 'border-gray-400'
                }`}
              >
                {selectedAgents.has(agent.id) && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-xl">{agent.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{agent.name}</p>
                <p className="text-xs text-gray-500 truncate">{agent.category}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Export Button */}
      <div className="flex items-center justify-between border-t-4 border-black dark:border-white pt-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {selectedAgents.size} agent{selectedAgents.size !== 1 ? 's' : ''} selected
        </p>
        <button
          onClick={handleExport}
          disabled={selectedAgents.size === 0}
          className={`px-6 py-3 font-bold uppercase text-sm transition-all ${
            selectedAgents.size === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : exported
              ? 'bg-green-500 text-white'
              : 'bg-lobster-500 text-white hover:bg-lobster-600 border-4 border-black'
          }`}
          style={selectedAgents.size > 0 && !exported ? { boxShadow: '4px 4px 0px 0px #000' } : undefined}
        >
          {exported ? '✓ Downloaded!' : `Export ${exportOptions.find((o) => o.id === selectedFormat)?.name} Collection`}
        </button>
      </div>
    </div>
  );
}

// Compact button for header/toolbar
export function ExportCollectionButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-3 py-1 text-xs font-bold uppercase border-2 border-black dark:border-white hover:bg-lobster-500 hover:text-white hover:border-lobster-500 transition-colors flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white dark:bg-black border-4 border-black dark:border-white p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black uppercase">📦 Export Collection</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <CollectionExport />
          </div>
        </div>
      )}
    </>
  );
}
