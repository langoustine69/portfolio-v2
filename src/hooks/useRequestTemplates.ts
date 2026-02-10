'use client';

import { useState, useEffect, useCallback } from 'react';

export interface RequestTemplate {
  id: string;
  name: string;
  description: string;
  agentId: string;
  agentName: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  queryParams: Record<string, string>;
  body?: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  author?: string;
}

const STORAGE_KEY = 'langoustine69-request-templates';

// Pre-built community templates
const communityTemplates: RequestTemplate[] = [
  {
    id: 'community-1',
    name: 'Weather Forecast - 7 Day',
    description: 'Get a 7-day weather forecast for any city with daily highs, lows, and conditions.',
    agentId: 'weather-agent',
    agentName: 'Weather Agent',
    endpoint: '/forecast',
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    queryParams: { days: '7', units: 'metric' },
    category: 'Weather',
    tags: ['forecast', 'daily', 'temperature'],
    isPublic: true,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
    usageCount: 1247,
    author: 'langoustine69'
  },
  {
    id: 'community-2',
    name: 'Crypto Price Check',
    description: 'Quick price check for any cryptocurrency with 24h change and volume.',
    agentId: 'crypto-prices',
    agentName: 'Crypto Prices Agent',
    endpoint: '/price',
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    queryParams: { currency: 'usd', include_24h_change: 'true' },
    category: 'Finance',
    tags: ['crypto', 'price', 'bitcoin'],
    isPublic: true,
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
    usageCount: 2891,
    author: 'cryptodev'
  },
  {
    id: 'community-3',
    name: 'News Headlines - Tech',
    description: 'Fetch latest tech news headlines with summaries and source links.',
    agentId: 'news-agent',
    agentName: 'News Agent',
    endpoint: '/headlines',
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    queryParams: { category: 'technology', limit: '10', language: 'en' },
    category: 'News',
    tags: ['headlines', 'tech', 'trending'],
    isPublic: true,
    createdAt: '2026-01-22T00:00:00Z',
    updatedAt: '2026-01-22T00:00:00Z',
    usageCount: 1567,
    author: 'newsbot'
  },
  {
    id: 'community-4',
    name: 'Stock Quote - Extended',
    description: 'Get extended stock quote with pre/post market data and key metrics.',
    agentId: 'stock-data',
    agentName: 'Stock Data Agent',
    endpoint: '/quote',
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    queryParams: { extended: 'true', include_metrics: 'true' },
    category: 'Finance',
    tags: ['stocks', 'quote', 'market'],
    isPublic: true,
    createdAt: '2026-01-25T00:00:00Z',
    updatedAt: '2026-01-25T00:00:00Z',
    usageCount: 943,
    author: 'tradingpro'
  },
  {
    id: 'community-5',
    name: 'Image Analysis - Objects',
    description: 'Detect and classify objects in an image with confidence scores.',
    agentId: 'vision-agent',
    agentName: 'Vision Agent',
    endpoint: '/analyze',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    queryParams: {},
    body: JSON.stringify({ features: ['objects', 'labels'], max_results: 10 }, null, 2),
    category: 'AI/ML',
    tags: ['vision', 'objects', 'detection'],
    isPublic: true,
    createdAt: '2026-01-28T00:00:00Z',
    updatedAt: '2026-01-28T00:00:00Z',
    usageCount: 678,
    author: 'mldev'
  },
  {
    id: 'community-6',
    name: 'Text Translation - Batch',
    description: 'Translate multiple text strings in a single request for efficiency.',
    agentId: 'translate-agent',
    agentName: 'Translate Agent',
    endpoint: '/translate/batch',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    queryParams: {},
    body: JSON.stringify({ target_language: 'es', preserve_formatting: true }, null, 2),
    category: 'Text',
    tags: ['translation', 'batch', 'multilingual'],
    isPublic: true,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
    usageCount: 512,
    author: 'polyglot'
  },
  {
    id: 'community-7',
    name: 'Sentiment Analysis - Social',
    description: 'Analyze sentiment of social media posts with emotion breakdown.',
    agentId: 'sentiment-agent',
    agentName: 'Sentiment Agent',
    endpoint: '/analyze',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    queryParams: {},
    body: JSON.stringify({ include_emotions: true, include_keywords: true }, null, 2),
    category: 'AI/ML',
    tags: ['sentiment', 'social', 'emotions'],
    isPublic: true,
    createdAt: '2026-02-03T00:00:00Z',
    updatedAt: '2026-02-03T00:00:00Z',
    usageCount: 789,
    author: 'datawhiz'
  },
  {
    id: 'community-8',
    name: 'Location Search - Nearby',
    description: 'Find nearby places of interest with ratings and distance.',
    agentId: 'places-agent',
    agentName: 'Places Agent',
    endpoint: '/nearby',
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    queryParams: { radius: '5000', type: 'restaurant', sort_by: 'rating' },
    category: 'Location',
    tags: ['places', 'nearby', 'restaurants'],
    isPublic: true,
    createdAt: '2026-02-05T00:00:00Z',
    updatedAt: '2026-02-05T00:00:00Z',
    usageCount: 445,
    author: 'localfinder'
  }
];

export function useRequestTemplates() {
  const [templates, setTemplates] = useState<RequestTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load templates from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTemplates(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load templates:', e);
    }
    setIsLoading(false);
  }, []);

  // Save templates to localStorage
  const saveTemplates = useCallback((newTemplates: RequestTemplate[]) => {
    setTemplates(newTemplates);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTemplates));
    } catch (e) {
      console.error('Failed to save templates:', e);
    }
  }, []);

  // Add a new template
  const addTemplate = useCallback((template: Omit<RequestTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => {
    const newTemplate: RequestTemplate = {
      ...template,
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0
    };
    saveTemplates([...templates, newTemplate]);
    return newTemplate;
  }, [templates, saveTemplates]);

  // Update a template
  const updateTemplate = useCallback((id: string, updates: Partial<RequestTemplate>) => {
    const newTemplates = templates.map(t => 
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    );
    saveTemplates(newTemplates);
  }, [templates, saveTemplates]);

  // Delete a template
  const deleteTemplate = useCallback((id: string) => {
    saveTemplates(templates.filter(t => t.id !== id));
  }, [templates, saveTemplates]);

  // Increment usage count
  const incrementUsage = useCallback((id: string) => {
    const newTemplates = templates.map(t => 
      t.id === id ? { ...t, usageCount: t.usageCount + 1 } : t
    );
    saveTemplates(newTemplates);
  }, [templates, saveTemplates]);

  // Import template from JSON
  const importTemplate = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json);
      const template: RequestTemplate = {
        ...parsed,
        id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
        isPublic: false
      };
      saveTemplates([...templates, template]);
      return template;
    } catch (e) {
      throw new Error('Invalid template JSON');
    }
  }, [templates, saveTemplates]);

  // Export template to JSON
  const exportTemplate = useCallback((id: string) => {
    const template = templates.find(t => t.id === id) || communityTemplates.find(t => t.id === id);
    if (!template) return null;
    const { id: _, createdAt, updatedAt, usageCount, ...exportable } = template;
    return JSON.stringify(exportable, null, 2);
  }, [templates]);

  // Duplicate a template
  const duplicateTemplate = useCallback((id: string) => {
    const original = templates.find(t => t.id === id) || communityTemplates.find(t => t.id === id);
    if (!original) return null;
    const { id: _, createdAt, updatedAt, usageCount, ...rest } = original;
    return addTemplate({ ...rest, name: `${rest.name} (Copy)`, isPublic: false });
  }, [templates, addTemplate]);

  // Get all templates including community
  const allTemplates = [...communityTemplates, ...templates];

  // Get unique categories
  const categories = [...new Set(allTemplates.map(t => t.category))];

  // Get unique tags
  const allTags = [...new Set(allTemplates.flatMap(t => t.tags))];

  return {
    templates,
    communityTemplates,
    allTemplates,
    categories,
    allTags,
    isLoading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    incrementUsage,
    importTemplate,
    exportTemplate,
    duplicateTemplate
  };
}
