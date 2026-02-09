'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  HomeIcon,
  HeartIcon,
  ChartBarIcon,
  ClockIcon,
  BoltIcon,
  ArrowTrendingUpIcon,
  BeakerIcon,
  ScaleIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
  ArrowRightIcon,
  StarIcon,
  RocketLaunchIcon,
  CurrencyDollarIcon,
  CommandLineIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { useFavorites } from '@/hooks/useFavorites'
import { agents, Agent } from '@/data/agents'

interface ActivityItem {
  id: string
  type: 'api_call' | 'favorite' | 'compare' | 'export' | 'playground'
  agent?: string
  description: string
  timestamp: Date
  success: boolean
}

interface UsageStats {
  totalCalls: number
  totalSpent: number
  avgResponseTime: number
  successRate: number
  topAgent: string
  weeklyChange: number
}

// Mock activity data generator
function generateMockActivity(): ActivityItem[] {
  const types: ActivityItem['type'][] = ['api_call', 'api_call', 'api_call', 'playground', 'compare', 'export']
  const agentIds = agents.filter(a => a.status === 'live').map(a => a.id).slice(0, 8)
  
  return Array.from({ length: 10 }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)]
    const agent = agentIds[Math.floor(Math.random() * agentIds.length)]
    const success = Math.random() > 0.1
    
    const descriptions: Record<ActivityItem['type'], string> = {
      api_call: `Called /${['overview', 'status', 'data', 'report'][Math.floor(Math.random() * 4)]}`,
      favorite: 'Added to favorites',
      compare: 'Compared agents',
      export: 'Exported SDK',
      playground: 'Tested in playground',
    }
    
    return {
      id: `activity-${i}`,
      type,
      agent,
      description: descriptions[type],
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 3),
      success,
    }
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

// Mock usage stats
function generateMockStats(favorites: string[]): UsageStats {
  return {
    totalCalls: Math.floor(Math.random() * 5000) + 1000,
    totalSpent: Math.random() * 2 + 0.5,
    avgResponseTime: Math.floor(Math.random() * 150) + 50,
    successRate: 95 + Math.random() * 4.5,
    topAgent: favorites[0] || 'crypto-price-agent',
    weeklyChange: Math.random() * 40 - 10,
  }
}

export default function DashboardPage() {
  const { favorites, isFavorite, toggleFavorite, mounted } = useFavorites()
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [stats, setStats] = useState<UsageStats | null>(null)
  
  // Generate mock data on client side
  useEffect(() => {
    if (mounted) {
      setActivity(generateMockActivity())
      setStats(generateMockStats(favorites))
    }
  }, [mounted, favorites])
  
  // Get favorite agents
  const favoriteAgents = useMemo(() => {
    return agents.filter(a => favorites.includes(a.id))
  }, [favorites])
  
  // Get recommended agents (live agents not in favorites)
  const recommendations = useMemo(() => {
    return agents
      .filter(a => a.status === 'live' && !favorites.includes(a.id))
      .slice(0, 4)
  }, [favorites])
  
  // Quick actions
  const quickActions = [
    { label: 'API Playground', href: '/simulator', icon: BeakerIcon, color: 'bg-blue-500' },
    { label: 'Compare Agents', href: '/compare', icon: ScaleIcon, color: 'bg-purple-500' },
    { label: 'Export SDK', href: '/sdk', icon: ArrowDownTrayIcon, color: 'bg-green-500' },
    { label: 'View Spending', href: '/spending', icon: CurrencyDollarIcon, color: 'bg-orange-500' },
  ]
  
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }
  
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'api_call': return CommandLineIcon
      case 'favorite': return HeartSolidIcon
      case 'compare': return ScaleIcon
      case 'export': return ArrowDownTrayIcon
      case 'playground': return BeakerIcon
      default: return BoltIcon
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <HomeIcon className="w-8 h-8 text-orange-500" />
                My Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Your personalized x402 agent command center
              </p>
            </div>
            <Link
              href="/agents"
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <SparklesIcon className="w-4 h-4" />
              Explore Agents
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total API Calls</p>
                <ChartBarIcon className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.totalCalls.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                <ArrowTrendingUpIcon className={`w-3 h-3 ${stats.weeklyChange > 0 ? 'text-green-500' : 'text-red-500'}`} />
                {stats.weeklyChange > 0 ? '+' : ''}{stats.weeklyChange.toFixed(1)}% this week
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Spent</p>
                <CurrencyDollarIcon className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                ${stats.totalSpent.toFixed(4)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">USDC</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Avg Response</p>
                <ClockIcon className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.avgResponseTime}ms
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">across all agents</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Success Rate</p>
                <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.successRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">API reliability</p>
            </motion.div>
          </div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BoltIcon className="w-5 h-5 text-orange-500" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, i) => (
              <Link
                key={action.href}
                href={action.href}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 transition-all hover:shadow-lg group"
              >
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <p className="font-medium text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors">
                  {action.label}
                </p>
              </Link>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Favorite Agents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <HeartSolidIcon className="w-5 h-5 text-red-500" />
                  My Favorite Agents
                  {favoriteAgents.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs rounded-full">
                      {favoriteAgents.length}
                    </span>
                  )}
                </h2>
                <Link
                  href="/agents?favorites=true"
                  className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1"
                >
                  View all <ArrowRightIcon className="w-3 h-3" />
                </Link>
              </div>
              
              {favoriteAgents.length === 0 ? (
                <div className="p-12 text-center">
                  <HeartIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No favorite agents yet
                  </p>
                  <Link
                    href="/agents"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add favorites
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {favoriteAgents.slice(0, 5).map((agent, i) => (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <Link href={`/agents/${agent.id}`} className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center text-xl">
                            {agent.icon}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white hover:text-orange-500 transition-colors">
                              {agent.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {agent.category}
                            </p>
                          </div>
                        </Link>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            agent.status === 'live' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {agent.status}
                          </span>
                          <button
                            onClick={() => toggleFavorite(agent.id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <HeartSolidIcon className="w-5 h-5 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-orange-500" />
                  Recent Activity
                </h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[400px] overflow-y-auto">
                {activity.slice(0, 8).map((item, i) => {
                  const Icon = getActivityIcon(item.type)
                  const agentData = agents.find(a => a.id === item.agent)
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 + i * 0.03 }}
                      className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          item.success 
                            ? 'bg-green-100 dark:bg-green-900/30' 
                            : 'bg-red-100 dark:bg-red-900/30'
                        }`}>
                          <Icon className={`w-4 h-4 ${
                            item.success 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white truncate">
                            {item.description}
                          </p>
                          {agentData && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <span>{agentData.icon}</span>
                              {agentData.name}
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                          {formatTimeAgo(item.timestamp)}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-6 text-white">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <RocketLaunchIcon className="w-5 h-5" />
              Recommended for You
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {recommendations.map((agent, i) => (
                <Link
                  key={agent.id}
                  href={`/agents/${agent.id}`}
                  className="bg-white/10 backdrop-blur rounded-lg p-4 hover:bg-white/20 transition-colors group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{agent.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium truncate">{agent.name}</p>
                      <p className="text-xs opacity-80">{agent.category}</p>
                    </div>
                  </div>
                  <p className="text-sm opacity-90 line-clamp-2">
                    {agent.description.slice(0, 80)}...
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs opacity-70 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRightIcon className="w-3 h-3" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Getting Started (for new users) */}
        {favoriteAgents.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <StarIcon className="w-5 h-5 text-orange-500" />
              Getting Started
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/discover"
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <p className="font-medium text-gray-900 dark:text-white mb-1">1. Find your agents</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Take our quiz to discover agents that match your needs</p>
              </Link>
              <Link
                href="/simulator"
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <p className="font-medium text-gray-900 dark:text-white mb-1">2. Test in playground</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Try API calls without writing code</p>
              </Link>
              <Link
                href="/starters"
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <p className="font-medium text-gray-900 dark:text-white mb-1">3. Start building</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Use our starter templates to integrate fast</p>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
