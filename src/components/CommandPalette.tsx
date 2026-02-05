'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { agents } from '@/data/agents';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'agent' | 'page' | 'action';
  href?: string;
  action?: () => void;
}

// Static pages
const pages: CommandItem[] = [
  { id: 'home', title: 'Home', subtitle: 'Back to homepage', icon: '🏠', type: 'page', href: '/' },
  { id: 'agents', title: 'All Agents', subtitle: 'Browse all agents', icon: '🤖', type: 'page', href: '/agents' },
  { id: 'bundles', title: 'Agent Bundles', subtitle: 'Curated agent collections', icon: '📦', type: 'page', href: '/bundles' },
  { id: 'compare', title: 'Compare Agents', subtitle: 'Side-by-side comparison', icon: '⚖️', type: 'page', href: '/compare' },
  { id: 'playground', title: 'API Playground', subtitle: 'Test API endpoints', icon: '🎮', type: 'page', href: '/playground' },
  { id: 'pricing', title: 'Pricing Calculator', subtitle: 'Estimate costs', icon: '💰', type: 'page', href: '/pricing' },
  { id: 'analytics', title: 'Analytics Dashboard', subtitle: 'Usage statistics', icon: '📊', type: 'page', href: '/analytics' },
  { id: 'status', title: 'System Status', subtitle: 'Service health', icon: '🩺', type: 'page', href: '/status' },
  { id: 'changelog', title: 'Changelog', subtitle: 'Release history', icon: '📋', type: 'page', href: '/changelog' },
  { id: 'blog', title: 'Blog', subtitle: 'Articles & updates', icon: '📝', type: 'page', href: '/blog' },
  { id: 'contact', title: 'Contact', subtitle: 'Get in touch', icon: '📧', type: 'page', href: '/contact' },
  { id: 'errors', title: 'Error Reference', subtitle: 'API error codes & solutions', icon: '🚨', type: 'page', href: '/errors' },
];

// Fuzzy search scoring
function fuzzyMatch(query: string, text: string): number {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  
  // Exact match gets highest score
  if (t === q) return 100;
  if (t.startsWith(q)) return 90;
  if (t.includes(q)) return 70;
  
  // Character-by-character fuzzy match
  let score = 0;
  let queryIndex = 0;
  let consecutive = 0;
  
  for (let i = 0; i < t.length && queryIndex < q.length; i++) {
    if (t[i] === q[queryIndex]) {
      score += 10 + consecutive * 5;
      consecutive++;
      queryIndex++;
    } else {
      consecutive = 0;
    }
  }
  
  // All characters matched?
  if (queryIndex === q.length) {
    return score;
  }
  
  return 0;
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  const idx = t.indexOf(q);
  
  if (idx >= 0) {
    return (
      <>
        {text.slice(0, idx)}
        <span className="text-lobster-400 font-semibold">{text.slice(idx, idx + query.length)}</span>
        {text.slice(idx + query.length)}
      </>
    );
  }
  
  return text;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Build command items from agents + pages
  const allItems = useMemo<CommandItem[]>(() => {
    const agentItems: CommandItem[] = agents
      .filter(a => a.status === 'live')
      .map(a => ({
        id: a.id,
        title: a.name,
        subtitle: a.description.slice(0, 60) + (a.description.length > 60 ? '...' : ''),
        icon: a.icon,
        type: 'agent' as const,
        href: `/agents/${a.id}`,
      }));
    
    return [...pages, ...agentItems];
  }, []);

  // Filter and sort by relevance
  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      return allItems.slice(0, 10);
    }
    
    return allItems
      .map(item => ({
        item,
        score: Math.max(
          fuzzyMatch(query, item.title),
          fuzzyMatch(query, item.subtitle || '') * 0.5,
          fuzzyMatch(query, item.type) * 0.3
        ),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ item }) => item);
  }, [query, allItems]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
      selectedEl?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Keyboard handling
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Open with Cmd+K or Ctrl+K
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsOpen(true);
      return;
    }

    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setQuery('');
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        const item = filteredItems[selectedIndex];
        if (item) {
          if (item.href) {
            router.push(item.href);
          } else if (item.action) {
            item.action();
          }
          setIsOpen(false);
          setQuery('');
        }
        break;
    }
  }, [isOpen, filteredItems, selectedIndex, router]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const selectItem = (item: CommandItem) => {
    if (item.href) {
      router.push(item.href);
    } else if (item.action) {
      item.action();
    }
    setIsOpen(false);
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      onClick={() => { setIsOpen(false); setQuery(''); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
      
      {/* Palette */}
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-xl mx-4 bg-shell-900 dark:bg-shell-900 light:bg-white border border-shell-700 dark:border-shell-700 light:border-shell-200 rounded-xl shadow-2xl overflow-hidden animate-scale-in"
      >
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-shell-700 dark:border-shell-700 light:border-shell-200">
          <svg className="w-5 h-5 text-shell-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search agents, pages..."
            className="flex-1 px-3 py-4 bg-transparent text-white dark:text-white light:text-shell-900 placeholder-shell-500 outline-none text-lg"
          />
          <kbd className="px-2 py-1 text-xs font-mono bg-shell-800 dark:bg-shell-800 light:bg-shell-100 text-shell-400 rounded border border-shell-700 dark:border-shell-700 light:border-shell-300">
            esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="px-4 py-8 text-center text-shell-500">
              <span className="text-3xl block mb-2">🦞</span>
              No results for &quot;{query}&quot;
            </div>
          ) : (
            filteredItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => selectItem(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                  idx === selectedIndex
                    ? 'bg-lobster-600/20 border border-lobster-500/50'
                    : 'hover:bg-shell-800 dark:hover:bg-shell-800 light:hover:bg-shell-100 border border-transparent'
                }`}
              >
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white dark:text-white light:text-shell-900">
                    {highlightMatch(item.title, query)}
                  </div>
                  {item.subtitle && (
                    <div className="text-sm text-shell-400 truncate">
                      {highlightMatch(item.subtitle, query)}
                    </div>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  item.type === 'agent' 
                    ? 'bg-lobster-600/20 text-lobster-400' 
                    : 'bg-shell-700 dark:bg-shell-700 light:bg-shell-200 text-shell-400'
                }`}>
                  {item.type}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-shell-700 dark:border-shell-700 light:border-shell-200 bg-shell-800/50 dark:bg-shell-800/50 light:bg-shell-50 text-xs text-shell-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono bg-shell-700 dark:bg-shell-700 light:bg-shell-200 rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 font-mono bg-shell-700 dark:bg-shell-700 light:bg-shell-200 rounded">↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono bg-shell-700 dark:bg-shell-700 light:bg-shell-200 rounded">↵</kbd>
              select
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 font-mono bg-shell-700 dark:bg-shell-700 light:bg-shell-200 rounded">⌘</kbd>
            <kbd className="px-1.5 py-0.5 font-mono bg-shell-700 dark:bg-shell-700 light:bg-shell-200 rounded">K</kbd>
            to open
          </span>
        </div>
      </div>
    </div>
  );
}

// Button to trigger command palette (for mobile/touch)
export function CommandPaletteButton() {
  const handleClick = () => {
    // Dispatch Cmd+K event
    const event = new KeyboardEvent('keydown', { 
      key: 'k', 
      metaKey: true,
      bubbles: true 
    });
    document.dispatchEvent(event);
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-shell-400 hover:text-white dark:hover:text-white light:hover:text-shell-900 bg-shell-800 dark:bg-shell-800 light:bg-shell-100 border border-shell-700 dark:border-shell-700 light:border-shell-300 rounded-lg transition-colors"
      title="Quick search (⌘K)"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <span className="hidden sm:inline">Search</span>
      <kbd className="hidden sm:inline px-1.5 py-0.5 text-xs font-mono bg-shell-700 dark:bg-shell-700 light:bg-shell-200 rounded">⌘K</kbd>
    </button>
  );
}
