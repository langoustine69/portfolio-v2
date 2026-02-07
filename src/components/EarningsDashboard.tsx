'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { agents, getLiveAgents, type Agent } from '@/data/agents';

type TimeRange = '7d' | '30d' | '90d' | 'all';
type SortBy = 'revenue' | 'transactions' | 'avgPayment';

interface AgentEarnings {
  agentId: string;
  totalRevenue: number;      // in USD
  transactions: number;
  avgPayment: number;
  dailyRevenue: number[];    // Last N days
  growth: number;            // % change
}

interface DailyTotal {
  date: string;
  revenue: number;
  transactions: number;
}

// Generate consistent simulated earnings based on agent id
function getAgentEarnings(agent: Agent, days: number): AgentEarnings {
  const hash = agent.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = (hash % 100) / 100;
  
  // Only live agents earn
  if (agent.status !== 'live') {
    return {
      agentId: agent.id,
      totalRevenue: 0,
      transactions: 0,
      avgPayment: 0,
      dailyRevenue: Array(days).fill(0),
      growth: 0,
    };
  }
  
  // Base metrics influenced by features and changelog
  const featureBonus = agent.features.length * 0.5;
  const changelogBonus = (agent.changelog?.length || 0) * 2;
  const baseDaily = 5 + seed * 25 + featureBonus + changelogBonus;
  
  // Generate daily revenue with some variance
  const dailyRevenue = Array.from({ length: days }, (_, i) => {
    const dayVariance = Math.sin((hash + i) * 0.5) * 0.3 + 1;
    const trendMultiplier = 1 + (i / days) * 0.2; // Slight upward trend
    return Math.max(0, baseDaily * dayVariance * trendMultiplier);
  });
  
  const totalRevenue = dailyRevenue.reduce((a, b) => a + b, 0);
  const baseTransactions = Math.floor(totalRevenue / (0.01 + seed * 0.04)); // $0.01-$0.05 per tx
  const avgPayment = baseTransactions > 0 ? totalRevenue / baseTransactions : 0;
  
  // Calculate growth (compare last half vs first half)
  const midpoint = Math.floor(days / 2);
  const firstHalf = dailyRevenue.slice(0, midpoint).reduce((a, b) => a + b, 0);
  const secondHalf = dailyRevenue.slice(midpoint).reduce((a, b) => a + b, 0);
  const growth = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;
  
  return {
    agentId: agent.id,
    totalRevenue,
    transactions: baseTransactions,
    avgPayment,
    dailyRevenue,
    growth,
  };
}

function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`;
  }
  return `$${value.toFixed(2)}`;
}

function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toLocaleString();
}

// Simple ASCII-style chart bars
function MiniChart({ data, maxHeight = 32 }: { data: number[], maxHeight?: number }) {
  const max = Math.max(...data, 1);
  const normalizedData = data.map(v => (v / max) * maxHeight);
  
  return (
    <div className="flex items-end gap-px h-8">
      {normalizedData.slice(-14).map((height, i) => (
        <div
          key={i}
          className="w-1.5 bg-gradient-to-t from-emerald-500 to-emerald-400 dark:from-emerald-600 dark:to-emerald-400 rounded-t-sm transition-all hover:from-emerald-400 hover:to-emerald-300"
          style={{ height: `${Math.max(2, height)}px` }}
          title={`$${data[data.length - 14 + i]?.toFixed(2) || '0'}`}
        />
      ))}
    </div>
  );
}

// Larger time series chart
function RevenueChart({ data, labels }: { data: number[], labels: string[] }) {
  const max = Math.max(...data, 1);
  const chartHeight = 120;
  
  return (
    <div className="relative">
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-zinc-500">
        <span>{formatCurrency(max)}</span>
        <span>{formatCurrency(max / 2)}</span>
        <span>$0</span>
      </div>
      
      {/* Chart area */}
      <div className="ml-14">
        <div className="flex items-end gap-1 border-b border-l border-zinc-200 dark:border-zinc-700 pl-2 pb-1" style={{ height: chartHeight }}>
          {data.map((value, i) => {
            const height = (value / max) * (chartHeight - 20);
            return (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full max-w-8 bg-gradient-to-t from-emerald-500 to-emerald-400 dark:from-emerald-600 dark:to-emerald-400 rounded-t transition-all hover:from-emerald-400 hover:to-emerald-300 cursor-pointer group relative"
                  style={{ height: `${Math.max(2, height)}px` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {formatCurrency(value)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* X-axis labels */}
        <div className="flex justify-between text-xs text-zinc-500 mt-1 px-1">
          {labels.filter((_, i) => i % Math.ceil(labels.length / 7) === 0).map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function GrowthBadge({ growth }: { growth: number }) {
  if (growth > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        {growth.toFixed(1)}%
      </span>
    );
  }
  if (growth < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-600 dark:text-red-400">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
        {Math.abs(growth).toFixed(1)}%
      </span>
    );
  }
  return <span className="text-xs text-zinc-500">—</span>;
}

export default function EarningsDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [sortBy, setSortBy] = useState<SortBy>('revenue');
  
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
  
  const { earnings, totals, dailyTotals } = useMemo(() => {
    const allEarnings = agents.map(agent => ({
      agent,
      earnings: getAgentEarnings(agent, days),
    }));
    
    // Calculate totals
    const totalRevenue = allEarnings.reduce((sum, e) => sum + e.earnings.totalRevenue, 0);
    const totalTransactions = allEarnings.reduce((sum, e) => sum + e.earnings.transactions, 0);
    const liveAgents = agents.filter(a => a.status === 'live').length;
    
    // Aggregate daily totals
    const dailyTotals: DailyTotal[] = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: allEarnings.reduce((sum, e) => sum + (e.earnings.dailyRevenue[i] || 0), 0),
        transactions: Math.floor(allEarnings.reduce((sum, e) => sum + (e.earnings.dailyRevenue[i] || 0), 0) / 0.025),
      };
    });
    
    // Sort agents
    const sortedEarnings = [...allEarnings].sort((a, b) => {
      switch (sortBy) {
        case 'revenue':
          return b.earnings.totalRevenue - a.earnings.totalRevenue;
        case 'transactions':
          return b.earnings.transactions - a.earnings.transactions;
        case 'avgPayment':
          return b.earnings.avgPayment - a.earnings.avgPayment;
        default:
          return 0;
      }
    });
    
    return {
      earnings: sortedEarnings,
      totals: { totalRevenue, totalTransactions, liveAgents },
      dailyTotals,
    };
  }, [days, sortBy]);
  
  const chartLabels = dailyTotals.map(d => d.date);
  const chartData = dailyTotals.map(d => d.revenue);
  
  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="text-emerald-100 text-sm font-medium">Total Revenue</div>
          <div className="text-3xl font-bold mt-1">{formatCurrency(totals.totalRevenue)}</div>
          <div className="text-emerald-200 text-xs mt-2">
            {timeRange === '7d' ? 'Last 7 days' : timeRange === '30d' ? 'Last 30 days' : timeRange === '90d' ? 'Last 90 days' : 'All time'}
          </div>
        </div>
        
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
          <div className="text-zinc-500 text-sm font-medium">Transactions</div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-white mt-1">{formatNumber(totals.totalTransactions)}</div>
          <div className="text-zinc-400 text-xs mt-2">x402 payments processed</div>
        </div>
        
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
          <div className="text-zinc-500 text-sm font-medium">Avg Payment</div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-white mt-1">
            ${totals.totalTransactions > 0 ? (totals.totalRevenue / totals.totalTransactions).toFixed(3) : '0.00'}
          </div>
          <div className="text-zinc-400 text-xs mt-2">Per request</div>
        </div>
        
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
          <div className="text-zinc-500 text-sm font-medium">Active Agents</div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-white mt-1">{totals.liveAgents}</div>
          <div className="text-zinc-400 text-xs mt-2">Generating revenue</div>
        </div>
      </div>
      
      {/* Time Series Chart */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Revenue Over Time</h3>
          <div className="flex gap-2">
            {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  timeRange === range
                    ? 'bg-emerald-500 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                }`}
              >
                {range === 'all' ? 'All' : range}
              </button>
            ))}
          </div>
        </div>
        
        <RevenueChart data={chartData.slice(-Math.min(30, chartData.length))} labels={chartLabels.slice(-Math.min(30, chartLabels.length))} />
      </div>
      
      {/* Agent Earnings Table */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Earnings by Agent</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-3 py-1.5 text-sm rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white border-0 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="revenue">Sort by Revenue</option>
              <option value="transactions">Sort by Transactions</option>
              <option value="avgPayment">Sort by Avg Payment</option>
            </select>
          </div>
        </div>
        
        <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {earnings.filter(e => e.earnings.totalRevenue > 0).map(({ agent, earnings: e }, rank) => (
            <Link
              key={agent.id}
              href={`/agents/${agent.id}`}
              className="flex items-center gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
            >
              {/* Rank */}
              <div className="w-8 text-center">
                {rank < 3 ? (
                  <span className="text-lg">{['🥇', '🥈', '🥉'][rank]}</span>
                ) : (
                  <span className="text-sm text-zinc-500">#{rank + 1}</span>
                )}
              </div>
              
              {/* Agent Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{agent.icon}</span>
                  <span className="font-medium text-zinc-900 dark:text-white truncate">{agent.name}</span>
                  <span className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-700 px-2 py-0.5 rounded">
                    {agent.category}
                  </span>
                </div>
              </div>
              
              {/* Mini Chart */}
              <div className="hidden md:block w-24">
                <MiniChart data={e.dailyRevenue} />
              </div>
              
              {/* Growth */}
              <div className="w-16 text-right">
                <GrowthBadge growth={e.growth} />
              </div>
              
              {/* Transactions */}
              <div className="w-20 text-right hidden sm:block">
                <div className="text-sm font-medium text-zinc-900 dark:text-white">{formatNumber(e.transactions)}</div>
                <div className="text-xs text-zinc-500">txns</div>
              </div>
              
              {/* Revenue */}
              <div className="w-24 text-right">
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(e.totalRevenue)}</div>
                <div className="text-xs text-zinc-500">{formatCurrency(e.avgPayment)}/req</div>
              </div>
            </Link>
          ))}
        </div>
        
        {earnings.filter(e => e.earnings.totalRevenue > 0).length === 0 && (
          <div className="p-8 text-center text-zinc-500">
            <p>No earnings data yet. Deploy live agents to start earning!</p>
          </div>
        )}
      </div>
      
      {/* $DREAMS Progress */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">$DREAMS Progress</h3>
            <p className="text-white/80 text-sm mt-1">Goal: 1M $DREAMS</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{formatNumber(Math.floor(totals.totalRevenue * 42.69))}</div>
            <div className="text-white/80 text-xs">~{((totals.totalRevenue * 42.69 / 1000000) * 100).toFixed(2)}% complete</div>
          </div>
        </div>
        <div className="mt-4 h-3 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(100, (totals.totalRevenue * 42.69 / 1000000) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
