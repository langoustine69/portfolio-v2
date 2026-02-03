'use client';

import { useState } from 'react';
import type { AgentChangelogEntry } from '@/data/agents';

interface AgentChangelogProps {
  changelog: AgentChangelogEntry[];
  agentName: string;
}

export default function AgentChangelog({ changelog, agentName }: AgentChangelogProps) {
  const [expanded, setExpanded] = useState(false);
  
  if (!changelog || changelog.length === 0) {
    return null;
  }

  // Sort by date descending (newest first)
  const sortedChangelog = [...changelog].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const displayedChanges = expanded ? sortedChangelog : sortedChangelog.slice(0, 3);

  const typeColors = {
    major: 'bg-lobster-600/20 text-lobster-400 border-lobster-500/30',
    minor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    patch: 'bg-shell-500/20 text-shell-300 border-shell-500/30',
  };

  const typeIcons = {
    major: '🚀',
    minor: '✨',
    patch: '🔧',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <section className="mb-8" aria-labelledby="changelog-heading">
      <h2 
        id="changelog-heading"
        className="text-sm font-medium text-shell-500 dark:text-shell-500 light:text-shell-600 uppercase tracking-wider mb-4 flex items-center gap-2"
      >
        <span>📋</span> Version History
      </h2>
      
      <div className="space-y-4">
        {displayedChanges.map((entry, index) => (
          <article
            key={`${entry.version}-${index}`}
            className="bg-shell-900/50 dark:bg-shell-900/50 light:bg-shell-100/50 border border-shell-700 dark:border-shell-700 light:border-shell-200 rounded-lg p-4 transition-all hover:border-shell-600 dark:hover:border-shell-600 light:hover:border-shell-300"
          >
            <header className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-lg" aria-hidden="true">{typeIcons[entry.type]}</span>
                <span className="font-mono text-lg font-semibold text-white dark:text-white light:text-shell-900">
                  v{entry.version}
                </span>
                <span 
                  className={`px-2 py-0.5 rounded text-xs font-medium border ${typeColors[entry.type]}`}
                  aria-label={`${entry.type} release`}
                >
                  {entry.type.toUpperCase()}
                </span>
              </div>
              <time 
                dateTime={entry.date}
                className="text-shell-500 dark:text-shell-500 light:text-shell-600 text-sm"
              >
                {formatDate(entry.date)}
              </time>
            </header>
            
            <ul className="space-y-1.5 ml-8" aria-label={`Changes in version ${entry.version}`}>
              {entry.changes.map((change, changeIndex) => (
                <li 
                  key={changeIndex}
                  className="text-shell-300 dark:text-shell-300 light:text-shell-700 text-sm flex items-start gap-2"
                >
                  <span className="text-lobster-500 mt-1" aria-hidden="true">•</span>
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      {sortedChangelog.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full py-2 text-sm text-lobster-400 hover:text-lobster-300 transition-colors flex items-center justify-center gap-2 bg-shell-900/30 dark:bg-shell-900/30 light:bg-shell-100/30 rounded-lg border border-shell-700 dark:border-shell-700 light:border-shell-200 hover:border-lobster-500/50"
          aria-expanded={expanded}
          aria-controls="changelog-list"
        >
          {expanded ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              Show less
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Show all {sortedChangelog.length} versions
            </>
          )}
        </button>
      )}
    </section>
  );
}

/**
 * Compact version for use in agent cards or overview
 */
export function AgentChangelogBadge({ changelog }: { changelog?: AgentChangelogEntry[] }) {
  if (!changelog || changelog.length === 0) return null;
  
  const latest = [...changelog].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];
  
  return (
    <span 
      className="inline-flex items-center gap-1 px-2 py-0.5 bg-shell-800/50 dark:bg-shell-800/50 light:bg-shell-200/50 text-shell-400 dark:text-shell-400 light:text-shell-600 text-xs rounded font-mono"
      title={`Latest: v${latest.version} (${latest.date})`}
    >
      v{latest.version}
    </span>
  );
}
