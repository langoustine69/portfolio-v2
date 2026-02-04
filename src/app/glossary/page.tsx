'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/components/I18nProvider';
import Breadcrumbs from '@/components/Breadcrumbs';

interface GlossaryTerm {
  term: string;
  definition: string;
  category: 'protocol' | 'agents' | 'payments' | 'technical' | 'platform';
  related?: string[];
}

const glossaryTerms: GlossaryTerm[] = [
  // Protocol & Standards
  {
    term: 'x402',
    definition: 'An HTTP-native micropayment protocol that uses the 402 Payment Required status code to enable pay-per-request API access. Agents return a 402 response with payment instructions; once paid, the request is processed.',
    category: 'protocol',
    related: ['402 Payment Required', 'Micropayment', 'Pay-per-request'],
  },
  {
    term: '402 Payment Required',
    definition: 'An HTTP status code reserved for future use in digital payment systems. The x402 protocol implements this status to signal that a request requires payment before processing.',
    category: 'protocol',
    related: ['x402', 'HTTP Status Code'],
  },
  {
    term: 'A2A (Agent-to-Agent)',
    definition: 'Communication protocol enabling AI agents to interact directly with each other, negotiate payments, and compose services autonomously without human intervention.',
    category: 'protocol',
    related: ['Agent', 'x402', 'Agent Composition'],
  },
  {
    term: 'MCP (Model Context Protocol)',
    definition: 'A protocol for connecting AI models to external tools, data sources, and services. Enables agents to access real-world capabilities through standardized interfaces.',
    category: 'protocol',
    related: ['Agent', 'Tool Use'],
  },

  // Agents
  {
    term: 'AI Agent',
    definition: 'An autonomous software system powered by AI that can perceive its environment, make decisions, and take actions to achieve specific goals. In the x402 context, agents are typically API services that perform specialized tasks.',
    category: 'agents',
    related: ['x402', 'Entrypoint', 'A2A'],
  },
  {
    term: 'Entrypoint',
    definition: 'A specific function or endpoint exposed by an agent that can be called by clients or other agents. Each entrypoint has its own pricing and functionality.',
    category: 'agents',
    related: ['Agent', 'Pay-per-request'],
  },
  {
    term: 'Agent Composition',
    definition: 'The practice of combining multiple specialized agents to perform complex tasks. One agent may call others, paying for their services via x402, to deliver enhanced functionality.',
    category: 'agents',
    related: ['A2A', 'Multi-agent System'],
  },
  {
    term: 'Multi-agent System',
    definition: 'A system composed of multiple interacting agents that work together to solve problems that are beyond the capabilities of any individual agent.',
    category: 'agents',
    related: ['Agent Composition', 'A2A'],
  },
  {
    term: 'Lucid Agents',
    definition: 'An open-source SDK and platform for building x402-enabled AI agents with built-in micropayment support, identity management, and deployment tools.',
    category: 'agents',
    related: ['x402', 'Agent', 'SDK'],
  },

  // Payments
  {
    term: 'Micropayment',
    definition: 'A financial transaction involving a very small sum of money, typically fractions of a cent to a few cents. x402 enables micropayments for individual API requests.',
    category: 'payments',
    related: ['x402', 'Pay-per-request', 'Stablecoin'],
  },
  {
    term: 'Pay-per-request',
    definition: 'A pricing model where users pay for each individual API call rather than subscribing to a plan. Enabled by x402 micropayments.',
    category: 'payments',
    related: ['x402', 'Micropayment', 'Usage-based Pricing'],
  },
  {
    term: 'Stablecoin',
    definition: 'A cryptocurrency designed to maintain a stable value relative to a reference asset (usually USD). USDC is commonly used for x402 payments due to its stability and low fees.',
    category: 'payments',
    related: ['USDC', 'Cryptocurrency', 'Base Network'],
  },
  {
    term: 'USDC',
    definition: 'USD Coin - a fully-reserved stablecoin pegged 1:1 to the US dollar. The primary payment currency for x402 transactions due to its stability and widespread support.',
    category: 'payments',
    related: ['Stablecoin', 'Micropayment', 'Base Network'],
  },
  {
    term: 'Base Network',
    definition: 'A Layer 2 blockchain built on Ethereum by Coinbase. Offers low transaction fees and fast confirmation times, making it ideal for x402 micropayments.',
    category: 'payments',
    related: ['Layer 2', 'USDC', 'Ethereum'],
  },
  {
    term: 'Layer 2 (L2)',
    definition: 'A secondary blockchain protocol built on top of a Layer 1 blockchain (like Ethereum) to improve scalability and reduce transaction costs while inheriting security.',
    category: 'payments',
    related: ['Base Network', 'Ethereum', 'Scalability'],
  },
  {
    term: 'Gas Fees',
    definition: 'Transaction fees paid to process operations on a blockchain. L2 networks like Base significantly reduce gas fees compared to Ethereum mainnet.',
    category: 'payments',
    related: ['Base Network', 'Layer 2', 'Transaction'],
  },

  // Technical
  {
    term: 'API (Application Programming Interface)',
    definition: 'A set of protocols and tools that allows different software applications to communicate with each other. x402 agents expose their functionality through HTTP APIs.',
    category: 'technical',
    related: ['REST API', 'HTTP', 'Endpoint'],
  },
  {
    term: 'REST API',
    definition: 'An architectural style for designing networked applications using HTTP requests to access and manipulate data. Most x402 agents implement RESTful interfaces.',
    category: 'technical',
    related: ['API', 'HTTP', 'JSON'],
  },
  {
    term: 'Webhook',
    definition: 'An HTTP callback that sends real-time data to other applications when specific events occur. Some agents use webhooks to notify clients of completed operations.',
    category: 'technical',
    related: ['API', 'HTTP', 'Event-driven'],
  },
  {
    term: 'Rate Limiting',
    definition: 'A technique to control the rate of requests a client can make to an API. Protects agents from abuse while ensuring fair access for all users.',
    category: 'technical',
    related: ['API', 'Throttling', 'Quota'],
  },
  {
    term: 'SDK (Software Development Kit)',
    definition: 'A collection of tools, libraries, and documentation that developers use to build applications for a specific platform or service.',
    category: 'technical',
    related: ['Lucid Agents', 'API', 'Library'],
  },
  {
    term: 'JSON',
    definition: 'JavaScript Object Notation - a lightweight data interchange format. The standard format for x402 agent requests and responses.',
    category: 'technical',
    related: ['API', 'REST API', 'Data Format'],
  },

  // Platform
  {
    term: 'Railway',
    definition: 'A cloud platform for deploying and hosting applications. Commonly used to deploy x402 agents due to its simplicity and automatic scaling.',
    category: 'platform',
    related: ['Deployment', 'Cloud Hosting', 'Agent'],
  },
  {
    term: 'Vercel',
    definition: 'A cloud platform optimized for frontend frameworks and serverless functions. Often used for hosting agent documentation and web interfaces.',
    category: 'platform',
    related: ['Deployment', 'Serverless', 'Next.js'],
  },
  {
    term: 'Serverless',
    definition: 'A cloud execution model where the cloud provider manages server infrastructure, automatically scaling based on demand. Pay only for actual usage.',
    category: 'platform',
    related: ['Cloud Hosting', 'Scaling', 'Functions'],
  },
  {
    term: 'Edge Computing',
    definition: 'Processing data closer to where it is generated (at the "edge" of the network) rather than in a centralized data center. Reduces latency for agent responses.',
    category: 'platform',
    related: ['Latency', 'CDN', 'Distribution'],
  },
];

const categoryLabels: Record<GlossaryTerm['category'], { name: string; color: string }> = {
  protocol: { name: 'Protocol', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  agents: { name: 'Agents', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  payments: { name: 'Payments', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  technical: { name: 'Technical', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  platform: { name: 'Platform', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
};

export default function GlossaryPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GlossaryTerm['category'] | 'all'>('all');

  const filteredTerms = useMemo(() => {
    return glossaryTerms
      .filter((term) => {
        const matchesSearch =
          searchQuery === '' ||
          term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
          term.definition.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [searchQuery, selectedCategory]);

  const groupedTerms = useMemo(() => {
    const groups: Record<string, GlossaryTerm[]> = {};
    filteredTerms.forEach((term) => {
      const letter = term.term[0].toUpperCase();
      if (!groups[letter]) {
        groups[letter] = [];
      }
      groups[letter].push(term);
    });
    return groups;
  }, [filteredTerms]);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const availableLetters = Object.keys(groupedTerms);

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ label: t('nav.glossary') || 'Glossary', href: '/glossary' }]} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 gradient-text">
            {t('glossary.title') || 'x402 Glossary'}
          </h1>
          <p className="text-lg text-shell-400 dark:text-shell-400 light:text-shell-600">
            {t('glossary.description') ||
              'A comprehensive guide to x402, AI agents, micropayments, and related terminology.'}
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-shell-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder={t('glossary.searchPlaceholder') || 'Search terms...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-shell-900/50 dark:bg-shell-900/50 light:bg-shell-100 border border-shell-700 dark:border-shell-700 light:border-shell-300 text-shell-100 dark:text-shell-100 light:text-shell-800 placeholder-shell-500 focus:outline-none focus:ring-2 focus:ring-lobster-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as GlossaryTerm['category'] | 'all')}
            className="px-4 py-3 rounded-lg bg-shell-900/50 dark:bg-shell-900/50 light:bg-shell-100 border border-shell-700 dark:border-shell-700 light:border-shell-300 text-shell-100 dark:text-shell-100 light:text-shell-800 focus:outline-none focus:ring-2 focus:ring-lobster-500 focus:border-transparent"
          >
            <option value="all">{t('glossary.allCategories') || 'All Categories'}</option>
            {Object.entries(categoryLabels).map(([key, { name }]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Alphabet Navigation */}
        <div className="flex flex-wrap gap-1 mb-8 p-3 rounded-lg bg-shell-900/30 dark:bg-shell-900/30 light:bg-shell-100/50">
          {alphabet.map((letter) => {
            const isAvailable = availableLetters.includes(letter);
            return (
              <a
                key={letter}
                href={isAvailable ? `#letter-${letter}` : undefined}
                className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                  isAvailable
                    ? 'text-shell-200 dark:text-shell-200 light:text-shell-700 hover:bg-lobster-500/20 hover:text-lobster-400'
                    : 'text-shell-600 dark:text-shell-600 light:text-shell-400 cursor-default'
                }`}
              >
                {letter}
              </a>
            );
          })}
        </div>

        {/* Terms Count */}
        <p className="text-sm text-shell-500 mb-6">
          {t('glossary.showingTerms', { count: filteredTerms.length }) ||
            `Showing ${filteredTerms.length} term${filteredTerms.length !== 1 ? 's' : ''}`}
        </p>

        {/* Terms List */}
        {filteredTerms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-shell-400 dark:text-shell-400 light:text-shell-500">
              {t('glossary.noResults') || 'No terms found matching your search.'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedTerms).map(([letter, terms]) => (
              <section key={letter} id={`letter-${letter}`}>
                <h2 className="text-2xl font-bold text-lobster-400 mb-4 pb-2 border-b border-shell-800 dark:border-shell-800 light:border-shell-200">
                  {letter}
                </h2>
                <div className="space-y-4">
                  {terms.map((term) => (
                    <article
                      key={term.term}
                      className="p-4 rounded-lg bg-shell-900/30 dark:bg-shell-900/30 light:bg-shell-100/50 border border-shell-800 dark:border-shell-800 light:border-shell-200 hover:border-lobster-500/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-lg font-semibold text-shell-100 dark:text-shell-100 light:text-shell-800">
                          {term.term}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded border ${categoryLabels[term.category].color}`}
                        >
                          {categoryLabels[term.category].name}
                        </span>
                      </div>
                      <p className="text-shell-300 dark:text-shell-300 light:text-shell-600 mb-3">
                        {term.definition}
                      </p>
                      {term.related && term.related.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs text-shell-500">Related:</span>
                          {term.related.map((related) => (
                            <button
                              key={related}
                              onClick={() => setSearchQuery(related)}
                              className="text-xs text-lobster-400 hover:text-lobster-300 hover:underline"
                            >
                              {related}
                            </button>
                          ))}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 p-6 rounded-xl bg-gradient-to-r from-lobster-500/10 to-purple-500/10 border border-lobster-500/20">
          <h3 className="text-xl font-bold mb-2 text-shell-100 dark:text-shell-100 light:text-shell-800">
            {t('glossary.cta.title') || 'Ready to build with x402?'}
          </h3>
          <p className="text-shell-400 dark:text-shell-400 light:text-shell-600 mb-4">
            {t('glossary.cta.description') ||
              'Explore our live agents or learn how to build your own with the Lucid Agents SDK.'}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/agents"
              className="inline-flex items-center gap-2 px-4 py-2 bg-lobster-600 hover:bg-lobster-500 text-white rounded-lg font-medium transition-colors"
            >
              {t('glossary.cta.exploreAgents') || 'Explore Agents'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <a
              href="https://github.com/lucid-labs/lucid-agents"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-shell-600 dark:border-shell-600 light:border-shell-300 hover:border-lobster-500 text-shell-200 dark:text-shell-200 light:text-shell-700 rounded-lg font-medium transition-colors"
            >
              {t('glossary.cta.viewSDK') || 'View SDK'}
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
