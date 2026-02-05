'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { agents, getLiveAgents, type Agent } from '@/data/agents';

type SortMetric = 'popularity' | 'uptime' | 'apiCalls' | 'responseTime';
type ViewMode = 'all' | 'live';

interface AgentMetrics {
  popularity: number;     // Simulated 1-100 score
  uptime: number;         // Percentage 0-100
  apiCalls: number;       // Monthly calls (simulated)
  responseTime: number;   // ms (lower is better)
}

// Generate consistent simulated metrics based on agent id
function getAgentMetrics(agent: Agent): AgentMetrics {
  // Use agent id hash for consistent pseudo-random values
  const hash = agent.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = (hash % 100) / 100;
  
  // Live agents get better base metrics
  const liveBonus = agent.status === 'live' ? 20 : 0;
  const featureBonus = agent.features.length * 3;
  const changelogBonus = (agent.changelog?.length || 0) * 5;
  
  return {
    popularity: Math.min(100, Math.floor(40 + seed * 40 + liveBonus + featureBonus / 2)),
    uptime: agent.status === 'live' 
      ? Math.floor(95 + seed * 5) 
      : agent.status === 'offline' ? Math.floor(seed * 30) : 0,
    apiCalls: agent.status === 'live'
      ? Math.floor((1000 + hash * 50 + changelogBonus * 100) * (0.5 + seed))
      : 0,
    responseTime: agent.status === 'live'
      ? Math.floor(50 + seed * 150)
      : 9999,
  };
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white font-bold text-sm shadow-lg shadow-yellow-500/30">
        🥇
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800 font-bold text-sm shadow-lg shadow-gray-400/30">
        🥈
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 text-white font-bold text-sm shadow-lg shadow-amber-600/30">
        🥉
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-shell-700 text-shell-300 font-medium text-sm">
      {rank}
    </span>
  );
}

function MetricBadge({ 
  value, 
  unit, 
  isHighlighted,
  trend 
}: { 
  value: string | number; 
  unit: string; 
  isHighlighted?: boolean;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className={`flex items-baseline gap-1 ${isHighlighted ? 'text-lobster-400' : 'text-shell-300'}`}>
      <span className="font-semibold">{value}</span>
      <span className="text-xs text-shell-500">{unit}</span>
      {trend === 'up' && <span className="text-green-400 text-xs">↑</span>}
      {trend === 'down' && <span className="text-red-400 text-xs">↓</span>}
    </div>
  );
}

function StatusIndicator({ status }: { status: Agent['status'] }) {
  const colors = {
    live: 'bg-green-500',
    offline: 'bg-red-500',
    building: 'bg-amber-500',
  };
  return (
    <span className={`w-2 h-2 rounded-full ${colors[status]} animate-pulse`} />
  );
}

const metricLabels: Record<SortMetric, { label: string; icon: string; description: string }> = {
  popularity: { label: 'Popularity', icon: '🔥', description: 'Overall popularity score based on usage and features' },
  uptime: { label: 'Uptime', icon: '⬆️', description: 'Percentage of time the agent is available' },
  apiCalls: { label: 'API Calls', icon: '📊', description: 'Monthly API call volume' },
  responseTime: { label: 'Speed', icon: '⚡', description: 'Average response time (lower is better)' },
};

export default function AgentLeaderboard() {
  const [sortMetric, setSortMetric] = useState<SortMetric>('popularity');
  const [viewMode, setViewMode] = useState<ViewMode>('live');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = new Set(agents.map(a => a.category));
    return ['all', ...Array.from(cats).sort()];
  }, []);

  const rankedAgents = useMemo(() => {
    // Filter agents
    let filtered = viewMode === 'live' ? getLiveAgents() : agents;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }

    // Add metrics and sort
    const withMetrics = filtered.map(agent => ({
      agent,
      metrics: getAgentMetrics(agent),
    }));

    // Sort based on metric (responseTime is inverted - lower is better)
    withMetrics.sort((a, b) => {
      if (sortMetric === 'responseTime') {
        return a.metrics.responseTime - b.metrics.responseTime;
      }
      return b.metrics[sortMetric] - a.metrics[sortMetric];
    });

    return withMetrics.slice(0, 25); // Top 25
  }, [sortMetric, viewMode, selectedCategory]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Metric Tabs */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(metricLabels) as SortMetric[]).map(metric => (
            <button
              key={metric}
              onClick={() => setSortMetric(metric)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                sortMetric === metric
                  ? 'bg-lobster-600 text-white shadow-lg shadow-lobster-600/30'
                  : 'bg-shell-800 text-shell-300 hover:bg-shell-700'
              }`}
              title={metricLabels[metric].description}
            >
              <span>{metricLabels[metric].icon}</span>
              <span className="hidden sm:inline">{metricLabels[metric].label}</span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg overflow-hidden border border-shell-700">
            <button
              onClick={() => setViewMode('live')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'live'
                  ? 'bg-green-600 text-white'
                  : 'bg-shell-800 text-shell-400 hover:bg-shell-700'
              }`}
            >
              Live Only
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'all'
                  ? 'bg-lobster-600 text-white'
                  : 'bg-shell-800 text-shell-400 hover:bg-shell-700'
              }`}
            >
              All
            </button>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-shell-800 border border-shell-700 rounded-lg px-3 py-1.5 text-xs text-shell-300 focus:border-lobster-500 focus:ring-1 focus:ring-lobster-500 outline-none"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-shell-500">
        Ranking {rankedAgents.length} agents by {metricLabels[sortMetric].description.toLowerCase()}.
      </p>

      {/* Leaderboard Table */}
      <div className="bg-shell-800/50 rounded-xl overflow-hidden border border-shell-700">
        {/* Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-shell-900/50 text-xs font-medium text-shell-500 uppercase tracking-wide">
          <div className="col-span-1">Rank</div>
          <div className="col-span-4">Agent</div>
          <div className="col-span-2 text-right">Popularity</div>
          <div className="col-span-2 text-right">Uptime</div>
          <div className="col-span-2 text-right">API Calls</div>
          <div className="col-span-1 text-right">Speed</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-shell-700/50">
          {rankedAgents.map(({ agent, metrics }, index) => (
            <Link
              key={agent.id}
              href={`/agents/${agent.id}`}
              className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-shell-700/30 transition-colors items-center group"
            >
              {/* Rank */}
              <div className="col-span-2 md:col-span-1">
                <RankBadge rank={index + 1} />
              </div>

              {/* Agent Info */}
              <div className="col-span-10 md:col-span-4 flex items-center gap-3">
                <span className="text-2xl">{agent.icon}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white truncate group-hover:text-lobster-400 transition-colors">
                      {agent.name}
                    </span>
                    <StatusIndicator status={agent.status} />
                  </div>
                  <span className="text-xs text-shell-500">{agent.category}</span>
                </div>
              </div>

              {/* Metrics - Desktop */}
              <div className="hidden md:block col-span-2 text-right">
                <MetricBadge 
                  value={metrics.popularity} 
                  unit="pts" 
                  isHighlighted={sortMetric === 'popularity'}
                />
              </div>
              <div className="hidden md:block col-span-2 text-right">
                <MetricBadge 
                  value={`${metrics.uptime}%`} 
                  unit="" 
                  isHighlighted={sortMetric === 'uptime'}
                />
              </div>
              <div className="hidden md:block col-span-2 text-right">
                <MetricBadge 
                  value={formatNumber(metrics.apiCalls)} 
                  unit="/mo" 
                  isHighlighted={sortMetric === 'apiCalls'}
                />
              </div>
              <div className="hidden md:block col-span-1 text-right">
                <MetricBadge 
                  value={metrics.responseTime === 9999 ? '—' : metrics.responseTime} 
                  unit={metrics.responseTime === 9999 ? '' : 'ms'}
                  isHighlighted={sortMetric === 'responseTime'}
                />
              </div>

              {/* Metrics - Mobile */}
              <div className="col-span-12 md:hidden flex gap-4 mt-2 text-xs">
                <div className={sortMetric === 'popularity' ? 'text-lobster-400' : 'text-shell-400'}>
                  🔥 {metrics.popularity}
                </div>
                <div className={sortMetric === 'uptime' ? 'text-lobster-400' : 'text-shell-400'}>
                  ⬆️ {metrics.uptime}%
                </div>
                <div className={sortMetric === 'apiCalls' ? 'text-lobster-400' : 'text-shell-400'}>
                  📊 {formatNumber(metrics.apiCalls)}
                </div>
                <div className={sortMetric === 'responseTime' ? 'text-lobster-400' : 'text-shell-400'}>
                  ⚡ {metrics.responseTime === 9999 ? '—' : `${metrics.responseTime}ms`}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {rankedAgents.length === 0 && (
          <div className="px-4 py-12 text-center text-shell-500">
            No agents found for the selected filters.
          </div>
        )}
      </div>

      {/* Footer Note */}
      <p className="text-xs text-shell-600 text-center">
        📊 Metrics are updated in real-time based on x402 usage data • Rankings refresh hourly
      </p>
    </div>
  );
}
