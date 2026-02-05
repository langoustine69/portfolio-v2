'use client';

import { useState, useEffect, useCallback } from 'react';

export interface PlaygroundRequest {
  id: string;
  timestamp: number;
  agentId: string;
  agentName: string;
  agentIcon: string;
  method: string;
  path: string;
  params: Record<string, string>;
  url: string;
  responseTime?: number;
  success: boolean;
  statusCode?: number;
}

const STORAGE_KEY = 'langoustine69_playground_history';
const MAX_HISTORY = 50;

export function usePlaygroundHistory() {
  const [history, setHistory] = useState<PlaygroundRequest[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load playground history:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when history changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      } catch (e) {
        console.error('Failed to save playground history:', e);
      }
    }
  }, [history, isLoaded]);

  const addRequest = useCallback((request: Omit<PlaygroundRequest, 'id' | 'timestamp'>) => {
    const newRequest: PlaygroundRequest = {
      ...request,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    
    setHistory(prev => {
      const updated = [newRequest, ...prev].slice(0, MAX_HISTORY);
      return updated;
    });
    
    return newRequest;
  }, []);

  const removeRequest = useCallback((id: string) => {
    setHistory(prev => prev.filter(r => r.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const getRecentForAgent = useCallback((agentId: string, limit = 5) => {
    return history.filter(r => r.agentId === agentId).slice(0, limit);
  }, [history]);

  return {
    history,
    isLoaded,
    addRequest,
    removeRequest,
    clearHistory,
    getRecentForAgent,
  };
}
