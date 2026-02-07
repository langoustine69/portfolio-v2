'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { agents } from '@/data/agents';
import Breadcrumbs from '@/components/Breadcrumbs';

interface SLATier {
  name: string;
  icon: string;
  uptime: string;
  uptimePercent: number;
  maxDowntimeMonth: string;
  responseP50: string;
  responseP95: string;
  responseP99: string;
  creditPolicy: string;
  supportResponse: string;
  color: string;
  bgColor: string;
  agents: string[];
}

interface IncidentEntry {
  id: string;
  date: string;
  title: string;
  status: 'resolved' | 'monitoring' | 'identified' | 'investigating';
  duration: string;
  affectedAgents: string[];
  description: string;
  resolution?: string;
}

const slaTiers: SLATier[] = [
  {
    name: 'Standard',
    icon: '🔷',
    uptime: '99.5%',
    uptimePercent: 99.5,
    maxDowntimeMonth: '~3.6 hours',
    responseP50: '<200ms',
    responseP95: '<500ms',
    responseP99: '<1s',
    creditPolicy: 'No credits',
    supportResponse: 'Best effort',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    agents: ['market-news-pulse', 'world-time-agent'],
  },
  {
    name: 'Business',
    icon: '🔶',
    uptime: '99.9%',
    uptimePercent: 99.9,
    maxDowntimeMonth: '~43 minutes',
    responseP50: '<150ms',
    responseP95: '<400ms',
    responseP99: '<800ms',
    creditPolicy: '10% credit per 0.1% below SLA',
    supportResponse: '< 24 hours',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    agents: ['natural-events-intel', 'crypto-price-agent', 'weather-agent'],
  },
  {
    name: 'Enterprise',
    icon: '💎',
    uptime: '99.95%',
    uptimePercent: 99.95,
    maxDowntimeMonth: '~22 minutes',
    responseP50: '<100ms',
    responseP95: '<300ms',
    responseP99: '<500ms',
    creditPolicy: '25% credit per 0.05% below SLA',
    supportResponse: '< 4 hours',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    agents: [],
  },
];

// Simulated incident history
const recentIncidents: IncidentEntry[] = [
  {
    id: 'inc-2026-02-05',
    date: '2026-02-05',
    title: 'Elevated latency on Crypto Price Agent',
    status: 'resolved',
    duration: '12 minutes',
    affectedAgents: ['crypto-price-agent'],
    description: 'Upstream API rate limiting caused intermittent delays.',
    resolution: 'Implemented request queuing and caching layer.',
  },
  {
    id: 'inc-2026-01-28',
    date: '2026-01-28',
    title: 'Brief outage during Railway maintenance',
    status: 'resolved',
    duration: '8 minutes',
    affectedAgents: ['natural-events-intel', 'crypto-price-agent', 'market-news-pulse'],
    description: 'Scheduled Railway infrastructure maintenance caused brief service interruption.',
    resolution: 'Services auto-recovered after maintenance window.',
  },
  {
    id: 'inc-2026-01-15',
    date: '2026-01-15',
    title: 'Weather Agent data source timeout',
    status: 'resolved',
    duration: '25 minutes',
    affectedAgents: ['weather-agent'],
    description: 'Open-Meteo API experienced regional outage.',
    resolution: 'Added fallback to secondary weather data source.',
  },
];

const statusColors: Record<string, { text: string; bg: string }> = {
  resolved: { text: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  monitoring: { text: 'text-blue-400', bg: 'bg-blue-500/20' },
  identified: { text: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  investigating: { text: 'text-orange-400', bg: 'bg-orange-500/20' },
};

// Calculate aggregate stats
const getAggregateStats = () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const incidentsLast30Days = recentIncidents.filter(i => new Date(i.date) >= thirtyDaysAgo);
  const totalDowntimeMinutes = incidentsLast30Days.reduce((acc, i) => {
    const mins = parseInt(i.duration) || 0;
    return acc + mins;
  }, 0);
  const totalMinutes30Days = 30 * 24 * 60;
  const uptimePercent = ((totalMinutes30Days - totalDowntimeMinutes) / totalMinutes30Days * 100).toFixed(3);
  
  return {
    uptimePercent,
    incidentCount: incidentsLast30Days.length,
    totalDowntimeMinutes,
    avgResponseTime: '145ms', // Simulated
    p95ResponseTime: '380ms',
    p99ResponseTime: '720ms',
  };
};

export default function ReliabilityPage() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null);

  const liveAgents = useMemo(() => agents.filter(a => a.status === 'live'), []);
  const stats = useMemo(() => getAggregateStats(), []);

  const getAgentTier = (agentId: string): SLATier => {
    for (const tier of slaTiers) {
      if (tier.agents.includes(agentId)) return tier;
    }
    return slaTiers[0]; // Default to Standard
  };

  return (
    <main className="min-h-screen bg-shell-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Breadcrumbs items={[{ label: 'Reliability & SLA', href: '/reliability' }]} />

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-coral-400 mb-4 flex items-center gap-3">
            <span>📊</span> Reliability & SLA
          </h1>
          <p className="text-shell-300 text-lg max-w-3xl">
            Our commitment to keeping your agents running. View uptime guarantees, 
            response time targets, credit policies, and incident history.
          </p>
        </div>

        {/* Current Status Overview */}
        <section className="mb-12">
          <div className="bg-shell-800/50 backdrop-blur rounded-2xl border border-shell-700/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
              <h2 className="text-xl font-semibold text-shell-100">All Systems Operational</h2>
              <Link 
                href="/status" 
                className="ml-auto text-sm text-coral-400 hover:text-coral-300 flex items-center gap-1"
              >
                View live status →
              </Link>
            </div>

            {/* 30-Day Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-shell-900/50 rounded-xl p-4">
                <div className="text-2xl font-bold text-emerald-400">{stats.uptimePercent}%</div>
                <div className="text-sm text-shell-400">30-day uptime</div>
              </div>
              <div className="bg-shell-900/50 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-400">{stats.incidentCount}</div>
                <div className="text-sm text-shell-400">Incidents (30d)</div>
              </div>
              <div className="bg-shell-900/50 rounded-xl p-4">
                <div className="text-2xl font-bold text-orange-400">{stats.totalDowntimeMinutes}m</div>
                <div className="text-sm text-shell-400">Total downtime</div>
              </div>
              <div className="bg-shell-900/50 rounded-xl p-4">
                <div className="text-2xl font-bold text-violet-400">{stats.avgResponseTime}</div>
                <div className="text-sm text-shell-400">Avg response</div>
              </div>
              <div className="bg-shell-900/50 rounded-xl p-4">
                <div className="text-2xl font-bold text-yellow-400">{stats.p95ResponseTime}</div>
                <div className="text-sm text-shell-400">P95 latency</div>
              </div>
              <div className="bg-shell-900/50 rounded-xl p-4">
                <div className="text-2xl font-bold text-pink-400">{stats.p99ResponseTime}</div>
                <div className="text-sm text-shell-400">P99 latency</div>
              </div>
            </div>
          </div>
        </section>

        {/* SLA Tiers */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-shell-100 mb-6 flex items-center gap-2">
            <span>🎯</span> Service Level Agreements
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {slaTiers.map((tier) => (
              <div
                key={tier.name}
                className={`${tier.bgColor} rounded-2xl border border-shell-700/50 p-6 transition-all duration-200 hover:border-shell-600 ${
                  selectedTier === tier.name ? 'ring-2 ring-coral-500/50' : ''
                }`}
                onClick={() => setSelectedTier(selectedTier === tier.name ? null : tier.name)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{tier.icon}</span>
                  <h3 className={`text-xl font-bold ${tier.color}`}>{tier.name}</h3>
                </div>

                {/* Uptime Guarantee */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-shell-100">{tier.uptime}</span>
                    <span className="text-shell-400">uptime</span>
                  </div>
                  <div className="text-sm text-shell-500 mt-1">
                    Max downtime: {tier.maxDowntimeMonth}/month
                  </div>
                </div>

                {/* Response Times */}
                <div className="space-y-2 mb-6">
                  <div className="text-sm text-shell-400 font-medium">Response Time Targets</div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-shell-900/30 rounded-lg p-2">
                      <div className="text-sm font-medium text-shell-200">{tier.responseP50}</div>
                      <div className="text-xs text-shell-500">P50</div>
                    </div>
                    <div className="bg-shell-900/30 rounded-lg p-2">
                      <div className="text-sm font-medium text-shell-200">{tier.responseP95}</div>
                      <div className="text-xs text-shell-500">P95</div>
                    </div>
                    <div className="bg-shell-900/30 rounded-lg p-2">
                      <div className="text-sm font-medium text-shell-200">{tier.responseP99}</div>
                      <div className="text-xs text-shell-500">P99</div>
                    </div>
                  </div>
                </div>

                {/* Policies */}
                <div className="space-y-3 text-sm border-t border-shell-700/50 pt-4">
                  <div className="flex justify-between">
                    <span className="text-shell-400">Credit Policy</span>
                    <span className="text-shell-200">{tier.creditPolicy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-shell-400">Support Response</span>
                    <span className="text-shell-200">{tier.supportResponse}</span>
                  </div>
                </div>

                {/* Agents in tier */}
                {tier.agents.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-shell-700/50">
                    <div className="text-xs text-shell-500 mb-2">Agents in this tier:</div>
                    <div className="flex flex-wrap gap-1">
                      {tier.agents.map((agentId) => {
                        const agent = agents.find(a => a.id === agentId);
                        return agent ? (
                          <Link
                            key={agentId}
                            href={`/agents/${agentId}`}
                            className="text-xs bg-shell-700/50 px-2 py-1 rounded hover:bg-shell-600/50 transition-colors"
                          >
                            {agent.icon} {agent.name}
                          </Link>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Reliability Practices */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-shell-100 mb-6 flex items-center gap-2">
            <span>🛡️</span> How We Ensure Reliability
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: '🔄',
                title: 'Auto-Scaling',
                desc: 'Railway automatically scales containers based on demand',
              },
              {
                icon: '🏥',
                title: 'Health Checks',
                desc: 'Continuous /health endpoint monitoring every 30 seconds',
              },
              {
                icon: '🔁',
                title: 'Auto-Restart',
                desc: 'Crashed containers automatically restart within seconds',
              },
              {
                icon: '📊',
                title: 'Real-time Metrics',
                desc: 'Response times, error rates, and throughput tracked',
              },
              {
                icon: '🌐',
                title: 'Edge Caching',
                desc: 'Frequently accessed data cached at CDN edge nodes',
              },
              {
                icon: '⚡',
                title: 'Fast Failover',
                desc: 'Automatic routing away from unhealthy instances',
              },
              {
                icon: '📱',
                title: 'Incident Alerts',
                desc: 'Immediate notification on any service degradation',
              },
              {
                icon: '🔐',
                title: 'DDoS Protection',
                desc: 'Railway infrastructure includes DDoS mitigation',
              },
            ].map((practice) => (
              <div
                key={practice.title}
                className="bg-shell-800/30 rounded-xl p-4 border border-shell-700/30"
              >
                <div className="text-2xl mb-2">{practice.icon}</div>
                <div className="font-medium text-shell-100 mb-1">{practice.title}</div>
                <div className="text-sm text-shell-400">{practice.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Incident History */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-shell-100 flex items-center gap-2">
              <span>📋</span> Incident History
            </h2>
            <div className="text-sm text-shell-400">Last 90 days</div>
          </div>

          <div className="space-y-3">
            {recentIncidents.length === 0 ? (
              <div className="bg-shell-800/30 rounded-xl p-8 text-center">
                <div className="text-4xl mb-3">✨</div>
                <div className="text-shell-300">No incidents in the last 90 days</div>
              </div>
            ) : (
              recentIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className="bg-shell-800/30 rounded-xl border border-shell-700/30 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedIncident(expandedIncident === incident.id ? null : incident.id)}
                    className="w-full p-4 flex items-center gap-4 text-left hover:bg-shell-700/20 transition-colors"
                  >
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[incident.status].bg} ${statusColors[incident.status].text}`}>
                      {incident.status}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-shell-100">{incident.title}</div>
                      <div className="text-sm text-shell-400">
                        {incident.date} · {incident.duration} · {incident.affectedAgents.length} agent(s) affected
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-shell-400 transition-transform ${expandedIncident === incident.id ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {expandedIncident === incident.id && (
                    <div className="px-4 pb-4 border-t border-shell-700/30 pt-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium text-shell-400 mb-1">Description</div>
                          <div className="text-shell-200">{incident.description}</div>
                        </div>
                        {incident.resolution && (
                          <div>
                            <div className="text-sm font-medium text-shell-400 mb-1">Resolution</div>
                            <div className="text-shell-200">{incident.resolution}</div>
                          </div>
                        )}
                      </div>
                      <div className="mt-4">
                        <div className="text-sm font-medium text-shell-400 mb-2">Affected Agents</div>
                        <div className="flex flex-wrap gap-2">
                          {incident.affectedAgents.map((agentId) => {
                            const agent = agents.find(a => a.id === agentId);
                            return agent ? (
                              <Link
                                key={agentId}
                                href={`/agents/${agentId}`}
                                className="inline-flex items-center gap-1 text-sm bg-shell-700/50 px-3 py-1 rounded-full hover:bg-shell-600/50"
                              >
                                {agent.icon} {agent.name}
                              </Link>
                            ) : (
                              <span key={agentId} className="text-sm bg-shell-700/50 px-3 py-1 rounded-full">
                                {agentId}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Response Time Explanation */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-shell-100 mb-6 flex items-center gap-2">
            <span>⏱️</span> Understanding Response Times
          </h2>
          <div className="bg-shell-800/30 rounded-2xl p-6 border border-shell-700/30">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div>
                <div className="text-lg font-semibold text-emerald-400 mb-2">P50 (Median)</div>
                <p className="text-shell-300 text-sm">
                  Half of all requests complete faster than this. Your typical experience.
                </p>
              </div>
              <div>
                <div className="text-lg font-semibold text-yellow-400 mb-2">P95 (95th Percentile)</div>
                <p className="text-shell-300 text-sm">
                  95% of requests complete faster. Only 1 in 20 takes longer.
                </p>
              </div>
              <div>
                <div className="text-lg font-semibold text-red-400 mb-2">P99 (99th Percentile)</div>
                <p className="text-shell-300 text-sm">
                  99% of requests complete faster. Captures worst-case scenarios.
                </p>
              </div>
            </div>
            <div className="text-sm text-shell-400 bg-shell-900/30 rounded-lg p-4">
              <strong className="text-shell-200">💡 Tip:</strong> When building latency-sensitive applications, 
              design for P95/P99 latencies, not just averages. This ensures a good experience for all users.
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-coral-500/10 to-orange-500/10 rounded-2xl p-8 text-center border border-coral-500/20">
          <h2 className="text-2xl font-bold text-shell-100 mb-3">
            Need Enterprise SLA?
          </h2>
          <p className="text-shell-300 mb-6 max-w-lg mx-auto">
            Get custom uptime guarantees, dedicated support, and SLA credits. 
            Contact us to discuss your requirements.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/status"
              className="px-6 py-3 bg-shell-700 text-shell-100 rounded-xl font-medium hover:bg-shell-600 transition-colors"
            >
              View Live Status
            </Link>
            <Link
              href="mailto:langoustine69@proton.me?subject=Enterprise SLA Inquiry"
              className="px-6 py-3 bg-coral-500 text-white rounded-xl font-medium hover:bg-coral-400 transition-colors"
            >
              Contact for Enterprise
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
