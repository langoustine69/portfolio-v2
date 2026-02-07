'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCases, industries, difficulties, UseCase } from '@/data/use-cases';
import { agents as allAgents } from '@/data/agents';
import Breadcrumbs from '@/components/Breadcrumbs';
import CodeBlock from '@/components/CodeBlock';

const difficultyConfig = {
  beginner: { label: 'Beginner', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  intermediate: { label: 'Intermediate', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  advanced: { label: 'Advanced', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
};

export default function UseCasesClient() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredUseCases = useMemo(() => {
    return useCases.filter(uc => {
      if (selectedIndustry !== 'all' && uc.industry !== selectedIndustry) return false;
      if (selectedDifficulty !== 'all' && uc.difficulty !== selectedDifficulty) return false;
      return true;
    });
  }, [selectedIndustry, selectedDifficulty]);

  const getAgentsByIds = (ids: string[]) => {
    return ids.map(id => allAgents.find(a => a.id === id)).filter(Boolean);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 py-16">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-6xl mx-auto px-4">
          <Breadcrumbs items={[{ label: 'Use Cases', href: '/use-cases' }]} className="mb-6 text-white/70" />
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              🦞 Use Cases Gallery
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-6">
              Real-world applications showing how x402 agents solve actual problems
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="font-bold text-2xl">{useCases.length}</span>
                <span className="block text-white/80">Use Cases</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="font-bold text-2xl">{industries.length}</span>
                <span className="block text-white/80">Industries</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="font-bold text-2xl">{new Set(useCases.flatMap(uc => uc.agents)).size}</span>
                <span className="block text-white/80">Agents Used</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-4 items-center justify-center">
          {/* Industry Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Industry:</label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Industries</option>
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty:</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              {difficulties.map(diff => (
                <option key={diff} value={diff}>{difficultyConfig[diff].label}</option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredUseCases.length} of {useCases.length}
          </span>
        </div>
      </section>

      {/* Use Cases Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="space-y-6">
          {filteredUseCases.map((useCase) => (
            <UseCaseCard
              key={useCase.id}
              useCase={useCase}
              isExpanded={expandedId === useCase.id}
              onToggle={() => setExpandedId(expandedId === useCase.id ? null : useCase.id)}
              agents={getAgentsByIds(useCase.agents)}
            />
          ))}
        </div>

        {filteredUseCases.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No use cases found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters to see more results.
            </p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">🚀 Have a Use Case in Mind?</h2>
          <p className="text-purple-100 mb-6 max-w-xl mx-auto">
            Can't find what you're looking for? Our agents are flexible and can be combined
            in countless ways. Check out the playground to experiment.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/agents"
              className="inline-flex items-center gap-2 bg-white text-purple-700 font-semibold px-6 py-3 rounded-lg hover:bg-purple-50 transition-colors"
            >
              Browse Agents
            </Link>
            <Link
              href="/api-playground"
              className="inline-flex items-center gap-2 bg-purple-700/50 text-white font-semibold px-6 py-3 rounded-lg hover:bg-purple-700/70 transition-colors"
            >
              Try Playground
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

interface UseCaseCardProps {
  useCase: UseCase;
  isExpanded: boolean;
  onToggle: () => void;
  agents: any[];
}

function UseCaseCard({ useCase, isExpanded, onToggle, agents }: UseCaseCardProps) {
  const config = difficultyConfig[useCase.difficulty];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-6 text-left flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="text-4xl flex-shrink-0">{useCase.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {useCase.title}
            </h3>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
              {config.label}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
              {useCase.industry}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
            {useCase.description}
          </p>
          {/* Agent Pills */}
          <div className="flex flex-wrap gap-2">
            {agents.map((agent) => (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-full hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
              >
                <span>{agent.icon}</span>
                <span>{agent.name}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className={`flex-shrink-0 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Problem Statement */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-red-500">❌</span> The Problem
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {useCase.problemStatement}
              </p>
            </div>

            {/* Solution */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-green-500">✅</span> The Solution
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {useCase.solution}
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span>✨</span> Benefits
            </h4>
            <ul className="grid sm:grid-cols-2 gap-2">
              {useCase.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <span className="text-green-500 flex-shrink-0">•</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Code Example */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span>💻</span> Code Example
            </h4>
            <div className="rounded-lg overflow-hidden">
              <CodeBlock code={useCase.codeSnippet.code} language={useCase.codeSnippet.language} />
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">Estimated Cost</div>
              <div className="font-bold text-gray-900 dark:text-white">{useCase.estimatedCost}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">Implementation Time</div>
              <div className="font-bold text-gray-900 dark:text-white">{useCase.implementationTime}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
