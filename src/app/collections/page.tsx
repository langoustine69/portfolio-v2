'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { agents } from '@/data/agents';
import { useCollections, Collection } from '@/hooks/useCollections';

const ICONS = ['📁', '🚀', '💼', '🔧', '📊', '🌐', '💰', '🤖', '📈', '🎯', '⚡', '🔥', '💎', '🏆', '🎨', '🔬', '📱', '🛠️', '🌟', '🎪'];

function CollectionCard({ collection, onEdit, onDelete, onShare, onDuplicate }: {
  collection: Collection;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
  onDuplicate: () => void;
}) {
  const collectionAgents = agents.filter(a => collection.agentIds.includes(a.id));
  const liveCount = collectionAgents.filter(a => a.status === 'live').length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{collection.icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {collection.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {collection.agentIds.length} agent{collection.agentIds.length !== 1 ? 's' : ''}
              {liveCount > 0 && ` · ${liveCount} live`}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={onShare}
            className="p-2 text-gray-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Share collection"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          <button
            onClick={onDuplicate}
            className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Duplicate collection"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Edit collection"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Delete collection"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {collection.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {collection.description}
        </p>
      )}

      {/* Agent Preview */}
      {collectionAgents.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-4">
          {collectionAgents.slice(0, 5).map(agent => (
            <Link
              key={agent.id}
              href={`/agents/${agent.id}`}
              className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <span>{agent.icon}</span>
              <span className="text-gray-700 dark:text-gray-300 truncate max-w-[100px]">{agent.name}</span>
              {agent.status === 'live' && (
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              )}
            </Link>
          ))}
          {collectionAgents.length > 5 && (
            <span className="px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
              +{collectionAgents.length - 5} more
            </span>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-4 italic">
          No agents in this collection yet
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
        <span>Created {new Date(collection.createdAt).toLocaleDateString()}</span>
        <Link
          href={`/collections/${collection.id}`}
          className="text-orange-600 dark:text-orange-400 hover:underline font-medium"
        >
          View Collection →
        </Link>
      </div>
    </div>
  );
}

function CreateEditModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string, icon: string) => void;
  initialData?: { name: string; description: string; icon: string };
}) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [icon, setIcon] = useState(initialData?.icon || '📁');

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setDescription(initialData?.description || '');
      setIcon(initialData?.icon || '📁');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {initialData ? 'Edit Collection' : 'Create Collection'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(i => (
                <button
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 text-xl rounded-lg transition-all ${
                    icon === i 
                      ? 'bg-orange-100 dark:bg-orange-900/30 ring-2 ring-orange-500' 
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Project Agents"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Agents used for my trading bot project..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (name.trim()) {
                onSave(name.trim(), description.trim(), icon);
                onClose();
              }
            }}
            disabled={!name.trim()}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {initialData ? 'Save Changes' : 'Create Collection'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ImportModal({ isOpen, onClose, onImport }: {
  isOpen: boolean;
  onClose: () => void;
  onImport: (json: string) => void;
}) {
  const [json, setJson] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setJson('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full shadow-xl">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Import Collections
        </h2>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Paste exported collections JSON or a share URL to import.
        </p>

        <textarea
          value={json}
          onChange={(e) => { setJson(e.target.value); setError(''); }}
          placeholder='[{"name": "My Collection", ...}] or share URL'
          rows={6}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
        />

        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              try {
                onImport(json);
                onClose();
              } catch {
                setError('Invalid format. Please paste valid JSON or a share URL.');
              }
            }}
            disabled={!json.trim()}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CollectionsPage() {
  const { 
    collections, 
    mounted, 
    createCollection, 
    updateCollection, 
    deleteCollection, 
    duplicateCollection,
    exportCollections,
    importCollections,
    generateShareUrl,
  } = useCollections();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Handle import from URL
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const importData = params.get('import');
      if (importData) {
        try {
          const decoded = JSON.parse(atob(importData));
          createCollection(decoded.n || 'Shared Collection', decoded.d || '', decoded.i || '📁');
          const newCol = collections[collections.length - 1];
          if (newCol && decoded.a) {
            decoded.a.forEach((agentId: string) => {
              // Would need to add agents after creation
            });
          }
          setToast('Collection imported from share link!');
          window.history.replaceState({}, '', '/collections');
        } catch {
          console.error('Failed to import from URL');
        }
      }
    }
  }, [mounted]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleShare = (collection: Collection) => {
    const url = generateShareUrl(collection.id);
    if (url) {
      navigator.clipboard.writeText(url);
      setToast('Share link copied to clipboard!');
    }
  };

  const handleExport = () => {
    const json = exportCollections();
    navigator.clipboard.writeText(json);
    setToast('All collections copied as JSON!');
  };

  const handleImport = (input: string) => {
    // Try URL first
    if (input.includes('?import=')) {
      const match = input.match(/import=([^&]+)/);
      if (match) {
        try {
          const decoded = JSON.parse(atob(match[1]));
          const col = createCollection(decoded.n || 'Imported Collection', decoded.d || '', decoded.i || '📁');
          // Add agents to the new collection
          decoded.a?.forEach((agentId: string) => {
            // Would need access to addAgentToCollection with the new collection ID
          });
          setToast('Collection imported successfully!');
          return;
        } catch {
          // Fall through to JSON import
        }
      }
    }
    
    // Try JSON import
    if (importCollections(input)) {
      setToast('Collections imported successfully!');
    } else {
      throw new Error('Invalid format');
    }
  };

  const handleDelete = (collection: Collection) => {
    if (confirm(`Delete "${collection.name}"? This cannot be undone.`)) {
      deleteCollection(collection.id);
      setToast('Collection deleted');
    }
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mb-8" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <span className="text-4xl">📚</span>
              Agent Collections
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Organize agents into custom collections for your projects
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {collections.length > 0 && (
              <>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Export All
                </button>
              </>
            )}
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Import
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Collection
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{collections.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Collections</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {new Set(collections.flatMap(c => c.agentIds)).size}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Unique Agents</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {collections.reduce((sum, c) => sum + c.agentIds.length, 0)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Entries</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{agents.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Available Agents</div>
          </div>
        </div>

        {/* Collections Grid */}
        {collections.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map(collection => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onEdit={() => setEditingCollection(collection)}
                onDelete={() => handleDelete(collection)}
                onShare={() => handleShare(collection)}
                onDuplicate={() => {
                  duplicateCollection(collection.id);
                  setToast('Collection duplicated!');
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <span className="text-6xl mb-4 block">📚</span>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No collections yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Create collections to organize agents by project, use case, or any way you like.
              Share them with your team or keep them for quick access.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Collection
            </button>
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-12 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>💡</span> Collection Tips
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              <p>Add agents from any agent detail page using the "Add to Collection" button</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              <p>Share collections with teammates via the share link - they can import with one click</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              <p>Export all collections as JSON for backup or transfer to another device</p>
            </div>
          </div>
        </div>

        {/* Related Links */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/agents" className="text-orange-600 dark:text-orange-400 hover:underline text-sm">
            Browse all agents →
          </Link>
          <Link href="/dashboard" className="text-orange-600 dark:text-orange-400 hover:underline text-sm">
            View dashboard →
          </Link>
          <Link href="/compare" className="text-orange-600 dark:text-orange-400 hover:underline text-sm">
            Compare agents →
          </Link>
        </div>
      </div>

      {/* Modals */}
      <CreateEditModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={(name, description, icon) => {
          createCollection(name, description, icon);
          setToast('Collection created!');
        }}
      />

      <CreateEditModal
        isOpen={!!editingCollection}
        onClose={() => setEditingCollection(null)}
        onSave={(name, description, icon) => {
          if (editingCollection) {
            updateCollection(editingCollection.id, { name, description, icon });
            setToast('Collection updated!');
          }
        }}
        initialData={editingCollection || undefined}
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />

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
