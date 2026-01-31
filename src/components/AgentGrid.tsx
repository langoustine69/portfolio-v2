'use client';

import { useState } from 'react';
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

  let filteredAgents = agents;

  if (selectedCategory !== 'all') {
    filteredAgents = filteredAgents.filter(a => a.category === selectedCategory);
  }

  if (selectedStatus !== 'all') {
    filteredAgents = filteredAgents.filter(a => a.status === selectedStatus);
  }

  if (limit) {
    filteredAgents = filteredAgents.slice(0, limit);
  }

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

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
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

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} showDetails={showDetails} />
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-shell-400 dark:text-shell-400 light:text-shell-600">No agents found matching your filters.</p>
        </div>
      )}
    </div>
  );
}
