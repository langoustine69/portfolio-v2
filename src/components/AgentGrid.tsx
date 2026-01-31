'use client';

import { useState, useMemo } from 'react';
import { agents, categories, Agent } from '@/data/agents';
import AgentCard from './AgentCard';

interface AgentGridProps {
  showFilters?: boolean;
  limit?: number;
  showDetails?: boolean;
}

export default function AgentGrid({ showFilters = true, limit, showDetails = false }: AgentGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredAgents = useMemo(() => {
    let result = agents;

    // Search filter - matches name, description, category, apiSource, and features
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(agent => 
        agent.name.toLowerCase().includes(query) ||
        agent.description.toLowerCase().includes(query) ||
        agent.category.toLowerCase().includes(query) ||
        agent.apiSource.toLowerCase().includes(query) ||
        agent.features.some(f => f.toLowerCase().includes(query))
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(a => a.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      result = result.filter(a => a.status === selectedStatus);
    }

    if (limit) {
      result = result.slice(0, limit);
    }

    return result;
  }, [searchQuery, selectedCategory, selectedStatus, limit]);

  const liveCount = agents.filter(a => a.status === 'live').length;
  const buildingCount = agents.filter(a => a.status === 'building').length;
  const offlineCount = agents.filter(a => a.status === 'offline').length;

  return (
    <div>
      {showFilters && (
        <div className="mb-8">
          {/* Stats */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="bg-shell-800/50 dark:bg-shell-800/50 light:bg-white/80 border border-shell-700 dark:border-shell-700 light:border-shell-200 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold text-shell-100 dark:text-shell-100 light:text-shell-900">{agents.length}</span>
              <span className="text-shell-400 dark:text-shell-400 light:text-shell-600 ml-2">Total Agents</span>
            </div>
            <div className="bg-shell-800/50 dark:bg-shell-800/50 light:bg-white/80 border border-shell-700 dark:border-shell-700 light:border-shell-200 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold text-lobster-400 dark:text-lobster-400 light:text-lobster-600">{liveCount}</span>
              <span className="text-shell-400 dark:text-shell-400 light:text-shell-600 ml-2">Live</span>
            </div>
            <div className="bg-shell-800/50 dark:bg-shell-800/50 light:bg-white/80 border border-shell-700 dark:border-shell-700 light:border-shell-200 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold text-yellow-400 dark:text-yellow-400 light:text-yellow-600">{buildingCount}</span>
              <span className="text-shell-400 dark:text-shell-400 light:text-shell-600 ml-2">Building</span>
            </div>
            <div className="bg-shell-800/50 dark:bg-shell-800/50 light:bg-white/80 border border-shell-700 dark:border-shell-700 light:border-shell-200 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold text-shell-400 dark:text-shell-400 light:text-shell-500">{offlineCount}</span>
              <span className="text-shell-400 dark:text-shell-400 light:text-shell-600 ml-2">Offline</span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search input */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-shell-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-shell-800 dark:bg-shell-800 light:bg-white border border-shell-700 dark:border-shell-700 light:border-shell-200 rounded-lg pl-10 pr-4 py-2 text-sm text-shell-100 dark:text-shell-100 light:text-shell-900 placeholder-shell-500 focus:outline-none focus:ring-2 focus:ring-lobster-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-shell-400 hover:text-shell-200 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-shell-400 dark:text-shell-400 light:text-shell-600">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-shell-800 dark:bg-shell-800 light:bg-white border border-shell-700 dark:border-shell-700 light:border-shell-200 rounded-lg px-3 py-1.5 text-sm text-shell-100 dark:text-shell-100 light:text-shell-900 focus:outline-none focus:ring-2 focus:ring-lobster-500"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-shell-400 dark:text-shell-400 light:text-shell-600">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-shell-800 dark:bg-shell-800 light:bg-white border border-shell-700 dark:border-shell-700 light:border-shell-200 rounded-lg px-3 py-1.5 text-sm text-shell-100 dark:text-shell-100 light:text-shell-900 focus:outline-none focus:ring-2 focus:ring-lobster-500"
              >
                <option value="all">All Status</option>
                <option value="live">Live</option>
                <option value="building">Building</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      {showFilters && (searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all') && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-shell-400 dark:text-shell-400 light:text-shell-600">
            Showing {filteredAgents.length} of {agents.length} agents
            {searchQuery && <span className="text-lobster-400"> matching "{searchQuery}"</span>}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedStatus('all');
            }}
            className="text-sm text-lobster-400 hover:text-lobster-300 transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} showDetails={showDetails} />
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-shell-400 dark:text-shell-400 light:text-shell-600 mb-2">
            {searchQuery 
              ? `No agents found matching "${searchQuery}"`
              : 'No agents found matching your filters.'}
          </p>
          <p className="text-sm text-shell-500">
            Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  );
}
