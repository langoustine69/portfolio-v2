'use client';

import { useState, useEffect, useCallback } from 'react';

export interface SandboxCredits {
  [agentId: string]: {
    used: number;
    lastReset: string;
  };
}

const MAX_FREE_CALLS = 5;
const STORAGE_KEY = 'x402-sandbox-credits';

export function useSandboxCredits() {
  const [credits, setCredits] = useState<SandboxCredits>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Check if any credits need daily reset
        const today = new Date().toISOString().split('T')[0];
        const updated: SandboxCredits = {};
        for (const [agentId, data] of Object.entries(parsed)) {
          const agentData = data as { used: number; lastReset: string };
          if (agentData.lastReset !== today) {
            // Reset daily credits
            updated[agentId] = { used: 0, lastReset: today };
          } else {
            updated[agentId] = agentData;
          }
        }
        setCredits(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        setCredits({});
      }
    }
    setIsLoaded(true);
  }, []);

  const getRemaining = useCallback((agentId: string): number => {
    const agentCredits = credits[agentId];
    if (!agentCredits) return MAX_FREE_CALLS;
    return Math.max(0, MAX_FREE_CALLS - agentCredits.used);
  }, [credits]);

  const useCredit = useCallback((agentId: string): boolean => {
    const remaining = getRemaining(agentId);
    if (remaining <= 0) return false;

    const today = new Date().toISOString().split('T')[0];
    const newCredits = {
      ...credits,
      [agentId]: {
        used: (credits[agentId]?.used || 0) + 1,
        lastReset: today,
      },
    };
    setCredits(newCredits);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCredits));
    return true;
  }, [credits, getRemaining]);

  const resetCredits = useCallback((agentId?: string) => {
    if (agentId) {
      const today = new Date().toISOString().split('T')[0];
      const newCredits = {
        ...credits,
        [agentId]: { used: 0, lastReset: today },
      };
      setCredits(newCredits);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newCredits));
    } else {
      setCredits({});
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [credits]);

  const getTotalUsed = useCallback((): number => {
    return Object.values(credits).reduce((sum, c) => sum + c.used, 0);
  }, [credits]);

  return {
    credits,
    getRemaining,
    useCredit,
    resetCredits,
    getTotalUsed,
    maxFreeCallsPerAgent: MAX_FREE_CALLS,
    isLoaded,
  };
}
