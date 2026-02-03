'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'langoustine69-favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavorites(new Set(Array.isArray(parsed) ? parsed : []));
      }
    } catch (e) {
      console.error('Failed to load favorites:', e);
    }
  }, []);

  // Persist to localStorage whenever favorites change
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(favorites)));
      } catch (e) {
        console.error('Failed to save favorites:', e);
      }
    }
  }, [favorites, mounted]);

  const toggleFavorite = useCallback((agentId: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(agentId)) {
        next.delete(agentId);
      } else {
        next.add(agentId);
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback((agentId: string) => {
    return favorites.has(agentId);
  }, [favorites]);

  const addFavorite = useCallback((agentId: string) => {
    setFavorites(prev => new Set(prev).add(agentId));
  }, []);

  const removeFavorite = useCallback((agentId: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.delete(agentId);
      return next;
    });
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites(new Set());
  }, []);

  return {
    favorites: Array.from(favorites),
    favoritesSet: favorites,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    clearFavorites,
    hasFavorites: favorites.size > 0,
    count: favorites.size,
    mounted,
  };
}

export default useFavorites;
