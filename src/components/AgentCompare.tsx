'use client';

import { useState, useMemo } from 'react';
import { Agent, agents, getLiveAgents, categories } from '@/data/agents';
import HealthIndicator from './HealthIndicator';

const MAX_COMPARE = 4;

export default function AgentCompare() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const liveAgents = getLiveAgents();

  const filteredAgents = useMemo(() => {
    return liveAgents.filter((agent) => {
      const matchesSearch =
        searchQuery === '' ||
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === 'all' || agent.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [liveAgents, searchQuery, categoryFilter]);

  const selectedAgents = useMemo(() => {
    return selectedIds
      .map((id) => agents.find((a) => a.id === id))
      .filter(Boolean) as Agent[];
  }, [selectedIds]);

  const toggleAgent = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else if (selectedIds.length < MAX_COMPARE) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const clearSelection = () => setSelectedIds([]);

  // Get all unique features across selected agents
  const allFeatures = useMemo(() => {
    const features = new Set<string>();
    selectedAgents.forEach((agent) => {
      agent.features.forEach((f) => features.add(f));
    });
    return Array.from(features).sort();
  }, [selectedAgents]);

  return (
    <div className="space-y-8">
      {/* Selection Panel */}
      <div className="bg-shell-900/50 dark:bg-shell-900/50 light:bg-white border border-shell-800 dark:border-shell-800 light:border-shell-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-shell-100 dark:text-shell-100 light:text-shell-900">
            Select Agents to Compare ({selectedIds.length}/{MAX_COMPARE})
          </h2>
          {selectedIds.length > 0 && (
            <button
              onClick={clearSelection}
              className="text-sm text-lobster-400 hover:text-lobster-300 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-shell-800 dark:bg-shell-800 light:bg-shell-100 border border-shell-700 dark:border-shell-700 light:border-shell-300 rounded-lg px-4 py-2 text-shell-100 dark:text-shell-100 light:text-shell-900 placeholder-shell-500 focus:outline-none focus:border-lobster-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-shell-800 dark:bg-shell-800 light:bg-shell-100 border border-shell-700 dark:border-shell-700 light:border-shell-300 rounded-lg px-4 py-2 text-shell-100 dark:text-shell-100 light:text-shell-900 focus:outline-none focus:border-lobster-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Agent Chips */}
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          {filteredAgents.map((agent) => {
            const isSelected = selectedIds.includes(agent.id);
            const isDisabled = !isSelected && selectedIds.length >= MAX_COMPARE;
            return (
              <button
                key={agent.id}
                onClick={() => !isDisabled && toggleAgent(agent.id)}
                disabled={isDisabled}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all
                  ${
                    isSelected
                      ? 'bg-lobster-600 text-white border-lobster-500'
                      : isDisabled
                      ? 'bg-shell-800/50 text-shell-500 cursor-not-allowed border-shell-700'
                      : 'bg-shell-800 dark:bg-shell-800 light:bg-shell-100 text-shell-300 dark:text-shell-300 light:text-shell-700 hover:bg-shell-700 dark:hover:bg-shell-700 light:hover:bg-shell-200 border-shell-700 dark:border-shell-700 light:border-shell-300'
                  }
                  border
                `}
              >
                <span>{agent.icon}</span>
                <span>{agent.name}</span>
                {isSelected && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      {selectedAgents.length > 0 ? (
        <div className="bg-shell-900/50 dark:bg-shell-900/50 light:bg-white border border-shell-800 dark:border-shell-800 light:border-shell-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-shell-800 dark:border-shell-800 light:border-shell-200">
                  <th className="text-left p-4 text-shell-400 dark:text-shell-400 light:text-shell-600 font-medium min-w-[150px]">
                    Attribute
                  </th>
                  {selectedAgents.map((agent) => (
                    <th key={agent.id} className="text-center p-4 min-w-[200px]">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-3xl">{agent.icon}</span>
                        <span className="font-semibold text-shell-100 dark:text-shell-100 light:text-shell-900">
                          {agent.name}
                        </span>
                        <button
                          onClick={() => toggleAgent(agent.id)}
                          className="text-xs text-shell-400 hover:text-lobster-400 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Status */}
                <tr className="border-b border-shell-800/50 dark:border-shell-800/50 light:border-shell-100">
                  <td className="p-4 text-shell-300 dark:text-shell-300 light:text-shell-700 font-medium">
                    Status
                  </td>
                  {selectedAgents.map((agent) => (
                    <td key={agent.id} className="p-4 text-center">
                      <div className="flex justify-center">
                        <HealthIndicator
                          endpoint={agent.railwayUrl}
                          staticStatus={agent.status}
                          showResponseTime
                        />
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Category */}
                <tr className="border-b border-shell-800/50 dark:border-shell-800/50 light:border-shell-100">
                  <td className="p-4 text-shell-300 dark:text-shell-300 light:text-shell-700 font-medium">
                    Category
                  </td>
                  {selectedAgents.map((agent) => (
                    <td
                      key={agent.id}
                      className="p-4 text-center text-shell-200 dark:text-shell-200 light:text-shell-800"
                    >
                      {agent.category}
                    </td>
                  ))}
                </tr>

                {/* API Source */}
                <tr className="border-b border-shell-800/50 dark:border-shell-800/50 light:border-shell-100">
                  <td className="p-4 text-shell-300 dark:text-shell-300 light:text-shell-700 font-medium">
                    API Source
                  </td>
                  {selectedAgents.map((agent) => (
                    <td key={agent.id} className="p-4 text-center">
                      <span className="bg-shell-800/50 dark:bg-shell-800/50 light:bg-shell-100 px-2 py-1 rounded text-xs text-shell-300 dark:text-shell-300 light:text-shell-700">
                        {agent.apiSource}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* ERC-8004 Identity */}
                <tr className="border-b border-shell-800/50 dark:border-shell-800/50 light:border-shell-100">
                  <td className="p-4 text-shell-300 dark:text-shell-300 light:text-shell-700 font-medium">
                    ERC-8004 Identity
                  </td>
                  {selectedAgents.map((agent) => (
                    <td key={agent.id} className="p-4 text-center">
                      {agent.erc8004Tx ? (
                        <a
                          href={agent.erc8004Tx}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Verified
                        </a>
                      ) : (
                        <span className="text-shell-500">—</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Description */}
                <tr className="border-b border-shell-800/50 dark:border-shell-800/50 light:border-shell-100">
                  <td className="p-4 text-shell-300 dark:text-shell-300 light:text-shell-700 font-medium align-top">
                    Description
                  </td>
                  {selectedAgents.map((agent) => (
                    <td
                      key={agent.id}
                      className="p-4 text-center text-sm text-shell-400 dark:text-shell-400 light:text-shell-600"
                    >
                      {agent.description}
                    </td>
                  ))}
                </tr>

                {/* Feature Comparison */}
                <tr className="bg-shell-800/30 dark:bg-shell-800/30 light:bg-shell-50">
                  <td
                    colSpan={selectedAgents.length + 1}
                    className="p-4 text-shell-100 dark:text-shell-100 light:text-shell-900 font-semibold"
                  >
                    Features
                  </td>
                </tr>
                {allFeatures.map((feature) => (
                  <tr
                    key={feature}
                    className="border-b border-shell-800/50 dark:border-shell-800/50 light:border-shell-100"
                  >
                    <td className="p-4 text-shell-400 dark:text-shell-400 light:text-shell-600 text-sm">
                      {feature}
                    </td>
                    {selectedAgents.map((agent) => (
                      <td key={agent.id} className="p-4 text-center">
                        {agent.features.includes(feature) ? (
                          <span className="text-green-400">
                            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        ) : (
                          <span className="text-shell-600">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Links */}
                <tr className="bg-shell-800/30 dark:bg-shell-800/30 light:bg-shell-50">
                  <td
                    colSpan={selectedAgents.length + 1}
                    className="p-4 text-shell-100 dark:text-shell-100 light:text-shell-900 font-semibold"
                  >
                    Links
                  </td>
                </tr>
                <tr>
                  <td className="p-4 text-shell-300 dark:text-shell-300 light:text-shell-700 font-medium">
                    Actions
                  </td>
                  {selectedAgents.map((agent) => (
                    <td key={agent.id} className="p-4">
                      <div className="flex flex-col items-center gap-2">
                        {agent.railwayUrl && (
                          <a
                            href={agent.railwayUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-lobster-400 hover:text-lobster-300 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Live Demo
                          </a>
                        )}
                        {agent.githubUrl && (
                          <a
                            href={agent.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-shell-400 hover:text-shell-300 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                            Source
                          </a>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-shell-900/50 dark:bg-shell-900/50 light:bg-white border border-shell-800 dark:border-shell-800 light:border-shell-200 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">⚖️</div>
          <h3 className="text-lg font-semibold text-shell-100 dark:text-shell-100 light:text-shell-900 mb-2">
            Select Agents to Compare
          </h3>
          <p className="text-shell-400 dark:text-shell-400 light:text-shell-600">
            Choose up to {MAX_COMPARE} agents from above to see a side-by-side comparison of their features, status, and capabilities.
          </p>
        </div>
      )}
    </div>
  );
}
