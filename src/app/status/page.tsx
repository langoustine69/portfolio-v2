'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { agents, categories, Agent } from '@/data/agents';
import Breadcrumbs from '@/components/Breadcrumbs';

type HealthStatus = 'checking' | 'healthy' | 'unhealthy' | 'unknown';

interface AgentHealth {
  id: string;
  status: HealthStatus;
  responseTime: number | null;
  lastChecked: Date | null;
}

const statusConfig: Record<HealthStatus, { color: string; bgColor: string; label: string }> = {
  checking: { color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', label: 'Checking' },
  healthy: { color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', label: 'Operational' },
  unhealthy: { color: 'text-red-400', bgColor: 'bg-red-500/20', label: 'Down' },
  unknown: { color: 'text-shell-400', bgColor: 'bg-shell-500/20', label: 'Unknown' },
};

export default function StatusPage() {
  const [healthData, setHealthData] = useState<Map<string, AgentHealth>>(new Map());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const liveAgents = useMemo(() => agents.filter(a => a.status === 'live'), []);

  const checkAgentHealth = useCallback(async (agent: Agent): Promise<AgentHealth> => {
    if (!agent.railwayUrl || agent.status !== 'live') {
      return {
        id: agent.id,
        status: 'unknown',
        responseTime: null,
        lastChecked: new Date(),
      };
    }

    const startTime = performance.now();
    try {
      const healthUrl = agent.railwayUrl.replace(/\/$/, '') + '/health';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors',
      });

      clearTimeout(timeoutId);
      const responseTime = Math.round(performance.now() - startTime);

      return {
        id: agent.id,
        status: response.ok ? 'healthy' : 'unhealthy',
        responseTime,
        lastChecked: new Date(),
      };
    } catch {
      // Try fallback with no-cors
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        await fetch(agent.railwayUrl, {
          method: 'HEAD',
          signal: controller.signal,
          mode: 'no-cors',
        });

        clearTimeout(timeoutId);
        const responseTime = Math.round(performance.now() - startTime);

        return {
          id: agent.id,
          status: 'healthy',
          responseTime,
          lastChecked: new Date(),
        };
      } catch {
        return {
          id: agent.id,
          status: 'unhealthy',
          responseTime: null,
          lastChecked: new Date(),
        };
      }
    }
  }, []);

  const checkAllAgents = useCallback(async () => {
    setIsRefreshing(true);
    
    // Initialize all as checking
    const initialState = new Map<string, AgentHealth>();
    liveAgents.forEach(agent => {
      initialState.set(agent.id, {
        id: agent.id,
        status: 'checking',
        responseTime: null,
        lastChecked: null,
      });
    });
    setHealthData(initialState);

    // Check agents in batches of 5 to avoid overwhelming
    const batchSize = 5;
    const newHealthData = new Map<string, AgentHealth>();

    for (let i = 0; i < liveAgents.length; i += batchSize) {
      const batch = liveAgents.slice(i, i + batchSize);
      const results = await Promise.all(batch.map(checkAgentHealth));
      
      results.forEach(result => {
        newHealthData.set(result.id, result);
      });
      
      // Update state incrementally
      setHealthData(new Map(newHealthData));
    }

    setLastRefresh(new Date());
    setIsRefreshing(false);
  }, [liveAgents, checkAgentHealth]);

  useEffect(() => {
    checkAllAgents();
    
    // Refresh every 2 minutes
    const interval = setInterval(checkAllAgents, 120000);
    return () => clearInterval(interval);
  }, [checkAllAgents]);

  // Calculate aggregate stats
  const stats = useMemo(() => {
    let healthy = 0;
    let unhealthy = 0;
    let checking = 0;
    let totalResponseTime = 0;
    let responseCount = 0;

    healthData.forEach(health => {
      if (health.status === 'healthy') {
        healthy++;
        if (health.responseTime) {
          totalResponseTime += health.responseTime;
          responseCount++;
        }
      } else if (health.status === 'unhealthy') {
        unhealthy++;
      } else if (health.status === 'checking') {
        checking++;
      }
    });

    const avgResponseTime = responseCount > 0 ? Math.round(totalResponseTime / responseCount) : null;
    const uptimePercent = liveAgents.length > 0 
      ? Math.round((healthy / liveAgents.length) * 100) 
      : 0;

    return { healthy, unhealthy, checking, avgResponseTime, uptimePercent, total: liveAgents.length };
  }, [healthData, liveAgents]);

  // Filter agents by category
  const filteredAgents = useMemo(() => {
    return selectedCategory === 'all' 
      ? liveAgents 
      : liveAgents.filter(a => a.category === selectedCategory);
  }, [liveAgents, selectedCategory]);

  // Group by category for display
  const agentsByCategory = useMemo(() => {
    const grouped = new Map<string, Agent[]>();
    filteredAgents.forEach(agent => {
      const category = agent.category;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(agent);
    });
    return grouped;
  }, [filteredAgents]);

  // Overall system status
  const overallStatus = useMemo(() => {
    if (stats.checking > 0) return 'checking';
    if (stats.unhealthy === 0 && stats.healthy > 0) return 'operational';
    if (stats.unhealthy > 0 && stats.healthy > stats.unhealthy) return 'degraded';
    if (stats.unhealthy > stats.healthy) return 'outage';
    return 'unknown';
  }, [stats]);

  const overallConfig = {
    operational: { color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', borderColor: 'border-emerald-500/30', label: 'All Systems Operational', icon: '✓' },
    degraded: { color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/30', label: 'Partial Outage', icon: '!' },
    outage: { color: 'text-red-400', bgColor: 'bg-red-500/20', borderColor: 'border-red-500/30', label: 'Major Outage', icon: '✕' },
    checking: { color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/30', label: 'Checking Status...', icon: '↻' },
    unknown: { color: 'text-shell-400', bgColor: 'bg-shell-500/20', borderColor: 'border-shell-500/30', label: 'Status Unknown', icon: '?' },
  };

  const currentOverall = overallConfig[overallStatus];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: 'System Status', href: '/status' }
        ]} />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-shell-100 mb-2">System Status</h1>
            <p className="text-shell-400">
              Real-time health monitoring for all live agents
            </p>
          </div>
          <button
            onClick={checkAllAgents}
            disabled={isRefreshing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isRefreshing 
                ? 'bg-shell-700 text-shell-400 cursor-not-allowed' 
                : 'bg-lobster-600 hover:bg-lobster-500 text-white'
            }`}
          >
            <svg 
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Overall Status Banner */}
        <div className={`${currentOverall.bgColor} ${currentOverall.borderColor} border rounded-xl p-6 mb-8`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full ${currentOverall.bgColor} flex items-center justify-center text-2xl ${currentOverall.color}`}>
              {overallStatus === 'checking' ? (
                <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : currentOverall.icon}
            </div>
            <div>
              <h2 className={`text-xl font-bold ${currentOverall.color}`}>
                {currentOverall.label}
              </h2>
              {lastRefresh && (
                <p className="text-shell-400 text-sm">
                  Last checked: {lastRefresh.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-shell-800/50 border border-shell-700 rounded-xl p-4">
            <div className="text-3xl font-bold text-emerald-400">{stats.healthy}</div>
            <div className="text-shell-400 text-sm">Operational</div>
          </div>
          <div className="bg-shell-800/50 border border-shell-700 rounded-xl p-4">
            <div className="text-3xl font-bold text-red-400">{stats.unhealthy}</div>
            <div className="text-shell-400 text-sm">Down</div>
          </div>
          <div className="bg-shell-800/50 border border-shell-700 rounded-xl p-4">
            <div className="text-3xl font-bold text-lobster-400">{stats.uptimePercent}%</div>
            <div className="text-shell-400 text-sm">Uptime</div>
          </div>
          <div className="bg-shell-800/50 border border-shell-700 rounded-xl p-4">
            <div className="text-3xl font-bold text-shell-200">
              {stats.avgResponseTime ? `${stats.avgResponseTime}ms` : '—'}
            </div>
            <div className="text-shell-400 text-sm">Avg Response</div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-lobster-600 text-white'
                : 'bg-shell-800 text-shell-300 hover:bg-shell-700'
            }`}
          >
            All ({liveAgents.length})
          </button>
          {categories
            .filter(cat => liveAgents.some(a => a.category === cat))
            .map(category => {
              const count = liveAgents.filter(a => a.category === category).length;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-lobster-600 text-white'
                      : 'bg-shell-800 text-shell-300 hover:bg-shell-700'
                  }`}
                >
                  {category} ({count})
                </button>
              );
            })}
        </div>

        {/* Agent List by Category */}
        <div className="space-y-6">
          {Array.from(agentsByCategory.entries()).map(([category, categoryAgents]) => (
            <div key={category} className="bg-shell-800/50 border border-shell-700 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-shell-800 border-b border-shell-700">
                <h3 className="font-semibold text-shell-100">{category}</h3>
              </div>
              <div className="divide-y divide-shell-700/50">
                {categoryAgents.map(agent => {
                  const health = healthData.get(agent.id);
                  const config = health ? statusConfig[health.status] : statusConfig.checking;
                  
                  return (
                    <div 
                      key={agent.id}
                      className="px-4 py-3 flex items-center justify-between hover:bg-shell-800/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{agent.icon}</span>
                        <div>
                          <Link 
                            href={`/agents/${agent.id}`}
                            className="font-medium text-shell-100 hover:text-lobster-400 transition-colors"
                          >
                            {agent.name}
                          </Link>
                          <p className="text-xs text-shell-500 truncate max-w-[300px]">
                            {agent.railwayUrl}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {health?.responseTime && health.status === 'healthy' && (
                          <span className="text-xs text-shell-400">
                            {health.responseTime}ms
                          </span>
                        )}
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bgColor}`}>
                          <span className={`w-2 h-2 rounded-full ${
                            health?.status === 'healthy' ? 'bg-emerald-400 animate-pulse' :
                            health?.status === 'checking' ? 'bg-yellow-400 animate-pulse' :
                            health?.status === 'unhealthy' ? 'bg-red-400' :
                            'bg-shell-400'
                          }`} />
                          <span className={`text-xs font-medium ${config.color}`}>
                            {config.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-shell-500 text-sm">
          <p>
            Status checks run every 2 minutes. Response times measured from edge.
          </p>
          <p className="mt-1">
            <Link href="/agents" className="text-lobster-400 hover:text-lobster-300">
              View all agents →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
