'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useReputationScores, ReputationScore } from '@/hooks/useReputationScores';
import Breadcrumbs from '@/components/Breadcrumbs';

const tierConfig = {
  platinum: { icon: '💎', label: 'Platinum', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30' },
  gold: { icon: '🥇', label: 'Gold', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  silver: { icon: '🥈', label: 'Silver', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30' },
  bronze: { icon: '🥉', label: 'Bronze', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  new: { icon: '🆕', label: 'New', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
};

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  
  const getColor = (s: number) => {
    if (s >= 90) return '#10b981'; // emerald
    if (s >= 80) return '#84cc16'; // lime
    if (s >= 70) return '#eab308'; // yellow
    if (s >= 60) return '#f97316'; // orange
    return '#ef4444'; // red
  };
  
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        className="text-gray-700"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={getColor(score)}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        className="transition-all duration-500"
      />
    </svg>
  );
}

function FactorBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-300">{Math.round(value)}%</span>
      </div>
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function ReputationCard({ reputation }: { reputation: ReputationScore }) {
  const [expanded, setExpanded] = useState(false);
  const tier = tierConfig[reputation.tier];
  
  return (
    <div className={`bg-gray-800/50 rounded-xl border ${tier.border} hover:border-opacity-60 transition-all`}>
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-4">
          {/* Score Ring */}
          <div className="relative flex-shrink-0">
            <ScoreRing score={reputation.score} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xl font-bold ${reputation.gradeColor}`}>
                {reputation.grade}
              </span>
            </div>
          </div>
          
          {/* Agent Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{reputation.agent.icon}</span>
              <Link 
                href={`/agents/${reputation.agent.id}`}
                className="font-semibold text-white hover:text-blue-400 transition-colors truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {reputation.agent.name}
              </Link>
              <span className={`px-1.5 py-0.5 rounded text-xs ${
                reputation.agent.status === 'live' 
                  ? 'bg-green-500/20 text-green-400'
                  : reputation.agent.status === 'offline'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {reputation.agent.status}
              </span>
            </div>
            
            <p className="text-sm text-gray-400 truncate mb-2">
              {reputation.agent.category} • {reputation.agent.apiSource}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className={tier.color}>
                {tier.icon} {tier.label}
              </span>
              <span>Score: {reputation.score}/100</span>
              <span>{reputation.daysSinceLaunch}d old</span>
              <span className="ml-auto text-gray-600">
                {expanded ? '▲ Less' : '▼ More'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-700/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Factor Breakdown */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300">Trust Factors</h4>
              <FactorBar label="Uptime" value={reputation.factors.uptime} color="bg-emerald-500" />
              <FactorBar label="Response Time" value={reputation.factors.responseTime} color="bg-blue-500" />
              <FactorBar label="Age/Maturity" value={reputation.factors.age} color="bg-violet-500" />
              <FactorBar label="Maintenance" value={reputation.factors.maintenance} color="bg-yellow-500" />
              <FactorBar label="Reliability" value={reputation.factors.reliability} color="bg-cyan-500" />
            </div>
            
            {/* Stats */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300">Agent Stats</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Launched</div>
                  <div className="text-sm text-gray-200">{reputation.launchDate}</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Last Update</div>
                  <div className="text-sm text-gray-200">{reputation.lastUpdate}</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Versions</div>
                  <div className="text-sm text-gray-200">{reputation.totalVersions}</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Avg. Uptime</div>
                  <div className="text-sm text-gray-200">{reputation.factors.uptime.toFixed(1)}%</div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-2">
                <Link
                  href={`/agents/${reputation.agent.id}`}
                  className="flex-1 text-center px-3 py-2 bg-blue-500/20 text-blue-400 text-sm rounded-lg hover:bg-blue-500/30 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Agent
                </Link>
                <Link
                  href={`/playground?agent=${reputation.agent.id}`}
                  className="flex-1 text-center px-3 py-2 bg-violet-500/20 text-violet-400 text-sm rounded-lg hover:bg-violet-500/30 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Try in Playground
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TierSummaryCard({ tier, count, avgScore }: { tier: keyof typeof tierConfig; count: number; avgScore: number }) {
  const config = tierConfig[tier];
  return (
    <div className={`${config.bg} rounded-xl p-4 border ${config.border}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{config.icon}</span>
        <span className={`font-semibold ${config.color}`}>{config.label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{count}</div>
      <div className="text-xs text-gray-400">agents • avg {avgScore.toFixed(0)} pts</div>
    </div>
  );
}

export default function ReputationPage() {
  const allScores = useReputationScores();
  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'age' | 'name'>('score');
  
  // Calculate tier stats
  const tierStats = useMemo(() => {
    const stats: Record<string, { count: number; totalScore: number }> = {
      platinum: { count: 0, totalScore: 0 },
      gold: { count: 0, totalScore: 0 },
      silver: { count: 0, totalScore: 0 },
      bronze: { count: 0, totalScore: 0 },
      new: { count: 0, totalScore: 0 },
    };
    
    allScores.forEach(r => {
      stats[r.tier].count++;
      stats[r.tier].totalScore += r.score;
    });
    
    return Object.entries(stats).map(([tier, data]) => ({
      tier: tier as keyof typeof tierConfig,
      count: data.count,
      avgScore: data.count > 0 ? data.totalScore / data.count : 0,
    }));
  }, [allScores]);
  
  // Filter and sort
  const filteredScores = useMemo(() => {
    let result = [...allScores];
    
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(r => 
        r.agent.name.toLowerCase().includes(s) ||
        r.agent.category.toLowerCase().includes(s) ||
        r.agent.id.toLowerCase().includes(s)
      );
    }
    
    if (selectedTier !== 'all') {
      result = result.filter(r => r.tier === selectedTier);
    }
    
    if (selectedStatus !== 'all') {
      result = result.filter(r => r.agent.status === selectedStatus);
    }
    
    switch (sortBy) {
      case 'score':
        result.sort((a, b) => b.score - a.score);
        break;
      case 'age':
        result.sort((a, b) => b.daysSinceLaunch - a.daysSinceLaunch);
        break;
      case 'name':
        result.sort((a, b) => a.agent.name.localeCompare(b.agent.name));
        break;
    }
    
    return result;
  }, [allScores, search, selectedTier, selectedStatus, sortBy]);
  
  const avgOverallScore = useMemo(() => {
    if (allScores.length === 0) return 0;
    return allScores.reduce((sum, r) => sum + r.score, 0) / allScores.length;
  }, [allScores]);
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            🛡️ Agent Reputation Scores
          </h1>
          <p className="text-gray-400">
            Trust scores based on uptime, response time, age, and maintenance activity.
            Higher scores indicate more reliable and established agents.
          </p>
        </div>
        
        {/* Overall Stats */}
        <div className="bg-gradient-to-r from-blue-500/10 to-violet-500/10 rounded-2xl p-6 border border-blue-500/20 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <ScoreRing score={avgOverallScore} size={120} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{avgOverallScore.toFixed(0)}</span>
                <span className="text-xs text-gray-400">avg score</span>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-semibold mb-2">Portfolio Health</h2>
              <p className="text-gray-400 text-sm mb-4">
                {allScores.length} agents tracked • {allScores.filter(r => r.tier === 'platinum' || r.tier === 'gold').length} high-reputation agents
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                  {allScores.filter(r => r.agent.status === 'live').length} Live
                </span>
                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                  {allScores.filter(r => r.agent.status === 'offline').length} Offline
                </span>
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                  {allScores.filter(r => r.agent.status === 'building').length} Building
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tier Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {tierStats.map(({ tier, count, avgScore }) => (
            <TierSummaryCard key={tier} tier={tier} count={count} avgScore={avgScore} />
          ))}
        </div>
        
        {/* Filters */}
        <div className="bg-gray-800/50 rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search agents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Tiers</option>
            <option value="platinum">💎 Platinum</option>
            <option value="gold">🥇 Gold</option>
            <option value="silver">🥈 Silver</option>
            <option value="bronze">🥉 Bronze</option>
            <option value="new">🆕 New</option>
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="live">🟢 Live</option>
            <option value="offline">🔴 Offline</option>
            <option value="building">🟡 Building</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="score">Sort: Score</option>
            <option value="age">Sort: Age</option>
            <option value="name">Sort: Name</option>
          </select>
          
          <span className="text-sm text-gray-400">
            {filteredScores.length} agent{filteredScores.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {/* Scoring Methodology */}
        <div className="bg-gray-800/30 rounded-xl p-4 mb-6 border border-gray-700/50">
          <details>
            <summary className="cursor-pointer text-sm font-medium text-gray-300 hover:text-white">
              📊 How Reputation Scores are Calculated
            </summary>
            <div className="mt-3 text-sm text-gray-400 space-y-2">
              <p>Each agent&apos;s trust score is calculated from 5 weighted factors:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong className="text-emerald-400">Uptime (35%)</strong> — Historical availability percentage</li>
                <li><strong className="text-blue-400">Response Time (20%)</strong> — Average latency performance</li>
                <li><strong className="text-violet-400">Age/Maturity (15%)</strong> — Time since launch (max at 60 days)</li>
                <li><strong className="text-yellow-400">Maintenance (15%)</strong> — Changelog activity and updates</li>
                <li><strong className="text-cyan-400">Reliability (15%)</strong> — Incident history and stability</li>
              </ul>
              <p className="mt-2">
                <strong>Tiers:</strong> Platinum (90+), Gold (80-89), Silver (70-79), Bronze (60-69), New (&lt;60)
              </p>
            </div>
          </details>
        </div>
        
        {/* Agent List */}
        <div className="space-y-4">
          {filteredScores.map((reputation, index) => (
            <div key={reputation.agent.id} className="relative">
              {index < 3 && selectedTier === 'all' && sortBy === 'score' && !search && (
                <div className="absolute -left-2 -top-2 z-10">
                  <span className={`text-2xl ${
                    index === 0 ? 'drop-shadow-[0_0_10px_gold]' : 
                    index === 1 ? 'drop-shadow-[0_0_8px_silver]' : 
                    'drop-shadow-[0_0_6px_#cd7f32]'
                  }`}>
                    {index === 0 ? '🏆' : index === 1 ? '🥈' : '🥉'}
                  </span>
                </div>
              )}
              <ReputationCard reputation={reputation} />
            </div>
          ))}
          
          {filteredScores.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No agents match your filters.
            </div>
          )}
        </div>
        
        {/* Related Links */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Related Pages</h3>
          <div className="flex flex-wrap gap-2">
            <Link href="/status" className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors">
              📊 System Status
            </Link>
            <Link href="/uptime" className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors">
              📅 Uptime Calendar
            </Link>
            <Link href="/reliability" className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors">
              ⚡ SLA & Reliability
            </Link>
            <Link href="/leaderboard" className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors">
              🏆 Leaderboard
            </Link>
            <Link href="/health-score" className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors">
              💚 Integration Health
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
