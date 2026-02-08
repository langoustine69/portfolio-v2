'use client';

import { useState, useMemo } from 'react';
import { agents, Agent } from '@/data/agents';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type SortKey = 'name' | 'category' | 'status';

export default function CheatsheetPage() {
  const [sortBy, setSortBy] = useState<SortKey>('category');
  const [filterStatus, setFilterStatus] = useState<'all' | 'live' | 'offline' | 'building'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(agents.map(a => a.category));
    return ['all', ...Array.from(cats).sort()];
  }, []);

  // Filter and sort agents
  const filteredAgents = useMemo(() => {
    let result = [...agents];

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(a => a.status === filterStatus);
    }

    // Filter by category
    if (filterCategory !== 'all') {
      result = result.filter(a => a.category === filterCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.name.toLowerCase().includes(query) ||
        a.category.toLowerCase().includes(query) ||
        a.apiSource.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'category') return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
      if (sortBy === 'status') {
        const statusOrder = { live: 0, building: 1, offline: 2 };
        return (statusOrder[a.status] - statusOrder[b.status]) || a.name.localeCompare(b.name);
      }
      return 0;
    });

    return result;
  }, [sortBy, filterStatus, filterCategory, searchQuery]);

  // Group by category for display
  const groupedAgents = useMemo(() => {
    if (sortBy !== 'category') return null;
    const groups: Record<string, Agent[]> = {};
    filteredAgents.forEach(agent => {
      if (!groups[agent.category]) groups[agent.category] = [];
      groups[agent.category].push(agent);
    });
    return groups;
  }, [filteredAgents, sortBy]);

  const liveCount = agents.filter(a => a.status === 'live').length;
  const buildingCount = agents.filter(a => a.status === 'building').length;
  const offlineCount = agents.filter(a => a.status === 'offline').length;

  const getStatusBadge = (status: Agent['status']) => {
    switch (status) {
      case 'live':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">●</span>;
      case 'building':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">◐</span>;
      case 'offline':
        return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">○</span>;
    }
  };

  const getRateLimit = (agent: Agent) => {
    if (!agent.rateLimit) return '—';
    const { requestsPerMinute, requestsPerHour } = agent.rateLimit;
    if (requestsPerMinute) return `${requestsPerMinute}/min`;
    if (requestsPerHour) return `${requestsPerHour}/hr`;
    return '—';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 print:py-4">
        {/* Header - hide some elements when printing */}
        <div className="mb-8 print:mb-4">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white print:text-2xl">
              📋 Quick Reference
            </h1>
            <button
              onClick={() => window.print()}
              className="print:hidden px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              🖨️ Print
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400 print:hidden">
            Compact reference card for all x402 agents. Print-friendly.
          </p>

          {/* Stats bar */}
          <div className="flex gap-4 mt-4 text-sm print:mt-2">
            <span className="text-green-600 dark:text-green-400">● {liveCount} Live</span>
            <span className="text-yellow-600 dark:text-yellow-400">◐ {buildingCount} Building</span>
            <span className="text-gray-500">○ {offlineCount} Offline</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600 dark:text-gray-400">{agents.length} Total Agents</span>
          </div>
        </div>

        {/* Filters - hidden when printing */}
        <div className="mb-6 print:hidden flex flex-wrap gap-4 items-center">
          {/* Search */}
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm w-48"
          />

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm"
          >
            <option value="all">All Status</option>
            <option value="live">🟢 Live Only</option>
            <option value="building">🟡 Building</option>
            <option value="offline">⚪ Offline</option>
          </select>

          {/* Category filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm"
          >
            <option value="category">Sort by Category</option>
            <option value="name">Sort by Name</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>

        {/* Legend */}
        <div className="mb-4 text-xs text-gray-500 dark:text-gray-400 print:mb-2">
          <strong>Legend:</strong> ● Live | ◐ Building | ○ Offline | RPM = Requests/Min | RPH = Requests/Hr
        </div>

        {/* Agent Table */}
        {sortBy === 'category' && groupedAgents ? (
          // Grouped by category
          Object.entries(groupedAgents).map(([category, categoryAgents]) => (
            <div key={category} className="mb-6 print:mb-3 print:break-inside-avoid">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 border-b border-gray-200 dark:border-gray-700 pb-1 print:text-base">
                {category} ({categoryAgents.length})
              </h2>
              <table className="w-full text-sm print:text-xs">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400">
                    <th className="py-1 pr-2 w-8"></th>
                    <th className="py-1 pr-4">Agent</th>
                    <th className="py-1 pr-4 hidden sm:table-cell">Source</th>
                    <th className="py-1 pr-4 hidden md:table-cell">Rate Limit</th>
                    <th className="py-1 hidden lg:table-cell">Features</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryAgents.map(agent => (
                    <tr
                      key={agent.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 print:hover:bg-transparent"
                    >
                      <td className="py-1.5 pr-2">{getStatusBadge(agent.status)}</td>
                      <td className="py-1.5 pr-4">
                        <Link
                          href={`/agents/${agent.id}`}
                          className="font-medium text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 print:text-black print:no-underline"
                        >
                          <span className="mr-1">{agent.icon}</span>
                          {agent.name}
                        </Link>
                      </td>
                      <td className="py-1.5 pr-4 text-gray-600 dark:text-gray-400 hidden sm:table-cell text-xs">
                        {agent.apiSource}
                      </td>
                      <td className="py-1.5 pr-4 text-gray-500 dark:text-gray-500 hidden md:table-cell font-mono text-xs">
                        {getRateLimit(agent)}
                      </td>
                      <td className="py-1.5 text-gray-500 dark:text-gray-500 hidden lg:table-cell text-xs truncate max-w-xs">
                        {agent.features.slice(0, 3).join(' • ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        ) : (
          // Flat list
          <table className="w-full text-sm print:text-xs">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="py-2 pr-2 w-8"></th>
                <th className="py-2 pr-4">Agent</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4 hidden sm:table-cell">Source</th>
                <th className="py-2 pr-4 hidden md:table-cell">Rate Limit</th>
                <th className="py-2 hidden lg:table-cell">Features</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents.map(agent => (
                <tr
                  key={agent.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                >
                  <td className="py-1.5 pr-2">{getStatusBadge(agent.status)}</td>
                  <td className="py-1.5 pr-4">
                    <Link
                      href={`/agents/${agent.id}`}
                      className="font-medium text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400"
                    >
                      <span className="mr-1">{agent.icon}</span>
                      {agent.name}
                    </Link>
                  </td>
                  <td className="py-1.5 pr-4 text-gray-600 dark:text-gray-400 text-xs">
                    {agent.category}
                  </td>
                  <td className="py-1.5 pr-4 text-gray-600 dark:text-gray-400 hidden sm:table-cell text-xs">
                    {agent.apiSource}
                  </td>
                  <td className="py-1.5 pr-4 text-gray-500 dark:text-gray-500 hidden md:table-cell font-mono text-xs">
                    {getRateLimit(agent)}
                  </td>
                  <td className="py-1.5 text-gray-500 dark:text-gray-500 hidden lg:table-cell text-xs truncate max-w-xs">
                    {agent.features.slice(0, 3).join(' • ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {filteredAgents.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No agents match your filters.
          </div>
        )}

        {/* Footer info - print only */}
        <div className="hidden print:block mt-8 pt-4 border-t border-gray-300 text-xs text-gray-500">
          <p>langoustine69.dev • x402 Micropayment Agents • Generated {new Date().toLocaleDateString()}</p>
          <p className="mt-1">
            Base URL Pattern: <code className="font-mono">https://&#123;agent-id&#125;-production.up.railway.app</code>
          </p>
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
