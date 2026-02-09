'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { agents, Agent } from '@/data/agents';
import { useCollections } from '@/hooks/useCollections';

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.id as string;
  
  const {
    getCollection,
    updateCollection,
    addAgentToCollection,
    removeAgentFromCollection,
    generateShareUrl,
    mounted,
  } = useCollections();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const collection = getCollection(collectionId);
  
  const collectionAgents = useMemo(() => {
    if (!collection) return [];
    return collection.agentIds
      .map(id => agents.find(a => a.id === id))
      .filter((a): a is Agent => !!a);
  }, [collection]);

  const availableAgents = useMemo(() => {
    if (!collection) return [];
    const inCollection = new Set(collection.agentIds);
    return agents.filter(a => !inCollection.has(a.id));
  }, [collection]);

  const filteredAvailable = useMemo(() => {
    if (!searchQuery) return availableAgents;
    const q = searchQuery.toLowerCase();
    return availableAgents.filter(a => 
      a.name.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q)
    );
  }, [availableAgents, searchQuery]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleShare = () => {
    const url = generateShareUrl(collectionId);
    if (url) {
      navigator.clipboard.writeText(url);
      setToast('Share link copied!');
    }
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mb-8" />
          </div>
        </div>
      </main>
    );
  }

  if (!collection) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <span className="text-6xl mb-4 block">📭</span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Collection not found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This collection may have been deleted or the link is invalid.
          </p>
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            ← Back to Collections
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/collections" className="hover:text-orange-600 dark:hover:text-orange-400">
            Collections
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">{collection.name}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div className="flex items-start gap-4">
            <span className="text-5xl">{collection.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {collection.name}
              </h1>
              {collection.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">
                  {collection.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{collection.agentIds.length} agent{collection.agentIds.length !== 1 ? 's' : ''}</span>
                <span>•</span>
                <span>Created {new Date(collection.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Agents
            </button>
          </div>
        </div>

        {/* Agents Grid */}
        {collectionAgents.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collectionAgents.map(agent => (
              <div
                key={agent.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow group relative"
              >
                {/* Remove button */}
                <button
                  onClick={() => {
                    removeAgentFromCollection(collectionId, agent.id);
                    setToast(`Removed ${agent.name}`);
                  }}
                  className="absolute top-3 right-3 p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  title="Remove from collection"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{agent.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {agent.name}
                    </h3>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                      agent.status === 'live' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : agent.status === 'building'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {agent.status === 'live' && <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />}
                      {agent.status}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                  {agent.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {agent.category}
                  </span>
                  <Link
                    href={`/agents/${agent.id}`}
                    className="text-sm text-orange-600 dark:text-orange-400 hover:underline"
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <span className="text-6xl mb-4 block">📭</span>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No agents in this collection
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add agents to start organizing your project.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Agents
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/collections" className="text-orange-600 dark:text-orange-400 hover:underline text-sm">
            ← All collections
          </Link>
          <Link href="/agents" className="text-orange-600 dark:text-orange-400 hover:underline text-sm">
            Browse all agents →
          </Link>
          {collectionAgents.length >= 2 && (
            <Link 
              href={`/compare?agents=${collectionAgents.slice(0, 4).map(a => a.id).join(',')}`}
              className="text-orange-600 dark:text-orange-400 hover:underline text-sm"
            >
              Compare these agents →
            </Link>
          )}
        </div>
      </div>

      {/* Add Agents Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] flex flex-col shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Add Agents to Collection
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search agents..."
              className="w-full px-4 py-2 mb-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />

            <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
              {filteredAvailable.length > 0 ? (
                filteredAvailable.map(agent => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{agent.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {agent.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {agent.category} • {agent.status}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        addAgentToCollection(collectionId, agent.id);
                        setToast(`Added ${agent.name}`);
                      }}
                      className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {searchQuery 
                    ? 'No agents match your search' 
                    : 'All agents are already in this collection!'}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowAddModal(false)}
                className="w-full px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-4 z-50">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {toast}
        </div>
      )}
    </main>
  );
}
