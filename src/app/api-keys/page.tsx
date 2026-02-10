'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  KeyIcon,
  PlusIcon,
  ClipboardIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  ClockIcon,
  ChartBarIcon,
  NoSymbolIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { useApiKeys, ApiKey } from '@/hooks/useApiKeys'

const AVAILABLE_SCOPES = [
  { id: 'read', label: 'Read', description: 'Read agent data and responses' },
  { id: 'write', label: 'Write', description: 'Create and modify resources' },
  { id: 'payments', label: 'Payments', description: 'Process x402 micropayments' },
  { id: 'admin', label: 'Admin', description: 'Full administrative access' },
]

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

function getStatusColor(status: ApiKey['status']): string {
  switch (status) {
    case 'active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    case 'revoked': return 'bg-red-500/10 text-red-400 border-red-500/20'
    case 'expired': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    default: return 'bg-shell-700 text-shell-400'
  }
}

function getScopeColor(scope: string): string {
  switch (scope) {
    case 'read': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    case 'write': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    case 'payments': return 'bg-coral-500/10 text-coral-400 border-coral-500/20'
    case 'admin': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    default: return 'bg-shell-700 text-shell-400'
  }
}

interface CreateKeyModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateKey: (name: string, scopes: string[], expiresInDays?: number) => ApiKey
}

function CreateKeyModal({ isOpen, onClose, onCreateKey }: CreateKeyModalProps) {
  const [name, setName] = useState('')
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['read'])
  const [expiresIn, setExpiresIn] = useState<string>('never')
  const [createdKey, setCreatedKey] = useState<ApiKey | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCreate = () => {
    if (!name.trim()) return
    const expiresInDays = expiresIn === 'never' ? undefined : parseInt(expiresIn)
    const newKey = onCreateKey(name.trim(), selectedScopes, expiresInDays)
    setCreatedKey(newKey)
  }

  const handleCopy = async () => {
    if (!createdKey) return
    await navigator.clipboard.writeText(createdKey.key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = () => {
    setName('')
    setSelectedScopes(['read'])
    setExpiresIn('never')
    setCreatedKey(null)
    setCopied(false)
    onClose()
  }

  const toggleScope = (scope: string) => {
    setSelectedScopes(prev => 
      prev.includes(scope) 
        ? prev.filter(s => s !== scope)
        : [...prev, scope]
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-shell-900 border border-shell-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 text-shell-400 hover:text-white transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {!createdKey ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-coral-500/20 flex items-center justify-center">
                <KeyIcon className="w-5 h-5 text-coral-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Create API Key</h2>
                <p className="text-sm text-shell-400">Generate a new key for your application</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-shell-300 mb-2">
                  Key Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Production API, Mobile App"
                  className="w-full px-4 py-2.5 bg-shell-800 border border-shell-700 rounded-lg text-white placeholder-shell-500 focus:ring-2 focus:ring-coral-500/50 focus:border-coral-500 transition-all"
                />
              </div>

              {/* Scopes */}
              <div>
                <label className="block text-sm font-medium text-shell-300 mb-2">
                  Permissions
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_SCOPES.map(scope => (
                    <button
                      key={scope.id}
                      onClick={() => toggleScope(scope.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        selectedScopes.includes(scope.id)
                          ? 'bg-coral-500/10 border-coral-500/50 text-white'
                          : 'bg-shell-800 border-shell-700 text-shell-400 hover:border-shell-600'
                      }`}
                    >
                      <div className="font-medium text-sm">{scope.label}</div>
                      <div className="text-xs opacity-70 mt-0.5">{scope.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Expiration */}
              <div>
                <label className="block text-sm font-medium text-shell-300 mb-2">
                  Expiration
                </label>
                <select
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  className="w-full px-4 py-2.5 bg-shell-800 border border-shell-700 rounded-lg text-white focus:ring-2 focus:ring-coral-500/50 focus:border-coral-500 transition-all"
                >
                  <option value="never">Never expires</option>
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 bg-shell-800 hover:bg-shell-700 text-shell-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!name.trim() || selectedScopes.length === 0}
                className="flex-1 px-4 py-2.5 bg-coral-500 hover:bg-coral-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Create Key
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <CheckIcon className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Key Created!</h2>
                <p className="text-sm text-shell-400">{createdKey.name}</p>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-5">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-200">
                  <p className="font-medium mb-1">Copy your API key now</p>
                  <p className="text-amber-300/80">
                    This is the only time you&apos;ll see the full key. Store it securely.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-shell-800 rounded-lg p-4 mb-5">
              <div className="flex items-center justify-between gap-3">
                <code className="text-sm text-coral-400 font-mono break-all">
                  {createdKey.key}
                </code>
                <button
                  onClick={handleCopy}
                  className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                    copied 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-shell-700 hover:bg-shell-600 text-white'
                  }`}
                >
                  {copied ? <CheckIcon className="w-4 h-4" /> : <ClipboardIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-2 mb-5">
              {createdKey.scopes.map(scope => (
                <span
                  key={scope}
                  className={`px-2 py-1 text-xs rounded-md border ${getScopeColor(scope)}`}
                >
                  {scope}
                </span>
              ))}
            </div>

            <button
              onClick={handleClose}
              className="w-full px-4 py-2.5 bg-coral-500 hover:bg-coral-600 text-white rounded-lg transition-colors"
            >
              Done
            </button>
          </>
        )}
      </motion.div>
    </div>
  )
}

interface KeyRowProps {
  apiKey: ApiKey
  onRevoke: (id: string) => void
  onDelete: (id: string) => void
  onRegenerate: (id: string) => string | null
}

function KeyRow({ apiKey, onRevoke, onDelete, onRegenerate }: KeyRowProps) {
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showConfirmRevoke, setShowConfirmRevoke] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(apiKey.key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isExpiringSoon = apiKey.expiresAt && 
    apiKey.expiresAt.getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-shell-900 border border-shell-800 rounded-xl p-5"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            apiKey.status === 'active' ? 'bg-coral-500/20' : 'bg-shell-800'
          }`}>
            <KeyIcon className={`w-5 h-5 ${
              apiKey.status === 'active' ? 'text-coral-400' : 'text-shell-500'
            }`} />
          </div>
          <div>
            <h3 className="font-semibold text-white">{apiKey.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 text-xs rounded-full border ${getStatusColor(apiKey.status)}`}>
                {apiKey.status}
              </span>
              {isExpiringSoon && apiKey.status === 'active' && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Expires soon
                </span>
              )}
            </div>
          </div>
        </div>

        {apiKey.status === 'active' && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className={`p-2 rounded-lg transition-colors ${
                copied 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-shell-800 hover:bg-shell-700 text-shell-400'
              }`}
              title="Copy key"
            >
              {copied ? <CheckIcon className="w-4 h-4" /> : <ClipboardIcon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowKey(!showKey)}
              className="p-2 rounded-lg bg-shell-800 hover:bg-shell-700 text-shell-400 transition-colors"
              title={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {/* Key display */}
      <div className="bg-shell-800/50 rounded-lg p-3 mb-4 font-mono text-sm">
        {apiKey.status === 'active' ? (
          showKey ? (
            <span className="text-coral-400">{apiKey.key}</span>
          ) : (
            <span className="text-shell-400">{apiKey.prefix}••••••••••••••••••••</span>
          )
        ) : (
          <span className="text-shell-500 italic">Key hidden (revoked)</span>
        )}
      </div>

      {/* Scopes */}
      <div className="flex flex-wrap gap-2 mb-4">
        {apiKey.scopes.map(scope => (
          <span
            key={scope}
            className={`px-2 py-1 text-xs rounded-md border ${getScopeColor(scope)}`}
          >
            {scope}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 py-3 border-y border-shell-800 mb-4">
        <div>
          <div className="text-xs text-shell-500 mb-1">Created</div>
          <div className="text-sm text-shell-300">{formatDate(apiKey.createdAt)}</div>
        </div>
        <div>
          <div className="text-xs text-shell-500 mb-1">Last Used</div>
          <div className="text-sm text-shell-300">
            {apiKey.lastUsedAt ? formatRelativeTime(apiKey.lastUsedAt) : 'Never'}
          </div>
        </div>
        <div>
          <div className="text-xs text-shell-500 mb-1">Usage</div>
          <div className="text-sm text-shell-300">{apiKey.usageCount.toLocaleString()} calls</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {apiKey.status === 'active' ? (
          <>
            {showConfirmRevoke ? (
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm text-shell-400">Revoke this key?</span>
                <button
                  onClick={() => { onRevoke(apiKey.id); setShowConfirmRevoke(false) }}
                  className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
                >
                  Yes, revoke
                </button>
                <button
                  onClick={() => setShowConfirmRevoke(false)}
                  className="px-3 py-1.5 bg-shell-800 hover:bg-shell-700 text-shell-400 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmRevoke(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-shell-800 hover:bg-red-500/20 text-shell-400 hover:text-red-400 rounded-lg text-sm transition-colors"
              >
                <NoSymbolIcon className="w-4 h-4" />
                Revoke
              </button>
            )}
          </>
        ) : (
          <>
            {showConfirmDelete ? (
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm text-shell-400">Delete permanently?</span>
                <button
                  onClick={() => { onDelete(apiKey.id); setShowConfirmDelete(false) }}
                  className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-3 py-1.5 bg-shell-800 hover:bg-shell-700 text-shell-400 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onRegenerate(apiKey.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-shell-800 hover:bg-coral-500/20 text-shell-400 hover:text-coral-400 rounded-lg text-sm transition-colors"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Regenerate
                </button>
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-shell-800 hover:bg-red-500/20 text-shell-400 hover:text-red-400 rounded-lg text-sm transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete
                </button>
              </>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}

export default function ApiKeysPage() {
  const { keys, isLoading, createKey, revokeKey, deleteKey, regenerateKey, activeKeys, resetToDefaults } = useApiKeys()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'revoked'>('all')

  const filteredKeys = keys.filter(k => {
    if (filter === 'all') return true
    return k.status === filter
  })

  const totalUsage = keys.reduce((sum, k) => sum + k.usageCount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-shell-950 to-shell-900">
      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-shell-800">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-coral-500/10 text-coral-400 rounded-full border border-coral-500/20">
            🔑 Credentials
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            API Keys
          </h1>
          <p className="text-xl text-shell-300 max-w-2xl mx-auto">
            Manage your x402 API credentials. Create keys for different environments, 
            control permissions, and monitor usage.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 bg-shell-900/50 border-b border-shell-800">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-shell-900 border border-shell-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-shell-400 mb-1">
                <KeyIcon className="w-4 h-4" />
                <span className="text-sm">Total Keys</span>
              </div>
              <div className="text-2xl font-bold text-white">{keys.length}</div>
            </div>
            <div className="bg-shell-900 border border-shell-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <CheckIcon className="w-4 h-4" />
                <span className="text-sm">Active</span>
              </div>
              <div className="text-2xl font-bold text-white">{activeKeys.length}</div>
            </div>
            <div className="bg-shell-900 border border-shell-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-shell-400 mb-1">
                <ChartBarIcon className="w-4 h-4" />
                <span className="text-sm">Total Calls</span>
              </div>
              <div className="text-2xl font-bold text-white">{totalUsage.toLocaleString()}</div>
            </div>
            <div className="bg-shell-900 border border-shell-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-coral-400 mb-1">
                <ShieldCheckIcon className="w-4 h-4" />
                <span className="text-sm">Scopes Used</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {new Set(keys.flatMap(k => k.scopes)).size}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Keys List */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  filter === 'all' 
                    ? 'bg-coral-500/20 text-coral-400' 
                    : 'bg-shell-800 text-shell-400 hover:bg-shell-700'
                }`}
              >
                All ({keys.length})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  filter === 'active' 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-shell-800 text-shell-400 hover:bg-shell-700'
                }`}
              >
                Active ({activeKeys.length})
              </button>
              <button
                onClick={() => setFilter('revoked')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  filter === 'revoked' 
                    ? 'bg-red-500/20 text-red-400' 
                    : 'bg-shell-800 text-shell-400 hover:bg-shell-700'
                }`}
              >
                Revoked ({keys.filter(k => k.status === 'revoked').length})
              </button>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-coral-500 hover:bg-coral-600 text-white rounded-lg transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Create Key
            </button>
          </div>

          {/* Keys */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500" />
            </div>
          ) : filteredKeys.length === 0 ? (
            <div className="text-center py-20 bg-shell-900/50 border border-shell-800 rounded-xl">
              <KeyIcon className="w-12 h-12 text-shell-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                {filter === 'all' ? 'No API keys yet' : `No ${filter} keys`}
              </h3>
              <p className="text-shell-400 mb-6">
                {filter === 'all' 
                  ? 'Create your first API key to start integrating'
                  : 'Try changing the filter'}
              </p>
              {filter === 'all' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-coral-500 hover:bg-coral-600 text-white rounded-lg transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  Create Your First Key
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredKeys.map(key => (
                  <KeyRow
                    key={key.id}
                    apiKey={key}
                    onRevoke={revokeKey}
                    onDelete={deleteKey}
                    onRegenerate={regenerateKey}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Reset button */}
          {keys.length > 0 && (
            <div className="mt-8 text-center">
              <button
                onClick={resetToDefaults}
                className="text-sm text-shell-500 hover:text-shell-400 transition-colors"
              >
                Reset to demo data
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Best Practices */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-shell-900/50 border-t border-shell-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Security Best Practices
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-shell-900 border border-shell-800 rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xl mb-3">
                🔒
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Never expose keys</h3>
              <p className="text-shell-400 text-sm">
                Store keys in environment variables or secrets managers. Never commit to version control.
              </p>
            </div>

            <div className="bg-shell-900 border border-shell-800 rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-xl mb-3">
                🎯
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Least privilege</h3>
              <p className="text-shell-400 text-sm">
                Only grant the scopes your application actually needs. Avoid using admin keys in production.
              </p>
            </div>

            <div className="bg-shell-900 border border-shell-800 rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-xl mb-3">
                🔄
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Rotate regularly</h3>
              <p className="text-shell-400 text-sm">
                Set expiration dates and rotate keys periodically. Regenerate immediately if compromised.
              </p>
            </div>

            <div className="bg-shell-900 border border-shell-800 rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-coral-500/20 flex items-center justify-center text-xl mb-3">
                🏷️
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Use descriptive names</h3>
              <p className="text-shell-400 text-sm">
                Name keys by environment and purpose (e.g., &quot;prod-backend&quot;, &quot;staging-mobile&quot;).
              </p>
            </div>

            <div className="bg-shell-900 border border-shell-800 rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-xl mb-3">
                📊
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Monitor usage</h3>
              <p className="text-shell-400 text-sm">
                Review key usage regularly. Investigate unexpected spikes or access patterns.
              </p>
            </div>

            <div className="bg-shell-900 border border-shell-800 rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-xl mb-3">
                🚫
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Revoke unused keys</h3>
              <p className="text-shell-400 text-sm">
                Disable or delete keys that are no longer in use. Clean up old development keys.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Links */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-shell-800">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-lg font-semibold text-white mb-6">Related Resources</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/security"
              className="px-4 py-2 bg-shell-800 hover:bg-shell-700 text-shell-300 rounded-lg transition-colors text-sm"
            >
              Security Guide →
            </Link>
            <Link
              href="/sandbox"
              className="px-4 py-2 bg-shell-800 hover:bg-shell-700 text-shell-300 rounded-lg transition-colors text-sm"
            >
              API Sandbox →
            </Link>
            <Link
              href="/rate-calculator"
              className="px-4 py-2 bg-shell-800 hover:bg-shell-700 text-shell-300 rounded-lg transition-colors text-sm"
            >
              Rate Limits →
            </Link>
            <Link
              href="/starters"
              className="px-4 py-2 bg-shell-800 hover:bg-shell-700 text-shell-300 rounded-lg transition-colors text-sm"
            >
              Starter Templates →
            </Link>
          </div>
        </div>
      </section>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateKeyModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreateKey={createKey}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
