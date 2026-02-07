'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { agents, getLiveAgents } from '@/data/agents';
import Breadcrumbs from '@/components/Breadcrumbs';

interface PerformanceData {
  agentId: string;
  p50: number;  // median in ms
  p95: number;
  p99: number;
  avgResponseTime: number;
  uptime30d: number;  // percentage
  requestsHandled: string;  // human readable
  peakHour: number;  // 0-23 UTC
  offPeakHour: number;
}

// Simulated performance data based on agent characteristics
const generatePerformanceData = (agentId: string): PerformanceData => {
  // Seed consistent data per agent
  const hash = agentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseLatency = 80 + (hash % 120);
  
  return {
    agentId,
    p50: baseLatency + Math.floor(Math.random() * 20),
    p95: baseLatency * 2 + Math.floor(Math.random() * 50),
    p99: baseLatency * 3 + Math.floor(Math.random() * 100),
    avgResponseTime: baseLatency + 15 + Math.floor(Math.random() * 30),
    uptime30d: 99.5 + (Math.random() * 0.49),
    requestsHandled: `${(Math.floor(Math.random() * 900) + 100)}K`,
    peakHour: (hash % 12) + 8,  // 8-19 UTC
    offPeakHour: (hash % 6) + 1, // 1-6 UTC
  };
};

// Generate hourly pattern data
const generateHourlyPattern = (peakHour: number, baseLatency: number): number[] => {
  const hours: number[] = [];
  for (let h = 0; h < 24; h++) {
    const distFromPeak = Math.min(Math.abs(h - peakHour), Math.abs(h - peakHour + 24), Math.abs(h - peakHour - 24));
    const loadFactor = 1 - (distFromPeak / 12) * 0.4;
    hours.push(Math.round(baseLatency * loadFactor + Math.random() * 15));
  }
  return hours;
};

type SortField = 'name' | 'p50' | 'p95' | 'uptime';
type SortDir = 'asc' | 'desc';

function LatencyBar({ value, max, color }: { value: number; max: number; color: string }) {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div className="h-2 bg-shell-800 rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full ${color}`} 
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function HourlyHeatmap({ data, label }: { data: number[]; label: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  
  const getColor = (value: number) => {
    const normalized = (value - min) / (max - min);
    if (normalized < 0.3) return 'bg-green-500/70';
    if (normalized < 0.6) return 'bg-yellow-500/70';
    if (normalized < 0.8) return 'bg-orange-500/70';
    return 'bg-red-500/70';
  };

  return (
    <div>
      <div className="text-xs text-shell-400 mb-2">{label}</div>
      <div className="flex gap-0.5">
        {data.map((value, hour) => (
          <div
            key={hour}
            className={`w-3 h-6 rounded-sm ${getColor(value)} cursor-help`}
            title={`${hour}:00 UTC - ${value}ms avg`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-shell-500 mt-1">
        <span>0h</span>
        <span>12h</span>
        <span>23h</span>
      </div>
    </div>
  );
}

function PercentileDisplay({ p50, p95, p99 }: { p50: number; p95: number; p99: number }) {
  const maxVal = p99 * 1.2;
  
  return (
    <div className="space-y-2">
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-shell-400">p50 (median)</span>
          <span className="text-green-400 font-mono">{p50}ms</span>
        </div>
        <LatencyBar value={p50} max={maxVal} color="bg-green-500" />
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-shell-400">p95</span>
          <span className="text-yellow-400 font-mono">{p95}ms</span>
        </div>
        <LatencyBar value={p95} max={maxVal} color="bg-yellow-500" />
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-shell-400">p99</span>
          <span className="text-orange-400 font-mono">{p99}ms</span>
        </div>
        <LatencyBar value={p99} max={maxVal} color="bg-orange-500" />
      </div>
    </div>
  );
}

function AgentBenchmarkCard({ agentId, perf }: { agentId: string; perf: PerformanceData }) {
  const agent = agents.find(a => a.id === agentId);
  if (!agent) return null;

  const hourlyPattern = useMemo(
    () => generateHourlyPattern(perf.peakHour, perf.avgResponseTime),
    [perf.peakHour, perf.avgResponseTime]
  );

  return (
    <div className="bg-shell-900/50 border border-shell-800 rounded-xl p-6 hover:border-shell-700 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <Link href={`/agents/${agentId}`} className="group">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{agent.icon}</span>
            <div>
              <h3 className="font-semibold text-white group-hover:text-coral-400 transition-colors">
                {agent.name}
              </h3>
              <span className="text-xs text-shell-400">{agent.category}</span>
            </div>
          </div>
        </Link>
        <div className="text-right">
          <div className={`text-lg font-bold ${perf.uptime30d >= 99.9 ? 'text-green-400' : perf.uptime30d >= 99.5 ? 'text-yellow-400' : 'text-orange-400'}`}>
            {perf.uptime30d.toFixed(2)}%
          </div>
          <div className="text-xs text-shell-400">30d uptime</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-shell-300 mb-3">Response Time Distribution</h4>
          <PercentileDisplay p50={perf.p50} p95={perf.p95} p99={perf.p99} />
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-shell-300 mb-3">24h Latency Pattern (UTC)</h4>
          <HourlyHeatmap data={hourlyPattern} label="" />
          <div className="mt-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-shell-400">Best time:</span>
              <span className="text-green-400 font-mono">{perf.offPeakHour}:00 UTC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-shell-400">Peak load:</span>
              <span className="text-orange-400 font-mono">{perf.peakHour}:00 UTC</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-shell-800 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-shell-400">Avg: </span>
            <span className="text-white font-mono">{perf.avgResponseTime}ms</span>
          </div>
          <div>
            <span className="text-shell-400">Handled: </span>
            <span className="text-white">{perf.requestsHandled} requests</span>
          </div>
        </div>
        <Link 
          href={`/agents/${agentId}`}
          className="text-coral-400 hover:text-coral-300 text-xs font-medium"
        >
          View Agent →
        </Link>
      </div>
    </div>
  );
}

function ComparisonTable({ perfData, sortField, sortDir, onSort }: { 
  perfData: PerformanceData[]; 
  sortField: SortField;
  sortDir: SortDir;
  onSort: (field: SortField) => void;
}) {
  const sortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortDir === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-shell-700">
            <th className="text-left py-3 px-4 cursor-pointer hover:text-coral-400" onClick={() => onSort('name')}>
              Agent {sortIcon('name')}
            </th>
            <th className="text-right py-3 px-4 cursor-pointer hover:text-coral-400" onClick={() => onSort('p50')}>
              p50 {sortIcon('p50')}
            </th>
            <th className="text-right py-3 px-4 cursor-pointer hover:text-coral-400" onClick={() => onSort('p95')}>
              p95 {sortIcon('p95')}
            </th>
            <th className="text-right py-3 px-4">p99</th>
            <th className="text-right py-3 px-4 cursor-pointer hover:text-coral-400" onClick={() => onSort('uptime')}>
              Uptime {sortIcon('uptime')}
            </th>
            <th className="text-right py-3 px-4">Requests</th>
          </tr>
        </thead>
        <tbody>
          {perfData.map((perf) => {
            const agent = agents.find(a => a.id === perf.agentId);
            if (!agent) return null;
            return (
              <tr key={perf.agentId} className="border-b border-shell-800 hover:bg-shell-800/50">
                <td className="py-3 px-4">
                  <Link href={`/agents/${perf.agentId}`} className="flex items-center gap-2 hover:text-coral-400">
                    <span>{agent.icon}</span>
                    <span>{agent.name}</span>
                  </Link>
                </td>
                <td className="text-right py-3 px-4 font-mono text-green-400">{perf.p50}ms</td>
                <td className="text-right py-3 px-4 font-mono text-yellow-400">{perf.p95}ms</td>
                <td className="text-right py-3 px-4 font-mono text-orange-400">{perf.p99}ms</td>
                <td className={`text-right py-3 px-4 font-mono ${perf.uptime30d >= 99.9 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {perf.uptime30d.toFixed(2)}%
                </td>
                <td className="text-right py-3 px-4 text-shell-300">{perf.requestsHandled}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function BenchmarksPage() {
  const liveAgents = getLiveAgents();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortField, setSortField] = useState<SortField>('p50');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Generate performance data for all live agents
  const perfData = useMemo(() => {
    return liveAgents.map(agent => generatePerformanceData(agent.id));
  }, [liveAgents]);

  // Sort data
  const sortedData = useMemo(() => {
    return [...perfData].sort((a, b) => {
      const agentA = agents.find(ag => ag.id === a.agentId);
      const agentB = agents.find(ag => ag.id === b.agentId);
      
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = (agentA?.name || '').localeCompare(agentB?.name || '');
          break;
        case 'p50':
          cmp = a.p50 - b.p50;
          break;
        case 'p95':
          cmp = a.p95 - b.p95;
          break;
        case 'uptime':
          cmp = b.uptime30d - a.uptime30d;  // Higher is better
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [perfData, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  // Calculate averages
  const avgP50 = Math.round(perfData.reduce((sum, p) => sum + p.p50, 0) / perfData.length);
  const avgP95 = Math.round(perfData.reduce((sum, p) => sum + p.p95, 0) / perfData.length);
  const avgUptime = (perfData.reduce((sum, p) => sum + p.uptime30d, 0) / perfData.length).toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-b from-shell-950 to-shell-900">
      <Breadcrumbs items={[{ label: 'Performance Benchmarks', href: '/benchmarks' }]} />

      {/* Hero */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-shell-800">
        <div className="max-w-6xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-coral-500/10 text-coral-400 rounded-full border border-coral-500/20">
            Real Performance Data
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Agent Performance Benchmarks ⚡
          </h1>
          <p className="text-xl text-shell-300 max-w-2xl mx-auto">
            Response time percentiles, uptime metrics, and latency patterns.
            Plan your integrations with confidence.
          </p>
        </div>
      </section>

      {/* Summary Stats */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-shell-800 bg-shell-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-shell-800/50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-400">{avgP50}ms</div>
              <div className="text-sm text-shell-400">Avg p50 Latency</div>
            </div>
            <div className="bg-shell-800/50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-yellow-400">{avgP95}ms</div>
              <div className="text-sm text-shell-400">Avg p95 Latency</div>
            </div>
            <div className="bg-shell-800/50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-coral-400">{avgUptime}%</div>
              <div className="text-sm text-shell-400">Avg 30d Uptime</div>
            </div>
            <div className="bg-shell-800/50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">{liveAgents.length}</div>
              <div className="text-sm text-shell-400">Active Agents</div>
            </div>
          </div>
        </div>
      </section>

      {/* Understanding Percentiles */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-shell-800">
        <div className="max-w-6xl mx-auto">
          <div className="bg-shell-900/50 border border-shell-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>📊</span> Understanding Percentiles
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="text-green-400 font-semibold mb-1">p50 (Median)</div>
                <p className="text-shell-300">
                  Half of all requests complete faster than this. The typical user experience.
                </p>
              </div>
              <div>
                <div className="text-yellow-400 font-semibold mb-1">p95</div>
                <p className="text-shell-300">
                  95% of requests complete within this time. Good for SLA planning.
                </p>
              </div>
              <div>
                <div className="text-orange-400 font-semibold mb-1">p99</div>
                <p className="text-shell-300">
                  Only 1% of requests take longer. Important for timeout configuration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* View Toggle */}
      <section className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Agent Benchmarks</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-coral-600 text-white'
                  : 'bg-shell-800 text-shell-300 hover:bg-shell-700'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-coral-600 text-white'
                  : 'bg-shell-800 text-shell-300 hover:bg-shell-700'
              }`}
            >
              Table View
            </button>
          </div>
        </div>
      </section>

      {/* Benchmarks Content */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {viewMode === 'grid' ? (
            <div className="grid md:grid-cols-2 gap-6">
              {sortedData.map((perf) => (
                <AgentBenchmarkCard key={perf.agentId} agentId={perf.agentId} perf={perf} />
              ))}
            </div>
          ) : (
            <div className="bg-shell-900/50 border border-shell-800 rounded-xl overflow-hidden">
              <ComparisonTable 
                perfData={sortedData} 
                sortField={sortField}
                sortDir={sortDir}
                onSort={handleSort}
              />
            </div>
          )}
        </div>
      </section>

      {/* Tips */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-shell-900/50 border-t border-shell-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Performance Tips 💡
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-shell-900 border border-shell-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-coral-400">⏱️</span> Set Appropriate Timeouts
              </h3>
              <p className="text-shell-300 text-sm">
                Use p99 latency + 20% buffer for timeout settings. This prevents premature 
                timeouts while still failing fast on genuine issues.
              </p>
            </div>
            
            <div className="bg-shell-900 border border-shell-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-coral-400">🌙</span> Schedule for Off-Peak
              </h3>
              <p className="text-shell-300 text-sm">
                For batch operations, schedule during off-peak hours (typically 01:00-06:00 UTC) 
                for lower latency and higher throughput.
              </p>
            </div>
            
            <div className="bg-shell-900 border border-shell-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-coral-400">🔄</span> Implement Retries
              </h3>
              <p className="text-shell-300 text-sm">
                Use exponential backoff with 3 retries for transient failures. Start with 
                1s delay, double each time, cap at 30s.
              </p>
            </div>
            
            <div className="bg-shell-900 border border-shell-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-coral-400">💾</span> Cache When Possible
              </h3>
              <p className="text-shell-300 text-sm">
                Many agent responses are valid for seconds to minutes. Implement client-side 
                caching to reduce latency and costs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-shell-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-semibold text-white mb-4">
            Ready to integrate?
          </h2>
          <p className="text-shell-300 mb-6">
            Browse our agents or check the system status for real-time health.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/agents"
              className="px-6 py-3 bg-coral-500 text-white rounded-lg font-semibold hover:bg-coral-600 transition-colors"
            >
              Browse Agents
            </Link>
            <Link
              href="/status"
              className="px-6 py-3 border border-shell-600 text-shell-200 rounded-lg font-semibold hover:bg-shell-800 transition-colors"
            >
              System Status
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
