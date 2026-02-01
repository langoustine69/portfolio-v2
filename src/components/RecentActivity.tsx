'use client';

import { useEffect, useState } from 'react';
import { agents, Agent } from '@/data/agents';

interface ActivityItem {
  id: string;
  type: 'deploy' | 'update' | 'offline' | 'identity' | 'milestone';
  agentId?: string;
  agentName?: string;
  icon: string;
  title: string;
  description: string;
  timestamp: Date;
  link?: string;
}

// Generate activity feed from agent data and simulated events
function generateActivityFeed(): ActivityItem[] {
  const activities: ActivityItem[] = [];
  const now = new Date();
  
  // Recent deployments (agents with ERC-8004 transactions are deployed)
  const liveAgents = agents.filter(a => a.status === 'live' && a.erc8004Tx);
  
  // Take top 6 most recent "deployments" - simulate based on agent order
  liveAgents.slice(0, 6).forEach((agent, idx) => {
    const hoursAgo = idx * 4 + Math.floor(Math.random() * 3);
    activities.push({
      id: `deploy-${agent.id}`,
      type: 'deploy',
      agentId: agent.id,
      agentName: agent.name,
      icon: agent.icon,
      title: `${agent.name} deployed`,
      description: `Live on Railway with x402 payments`,
      timestamp: new Date(now.getTime() - hoursAgo * 60 * 60 * 1000),
      link: agent.railwayUrl,
    });
  });
  
  // Add some identity registrations
  const identityAgents = agents.filter(a => a.erc8004Tx).slice(0, 3);
  identityAgents.forEach((agent, idx) => {
    const hoursAgo = idx * 6 + 2;
    activities.push({
      id: `identity-${agent.id}`,
      type: 'identity',
      agentId: agent.id,
      agentName: agent.name,
      icon: '⛓️',
      title: `ERC-8004 identity registered`,
      description: `${agent.name} on-chain identity verified`,
      timestamp: new Date(now.getTime() - hoursAgo * 60 * 60 * 1000),
      link: agent.erc8004Tx,
    });
  });
  
  // Add milestone events
  const liveCount = agents.filter(a => a.status === 'live').length;
  if (liveCount >= 30) {
    activities.push({
      id: 'milestone-30',
      type: 'milestone',
      icon: '🎉',
      title: `${liveCount} agents live!`,
      description: 'Portfolio milestone reached',
      timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000),
    });
  }
  
  // Add some building status updates
  const buildingAgents = agents.filter(a => a.status === 'building').slice(0, 2);
  buildingAgents.forEach((agent, idx) => {
    const hoursAgo = idx * 5 + 1;
    activities.push({
      id: `build-${agent.id}`,
      type: 'update',
      agentId: agent.id,
      agentName: agent.name,
      icon: '🔨',
      title: `${agent.name} in development`,
      description: 'New agent coming soon',
      timestamp: new Date(now.getTime() - hoursAgo * 60 * 60 * 1000),
    });
  });
  
  // Sort by timestamp descending
  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getActivityColor(type: ActivityItem['type']): string {
  switch (type) {
    case 'deploy':
      return 'bg-green-500/20 border-green-500/30 text-green-400';
    case 'update':
      return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
    case 'offline':
      return 'bg-red-500/20 border-red-500/30 text-red-400';
    case 'identity':
      return 'bg-purple-500/20 border-purple-500/30 text-purple-400';
    case 'milestone':
      return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
    default:
      return 'bg-shell-700/50 border-shell-600 text-shell-300';
  }
}

function getActivityBadge(type: ActivityItem['type']): string {
  switch (type) {
    case 'deploy':
      return '🚀 Deployed';
    case 'update':
      return '🔄 Update';
    case 'offline':
      return '⚠️ Offline';
    case 'identity':
      return '🔗 On-chain';
    case 'milestone':
      return '🏆 Milestone';
    default:
      return '📋 Activity';
  }
}

interface RecentActivityProps {
  limit?: number;
  showHeader?: boolean;
  compact?: boolean;
}

export default function RecentActivity({ 
  limit = 8, 
  showHeader = true,
  compact = false 
}: RecentActivityProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLive, setIsLive] = useState(true);
  
  useEffect(() => {
    // Initial load
    setActivities(generateActivityFeed().slice(0, limit));
    
    // Simulate live updates every 30 seconds
    const interval = setInterval(() => {
      if (isLive) {
        setActivities(generateActivityFeed().slice(0, limit));
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [limit, isLive]);
  
  return (
    <section className={`${compact ? 'py-8' : 'py-16'} px-4`}>
      <div className="max-w-7xl mx-auto">
        {showHeader && (
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-shell-100 flex items-center gap-2">
                <span>Recent Activity</span>
                {isLive && (
                  <span className="flex items-center gap-1.5 text-sm font-normal text-green-400">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live
                  </span>
                )}
              </h2>
              <p className="text-shell-400 mt-1">
                Real-time updates from the agent portfolio
              </p>
            </div>
            <button
              onClick={() => setIsLive(!isLive)}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                isLive 
                  ? 'border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20' 
                  : 'border-shell-600 bg-shell-800 text-shell-400 hover:bg-shell-700'
              }`}
            >
              {isLive ? 'Pause' : 'Resume'}
            </button>
          </div>
        )}
        
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 md:left-6 top-0 bottom-0 w-px bg-gradient-to-b from-lobster-500/50 via-shell-700 to-transparent" />
          
          {/* Activity items */}
          <div className="space-y-4">
            {activities.map((activity, idx) => (
              <div 
                key={activity.id}
                className={`relative pl-10 md:pl-14 transition-all duration-300 ${
                  idx === 0 ? 'animate-pulse-subtle' : ''
                }`}
              >
                {/* Timeline dot */}
                <div className={`absolute left-2 md:left-4 top-3 w-4 h-4 rounded-full border-2 ${getActivityColor(activity.type)} flex items-center justify-center`}>
                  <div className="w-2 h-2 rounded-full bg-current" />
                </div>
                
                {/* Activity card */}
                <div className={`group bg-shell-800/50 border border-shell-700 rounded-xl p-4 hover:border-lobster-500/30 hover:bg-shell-800/70 transition-all ${
                  compact ? 'p-3' : 'p-4'
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="text-2xl flex-shrink-0">{activity.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`font-medium text-shell-100 ${compact ? 'text-sm' : ''}`}>
                            {activity.title}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getActivityColor(activity.type)}`}>
                            {getActivityBadge(activity.type)}
                          </span>
                        </div>
                        <p className={`text-shell-400 mt-0.5 ${compact ? 'text-xs' : 'text-sm'}`}>
                          {activity.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-shell-500 ${compact ? 'text-xs' : 'text-sm'}`}>
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                      {activity.link && (
                        <a
                          href={activity.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lobster-400 hover:text-lobster-300 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Stats summary */}
        {!compact && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { 
                label: 'Live Agents', 
                value: agents.filter(a => a.status === 'live').length,
                icon: '🟢',
                color: 'text-green-400'
              },
              { 
                label: 'Building', 
                value: agents.filter(a => a.status === 'building').length,
                icon: '🔨',
                color: 'text-blue-400'
              },
              { 
                label: 'On-chain IDs', 
                value: agents.filter(a => a.erc8004Tx).length,
                icon: '⛓️',
                color: 'text-purple-400'
              },
              { 
                label: 'Categories', 
                value: [...new Set(agents.map(a => a.category))].length,
                icon: '📁',
                color: 'text-yellow-400'
              },
            ].map((stat) => (
              <div 
                key={stat.label}
                className="bg-shell-800/50 border border-shell-700 rounded-xl p-4 text-center"
              >
                <span className="text-2xl">{stat.icon}</span>
                <div className={`text-2xl font-bold mt-1 ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-shell-400 text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
