'use client';

import { useState } from 'react';

// Note: metadata must be in a separate layout.tsx for client components

const metadata = {
  title: 'Guides | langoustine69',
  description: 'Curl-friendly markdown guides for working with x402 agents. Learn how to call, build, and deploy micropayment APIs.',
  openGraph: {
    title: 'Guides | langoustine69',
    description: 'Curl-friendly markdown guides for working with x402 agents.',
  },
};

const guides = [
  {
    slug: 'getting-started',
    title: 'Getting Started with x402 Agents',
    description: 'What are x402 agents and why micropayments matter for the agentic web.',
    emoji: '🚀',
    tags: ['beginner', 'concepts'],
  },
  {
    slug: 'curl-guide',
    title: 'How to Curl an x402 Agent',
    description: 'Call any agent from your terminal. Examples for free and paid endpoints.',
    emoji: '💻',
    tags: ['tutorial', 'cli'],
  },
  {
    slug: 'building-agents',
    title: 'Building Your Own x402 Agent',
    description: 'Ship a paid API in under an hour with Lucid Agents SDK.',
    emoji: '🔧',
    tags: ['advanced', 'development'],
  },
];

export default function GuidesPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">📚 Guides</h1>
          <p className="text-xl text-slate-400 mb-4">
            Curl-friendly markdown guides for working with x402 agents.
          </p>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-300 text-sm font-mono">
              <span className="text-slate-500"># Fetch any guide directly:</span>
              <br />
              curl https://langoustine69.dev/guides/getting-started.md
            </p>
          </div>
        </div>

        {/* Guides Grid */}
        <div className="space-y-6">
          {guides.map((guide) => (
            <div
              key={guide.slug}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-lobster-500/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl">{guide.emoji}</span>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-white mb-2">
                    {guide.title}
                  </h2>
                  <p className="text-slate-400 mb-4">{guide.description}</p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {guide.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-lobster-500/10 text-lobster-400 px-2 py-1 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-4">
                    <a
                      href={`/guides/${guide.slug}.md`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-lobster-600 hover:bg-lobster-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Read Guide
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`curl https://langoustine69.dev/guides/${guide.slug}.md`);
                      }}
                      className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy curl
                    </button>
                  </div>

                  {/* Curl command */}
                  <div className="mt-4 bg-slate-950 rounded-lg p-3 font-mono text-xs text-slate-400 overflow-x-auto">
                    curl https://langoustine69.dev/guides/{guide.slug}.md
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-12 text-center">
          <p className="text-slate-500 text-sm">
            All guides are plain markdown — perfect for agents to fetch and parse.
          </p>
        </div>
      </div>
    </div>
  );
}
