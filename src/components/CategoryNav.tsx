'use client';

import { useMemo } from 'react';
import { agents } from '@/data/agents';

// Category icons and colors
const categoryConfig: Record<string, { icon: string; color: string }> = {
  'Sports': { icon: '🏈', color: 'from-green-500/20 to-green-600/10 border-green-500/30 hover:border-green-400' },
  'Finance': { icon: '💰', color: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 hover:border-yellow-400' },
  'Space': { icon: '🌌', color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 hover:border-purple-400' },
  'Tech News': { icon: '📰', color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-400' },
  'Tech Trends': { icon: '💡', color: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 hover:border-cyan-400' },
  'Motorsport': { icon: '🏎️', color: 'from-red-500/20 to-red-600/10 border-red-500/30 hover:border-red-400' },
  'DeFi': { icon: '⛓️', color: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 hover:border-indigo-400' },
  'Gaming': { icon: '🎮', color: 'from-violet-500/20 to-violet-600/10 border-violet-500/30 hover:border-violet-400' },
  'Knowledge': { icon: '📖', color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 hover:border-amber-400' },
  'Music': { icon: '🎵', color: 'from-pink-500/20 to-pink-600/10 border-pink-500/30 hover:border-pink-400' },
  'Academic': { icon: '🎓', color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 hover:border-emerald-400' },
  'Developer Tools': { icon: '📦', color: 'from-orange-500/20 to-orange-600/10 border-orange-500/30 hover:border-orange-400' },
  'Geoscience': { icon: '🌍', color: 'from-teal-500/20 to-teal-600/10 border-teal-500/30 hover:border-teal-400' },
  'Marine': { icon: '🌊', color: 'from-sky-500/20 to-sky-600/10 border-sky-500/30 hover:border-sky-400' },
  'AI/ML': { icon: '🤖', color: 'from-fuchsia-500/20 to-fuchsia-600/10 border-fuchsia-500/30 hover:border-fuchsia-400' },
  'Security': { icon: '🔍', color: 'from-slate-500/20 to-slate-600/10 border-slate-500/30 hover:border-slate-400' },
  'Infrastructure': { icon: '🌐', color: 'from-zinc-500/20 to-zinc-600/10 border-zinc-500/30 hover:border-zinc-400' },
  'Economics': { icon: '📈', color: 'from-lime-500/20 to-lime-600/10 border-lime-500/30 hover:border-lime-400' },
  'Environment': { icon: '🌬️', color: 'from-green-500/20 to-green-600/10 border-green-500/30 hover:border-green-400' },
  'Politics': { icon: '🏛️', color: 'from-stone-500/20 to-stone-600/10 border-stone-500/30 hover:border-stone-400' },
  'Social Signals': { icon: '📊', color: 'from-rose-500/20 to-rose-600/10 border-rose-500/30 hover:border-rose-400' },
  'Geolocation': { icon: '🌍', color: 'from-teal-500/20 to-teal-600/10 border-teal-500/30 hover:border-teal-400' },
  'Scheduling': { icon: '📅', color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-400' },
  'Health & Nutrition': { icon: '🍎', color: 'from-red-500/20 to-red-600/10 border-red-500/30 hover:border-red-400' },
  'Library': { icon: '📚', color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 hover:border-amber-400' },
};

const defaultConfig = { icon: '📁', color: 'from-shell-500/20 to-shell-600/10 border-shell-500/30 hover:border-shell-400' };

interface CategoryNavProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  variant?: 'pills' | 'cards';
  showCounts?: boolean;
}

export default function CategoryNav({ 
  selectedCategory, 
  onCategoryChange, 
  variant = 'pills',
  showCounts = true 
}: CategoryNavProps) {
  // Get unique categories with counts, sorted by count
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    agents.forEach(agent => {
      counts[agent.category] = (counts[agent.category] || 0) + 1;
    });
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .map(([name, count]) => ({
        name,
        count,
        ...(categoryConfig[name] || defaultConfig),
      }));
  }, []);

  const totalCount = agents.length;

  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* All category */}
        <button
          onClick={() => onCategoryChange('all')}
          className={`group relative bg-gradient-to-br ${
            selectedCategory === 'all'
              ? 'from-lobster-500/30 to-lobster-600/20 border-lobster-400 ring-2 ring-lobster-500/50'
              : 'from-shell-700/50 to-shell-800/50 border-shell-600 hover:border-lobster-500/50'
          } border rounded-xl p-4 text-center transition-all duration-200`}
        >
          <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">🦞</span>
          <h3 className="text-shell-100 font-medium text-sm">All</h3>
          {showCounts && (
            <p className="text-shell-400 text-xs mt-1">{totalCount} agents</p>
          )}
        </button>

        {/* Category cards */}
        {categoryData.map((cat) => (
          <button
            key={cat.name}
            onClick={() => onCategoryChange(cat.name)}
            className={`group relative bg-gradient-to-br ${
              selectedCategory === cat.name
                ? `${cat.color.replace('hover:border-', '')} ring-2 ring-lobster-500/50`
                : `from-shell-700/50 to-shell-800/50 border-shell-600 ${cat.color.split(' ').pop()}`
            } border rounded-xl p-4 text-center transition-all duration-200`}
          >
            <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">
              {cat.icon}
            </span>
            <h3 className="text-shell-100 font-medium text-sm truncate">{cat.name}</h3>
            {showCounts && (
              <p className="text-shell-400 text-xs mt-1">{cat.count} agent{cat.count !== 1 ? 's' : ''}</p>
            )}
          </button>
        ))}
      </div>
    );
  }

  // Pills variant (default)
  return (
    <div className="flex flex-wrap gap-2">
      {/* All pill */}
      <button
        onClick={() => onCategoryChange('all')}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          selectedCategory === 'all'
            ? 'bg-lobster-600 text-white shadow-lg shadow-lobster-500/25'
            : 'bg-shell-800 text-shell-300 hover:bg-shell-700 hover:text-shell-100 border border-shell-700'
        }`}
      >
        <span>🦞</span>
        <span>All</span>
        {showCounts && (
          <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
            selectedCategory === 'all' ? 'bg-white/20' : 'bg-shell-700'
          }`}>
            {totalCount}
          </span>
        )}
      </button>

      {/* Category pills */}
      {categoryData.map((cat) => (
        <button
          key={cat.name}
          onClick={() => onCategoryChange(cat.name)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            selectedCategory === cat.name
              ? 'bg-lobster-600 text-white shadow-lg shadow-lobster-500/25'
              : 'bg-shell-800 text-shell-300 hover:bg-shell-700 hover:text-shell-100 border border-shell-700'
          }`}
        >
          <span>{cat.icon}</span>
          <span>{cat.name}</span>
          {showCounts && (
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
              selectedCategory === cat.name ? 'bg-white/20' : 'bg-shell-700'
            }`}>
              {cat.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
