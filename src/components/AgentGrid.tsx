'use client';

import { useState, useMemo, useEffect } from 'react';
import { agents, categories, Agent } from '@/data/agents';
import AgentCard from './AgentCard';
import CategoryNav from './CategoryNav';
import { useFavorites } from '@/hooks/useFavorites';

interface AgentGridProps {
  showFilters?: boolean;
  limit?: number;
  showDetails?: boolean;
  showCategoryNav?: boolean;
  initialCategory?: string;
  /** When enabled, syncs category with URL params. Must be wrapped in Suspense. */
  syncWithUrl?: boolean;
}

// Hook for URL syncing - only used when syncWithUrl is true
function useUrlSync(enabled: boolean, initialCategory: string) {
  // Dynamically import to avoid SSR issues when not needed
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);
  
  useEffect(() => {
    if (enabled && typeof window !== 'undefined') {
      setSearchParams(new URLSearchParams(window.location.search));
      
      // Listen for popstate to sync back button
      const handlePopState = () => {
        setSearchParams(new URLSearchParams(window.location.search));
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [enabled]);
  
  const urlCategory = searchParams?.get('category');
  
  const updateUrl = (category: string) => {
    if (!enabled || typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.pushState({}, '', newUrl);
  };
  
  return { urlCategory: urlCategory || initialCategory, updateUrl };
}

export default function AgentGrid({ 
  showFilters = true, 
  limit, 
  showDetails = false,
  showCategoryNav = false,
  initialCategory = 'all',
  syncWithUrl = false,
}: AgentGridProps) {
  const { urlCategory, updateUrl } = useUrlSync(syncWithUrl, initialCategory);
  const { favoritesSet, hasFavorites, count: favoritesCount, mounted: favoritesMounted } = useFavorites();
  
  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);

  // Sync with URL changes
  useEffect(() => {
    if (syncWithUrl && urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory);
    }
  }, [urlCategory, syncWithUrl]);

  // Update URL when category changes (only if syncWithUrl is enabled)
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (syncWithUrl) {
      updateUrl(category);
    }
  };

  const filteredAgents = useMemo(() => {
    let result = agents;

    // Favorites filter
    if (showFavoritesOnly && favoritesMounted) {
      result = result.filter(agent => favoritesSet.has(agent.id));
    }

    // Search filter - matches name, description, category, apiSource, and features
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(agent => 
        agent.name.toLowerCase().includes(query) ||
        agent.description.toLowerCase().includes(query) ||
        agent.category.toLowerCase().includes(query) ||
        agent.apiSource.toLowerCase().includes(query) ||
        agent.features.some(f => f.toLowerCase().includes(query))
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(a => a.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      result = result.filter(a => a.status === selectedStatus);
    }

    if (limit) {
      result = result.slice(0, limit);
    }

    return result;
  }, [searchQuery, selectedCategory, selectedStatus, limit, showFavoritesOnly, favoritesSet, favoritesMounted]);

  const liveCount = agents.filter(a => a.status === 'live').length;
  const buildingCount = agents.filter(a => a.status === 'building').length;
  const offlineCount = agents.filter(a => a.status === 'offline').length;

  return (
    <div>
      {showFilters && (
        <div className="mb-8">
          {/* Stats */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="bg-shell-800/50 dark:bg-shell-800/50 light:bg-white/80 border border-shell-700 dark:border-shell-700 light:border-shell-200 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold text-shell-100 dark:text-shell-100 light:text-shell-900">{agents.length}</span>
              <span className="text-shell-400 dark:text-shell-400 light:text-shell-600 ml-2">Total Agents</span>
            </div>
            <div className="bg-shell-800/50 dark:bg-shell-800/50 light:bg-white/80 border border-shell-700 dark:border-shell-700 light:border-shell-200 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold text-lobster-400 dark:text-lobster-400 light:text-lobster-600">{liveCount}</span>
              <span className="text-shell-400 dark:text-shell-400 light:text-shell-600 ml-2">Live</span>
            </div>
            <div className="bg-shell-800/50 dark:bg-shell-800/50 light:bg-white/80 border border-shell-700 dark:border-shell-700 light:border-shell-200 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold text-yellow-400 dark:text-yellow-400 light:text-yellow-600">{buildingCount}</span>
              <span className="text-shell-400 dark:text-shell-400 light:text-shell-600 ml-2">Building</span>
            </div>
            <div className="bg-shell-800/50 dark:bg-shell-800/50 light:bg-white/80 border border-shell-700 dark:border-shell-700 light:border-shell-200 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold text-shell-400 dark:text-shell-400 light:text-shell-500">{offlineCount}</span>
              <span className="text-shell-400 dark:text-shell-400 light:text-shell-600 ml-2">Offline</span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search input */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-shell-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-shell-800 dark:bg-shell-800 light:bg-white border border-shell-700 dark:border-shell-700 light:border-shell-200 rounded-lg pl-10 pr-4 py-2 text-sm text-shell-100 dark:text-shell-100 light:text-shell-900 placeholder-shell-500 focus:outline-none focus:ring-2 focus:ring-lobster-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-shell-400 hover:text-shell-200 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Category filter (dropdown - hidden when CategoryNav is shown) */}
            {!showCategoryNav && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-shell-400 dark:text-shell-400 light:text-shell-600">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="bg-shell-800 dark:bg-shell-800 light:bg-white border border-shell-700 dark:border-shell-700 light:border-shell-200 rounded-lg px-3 py-1.5 text-sm text-shell-100 dark:text-shell-100 light:text-shell-900 focus:outline-none focus:ring-2 focus:ring-lobster-500"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            )}

            {/* Status filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-shell-400 dark:text-shell-400 light:text-shell-600">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-shell-800 dark:bg-shell-800 light:bg-white border border-shell-700 dark:border-shell-700 light:border-shell-200 rounded-lg px-3 py-1.5 text-sm text-shell-100 dark:text-shell-100 light:text-shell-900 focus:outline-none focus:ring-2 focus:ring-lobster-500"
              >
                <option value="all">All Status</option>
                <option value="live">Live</option>
                <option value="building">Building</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            {/* Favorites filter */}
            {favoritesMounted && (
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all
                  border focus:outline-none focus:ring-2 focus:ring-lobster-500
                  ${showFavoritesOnly
                    ? 'bg-lobster-500/20 border-lobster-500 text-lobster-300 hover:bg-lobster-500/30'
                    : 'bg-shell-800 dark:bg-shell-800 light:bg-white border-shell-700 dark:border-shell-700 light:border-shell-200 text-shell-400 hover:text-shell-200 hover:border-shell-600'
                  }
                  ${!hasFavorites && !showFavoritesOnly ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                disabled={!hasFavorites && !showFavoritesOnly}
                title={hasFavorites ? `Show ${favoritesCount} favorite${favoritesCount !== 1 ? 's' : ''}` : 'No favorites saved yet'}
              >
                <svg
                  className="w-4 h-4"
                  fill={showFavoritesOnly ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span>Favorites{hasFavorites ? ` (${favoritesCount})` : ''}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results count */}
      {showFilters && (searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' || showFavoritesOnly) && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-shell-400 dark:text-shell-400 light:text-shell-600">
            Showing {filteredAgents.length} of {agents.length} agents
            {showFavoritesOnly && <span className="text-lobster-400"> (favorites only)</span>}
            {searchQuery && <span className="text-lobster-400"> matching "{searchQuery}"</span>}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              handleCategoryChange('all');
              setSelectedStatus('all');
              setShowFavoritesOnly(false);
            }}
            className="text-sm text-lobster-400 hover:text-lobster-300 transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Category Navigation Pills */}
      {showCategoryNav && (
        <div className="mb-8">
          <h3 className="text-sm font-medium text-shell-400 mb-3">Browse by Category</h3>
          <CategoryNav
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            variant="pills"
            showCounts
          />
        </div>
      )}

      {/* Agent Grid */}
      <section 
        id="agents-grid" 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        aria-label={`Agent grid showing ${filteredAgents.length} agents`}
        role="feed"
        aria-busy="false"
      >
        {filteredAgents.map((agent, index) => (
          <div 
            key={agent.id} 
            role="article" 
            aria-posinset={index + 1} 
            aria-setsize={filteredAgents.length}
          >
            <AgentCard agent={agent} showDetails={showDetails} />
          </div>
        ))}
      </section>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">{showFavoritesOnly ? '❤️' : '🔍'}</div>
          <p className="text-shell-400 dark:text-shell-400 light:text-shell-600 mb-2">
            {showFavoritesOnly && !hasFavorites
              ? 'No favorites yet!'
              : searchQuery 
                ? `No agents found matching "${searchQuery}"`
                : 'No agents found matching your filters.'}
          </p>
          <p className="text-sm text-shell-500">
            {showFavoritesOnly && !hasFavorites
              ? 'Click the heart icon on any agent to save it as a favorite.'
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      )}
    </div>
  );
}
