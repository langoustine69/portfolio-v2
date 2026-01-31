'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  generateAgentAnalytics, 
  getPortfolioStats, 
  formatUSDC, 
  formatNumber,
  type AgentAnalytics 
} from '@/lib/mockAnalytics';

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

function StatCard({ label, value, subValue, icon, trend, trendValue }: StatCardProps) {
  return (
    <div className="bg-shell-900/50 dark:bg-shell-900/50 light:bg-white border border-shell-800 dark:border-shell-800 light:border-shell-200 rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-shell-400 dark:text-shell-400 light:text-shell-500 text-sm">{label}</p>
          <p className="text-2xl font-bold text-shell-100 dark:text-shell-100 light:text-shell-900 mt-1">{value}</p>
          {subValue && (
            <p className="text-shell-500 dark:text-shell-500 light:text-shell-600 text-sm mt-1">{subValue}</p>
          )}
          {trend && trendValue && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              trend === 'up' ? 'text-green-400' : 
              trend === 'down' ? 'text-red-400' : 'text-shell-400'
            }`}>
              {trend === 'up' && <span>↑</span>}
              {trend === 'down' && <span>↓</span>}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

function MiniBarChart({ data, maxHeight = 40 }: { data: number[]; maxHeight?: number }) {
  const max = Math.max(...data);
  
  return (
    <div className="flex items-end gap-1 h-10">
      {data.map((value, i) => (
        <div
          key={i}
          className="flex-1 bg-lobster-500/60 rounded-t min-w-[4px] transition-all hover:bg-lobster-400"
          style={{ height: `${(value / max) * maxHeight}px` }}
          title={`Day ${i + 1}: ${value} requests`}
        />
      ))}
    </div>
  );
}

function AgentRow({ agent, rank }: { agent: AgentAnalytics; rank: number }) {
  return (
    <tr className="border-b border-shell-800 dark:border-shell-800 light:border-shell-200 hover:bg-shell-800/30 dark:hover:bg-shell-800/30 light:hover:bg-shell-100/50 transition-colors">
      <td className="py-4 px-4">
        <span className="text-shell-500 dark:text-shell-500 light:text-shell-400 font-mono text-sm">#{rank}</span>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">{agent.icon}</span>
          <span className="font-medium text-shell-100 dark:text-shell-100 light:text-shell-900">{agent.name}</span>
        </div>
      </td>
      <td className="py-4 px-4 text-right">
        <span className="font-mono text-shell-100 dark:text-shell-100 light:text-shell-900">{formatNumber(agent.totalRequests)}</span>
      </td>
      <td className="py-4 px-4 text-right">
        <span className="font-mono text-green-400">{formatUSDC(agent.revenue)}</span>
      </td>
      <td className="py-4 px-4 text-right">
        <span className="font-mono text-shell-300 dark:text-shell-300 light:text-shell-600">{agent.avgLatency}ms</span>
      </td>
      <td className="py-4 px-4 text-right">
        <span className={`font-mono ${agent.uptime >= 99.5 ? 'text-green-400' : agent.uptime >= 98 ? 'text-yellow-400' : 'text-red-400'}`}>
          {agent.uptime.toFixed(1)}%
        </span>
      </td>
      <td className="py-4 px-4">
        <MiniBarChart data={agent.dailyRequests} />
      </td>
    </tr>
  );
}

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');
  const stats = getPortfolioStats();
  const agentAnalytics = generateAgentAnalytics();
  
  // Calculate top performer
  const topAgent = agentAnalytics[0];
  
  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex items-center gap-2">
        {(['7d', '30d', 'all'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === range
                ? 'bg-lobster-600 text-white'
                : 'bg-shell-800 dark:bg-shell-800 light:bg-shell-100 text-shell-300 dark:text-shell-300 light:text-shell-600 hover:bg-shell-700 dark:hover:bg-shell-700 light:hover:bg-shell-200'
            }`}
          >
            {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'All Time'}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total API Requests"
          value={formatNumber(stats.totalRequests)}
          subValue={`${formatNumber(stats.requestsToday)} today`}
          icon="📈"
          trend="up"
          trendValue="+12.5% this week"
        />
        <StatCard
          label="Total Revenue"
          value={formatUSDC(stats.totalRevenue)}
          subValue={`${formatUSDC(stats.revenueToday)} today`}
          icon="💰"
          trend="up"
          trendValue="+8.3% this week"
        />
        <StatCard
          label="Avg Latency"
          value={`${stats.avgLatency}ms`}
          subValue="p95 response time"
          icon="⚡"
          trend="down"
          trendValue="-5ms from last week"
        />
        <StatCard
          label="Uptime"
          value={`${stats.avgUptime.toFixed(2)}%`}
          subValue={`${stats.liveAgents} agents live`}
          icon="🟢"
          trend="neutral"
          trendValue="Stable"
        />
      </div>

      {/* Top Performer Highlight */}
      {topAgent && (
        <div className="bg-gradient-to-r from-lobster-500/10 to-lobster-600/5 border border-lobster-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{topAgent.icon}</div>
              <div>
                <p className="text-shell-400 dark:text-shell-400 light:text-shell-500 text-sm">Top Performing Agent</p>
                <p className="text-xl font-bold text-shell-100 dark:text-shell-100 light:text-shell-900">{topAgent.name}</p>
                <p className="text-lobster-400 text-sm mt-1">
                  {formatNumber(topAgent.totalRequests)} requests · {formatUSDC(topAgent.revenue)} revenue
                </p>
              </div>
            </div>
            <div className="hidden md:block">
              <MiniBarChart data={topAgent.dailyRequests} maxHeight={60} />
              <p className="text-shell-500 text-xs mt-2 text-center">Last 7 days</p>
            </div>
          </div>
        </div>
      )}

      {/* Agent Table */}
      <div className="bg-shell-900/30 dark:bg-shell-900/30 light:bg-white border border-shell-800 dark:border-shell-800 light:border-shell-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-shell-800 dark:border-shell-800 light:border-shell-200">
          <h3 className="text-lg font-semibold text-shell-100 dark:text-shell-100 light:text-shell-900">Agent Performance</h3>
          <p className="text-shell-400 dark:text-shell-400 light:text-shell-500 text-sm">Detailed metrics for all live agents</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-shell-800/50 dark:bg-shell-800/50 light:bg-shell-100/50">
                <th className="py-3 px-4 text-left text-xs font-medium text-shell-400 dark:text-shell-400 light:text-shell-500 uppercase tracking-wider">Rank</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-shell-400 dark:text-shell-400 light:text-shell-500 uppercase tracking-wider">Agent</th>
                <th className="py-3 px-4 text-right text-xs font-medium text-shell-400 dark:text-shell-400 light:text-shell-500 uppercase tracking-wider">Requests</th>
                <th className="py-3 px-4 text-right text-xs font-medium text-shell-400 dark:text-shell-400 light:text-shell-500 uppercase tracking-wider">Revenue</th>
                <th className="py-3 px-4 text-right text-xs font-medium text-shell-400 dark:text-shell-400 light:text-shell-500 uppercase tracking-wider">Latency</th>
                <th className="py-3 px-4 text-right text-xs font-medium text-shell-400 dark:text-shell-400 light:text-shell-500 uppercase tracking-wider">Uptime</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-shell-400 dark:text-shell-400 light:text-shell-500 uppercase tracking-wider">7-Day Trend</th>
              </tr>
            </thead>
            <tbody>
              {agentAnalytics.map((agent, index) => (
                <AgentRow key={agent.id} agent={agent} rank={index + 1} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center py-4">
        <p className="text-shell-500 dark:text-shell-500 light:text-shell-400 text-sm">
          💡 Data is simulated for demonstration. Real analytics coming with x402 payment tracking.
        </p>
        <Link
          href="/agents"
          className="inline-block mt-3 text-lobster-400 hover:text-lobster-300 text-sm transition-colors"
        >
          Explore all agents →
        </Link>
      </div>
    </div>
  );
}
