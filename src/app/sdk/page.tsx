'use client';

import { useState } from 'react';
import Link from 'next/link';
import { agents } from '@/data/agents';
import SdkGenerator from '@/components/SdkGenerator';

export default function SdkPage() {
  const liveAgents = agents.filter(a => a.status === 'live' && a.railwayUrl);
  const [selectedAgentId, setSelectedAgentId] = useState(liveAgents[0]?.id || '');
  
  const selectedAgent = agents.find(a => a.id === selectedAgentId);

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
            <span className="text-white">SDK</span>{' '}
            <span className="bg-gradient-to-r from-[#ff6b9d] to-purple-500 bg-clip-text text-transparent">
              Generator
            </span>
            <span className="ml-3">🔧</span>
          </h1>
          <p className="text-[#888] text-lg max-w-2xl mx-auto">
            Generate production-ready SDK wrapper code for any agent. 
            Includes full x402 payment flow, error handling, and TypeScript types.
          </p>
        </div>

        {/* Agent Selector */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-[#666] uppercase tracking-wider mb-3">
            Select Agent
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {liveAgents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgentId(agent.id)}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                  selectedAgentId === agent.id
                    ? 'bg-[#ff6b9d]/10 border-[#ff6b9d] text-white'
                    : 'bg-[#1a1a1a] border-[#333] text-[#888] hover:border-[#555] hover:text-white'
                }`}
              >
                <span className="text-2xl">{agent.icon}</span>
                <div className="min-w-0">
                  <div className="font-medium truncate">{agent.name}</div>
                  <div className="text-xs text-[#666] truncate">{agent.category}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* SDK Generator */}
        {selectedAgent ? (
          <SdkGenerator agent={selectedAgent} />
        ) : (
          <div className="text-center py-12 text-[#666]">
            No live agents available for SDK generation.
          </div>
        )}

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
            <div className="text-3xl mb-4">💳</div>
            <h3 className="text-lg font-semibold text-white mb-2">x402 Payment Flow</h3>
            <p className="text-[#888] text-sm">
              Built-in handling for 402 responses with automatic payment retry via configurable handler.
            </p>
          </div>
          
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
            <div className="text-3xl mb-4">🔄</div>
            <h3 className="text-lg font-semibold text-white mb-2">Auto Retry</h3>
            <p className="text-[#888] text-sm">
              Exponential backoff retry on transient failures (502, 503, 504) with configurable limits.
            </p>
          </div>
          
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
            <div className="text-3xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-white mb-2">Typed Responses</h3>
            <p className="text-[#888] text-sm">
              Full TypeScript types, Python type hints, Go structs, and Rust types included.
            </p>
          </div>
        </div>

        {/* Quick Start */}
        <div className="mt-12 bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>🚀</span> Quick Start
          </h2>
          <ol className="space-y-3 text-[#888]">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#ff6b9d]/20 text-[#ff6b9d] rounded-full flex items-center justify-center text-sm font-medium">1</span>
              <span>Select an agent from the grid above</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#ff6b9d]/20 text-[#ff6b9d] rounded-full flex items-center justify-center text-sm font-medium">2</span>
              <span>Choose your language (TypeScript, Python, Go, or Rust)</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#ff6b9d]/20 text-[#ff6b9d] rounded-full flex items-center justify-center text-sm font-medium">3</span>
              <span>Download or copy the generated SDK</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#ff6b9d]/20 text-[#ff6b9d] rounded-full flex items-center justify-center text-sm font-medium">4</span>
              <span>Configure your payment handler (optional)</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-[#ff6b9d]/20 text-[#ff6b9d] rounded-full flex items-center justify-center text-sm font-medium">5</span>
              <span>Start making API calls!</span>
            </li>
          </ol>
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
