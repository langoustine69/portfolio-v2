'use client';

import { useState } from 'react';
import { Agent } from '@/data/agents';
import Link from 'next/link';
import HealthIndicator from './HealthIndicator';
import FavoriteButton from './FavoriteButton';
import RateLimitDisplay from './RateLimitDisplay';
import RecentlyUpdatedBadge from './RecentlyUpdatedBadge';
import QuickDemoModal from './QuickDemoModal';

interface AgentCardProps {
  agent: Agent;
  showDetails?: boolean;
}

export default function AgentCard({ agent, showDetails = false }: AgentCardProps) {
  const [showQuickDemo, setShowQuickDemo] = useState(false);
  
  const statusLabel = agent.status === 'live' ? 'Live and operational' : 
                      agent.status === 'building' ? 'In development' : 
                      agent.status === 'offline' ? 'Currently offline' : 'Unknown status';
  
  // Random accent color for brutal variety
  const accentColors = ['bg-brutal-yellow', 'bg-brutal-cyan', 'bg-brutal-lime', 'bg-brutal-pink', 'bg-brutal-orange'];
  const accentColor = accentColors[agent.name.length % accentColors.length];
  
  return (
    <article 
      className="group relative bg-white dark:bg-black border-3 border-black dark:border-white p-6 transition-all duration-100 hover:-translate-x-1 hover:-translate-y-1"
      style={{ 
        boxShadow: '4px 4px 0px 0px #000000',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '6px 6px 0px 0px #000000';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '4px 4px 0px 0px #000000';
      }}
      aria-labelledby={`agent-title-${agent.id}`}
      aria-describedby={`agent-desc-${agent.id}`}
    >
      {/* Accent stripe */}
      <div className={`absolute top-0 left-0 right-0 h-2 ${accentColor}`} />
      
      {/* Favorite button */}
      <div className="absolute top-4 right-4 z-20">
        <FavoriteButton agentId={agent.id} size="md" />
      </div>
      
      <div className="relative z-10 pt-2">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 pr-10">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{agent.icon}</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 
                  id={`agent-title-${agent.id}`} 
                  className="text-lg font-black uppercase tracking-tight text-black dark:text-white"
                >
                  {agent.name}
                </h3>
                <RecentlyUpdatedBadge changelog={agent.changelog} daysThreshold={7} />
              </div>
              <span className="text-sm font-bold uppercase text-shell-600 dark:text-shell-400">
                {agent.category}
              </span>
            </div>
          </div>
        </div>
        
        {/* Health Status - brutal badge style */}
        <div className="mb-4">
          <HealthIndicator 
            endpoint={agent.railwayUrl} 
            staticStatus={agent.status}
            showResponseTime={showDetails}
          />
        </div>

        {/* Description */}
        <p 
          id={`agent-desc-${agent.id}`} 
          className="text-black dark:text-white font-medium text-sm mb-4 line-clamp-2"
        >
          {agent.description}
        </p>

        {/* API Source + Rate Limit */}
        <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-shell-600 dark:text-shell-400">API:</span>
            <span className="text-xs font-bold bg-brutal-yellow text-black px-2 py-1 border-2 border-black">
              {agent.apiSource}
            </span>
          </div>
          {agent.status === 'live' && (
            <RateLimitDisplay rateLimit={agent.rateLimit} variant="compact" />
          )}
        </div>

        {/* Features */}
        {showDetails && agent.features.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {agent.features.map((feature, i) => (
              <span
                key={feature}
                className={`text-xs font-bold uppercase px-2 py-1 border-2 border-black dark:border-white text-black dark:text-white ${
                  i % 2 === 0 ? 'bg-brutal-cyan' : 'bg-brutal-lime'
                }`}
                style={{ boxShadow: '2px 2px 0px 0px #000000' }}
              >
                {feature}
              </span>
            ))}
          </div>
        )}

        {/* Links */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t-2 border-black dark:border-white flex-wrap">
          {agent.railwayUrl && agent.status === 'live' && (
            <button
              onClick={() => setShowQuickDemo(true)}
              className="flex items-center gap-1.5 text-sm font-bold uppercase px-3 py-1 bg-lobster-500 text-white border-2 border-black hover:bg-lobster-600 transition-colors"
              style={{ boxShadow: '2px 2px 0px 0px #000000' }}
              aria-label={`Quick demo for ${agent.name}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              TRY IT
            </button>
          )}
          {agent.githubUrl && (
            <a
              href={agent.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-bold uppercase px-3 py-1 bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white hover:bg-shell-100 dark:hover:bg-shell-900 transition-colors"
              style={{ boxShadow: '2px 2px 0px 0px #000000' }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              CODE
            </a>
          )}
          {agent.erc8004Tx && (
            <a
              href={agent.erc8004Tx}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-bold uppercase px-3 py-1 bg-brutal-lime text-black border-2 border-black hover:bg-green-400 transition-colors"
              title="ERC-8004 Identity Verified"
              style={{ boxShadow: '2px 2px 0px 0px #000000' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              8004
            </a>
          )}
        </div>
      </div>

      {/* Quick Demo Modal */}
      <QuickDemoModal
        agent={agent}
        isOpen={showQuickDemo}
        onClose={() => setShowQuickDemo(false)}
      />
    </article>
  );
}
