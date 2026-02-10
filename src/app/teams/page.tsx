'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  UserGroupIcon,
  PlusIcon,
  KeyIcon,
  CogIcon,
  ChevronRightIcon,
  XMarkIcon,
  CheckIcon,
  TrashIcon,
  PencilIcon,
  EnvelopeIcon,
  ClipboardIcon,
  EyeIcon,
  EyeSlashIcon,
  NoSymbolIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { useTeams, Team, TeamMember, TeamApiKey, Invitation } from '@/hooks/useTeams'

const ROLE_COLORS: Record<TeamMember['role'], string> = {
  owner: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  developer: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  viewer: 'bg-shell-700 text-shell-400 border-shell-600',
}

const ROLE_DESCRIPTIONS: Record<TeamMember['role'], string> = {
  owner: 'Full control, can delete team',
  admin: 'Manage members and keys',
  developer: 'Create and use keys',
  viewer: 'View only access',
}

const SCOPE_COLORS: Record<string, string> = {
  read: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  write: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  payments: 'bg-coral-500/10 text-coral-400 border-coral-500/20',
  admin: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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

interface CreateTeamModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string, description: string, icon: string) => void
  icons: string[]
}

function CreateTeamModal({ isOpen, onClose, onCreate, icons }: CreateTeamModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('🚀')

  const handleCreate = () => {
    if (!name.trim()) return
    onCreate(name.trim(), description.trim(), icon)
    setName('')
    setDescription('')
    setIcon('🚀')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-shell-900 border border-shell-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1 text-shell-400 hover:text-white transition-colors">
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-coral-500/20 flex items-center justify-center">
            <UserGroupIcon className="w-5 h-5 text-coral-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Create Team</h2>
            <p className="text-sm text-shell-400">Collaborate with your organization</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-shell-300 mb-2">Team Icon</label>
            <div className="flex flex-wrap gap-2">
              {icons.map(i => (
                <button
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 text-xl rounded-lg border transition-all ${
                    icon === i
                      ? 'bg-coral-500/20 border-coral-500/50'
                      : 'bg-shell-800 border-shell-700 hover:border-shell-600'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-shell-300 mb-2">Team Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Acme Corp, Backend Team"
              className="w-full px-4 py-2.5 bg-shell-800 border border-shell-700 rounded-lg text-white placeholder-shell-500 focus:ring-2 focus:ring-coral-500/50 focus:border-coral-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-shell-300 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this team for?"
              rows={2}
              className="w-full px-4 py-2.5 bg-shell-800 border border-shell-700 rounded-lg text-white placeholder-shell-500 focus:ring-2 focus:ring-coral-500/50 focus:border-coral-500 transition-all resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-shell-800 hover:bg-shell-700 text-shell-300 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="flex-1 px-4 py-2.5 bg-coral-500 hover:bg-coral-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Create Team
          </button>
        </div>
      </motion.div>
    </div>
  )
}

interface InviteMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onInvite: (email: string, role: 'admin' | 'developer' | 'viewer') => void
}

function InviteMemberModal({ isOpen, onClose, onInvite }: InviteMemberModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'developer' | 'viewer'>('developer')

  const handleInvite = () => {
    if (!email.trim() || !email.includes('@')) return
    onInvite(email.trim(), role)
    setEmail('')
    setRole('developer')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-shell-900 border border-shell-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1 text-shell-400 hover:text-white transition-colors">
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <UserPlusIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Invite Member</h2>
            <p className="text-sm text-shell-400">Send an invitation to join this team</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-shell-300 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@company.com"
              className="w-full px-4 py-2.5 bg-shell-800 border border-shell-700 rounded-lg text-white placeholder-shell-500 focus:ring-2 focus:ring-coral-500/50 focus:border-coral-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-shell-300 mb-2">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {(['admin', 'developer', 'viewer'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    role === r
                      ? 'bg-coral-500/10 border-coral-500/50 text-white'
                      : 'bg-shell-800 border-shell-700 text-shell-400 hover:border-shell-600'
                  }`}
                >
                  <div className="font-medium text-sm capitalize">{r}</div>
                  <div className="text-xs opacity-70 mt-0.5">{ROLE_DESCRIPTIONS[r]}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-shell-800 hover:bg-shell-700 text-shell-300 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={handleInvite}
            disabled={!email.trim() || !email.includes('@')}
            className="flex-1 px-4 py-2.5 bg-coral-500 hover:bg-coral-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <EnvelopeIcon className="w-4 h-4" />
            Send Invite
          </button>
        </div>
      </motion.div>
    </div>
  )
}

interface CreateKeyModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string, scopes: string[], allowedMembers: string[] | 'all', expiresInDays?: number) => TeamApiKey | null
  team: Team
}

function CreateKeyModal({ isOpen, onClose, onCreate, team }: CreateKeyModalProps) {
  const [name, setName] = useState('')
  const [scopes, setScopes] = useState<string[]>(['read'])
  const [access, setAccess] = useState<'all' | 'specific'>('all')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [expiresIn, setExpiresIn] = useState<string>('never')
  const [createdKey, setCreatedKey] = useState<TeamApiKey | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCreate = () => {
    if (!name.trim()) return
    const expiresInDays = expiresIn === 'never' ? undefined : parseInt(expiresIn)
    const allowedMembers = access === 'all' ? 'all' : selectedMembers
    const newKey = onCreate(name.trim(), scopes, allowedMembers, expiresInDays)
    if (newKey) setCreatedKey(newKey)
  }

  const handleCopy = async () => {
    if (!createdKey) return
    await navigator.clipboard.writeText(createdKey.key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = () => {
    setName('')
    setScopes(['read'])
    setAccess('all')
    setSelectedMembers([])
    setExpiresIn('never')
    setCreatedKey(null)
    setCopied(false)
    onClose()
  }

  const toggleScope = (scope: string) => {
    setScopes(prev => prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope])
  }

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev => prev.includes(memberId) ? prev.filter(m => m !== memberId) : [...prev, memberId])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-shell-900 border border-shell-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl my-8"
      >
        <button onClick={handleClose} className="absolute top-4 right-4 p-1 text-shell-400 hover:text-white transition-colors">
          <XMarkIcon className="w-5 h-5" />
        </button>

        {!createdKey ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-coral-500/20 flex items-center justify-center">
                <KeyIcon className="w-5 h-5 text-coral-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Create Team Key</h2>
                <p className="text-sm text-shell-400">For {team.name}</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-shell-300 mb-2">Key Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Production Backend, CI Pipeline"
                  className="w-full px-4 py-2.5 bg-shell-800 border border-shell-700 rounded-lg text-white placeholder-shell-500 focus:ring-2 focus:ring-coral-500/50 focus:border-coral-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-shell-300 mb-2">Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {['read', 'write', 'payments', 'admin'].map(scope => (
                    <button
                      key={scope}
                      onClick={() => toggleScope(scope)}
                      disabled={!team.settings.allowedScopes.includes(scope)}
                      className={`p-2 rounded-lg border text-left text-sm transition-all ${
                        scopes.includes(scope)
                          ? 'bg-coral-500/10 border-coral-500/50 text-white'
                          : 'bg-shell-800 border-shell-700 text-shell-400 hover:border-shell-600'
                      } ${!team.settings.allowedScopes.includes(scope) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="capitalize">{scope}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-shell-300 mb-2">Access Control</label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    onClick={() => setAccess('all')}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      access === 'all'
                        ? 'bg-coral-500/10 border-coral-500/50 text-white'
                        : 'bg-shell-800 border-shell-700 text-shell-400 hover:border-shell-600'
                    }`}
                  >
                    <div className="font-medium text-sm">All Members</div>
                    <div className="text-xs opacity-70">Everyone can use</div>
                  </button>
                  <button
                    onClick={() => setAccess('specific')}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      access === 'specific'
                        ? 'bg-coral-500/10 border-coral-500/50 text-white'
                        : 'bg-shell-800 border-shell-700 text-shell-400 hover:border-shell-600'
                    }`}
                  >
                    <div className="font-medium text-sm">Specific Members</div>
                    <div className="text-xs opacity-70">Restrict access</div>
                  </button>
                </div>

                {access === 'specific' && (
                  <div className="bg-shell-800 rounded-lg p-3 max-h-32 overflow-y-auto space-y-2">
                    {team.members.map(member => (
                      <button
                        key={member.id}
                        onClick={() => toggleMember(member.id)}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-all ${
                          selectedMembers.includes(member.id)
                            ? 'bg-coral-500/20 text-white'
                            : 'hover:bg-shell-700 text-shell-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          selectedMembers.includes(member.id)
                            ? 'bg-coral-500 border-coral-500'
                            : 'border-shell-600'
                        }`}>
                          {selectedMembers.includes(member.id) && <CheckIcon className="w-3 h-3 text-white" />}
                        </div>
                        <span>{member.name}</span>
                        <span className="text-shell-500 text-xs">({member.email})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-shell-300 mb-2">Expiration</label>
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
              <button onClick={handleClose} className="flex-1 px-4 py-2.5 bg-shell-800 hover:bg-shell-700 text-shell-300 rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!name.trim() || scopes.length === 0}
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
                <h2 className="text-xl font-bold text-white">Team Key Created!</h2>
                <p className="text-sm text-shell-400">{createdKey.name}</p>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-5">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-200">
                  <p className="font-medium mb-1">Copy your API key now</p>
                  <p className="text-amber-300/80">This is the only time you&apos;ll see the full key.</p>
                </div>
              </div>
            </div>

            <div className="bg-shell-800 rounded-lg p-4 mb-5">
              <div className="flex items-center justify-between gap-3">
                <code className="text-sm text-coral-400 font-mono break-all">{createdKey.key}</code>
                <button
                  onClick={handleCopy}
                  className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                    copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-shell-700 hover:bg-shell-600 text-white'
                  }`}
                >
                  {copied ? <CheckIcon className="w-4 h-4" /> : <ClipboardIcon className="w-4 h-4" />}
                </button>
              </div>
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

function MemberCard({ member, canManage, onRemove, onUpdateRole }: { 
  member: TeamMember; 
  canManage: boolean;
  onRemove: () => void;
  onUpdateRole: (role: TeamMember['role']) => void;
}) {
  const [showActions, setShowActions] = useState(false)

  return (
    <div className="flex items-center justify-between p-3 bg-shell-800/50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-coral-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
          {member.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-medium text-white text-sm">{member.name}</div>
          <div className="text-xs text-shell-400">{member.email}</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 text-xs rounded-full border ${ROLE_COLORS[member.role]}`}>
          {member.role}
        </span>

        {canManage && member.role !== 'owner' && (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1.5 rounded-lg bg-shell-700 hover:bg-shell-600 text-shell-400 transition-colors"
            >
              <CogIcon className="w-4 h-4" />
            </button>

            {showActions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 bg-shell-800 border border-shell-700 rounded-lg shadow-xl p-2 min-w-[140px]">
                  {(['admin', 'developer', 'viewer'] as const).filter(r => r !== member.role).map(r => (
                    <button
                      key={r}
                      onClick={() => { onUpdateRole(r); setShowActions(false) }}
                      className="w-full text-left px-3 py-1.5 text-sm text-shell-300 hover:bg-shell-700 rounded capitalize"
                    >
                      Make {r}
                    </button>
                  ))}
                  <hr className="my-1.5 border-shell-700" />
                  <button
                    onClick={() => { onRemove(); setShowActions(false) }}
                    className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 rounded"
                  >
                    Remove
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function TeamKeyCard({ teamKey, onRevoke, onDelete, onRegenerate, getMemberName }: {
  teamKey: TeamApiKey
  onRevoke: () => void
  onDelete: () => void
  onRegenerate: () => void
  getMemberName: (id: string) => string
}) {
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(teamKey.key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isActive = teamKey.status === 'active'

  return (
    <div className="bg-shell-800/50 rounded-xl p-4 border border-shell-700/50">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <KeyIcon className={`w-5 h-5 ${isActive ? 'text-coral-400' : 'text-shell-500'}`} />
          <div>
            <div className="font-medium text-white">{teamKey.name}</div>
            <div className="text-xs text-shell-400">Created by {getMemberName(teamKey.createdBy)}</div>
          </div>
        </div>
        <span className={`px-2 py-0.5 text-xs rounded-full border ${
          isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {teamKey.status}
        </span>
      </div>

      {/* Key */}
      <div className="bg-shell-900 rounded-lg p-2.5 mb-3 font-mono text-sm flex items-center justify-between">
        {isActive ? (
          showKey ? (
            <span className="text-coral-400 break-all">{teamKey.key}</span>
          ) : (
            <span className="text-shell-400">{teamKey.prefix}••••••••••••••••</span>
          )
        ) : (
          <span className="text-shell-500 italic">Key hidden</span>
        )}
        {isActive && (
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            <button
              onClick={handleCopy}
              className={`p-1.5 rounded transition-colors ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-shell-700 hover:bg-shell-600 text-shell-400'}`}
            >
              {copied ? <CheckIcon className="w-3.5 h-3.5" /> : <ClipboardIcon className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setShowKey(!showKey)}
              className="p-1.5 rounded bg-shell-700 hover:bg-shell-600 text-shell-400 transition-colors"
            >
              {showKey ? <EyeSlashIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-shell-400 mb-3">
        <span>{teamKey.usageCount.toLocaleString()} calls</span>
        <span>•</span>
        <span>{teamKey.lastUsedAt ? formatRelativeTime(teamKey.lastUsedAt) : 'Never used'}</span>
        {teamKey.expiresAt && (
          <>
            <span>•</span>
            <span className="text-amber-400">Expires {formatDate(teamKey.expiresAt)}</span>
          </>
        )}
      </div>

      {/* Scopes & Access */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {teamKey.scopes.map(scope => (
          <span key={scope} className={`px-1.5 py-0.5 text-xs rounded border ${SCOPE_COLORS[scope] || 'bg-shell-700 text-shell-400'}`}>
            {scope}
          </span>
        ))}
        <span className="px-1.5 py-0.5 text-xs rounded bg-shell-700 text-shell-400 border border-shell-600">
          {teamKey.allowedMembers === 'all' ? 'All members' : `${teamKey.allowedMembers.length} members`}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {isActive ? (
          <button onClick={onRevoke} className="flex items-center gap-1 px-2 py-1 text-xs bg-shell-700 hover:bg-red-500/20 text-shell-400 hover:text-red-400 rounded transition-colors">
            <NoSymbolIcon className="w-3.5 h-3.5" />
            Revoke
          </button>
        ) : (
          <>
            <button onClick={onRegenerate} className="flex items-center gap-1 px-2 py-1 text-xs bg-shell-700 hover:bg-coral-500/20 text-shell-400 hover:text-coral-400 rounded transition-colors">
              <ArrowPathIcon className="w-3.5 h-3.5" />
              Regenerate
            </button>
            <button onClick={onDelete} className="flex items-center gap-1 px-2 py-1 text-xs bg-shell-700 hover:bg-red-500/20 text-shell-400 hover:text-red-400 rounded transition-colors">
              <TrashIcon className="w-3.5 h-3.5" />
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function TeamsPage() {
  const {
    teams,
    currentTeam,
    currentTeamId,
    setCurrentTeamId,
    invitations,
    isLoading,
    createTeam,
    updateTeam,
    deleteTeam,
    addMember,
    updateMember,
    removeMember,
    createTeamKey,
    revokeTeamKey,
    deleteTeamKey,
    regenerateTeamKey,
    inviteMember,
    cancelInvitation,
    resetToDefaults,
    teamIcons,
  } = useTeams()

  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'keys' | 'members' | 'settings'>('keys')

  const currentMember = currentTeam?.members[0] // In real app, this would be the logged-in user
  const canManage = currentMember?.role === 'owner' || currentMember?.role === 'admin'

  const getMemberName = (id: string) => {
    const member = currentTeam?.members.find(m => m.id === id)
    return member?.name || 'Unknown'
  }

  const handleCreateTeamKey = (name: string, scopes: string[], allowedMembers: string[] | 'all', expiresInDays?: number) => {
    if (!currentTeam || !currentMember) return null
    return createTeamKey(currentTeam.id, name, scopes, currentMember.id, allowedMembers, expiresInDays)
  }

  const pendingInvites = invitations.filter(i => i.teamId === currentTeamId && i.status === 'pending')

  return (
    <div className="min-h-screen bg-gradient-to-b from-shell-950 to-shell-900">
      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-shell-800">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">
            👥 Multi-Tenant
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Team API Keys
          </h1>
          <p className="text-xl text-shell-300 max-w-2xl mx-auto">
            Collaborate with your organization. Manage shared API keys, 
            control permissions, and track usage across your team.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Team Selector */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="bg-shell-900 border border-shell-800 rounded-xl p-4 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-shell-300">Your Teams</h3>
                <button
                  onClick={() => setShowCreateTeamModal(true)}
                  className="p-1.5 rounded-lg bg-coral-500/20 hover:bg-coral-500/30 text-coral-400 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-coral-500" />
                </div>
              ) : teams.length === 0 ? (
                <div className="text-center py-6">
                  <UserGroupIcon className="w-10 h-10 text-shell-600 mx-auto mb-2" />
                  <p className="text-sm text-shell-400 mb-3">No teams yet</p>
                  <button
                    onClick={() => setShowCreateTeamModal(true)}
                    className="text-sm text-coral-400 hover:text-coral-300"
                  >
                    Create your first team
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  {teams.map(team => (
                    <button
                      key={team.id}
                      onClick={() => setCurrentTeamId(team.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all text-left ${
                        currentTeamId === team.id
                          ? 'bg-coral-500/20 text-white'
                          : 'hover:bg-shell-800 text-shell-300'
                      }`}
                    >
                      <span className="text-lg">{team.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate text-sm">{team.name}</div>
                        <div className="text-xs text-shell-400">{team.members.length} members</div>
                      </div>
                      {currentTeamId === team.id && (
                        <ChevronRightIcon className="w-4 h-4 text-coral-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {teams.length > 0 && (
                <div className="mt-4 pt-4 border-t border-shell-800">
                  <button
                    onClick={resetToDefaults}
                    className="text-xs text-shell-500 hover:text-shell-400 transition-colors"
                  >
                    Reset to demo data
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {!currentTeam ? (
              <div className="bg-shell-900 border border-shell-800 rounded-xl p-12 text-center">
                <UserGroupIcon className="w-12 h-12 text-shell-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Select a team</h3>
                <p className="text-shell-400 mb-6">Choose a team from the sidebar or create a new one</p>
                <button
                  onClick={() => setShowCreateTeamModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-coral-500 hover:bg-coral-600 text-white rounded-lg transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  Create Team
                </button>
              </div>
            ) : (
              <>
                {/* Team Header */}
                <div className="bg-shell-900 border border-shell-800 rounded-xl p-6 mb-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-shell-800 flex items-center justify-center text-3xl">
                        {currentTeam.icon}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{currentTeam.name}</h2>
                        <p className="text-shell-400">{currentTeam.description}</p>
                      </div>
                    </div>
                    {canManage && (
                      <button className="p-2 rounded-lg bg-shell-800 hover:bg-shell-700 text-shell-400 transition-colors">
                        <CogIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                    <div className="bg-shell-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-shell-400 mb-1">
                        <UserGroupIcon className="w-4 h-4" />
                        <span className="text-xs">Members</span>
                      </div>
                      <div className="text-xl font-bold text-white">{currentTeam.members.length}</div>
                    </div>
                    <div className="bg-shell-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-shell-400 mb-1">
                        <KeyIcon className="w-4 h-4" />
                        <span className="text-xs">Active Keys</span>
                      </div>
                      <div className="text-xl font-bold text-white">
                        {currentTeam.keys.filter(k => k.status === 'active').length}
                      </div>
                    </div>
                    <div className="bg-shell-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-shell-400 mb-1">
                        <ChartBarIcon className="w-4 h-4" />
                        <span className="text-xs">Total Calls</span>
                      </div>
                      <div className="text-xl font-bold text-white">{currentTeam.usage.totalCalls.toLocaleString()}</div>
                    </div>
                    <div className="bg-shell-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-coral-400 mb-1">
                        <span className="text-xs">💰</span>
                        <span className="text-xs">Spend</span>
                      </div>
                      <div className="text-xl font-bold text-white">${currentTeam.usage.currentSpend.toFixed(2)}</div>
                      {currentTeam.usage.monthlyBudget && (
                        <div className="text-xs text-shell-400">of ${currentTeam.usage.monthlyBudget} budget</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 mb-6">
                  {(['keys', 'members', 'settings'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab
                          ? 'bg-coral-500/20 text-coral-400'
                          : 'bg-shell-800 text-shell-400 hover:bg-shell-700'
                      }`}
                    >
                      {tab === 'keys' && <><KeyIcon className="w-4 h-4 inline mr-1.5" />API Keys</>}
                      {tab === 'members' && <><UserGroupIcon className="w-4 h-4 inline mr-1.5" />Members</>}
                      {tab === 'settings' && <><CogIcon className="w-4 h-4 inline mr-1.5" />Settings</>}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                  {activeTab === 'keys' && (
                    <motion.div
                      key="keys"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Team API Keys</h3>
                        <button
                          onClick={() => setShowCreateKeyModal(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-lg text-sm transition-colors"
                        >
                          <PlusIcon className="w-4 h-4" />
                          Create Key
                        </button>
                      </div>

                      {currentTeam.keys.length === 0 ? (
                        <div className="bg-shell-900 border border-shell-800 rounded-xl p-12 text-center">
                          <KeyIcon className="w-10 h-10 text-shell-600 mx-auto mb-3" />
                          <h4 className="text-white font-medium mb-2">No keys yet</h4>
                          <p className="text-shell-400 text-sm mb-4">Create your first team API key</p>
                          <button
                            onClick={() => setShowCreateKeyModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-lg text-sm transition-colors"
                          >
                            <PlusIcon className="w-4 h-4" />
                            Create Key
                          </button>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {currentTeam.keys.map(key => (
                            <TeamKeyCard
                              key={key.id}
                              teamKey={key}
                              onRevoke={() => revokeTeamKey(currentTeam.id, key.id)}
                              onDelete={() => deleteTeamKey(currentTeam.id, key.id)}
                              onRegenerate={() => regenerateTeamKey(currentTeam.id, key.id)}
                              getMemberName={getMemberName}
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'members' && (
                    <motion.div
                      key="members"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Team Members</h3>
                        {canManage && (
                          <button
                            onClick={() => setShowInviteModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-lg text-sm transition-colors"
                          >
                            <UserPlusIcon className="w-4 h-4" />
                            Invite Member
                          </button>
                        )}
                      </div>

                      <div className="bg-shell-900 border border-shell-800 rounded-xl p-4 space-y-2">
                        {currentTeam.members.map(member => (
                          <MemberCard
                            key={member.id}
                            member={member}
                            canManage={canManage}
                            onRemove={() => removeMember(currentTeam.id, member.id)}
                            onUpdateRole={(role) => updateMember(currentTeam.id, member.id, { role })}
                          />
                        ))}
                      </div>

                      {/* Pending Invites */}
                      {pendingInvites.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-sm font-semibold text-shell-300 mb-3">Pending Invitations</h4>
                          <div className="bg-shell-900 border border-shell-800 rounded-xl p-4 space-y-2">
                            {pendingInvites.map(invite => (
                              <div key={invite.id} className="flex items-center justify-between p-3 bg-shell-800/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <EnvelopeIcon className="w-5 h-5 text-amber-400" />
                                  <div>
                                    <div className="text-white text-sm">{invite.email}</div>
                                    <div className="text-xs text-shell-400">Invited as {invite.role}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    Pending
                                  </span>
                                  <button
                                    onClick={() => cancelInvitation(invite.id)}
                                    className="p-1.5 rounded-lg bg-shell-700 hover:bg-red-500/20 text-shell-400 hover:text-red-400 transition-colors"
                                  >
                                    <XMarkIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'settings' && (
                    <motion.div
                      key="settings"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="bg-shell-900 border border-shell-800 rounded-xl p-6 space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-4">Team Settings</h3>
                          
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-shell-800/50 rounded-lg">
                              <div>
                                <div className="font-medium text-white">Require approval for new keys</div>
                                <div className="text-sm text-shell-400">Admins must approve key creation requests</div>
                              </div>
                              <button
                                onClick={() => updateTeam(currentTeam.id, { 
                                  settings: { ...currentTeam.settings, requireApprovalForKeys: !currentTeam.settings.requireApprovalForKeys }
                                })}
                                className={`w-12 h-6 rounded-full transition-colors ${
                                  currentTeam.settings.requireApprovalForKeys ? 'bg-coral-500' : 'bg-shell-600'
                                }`}
                              >
                                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                  currentTeam.settings.requireApprovalForKeys ? 'translate-x-6' : 'translate-x-0.5'
                                }`} />
                              </button>
                            </div>

                            <div className="p-4 bg-shell-800/50 rounded-lg">
                              <div className="font-medium text-white mb-1">Max keys per member</div>
                              <div className="text-sm text-shell-400 mb-3">Limit how many keys each member can create</div>
                              <input
                                type="number"
                                value={currentTeam.settings.maxKeysPerMember}
                                onChange={(e) => updateTeam(currentTeam.id, {
                                  settings: { ...currentTeam.settings, maxKeysPerMember: parseInt(e.target.value) || 5 }
                                })}
                                className="w-24 px-3 py-2 bg-shell-900 border border-shell-700 rounded-lg text-white"
                              />
                            </div>

                            <div className="p-4 bg-shell-800/50 rounded-lg">
                              <div className="font-medium text-white mb-1">Allowed scopes</div>
                              <div className="text-sm text-shell-400 mb-3">Control which permissions can be assigned</div>
                              <div className="flex flex-wrap gap-2">
                                {['read', 'write', 'payments', 'admin'].map(scope => (
                                  <button
                                    key={scope}
                                    onClick={() => {
                                      const current = currentTeam.settings.allowedScopes
                                      const updated = current.includes(scope)
                                        ? current.filter(s => s !== scope)
                                        : [...current, scope]
                                      updateTeam(currentTeam.id, { settings: { ...currentTeam.settings, allowedScopes: updated } })
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                                      currentTeam.settings.allowedScopes.includes(scope)
                                        ? 'bg-coral-500/20 text-coral-400 border border-coral-500/50'
                                        : 'bg-shell-700 text-shell-400 border border-shell-600'
                                    }`}
                                  >
                                    {scope}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Danger Zone */}
                        {currentMember?.role === 'owner' && (
                          <div className="pt-6 border-t border-shell-800">
                            <h4 className="text-red-400 font-medium mb-4">Danger Zone</h4>
                            <button
                              onClick={() => {
                                if (confirm(`Delete team "${currentTeam.name}"? This cannot be undone.`)) {
                                  deleteTeam(currentTeam.id)
                                }
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                              Delete Team
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Related Links */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-shell-800 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-lg font-semibold text-white mb-6">Related Resources</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/api-keys" className="px-4 py-2 bg-shell-800 hover:bg-shell-700 text-shell-300 rounded-lg transition-colors text-sm">
              Personal API Keys →
            </Link>
            <Link href="/security" className="px-4 py-2 bg-shell-800 hover:bg-shell-700 text-shell-300 rounded-lg transition-colors text-sm">
              Security Guide →
            </Link>
            <Link href="/spending" className="px-4 py-2 bg-shell-800 hover:bg-shell-700 text-shell-300 rounded-lg transition-colors text-sm">
              Cost Tracking →
            </Link>
            <Link href="/alerts" className="px-4 py-2 bg-shell-800 hover:bg-shell-700 text-shell-300 rounded-lg transition-colors text-sm">
              Alert Setup →
            </Link>
          </div>
        </div>
      </section>

      {/* Modals */}
      <AnimatePresence>
        {showCreateTeamModal && (
          <CreateTeamModal
            isOpen={showCreateTeamModal}
            onClose={() => setShowCreateTeamModal(false)}
            onCreate={createTeam}
            icons={teamIcons}
          />
        )}
        {showInviteModal && (
          <InviteMemberModal
            isOpen={showInviteModal}
            onClose={() => setShowInviteModal(false)}
            onInvite={(email, role) => {
              if (currentTeam && currentMember) {
                inviteMember(currentTeam.id, email, role, currentMember.id)
              }
            }}
          />
        )}
        {showCreateKeyModal && currentTeam && (
          <CreateKeyModal
            isOpen={showCreateKeyModal}
            onClose={() => setShowCreateKeyModal(false)}
            onCreate={handleCreateTeamKey}
            team={currentTeam}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
