'use client'

import { useState, useEffect, useCallback } from 'react'

export interface ApiKey {
  id: string
  name: string
  key: string
  prefix: string // First 8 chars shown
  createdAt: Date
  lastUsedAt: Date | null
  expiresAt: Date | null
  scopes: string[]
  status: 'active' | 'revoked' | 'expired'
  usageCount: number
}

const STORAGE_KEY = 'x402-api-keys'

// Generate a mock API key
function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const segments = [
    'x402',
    Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''),
    Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''),
    Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''),
  ]
  return segments.join('_')
}

// Default keys for demo
function getDefaultKeys(): ApiKey[] {
  const now = new Date()
  return [
    {
      id: 'key-1',
      name: 'Production API Key',
      key: 'x402_prod_Kx8mN2vL9pQr3wYt_a1b2c3d4',
      prefix: 'x402_pro',
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      lastUsedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      expiresAt: null,
      scopes: ['read', 'write', 'payments'],
      status: 'active',
      usageCount: 15420,
    },
    {
      id: 'key-2',
      name: 'Development Key',
      key: 'x402_dev_Tm4nP8qR2sUv6xZa_e5f6g7h8',
      prefix: 'x402_dev',
      createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      lastUsedAt: new Date(now.getTime() - 30 * 60 * 1000),
      expiresAt: null,
      scopes: ['read', 'write'],
      status: 'active',
      usageCount: 892,
    },
    {
      id: 'key-3',
      name: 'CI/CD Pipeline',
      key: 'x402_ci_Jk2lM5nO8pQr1sTu_i9j0k1l2',
      prefix: 'x402_ci_',
      createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      lastUsedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      scopes: ['read'],
      status: 'active',
      usageCount: 4521,
    },
    {
      id: 'key-4',
      name: 'Old Test Key',
      key: 'x402_test_Ab1cD2eF3gH4iJ5k_m6n7o8p9',
      prefix: 'x402_tes',
      createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      lastUsedAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
      expiresAt: null,
      scopes: ['read'],
      status: 'revoked',
      usageCount: 156,
    },
  ]
}

export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load keys from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Convert date strings back to Date objects
        const restored = parsed.map((k: any) => ({
          ...k,
          createdAt: new Date(k.createdAt),
          lastUsedAt: k.lastUsedAt ? new Date(k.lastUsedAt) : null,
          expiresAt: k.expiresAt ? new Date(k.expiresAt) : null,
        }))
        setKeys(restored)
      } else {
        // Use default keys for first-time users
        setKeys(getDefaultKeys())
      }
    } catch {
      setKeys(getDefaultKeys())
    }
    setIsLoading(false)
  }, [])

  // Save keys to localStorage
  useEffect(() => {
    if (!isLoading && keys.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
    }
  }, [keys, isLoading])

  const createKey = useCallback((name: string, scopes: string[], expiresInDays?: number): ApiKey => {
    const now = new Date()
    const fullKey = generateApiKey()
    const newKey: ApiKey = {
      id: `key-${Date.now()}`,
      name,
      key: fullKey,
      prefix: fullKey.substring(0, 8),
      createdAt: now,
      lastUsedAt: null,
      expiresAt: expiresInDays ? new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000) : null,
      scopes,
      status: 'active',
      usageCount: 0,
    }
    setKeys(prev => [newKey, ...prev])
    return newKey
  }, [])

  const revokeKey = useCallback((id: string) => {
    setKeys(prev => prev.map(k => 
      k.id === id ? { ...k, status: 'revoked' as const } : k
    ))
  }, [])

  const deleteKey = useCallback((id: string) => {
    setKeys(prev => prev.filter(k => k.id !== id))
  }, [])

  const regenerateKey = useCallback((id: string): string | null => {
    const fullKey = generateApiKey()
    setKeys(prev => prev.map(k => 
      k.id === id ? { 
        ...k, 
        key: fullKey,
        prefix: fullKey.substring(0, 8),
        status: 'active' as const,
        usageCount: 0,
        lastUsedAt: null,
      } : k
    ))
    return fullKey
  }, [])

  const resetToDefaults = useCallback(() => {
    const defaults = getDefaultKeys()
    setKeys(defaults)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults))
  }, [])

  return {
    keys,
    isLoading,
    createKey,
    revokeKey,
    deleteKey,
    regenerateKey,
    resetToDefaults,
    activeKeys: keys.filter(k => k.status === 'active'),
    revokedKeys: keys.filter(k => k.status === 'revoked'),
  }
}
