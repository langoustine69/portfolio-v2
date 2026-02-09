'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAchievements, ACHIEVEMENTS, Achievement } from '@/hooks/useAchievements';

const CATEGORY_INFO: Record<string, { name: string; icon: string; color: string }> = {
  exploration: { name: 'Exploration', icon: '🗺️', color: 'blue' },
  integration: { name: 'Integration', icon: '🔧', color: 'green' },
  mastery: { name: 'Mastery', icon: '🎓', color: 'purple' },
  community: { name: 'Community', icon: '👥', color: 'orange' },
  special: { name: 'Special', icon: '✨', color: 'pink' },
};

const RARITY_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  common: { bg: 'bg-gray-100 dark:bg-gray-800', border: 'border-gray-300 dark:border-gray-600', text: 'text-gray-600 dark:text-gray-400' },
  rare: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-300 dark:border-blue-600', text: 'text-blue-600 dark:text-blue-400' },
  epic: { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-300 dark:border-purple-600', text: 'text-purple-600 dark:text-purple-400' },
  legendary: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-400 dark:border-amber-500', text: 'text-amber-600 dark:text-amber-400' },
};

function AchievementCard({ achievement, unlocked }: { achievement: Achievement & { unlockedAt?: number }; unlocked: boolean }) {
  const rarity = RARITY_STYLES[achievement.rarity];
  
  return (
    <div
      className={`relative p-4 rounded-xl border-2 transition-all ${
        unlocked
          ? `${rarity.bg} ${rarity.border} shadow-sm`
          : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60'
      }`}
    >
      {/* Rarity badge */}
      <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${rarity.text} ${rarity.bg} border ${rarity.border}`}>
        {achievement.rarity}
      </div>
      
      <div className="flex items-start gap-3">
        <div
          className={`text-3xl ${
            unlocked ? '' : 'grayscale opacity-50'
          }`}
        >
          {achievement.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold ${unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
            {achievement.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            {achievement.description}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-xs font-medium ${rarity.text}`}>
              +{achievement.points} pts
            </span>
            {unlocked && achievement.unlockedAt && (
              <span className="text-xs text-gray-500 dark:text-gray-500">
                Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
              </span>
            )}
            {!unlocked && (
              <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                {achievement.requirement}
              </span>
            )}
          </div>
        </div>
        {unlocked && (
          <div className="text-green-500 text-xl">✓</div>
        )}
      </div>
    </div>
  );
}

function ProgressRing({ percentage }: { percentage: number }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="relative w-36 h-36">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="72"
          cy="72"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx="72"
          cy="72"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-orange-500 transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{percentage}%</span>
      </div>
    </div>
  );
}

export default function AchievementsPage() {
  const { achievements, progress, newAchievement, stats } = useAchievements();
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [showLocked, setShowLocked] = useState(true);
  const [sortBy, setSortBy] = useState<'default' | 'points' | 'rarity'>('default');

  const filteredAchievements = useMemo(() => {
    let filtered = achievements;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((a) => a.category === selectedCategory);
    }
    
    if (!showLocked) {
      filtered = filtered.filter((a) => a.unlockedAt);
    }
    
    if (sortBy === 'points') {
      filtered = [...filtered].sort((a, b) => b.points - a.points);
    } else if (sortBy === 'rarity') {
      const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
      filtered = [...filtered].sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
    }
    
    return filtered;
  }, [achievements, selectedCategory, showLocked, sortBy]);

  const categoryStats = useMemo(() => {
    return Object.keys(CATEGORY_INFO).map((cat) => {
      const total = ACHIEVEMENTS.filter((a) => a.category === cat).length;
      const unlocked = achievements.filter((a) => a.category === cat && a.unlockedAt).length;
      return { category: cat, total, unlocked };
    });
  }, [achievements]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      {/* Achievement Toast */}
      {newAchievement && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4">
            <span className="text-4xl">{newAchievement.icon}</span>
            <div>
              <p className="text-sm font-medium opacity-90">Achievement Unlocked!</p>
              <p className="text-lg font-bold">{newAchievement.name}</p>
              <p className="text-sm opacity-80">+{newAchievement.points} points</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-orange-600 hover:underline text-sm mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            🏆 Developer Achievements
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track your progress and unlock badges as you explore the x402 agent ecosystem
          </p>
        </div>

        {/* Progress Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <ProgressRing percentage={progress.percentage} />
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {progress.unlocked} / {progress.total} Achievements
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                <span className="text-orange-500 font-semibold">{progress.points}</span> / {progress.maxPoints} points earned
              </p>
              
              {/* Category breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {categoryStats.map(({ category, total, unlocked }) => (
                  <div
                    key={category}
                    className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                  >
                    <span className="text-xl">{CATEGORY_INFO[category].icon}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{CATEGORY_INFO[category].name}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {unlocked}/{total}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Your Stats</p>
              <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p>👀 {stats.agentsViewed.length} agents viewed</p>
                <p>📋 {stats.snippetsCopied} snippets copied</p>
                <p>⌨️ {stats.shortcutsUsed} shortcuts used</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_INFO).map(([key, { name, icon }]) => (
                <option key={key} value={key}>{icon} {name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'default' | 'points' | 'rarity')}
              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
            >
              <option value="default">Default</option>
              <option value="points">Points (High to Low)</option>
              <option value="rarity">Rarity</option>
            </select>
          </div>
          
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showLocked}
              onChange={(e) => setShowLocked(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            <span className="text-gray-700 dark:text-gray-300">Show locked</span>
          </label>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              unlocked={!!achievement.unlockedAt}
            />
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-4xl mb-2">🔍</p>
            <p>No achievements match your filters.</p>
          </div>
        )}

        {/* Tips */}
        <div className="mt-12 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">💡 Tips to Unlock More</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-start gap-2">
              <span>🎮</span>
              <span>Try the <Link href="/playground" className="text-orange-600 hover:underline">API Playground</Link> to test agents</span>
            </div>
            <div className="flex items-start gap-2">
              <span>⚙️</span>
              <span>Generate SDKs at <Link href="/sdk" className="text-orange-600 hover:underline">/sdk</Link> for quick integration</span>
            </div>
            <div className="flex items-start gap-2">
              <span>⚖️</span>
              <span><Link href="/compare" className="text-orange-600 hover:underline">Compare agents</Link> to find the best fit</span>
            </div>
            <div className="flex items-start gap-2">
              <span>🏗️</span>
              <span>Build workflows in the <Link href="/workflows" className="text-orange-600 hover:underline">Workflow Builder</Link></span>
            </div>
            <div className="flex items-start gap-2">
              <span>📋</span>
              <span>Complete the <Link href="/checklist" className="text-orange-600 hover:underline">Production Checklist</Link></span>
            </div>
            <div className="flex items-start gap-2">
              <span>⌨️</span>
              <span>Press <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">⌘K</kbd> for command palette</span>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <Link href="/dashboard" className="text-orange-600 hover:underline">Dashboard</Link>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <Link href="/leaderboard" className="text-orange-600 hover:underline">Leaderboard</Link>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <Link href="/showcase" className="text-orange-600 hover:underline">Community Showcase</Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}
