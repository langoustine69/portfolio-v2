'use client';

import { AgentChangelogEntry } from '@/data/agents';
import { useMemo } from 'react';

interface RecentlyUpdatedBadgeProps {
  changelog?: AgentChangelogEntry[];
  daysThreshold?: number;
  size?: 'sm' | 'md';
}

export default function RecentlyUpdatedBadge({ 
  changelog, 
  daysThreshold = 7,
  size = 'sm'
}: RecentlyUpdatedBadgeProps) {
  const recentUpdate = useMemo(() => {
    if (!changelog || changelog.length === 0) return null;
    
    const now = new Date();
    const thresholdDate = new Date(now.getTime() - daysThreshold * 24 * 60 * 60 * 1000);
    
    // Find the most recent update within threshold
    const recent = changelog.find(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= thresholdDate;
    });
    
    if (!recent) return null;
    
    // Calculate days ago
    const entryDate = new Date(recent.date);
    const daysAgo = Math.floor((now.getTime() - entryDate.getTime()) / (24 * 60 * 60 * 1000));
    
    return {
      version: recent.version,
      type: recent.type,
      daysAgo,
      changes: recent.changes.slice(0, 2), // First 2 changes for tooltip
    };
  }, [changelog, daysThreshold]);

  if (!recentUpdate) return null;

  const typeColors = {
    major: 'bg-green-500/20 text-green-400 border-green-500/30',
    minor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    patch: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  };

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
  };

  const daysText = recentUpdate.daysAgo === 0 
    ? 'Today' 
    : recentUpdate.daysAgo === 1 
      ? 'Yesterday' 
      : `${recentUpdate.daysAgo}d ago`;

  return (
    <div className="group/badge relative inline-flex">
      <span 
        className={`
          inline-flex items-center gap-1 rounded-full font-medium border
          ${typeColors[recentUpdate.type]}
          ${sizeClasses[size]}
          animate-pulse-subtle
        `}
        aria-label={`Updated ${daysText}, version ${recentUpdate.version}`}
      >
        <svg 
          className={`${size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
          />
        </svg>
        <span className="sr-only sm:not-sr-only">{daysText}</span>
      </span>
      
      {/* Tooltip on hover */}
      <div className="
        absolute bottom-full left-0 mb-2 z-50
        opacity-0 invisible group-hover/badge:opacity-100 group-hover/badge:visible
        transition-all duration-200
        pointer-events-none
      ">
        <div className="
          bg-shell-800 dark:bg-shell-800 light:bg-white 
          border border-shell-700 dark:border-shell-700 light:border-shell-200
          rounded-lg shadow-xl p-3 min-w-[200px]
        ">
          <div className="flex items-center gap-2 mb-2">
            <span className={`
              px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase
              ${typeColors[recentUpdate.type]}
            `}>
              {recentUpdate.type}
            </span>
            <span className="text-xs text-shell-400 dark:text-shell-400 light:text-shell-500">
              v{recentUpdate.version}
            </span>
          </div>
          <ul className="text-xs text-shell-300 dark:text-shell-300 light:text-shell-600 space-y-1">
            {recentUpdate.changes.map((change, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-lobster-400 mt-0.5">•</span>
                <span className="line-clamp-2">{change}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Arrow */}
        <div className="
          absolute top-full left-4
          border-4 border-transparent border-t-shell-800 
          dark:border-t-shell-800 light:border-t-white
        " />
      </div>
    </div>
  );
}

// Helper hook to check if agent was recently updated
export function useIsRecentlyUpdated(
  changelog?: AgentChangelogEntry[], 
  daysThreshold = 7
): boolean {
  return useMemo(() => {
    if (!changelog || changelog.length === 0) return false;
    
    const now = new Date();
    const thresholdDate = new Date(now.getTime() - daysThreshold * 24 * 60 * 60 * 1000);
    
    return changelog.some(entry => new Date(entry.date) >= thresholdDate);
  }, [changelog, daysThreshold]);
}
