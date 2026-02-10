'use client'

import { useState, useEffect, useCallback } from 'react'

export interface TeamMember {
  id: string
  email: string
  name: string
  role: 'owner' | 'admin' | 'developer' | 'viewer'
  joinedAt: Date
  lastActiveAt: Date | null
  avatar?: string
}

export interface TeamApiKey {
  id: string
  name: string
  key: string
  prefix: string
  createdBy: string // member id
  createdAt: Date
  lastUsedAt: Date | null
  expiresAt: Date | null
  scopes: string[]
  status: 'active' | 'revoked' | 'expired'
  usageCount: number
  allowedMembers: string[] | 'all' // member ids or 'all'
}

export interface Team {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  createdAt: Date
  members: TeamMember[]
  keys: TeamApiKey[]
  settings: {
    requireApprovalForKeys: boolean
    maxKeysPerMember: number
    defaultKeyExpiration: number | null // days, null = never
    allowedScopes: string[]
  }
  usage: {
    totalCalls: number
    monthlyBudget: number | null
    currentSpend: number
  }
}

export interface Invitation {
  id: string
  teamId: string
  email: string
  role: 'admin' | 'developer' | 'viewer'
  invitedBy: string
  invitedAt: Date
  expiresAt: Date
  status: 'pending' | 'accepted' | 'expired'
}

const STORAGE_KEY = 'x402-teams'
const INVITES_KEY = 'x402-invitations'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function generateTeamKey(teamSlug: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const segments = [
    'x402',
    teamSlug.substring(0, 4),
    Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''),
    Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''),
  ]
  return segments.join('_')
}

const TEAM_ICONS = ['🏢', '🚀', '⚡', '🔥', '💎', '🌟', '🎯', '🛡️', '🔮', '🦞']

function getDefaultTeams(): Team[] {
  const now = new Date()
  return [
    {
      id: 'team-1',
      name: 'Acme Corp',
      slug: 'acme-corp',
      description: 'Main production team for Acme applications',
      icon: '🚀',
      createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      members: [
        {
          id: 'member-1',
          email: 'alice@acme.com',
          name: 'Alice Chen',
          role: 'owner',
          joinedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
          lastActiveAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
          avatar: undefined,
        },
        {
          id: 'member-2',
          email: 'bob@acme.com',
          name: 'Bob Smith',
          role: 'admin',
          joinedAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
          lastActiveAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        },
        {
          id: 'member-3',
          email: 'carol@acme.com',
          name: 'Carol Davis',
          role: 'developer',
          joinedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          lastActiveAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        },
        {
          id: 'member-4',
          email: 'dave@acme.com',
          name: 'Dave Wilson',
          role: 'viewer',
          joinedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
          lastActiveAt: null,
        },
      ],
      keys: [
        {
          id: 'team-key-1',
          name: 'Production Backend',
          key: 'x402_acme_Kx8mN2vL9pQr_3wYta1',
          prefix: 'x402_acm',
          createdBy: 'member-1',
          createdAt: new Date(now.getTime() - 55 * 24 * 60 * 60 * 1000),
          lastUsedAt: new Date(now.getTime() - 10 * 60 * 1000),
          expiresAt: null,
          scopes: ['read', 'write', 'payments'],
          status: 'active',
          usageCount: 284521,
          allowedMembers: 'all',
        },
        {
          id: 'team-key-2',
          name: 'Staging Environment',
          key: 'x402_acme_Tm4nP8qR2sUv_6xZae5',
          prefix: 'x402_acm',
          createdBy: 'member-2',
          createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          lastUsedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
          expiresAt: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
          scopes: ['read', 'write'],
          status: 'active',
          usageCount: 15892,
          allowedMembers: ['member-1', 'member-2', 'member-3'],
        },
        {
          id: 'team-key-3',
          name: 'Analytics Pipeline',
          key: 'x402_acme_Jk2lM5nO8pQr_1sTui9',
          prefix: 'x402_acm',
          createdBy: 'member-3',
          createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
          lastUsedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
          expiresAt: null,
          scopes: ['read'],
          status: 'active',
          usageCount: 45210,
          allowedMembers: 'all',
        },
      ],
      settings: {
        requireApprovalForKeys: false,
        maxKeysPerMember: 5,
        defaultKeyExpiration: null,
        allowedScopes: ['read', 'write', 'payments', 'admin'],
      },
      usage: {
        totalCalls: 345623,
        monthlyBudget: 500,
        currentSpend: 127.45,
      },
    },
    {
      id: 'team-2',
      name: 'Side Project Labs',
      slug: 'side-project-labs',
      description: 'Experimental projects and prototypes',
      icon: '⚡',
      createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      members: [
        {
          id: 'member-5',
          email: 'alice@acme.com',
          name: 'Alice Chen',
          role: 'owner',
          joinedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
          lastActiveAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        },
      ],
      keys: [
        {
          id: 'team-key-4',
          name: 'Prototype API',
          key: 'x402_side_Ab1cD2eF3gH4_iJ5km6',
          prefix: 'x402_sid',
          createdBy: 'member-5',
          createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
          lastUsedAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
          expiresAt: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
          scopes: ['read', 'write'],
          status: 'active',
          usageCount: 1256,
          allowedMembers: 'all',
        },
      ],
      settings: {
        requireApprovalForKeys: false,
        maxKeysPerMember: 10,
        defaultKeyExpiration: 30,
        allowedScopes: ['read', 'write'],
      },
      usage: {
        totalCalls: 1256,
        monthlyBudget: null,
        currentSpend: 8.50,
      },
    },
  ]
}

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null)

  // Load from localStorage
  useEffect(() => {
    try {
      const storedTeams = localStorage.getItem(STORAGE_KEY)
      const storedInvites = localStorage.getItem(INVITES_KEY)
      
      if (storedTeams) {
        const parsed = JSON.parse(storedTeams)
        const restored = parsed.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          members: t.members.map((m: any) => ({
            ...m,
            joinedAt: new Date(m.joinedAt),
            lastActiveAt: m.lastActiveAt ? new Date(m.lastActiveAt) : null,
          })),
          keys: t.keys.map((k: any) => ({
            ...k,
            createdAt: new Date(k.createdAt),
            lastUsedAt: k.lastUsedAt ? new Date(k.lastUsedAt) : null,
            expiresAt: k.expiresAt ? new Date(k.expiresAt) : null,
          })),
        }))
        setTeams(restored)
        if (restored.length > 0) setCurrentTeamId(restored[0].id)
      } else {
        const defaults = getDefaultTeams()
        setTeams(defaults)
        setCurrentTeamId(defaults[0].id)
      }

      if (storedInvites) {
        const parsed = JSON.parse(storedInvites)
        setInvitations(parsed.map((i: any) => ({
          ...i,
          invitedAt: new Date(i.invitedAt),
          expiresAt: new Date(i.expiresAt),
        })))
      }
    } catch {
      const defaults = getDefaultTeams()
      setTeams(defaults)
      setCurrentTeamId(defaults[0].id)
    }
    setIsLoading(false)
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(teams))
      localStorage.setItem(INVITES_KEY, JSON.stringify(invitations))
    }
  }, [teams, invitations, isLoading])

  const currentTeam = teams.find(t => t.id === currentTeamId) || null

  const createTeam = useCallback((name: string, description: string, icon: string): Team => {
    const now = new Date()
    const newTeam: Team = {
      id: `team-${generateId()}`,
      name,
      slug: generateSlug(name),
      description,
      icon,
      createdAt: now,
      members: [
        {
          id: `member-${generateId()}`,
          email: 'you@example.com',
          name: 'You',
          role: 'owner',
          joinedAt: now,
          lastActiveAt: now,
        },
      ],
      keys: [],
      settings: {
        requireApprovalForKeys: false,
        maxKeysPerMember: 5,
        defaultKeyExpiration: null,
        allowedScopes: ['read', 'write', 'payments', 'admin'],
      },
      usage: {
        totalCalls: 0,
        monthlyBudget: null,
        currentSpend: 0,
      },
    }
    setTeams(prev => [...prev, newTeam])
    setCurrentTeamId(newTeam.id)
    return newTeam
  }, [])

  const updateTeam = useCallback((teamId: string, updates: Partial<Pick<Team, 'name' | 'description' | 'icon' | 'settings'>>) => {
    setTeams(prev => prev.map(t => 
      t.id === teamId ? { ...t, ...updates, slug: updates.name ? generateSlug(updates.name) : t.slug } : t
    ))
  }, [])

  const deleteTeam = useCallback((teamId: string) => {
    setTeams(prev => prev.filter(t => t.id !== teamId))
    if (currentTeamId === teamId) {
      setCurrentTeamId(teams.find(t => t.id !== teamId)?.id || null)
    }
  }, [currentTeamId, teams])

  const addMember = useCallback((teamId: string, email: string, name: string, role: TeamMember['role']) => {
    const now = new Date()
    const newMember: TeamMember = {
      id: `member-${generateId()}`,
      email,
      name,
      role,
      joinedAt: now,
      lastActiveAt: null,
    }
    setTeams(prev => prev.map(t => 
      t.id === teamId ? { ...t, members: [...t.members, newMember] } : t
    ))
    return newMember
  }, [])

  const updateMember = useCallback((teamId: string, memberId: string, updates: Partial<Pick<TeamMember, 'role' | 'name'>>) => {
    setTeams(prev => prev.map(t => 
      t.id === teamId 
        ? { ...t, members: t.members.map(m => m.id === memberId ? { ...m, ...updates } : m) }
        : t
    ))
  }, [])

  const removeMember = useCallback((teamId: string, memberId: string) => {
    setTeams(prev => prev.map(t => 
      t.id === teamId ? { ...t, members: t.members.filter(m => m.id !== memberId) } : t
    ))
  }, [])

  const createTeamKey = useCallback((
    teamId: string, 
    name: string, 
    scopes: string[], 
    createdBy: string,
    allowedMembers: string[] | 'all',
    expiresInDays?: number
  ): TeamApiKey | null => {
    const team = teams.find(t => t.id === teamId)
    if (!team) return null

    const now = new Date()
    const fullKey = generateTeamKey(team.slug)
    const newKey: TeamApiKey = {
      id: `team-key-${generateId()}`,
      name,
      key: fullKey,
      prefix: fullKey.substring(0, 8),
      createdBy,
      createdAt: now,
      lastUsedAt: null,
      expiresAt: expiresInDays ? new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000) : null,
      scopes,
      status: 'active',
      usageCount: 0,
      allowedMembers,
    }

    setTeams(prev => prev.map(t => 
      t.id === teamId ? { ...t, keys: [...t.keys, newKey] } : t
    ))
    return newKey
  }, [teams])

  const revokeTeamKey = useCallback((teamId: string, keyId: string) => {
    setTeams(prev => prev.map(t => 
      t.id === teamId 
        ? { ...t, keys: t.keys.map(k => k.id === keyId ? { ...k, status: 'revoked' as const } : k) }
        : t
    ))
  }, [])

  const deleteTeamKey = useCallback((teamId: string, keyId: string) => {
    setTeams(prev => prev.map(t => 
      t.id === teamId ? { ...t, keys: t.keys.filter(k => k.id !== keyId) } : t
    ))
  }, [])

  const regenerateTeamKey = useCallback((teamId: string, keyId: string): string | null => {
    const team = teams.find(t => t.id === teamId)
    if (!team) return null

    const fullKey = generateTeamKey(team.slug)
    setTeams(prev => prev.map(t => 
      t.id === teamId 
        ? { 
            ...t, 
            keys: t.keys.map(k => 
              k.id === keyId 
                ? { ...k, key: fullKey, prefix: fullKey.substring(0, 8), status: 'active' as const, usageCount: 0, lastUsedAt: null }
                : k
            ) 
          }
        : t
    ))
    return fullKey
  }, [teams])

  const inviteMember = useCallback((teamId: string, email: string, role: 'admin' | 'developer' | 'viewer', invitedBy: string) => {
    const now = new Date()
    const invite: Invitation = {
      id: `invite-${generateId()}`,
      teamId,
      email,
      role,
      invitedBy,
      invitedAt: now,
      expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      status: 'pending',
    }
    setInvitations(prev => [...prev, invite])
    return invite
  }, [])

  const cancelInvitation = useCallback((inviteId: string) => {
    setInvitations(prev => prev.filter(i => i.id !== inviteId))
  }, [])

  const resetToDefaults = useCallback(() => {
    const defaults = getDefaultTeams()
    setTeams(defaults)
    setCurrentTeamId(defaults[0].id)
    setInvitations([])
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults))
    localStorage.setItem(INVITES_KEY, '[]')
  }, [])

  return {
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
    teamIcons: TEAM_ICONS,
  }
}
