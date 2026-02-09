'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'langoustine69-collections';

export interface Collection {
  id: string;
  name: string;
  description: string;
  icon: string;
  agentIds: string[];
  createdAt: string;
  updatedAt: string;
}

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load collections from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCollections(Array.isArray(parsed) ? parsed : []);
      }
    } catch (e) {
      console.error('Failed to load collections:', e);
    }
  }, []);

  // Persist to localStorage whenever collections change
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
      } catch (e) {
        console.error('Failed to save collections:', e);
      }
    }
  }, [collections, mounted]);

  const generateId = () => `col_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const createCollection = useCallback((name: string, description: string = '', icon: string = '📁') => {
    const newCollection: Collection = {
      id: generateId(),
      name,
      description,
      icon,
      agentIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCollections(prev => [...prev, newCollection]);
    return newCollection;
  }, []);

  const updateCollection = useCallback((id: string, updates: Partial<Omit<Collection, 'id' | 'createdAt'>>) => {
    setCollections(prev => prev.map(col => 
      col.id === id 
        ? { ...col, ...updates, updatedAt: new Date().toISOString() }
        : col
    ));
  }, []);

  const deleteCollection = useCallback((id: string) => {
    setCollections(prev => prev.filter(col => col.id !== id));
  }, []);

  const addAgentToCollection = useCallback((collectionId: string, agentId: string) => {
    setCollections(prev => prev.map(col => {
      if (col.id === collectionId && !col.agentIds.includes(agentId)) {
        return {
          ...col,
          agentIds: [...col.agentIds, agentId],
          updatedAt: new Date().toISOString(),
        };
      }
      return col;
    }));
  }, []);

  const removeAgentFromCollection = useCallback((collectionId: string, agentId: string) => {
    setCollections(prev => prev.map(col => {
      if (col.id === collectionId) {
        return {
          ...col,
          agentIds: col.agentIds.filter(id => id !== agentId),
          updatedAt: new Date().toISOString(),
        };
      }
      return col;
    }));
  }, []);

  const isAgentInCollection = useCallback((collectionId: string, agentId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    return collection?.agentIds.includes(agentId) ?? false;
  }, [collections]);

  const getCollectionsForAgent = useCallback((agentId: string) => {
    return collections.filter(col => col.agentIds.includes(agentId));
  }, [collections]);

  const getCollection = useCallback((id: string) => {
    return collections.find(c => c.id === id);
  }, [collections]);

  const duplicateCollection = useCallback((id: string) => {
    const source = collections.find(c => c.id === id);
    if (!source) return null;
    
    const newCollection: Collection = {
      id: generateId(),
      name: `${source.name} (Copy)`,
      description: source.description,
      icon: source.icon,
      agentIds: [...source.agentIds],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCollections(prev => [...prev, newCollection]);
    return newCollection;
  }, [collections]);

  const exportCollections = useCallback(() => {
    return JSON.stringify(collections, null, 2);
  }, [collections]);

  const importCollections = useCallback((json: string, merge: boolean = true) => {
    try {
      const imported = JSON.parse(json);
      if (!Array.isArray(imported)) throw new Error('Invalid format');
      
      if (merge) {
        setCollections(prev => {
          const existingIds = new Set(prev.map(c => c.id));
          const newCollections = imported.filter((c: Collection) => !existingIds.has(c.id));
          return [...prev, ...newCollections];
        });
      } else {
        setCollections(imported);
      }
      return true;
    } catch (e) {
      console.error('Failed to import collections:', e);
      return false;
    }
  }, []);

  const generateShareUrl = useCallback((id: string) => {
    const collection = collections.find(c => c.id === id);
    if (!collection) return null;
    
    const shareData = {
      n: collection.name,
      d: collection.description,
      i: collection.icon,
      a: collection.agentIds,
    };
    const encoded = btoa(JSON.stringify(shareData));
    return `${typeof window !== 'undefined' ? window.location.origin : ''}/collections?import=${encoded}`;
  }, [collections]);

  return {
    collections,
    mounted,
    createCollection,
    updateCollection,
    deleteCollection,
    addAgentToCollection,
    removeAgentFromCollection,
    isAgentInCollection,
    getCollectionsForAgent,
    getCollection,
    duplicateCollection,
    exportCollections,
    importCollections,
    generateShareUrl,
    hasCollections: collections.length > 0,
    count: collections.length,
  };
}

export default useCollections;
