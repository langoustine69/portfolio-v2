'use client';

import { useMemo } from 'react';
import { agents, Agent } from '@/data/agents';

export interface ReputationFactors {
  uptime: number;          // 0-100
  responseTime: number;    // 0-100 (inverse, lower is better)
  age: number;             // 0-100 (older = more established)
  maintenance: number;     // 0-100 (changelog activity)
  reliability: number;     // 0-100 (based on status history)
}

export interface ReputationScore {
  agent: Agent;
  score: number;           // 0-100
  grade: string;           // A+, A, B+, etc.
  gradeColor: string;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'new';
  factors: ReputationFactors;
  launchDate: string;
  daysSinceLaunch: number;
  lastUpdate: string;
  totalVersions: number;
}

// Seeded random for consistent mock data
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs((Math.sin(hash) * 10000) % 1);
}

function getGrade(score: number): { grade: string; color: string } {
  if (score >= 95) return { grade: 'A+', color: 'text-emerald-400' };
  if (score >= 90) return { grade: 'A', color: 'text-emerald-500' };
  if (score >= 85) return { grade: 'A-', color: 'text-green-400' };
  if (score >= 80) return { grade: 'B+', color: 'text-lime-400' };
  if (score >= 75) return { grade: 'B', color: 'text-lime-500' };
  if (score >= 70) return { grade: 'B-', color: 'text-yellow-400' };
  if (score >= 65) return { grade: 'C+', color: 'text-yellow-500' };
  if (score >= 60) return { grade: 'C', color: 'text-orange-400' };
  if (score >= 55) return { grade: 'C-', color: 'text-orange-500' };
  if (score >= 50) return { grade: 'D', color: 'text-red-400' };
  return { grade: 'F', color: 'text-red-500' };
}

function getTier(score: number): 'platinum' | 'gold' | 'silver' | 'bronze' | 'new' {
  if (score >= 90) return 'platinum';
  if (score >= 80) return 'gold';
  if (score >= 70) return 'silver';
  if (score >= 60) return 'bronze';
  return 'new';
}

export function calculateReputationScore(agent: Agent): ReputationScore {
  const rand = seededRandom(agent.id);
  const now = new Date('2026-02-10');
  
  // Get launch date from changelog or estimate
  let launchDate = '2026-01-15'; // default
  if (agent.changelog && agent.changelog.length > 0) {
    const sorted = [...agent.changelog].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    launchDate = sorted[0].date;
  }
  
  const launchDateObj = new Date(launchDate);
  const daysSinceLaunch = Math.floor((now.getTime() - launchDateObj.getTime()) / (1000 * 60 * 60 * 24));
  
  // Get last update
  let lastUpdate = launchDate;
  if (agent.changelog && agent.changelog.length > 0) {
    const sorted = [...agent.changelog].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    lastUpdate = sorted[0].date;
  }
  
  const totalVersions = agent.changelog?.length || 1;
  
  // Calculate factors
  const factors: ReputationFactors = {
    // Uptime: live agents get 85-99.9%, offline get 0-50%
    uptime: agent.status === 'live' 
      ? 85 + rand * 14.9 
      : agent.status === 'offline' 
        ? rand * 50 
        : 30 + rand * 40,
    
    // Response time score (inverse - 100 = fast, 0 = slow)
    // Based on rate limits - higher limits often mean better infra
    responseTime: agent.status === 'live'
      ? 70 + rand * 30
      : 20 + rand * 40,
    
    // Age score - older = more established, max at 60 days
    age: Math.min(100, (daysSinceLaunch / 60) * 100),
    
    // Maintenance score based on changelog activity
    maintenance: Math.min(100, totalVersions * 20 + rand * 20),
    
    // Reliability based on status
    reliability: agent.status === 'live' 
      ? 80 + rand * 20 
      : agent.status === 'offline' 
        ? 10 + rand * 30 
        : 40 + rand * 30,
  };
  
  // Weighted score calculation
  const weights = {
    uptime: 0.35,
    responseTime: 0.20,
    age: 0.15,
    maintenance: 0.15,
    reliability: 0.15,
  };
  
  const score = Math.round(
    factors.uptime * weights.uptime +
    factors.responseTime * weights.responseTime +
    factors.age * weights.age +
    factors.maintenance * weights.maintenance +
    factors.reliability * weights.reliability
  );
  
  const { grade, color } = getGrade(score);
  
  return {
    agent,
    score,
    grade,
    gradeColor: color,
    tier: getTier(score),
    factors,
    launchDate,
    daysSinceLaunch,
    lastUpdate,
    totalVersions,
  };
}

export function useReputationScores() {
  return useMemo(() => {
    return agents
      .map(calculateReputationScore)
      .sort((a, b) => b.score - a.score);
  }, []);
}

export function useAgentReputation(agentId: string) {
  return useMemo(() => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return null;
    return calculateReputationScore(agent);
  }, [agentId]);
}
