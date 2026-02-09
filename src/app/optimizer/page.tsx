'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  BoltIcon,
  CurrencyDollarIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ChartBarIcon,
  ClockIcon,
  CubeIcon,
  ArrowPathIcon,
  BellAlertIcon,
  DocumentDuplicateIcon,
  ArrowRightIcon,
  SparklesIcon,
  CommandLineIcon,
  ServerStackIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'
import Breadcrumbs from '@/components/Breadcrumbs'

interface UsageInput {
  dailyCalls: number
  avgResponseSize: string
  cacheHitRate: number
  peakMultiplier: number
  pollingIntervalSec: number
  batchingEnabled: boolean
  retryOnError: boolean
  duplicateRequests: number
}

interface Recommendation {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  savingsPercent: number
  effort: 'easy' | 'medium' | 'hard'
  category: 'caching' | 'batching' | 'timing' | 'architecture' | 'monitoring'
  code?: string
  applicable: boolean
  reason?: string
}

const defaultUsage: UsageInput = {
  dailyCalls: 10000,
  avgResponseSize: 'medium',
  cacheHitRate: 0,
  peakMultiplier: 3,
  pollingIntervalSec: 60,
  batchingEnabled: false,
  retryOnError: true,
  duplicateRequests: 15,
}

const avgCostPerCall = 0.0001 // $0.0001 per call

export default function OptimizerPage() {
  const [usage, setUsage] = useState<UsageInput>(defaultUsage)
  const [showCode, setShowCode] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const recommendations = useMemo<Recommendation[]>(() => {
    const recs: Recommendation[] = []

    // Caching recommendation
    if (usage.cacheHitRate < 50) {
      recs.push({
        id: 'caching',
        title: 'Implement Response Caching',
        description: `Your cache hit rate is ${usage.cacheHitRate}%. Caching frequently-requested data can reduce API calls by 40-70%. Most x402 responses are valid for 30-300 seconds.`,
        impact: 'high',
        savingsPercent: Math.min(60, 60 - usage.cacheHitRate),
        effort: 'easy',
        category: 'caching',
        applicable: true,
        code: `import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 // 60 second TTL
})

async function fetchWithCache(url: string) {
  const cached = cache.get(url)
  if (cached) return cached
  
  const response = await fetch(url)
  const data = await response.json()
  cache.set(url, data)
  return data
}`
      })
    } else {
      recs.push({
        id: 'caching',
        title: 'Response Caching',
        description: `Great! Your ${usage.cacheHitRate}% cache hit rate is solid.`,
        impact: 'low',
        savingsPercent: 0,
        effort: 'easy',
        category: 'caching',
        applicable: false,
        reason: 'Already well-optimized'
      })
    }

    // Batching recommendation
    if (!usage.batchingEnabled && usage.dailyCalls > 1000) {
      recs.push({
        id: 'batching',
        title: 'Enable Request Batching',
        description: 'Combine multiple queries into single API calls. Many agents support batch endpoints that reduce overhead by 20-40%.',
        impact: 'high',
        savingsPercent: 30,
        effort: 'medium',
        category: 'batching',
        applicable: true,
        code: `// Instead of multiple calls:
const prices = await Promise.all([
  fetch('/api/crypto-price?symbol=BTC'),
  fetch('/api/crypto-price?symbol=ETH'),
  fetch('/api/crypto-price?symbol=SOL'),
])

// Use batch endpoint:
const prices = await fetch('/api/crypto-price/batch', {
  method: 'POST',
  body: JSON.stringify({ 
    symbols: ['BTC', 'ETH', 'SOL'] 
  })
})
// One request, one payment, all data`
      })
    }

    // Polling optimization
    if (usage.pollingIntervalSec < 30) {
      recs.push({
        id: 'polling',
        title: 'Optimize Polling Frequency',
        description: `Polling every ${usage.pollingIntervalSec}s is aggressive. Most data (prices, weather, etc.) doesn't change that fast. Consider webhooks or longer intervals.`,
        impact: 'high',
        savingsPercent: Math.round((1 - usage.pollingIntervalSec / 60) * 50),
        effort: 'easy',
        category: 'timing',
        applicable: true,
        code: `// Before: Polling every 10s (8,640 calls/day)
setInterval(() => fetchPrices(), 10000)

// After: Adaptive polling
let interval = 60000 // Start at 60s

function adaptivePolling() {
  fetchPrices().then(data => {
    // Increase frequency during volatility
    const volatility = calculateVolatility(data)
    interval = volatility > 0.05 ? 15000 : 60000
    setTimeout(adaptivePolling, interval)
  })
}

// Or use webhooks for real-time updates
// No polling = no wasted calls`
      })
    }

    // Duplicate requests
    if (usage.duplicateRequests > 10) {
      recs.push({
        id: 'dedup',
        title: 'Deduplicate Concurrent Requests',
        description: `${usage.duplicateRequests}% of your requests are duplicates (same endpoint called multiple times simultaneously). Use request deduplication.`,
        impact: 'medium',
        savingsPercent: Math.round(usage.duplicateRequests * 0.8),
        effort: 'easy',
        category: 'architecture',
        applicable: true,
        code: `const pendingRequests = new Map<string, Promise<any>>()

async function deduplicatedFetch(url: string) {
  // If request already in flight, return existing promise
  if (pendingRequests.has(url)) {
    return pendingRequests.get(url)
  }
  
  const promise = fetch(url)
    .then(r => r.json())
    .finally(() => pendingRequests.delete(url))
  
  pendingRequests.set(url, promise)
  return promise
}

// Now 10 simultaneous calls = 1 API request`
      })
    }

    // Peak traffic
    if (usage.peakMultiplier > 2) {
      recs.push({
        id: 'smoothing',
        title: 'Smooth Traffic Spikes',
        description: `Your peak traffic is ${usage.peakMultiplier}x your average. Implement request queuing to spread load and avoid rate limits.`,
        impact: 'medium',
        savingsPercent: 15,
        effort: 'medium',
        category: 'timing',
        applicable: true,
        code: `import PQueue from 'p-queue'

const queue = new PQueue({
  concurrency: 5,
  interval: 1000,
  intervalCap: 10 // Max 10 requests per second
})

// All requests go through the queue
async function throttledFetch(url: string) {
  return queue.add(() => fetch(url).then(r => r.json()))
}

// Prevents bursting and rate limit errors`
      })
    }

    // Retry strategy
    if (usage.retryOnError) {
      recs.push({
        id: 'retry',
        title: 'Optimize Retry Strategy',
        description: 'Naive retries can double your costs on failures. Use exponential backoff and distinguish between retryable and non-retryable errors.',
        impact: 'low',
        savingsPercent: 5,
        effort: 'easy',
        category: 'architecture',
        applicable: true,
        code: `async function smartRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (err: any) {
      // Don't retry client errors (4xx except 429)
      if (err.status >= 400 && err.status < 500 && err.status !== 429) {
        throw err
      }
      // Exponential backoff
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)))
    }
  }
  throw new Error('Max retries exceeded')
}`
      })
    }

    // Webhooks recommendation
    recs.push({
      id: 'webhooks',
      title: 'Use Webhooks Instead of Polling',
      description: 'Subscribe to webhooks for real-time updates. You only pay when data actually changes, not for checking if it changed.',
      impact: 'high',
      savingsPercent: usage.pollingIntervalSec < 60 ? 70 : 40,
      effort: 'medium',
      category: 'architecture',
      applicable: usage.pollingIntervalSec < 120,
      code: `// Register webhook endpoint
await fetch('/api/webhooks/register', {
  method: 'POST',
  body: JSON.stringify({
    url: 'https://yourapp.com/webhook',
    events: ['price.alert', 'nft.sale'],
    filters: { threshold: 0.05 }
  })
})

// Your endpoint receives updates only when relevant
app.post('/webhook', (req, res) => {
  const { event, data } = req.body
  // Process the update - no polling needed
})`
    })

    // Precompute/aggregate
    recs.push({
      id: 'precompute',
      title: 'Precompute Aggregations',
      description: 'If you fetch the same derived data repeatedly (averages, rankings), compute once and cache the result instead of fetching raw data each time.',
      impact: 'medium',
      savingsPercent: 25,
      effort: 'medium',
      category: 'caching',
      applicable: usage.dailyCalls > 5000,
      code: `// Instead of computing on every request:
app.get('/portfolio-value', async (req, res) => {
  const prices = await fetchAllPrices() // Expensive
  const holdings = await getHoldings()
  const value = calculateTotal(prices, holdings)
  res.json({ value })
})

// Precompute on a schedule:
let cachedPortfolioValue = null
setInterval(async () => {
  const prices = await fetchAllPrices()
  const holdings = await getHoldings()
  cachedPortfolioValue = calculateTotal(prices, holdings)
}, 60000) // Update every minute

app.get('/portfolio-value', (req, res) => {
  res.json({ value: cachedPortfolioValue })
}) // Zero API calls per request`
    })

    return recs.sort((a, b) => {
      if (a.applicable !== b.applicable) return a.applicable ? -1 : 1
      const impactOrder = { high: 0, medium: 1, low: 2 }
      return impactOrder[a.impact] - impactOrder[b.impact]
    })
  }, [usage])

  const applicableRecs = recommendations.filter(r => r.applicable)
  const totalSavings = applicableRecs.reduce((sum, r) => sum + r.savingsPercent, 0)
  const estimatedSavings = Math.min(80, totalSavings) // Cap at 80%

  const currentMonthlyCost = usage.dailyCalls * 30 * avgCostPerCall
  const optimizedMonthlyCost = currentMonthlyCost * (1 - estimatedSavings / 100)

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const impactColors = {
    high: 'text-green-500 bg-green-500/10 border-green-500/30',
    medium: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
    low: 'text-gray-500 bg-gray-500/10 border-gray-500/30'
  }

  const effortLabels = {
    easy: '⚡ Quick win',
    medium: '🔧 Some work',
    hard: '🏗️ Major effort'
  }

  const categoryIcons = {
    caching: <ArrowPathIcon className="w-5 h-5" />,
    batching: <CubeIcon className="w-5 h-5" />,
    timing: <ClockIcon className="w-5 h-5" />,
    architecture: <ServerStackIcon className="w-5 h-5" />,
    monitoring: <BellAlertIcon className="w-5 h-5" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Cost Optimizer', href: '/optimizer' },
          ]}
        />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <BoltIcon className="w-8 h-8 text-orange-500" />
            API Cost Optimizer
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
            Analyze your usage patterns and get personalized recommendations to reduce costs
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-orange-500" />
                Your Usage Profile
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Daily API Calls
                  </label>
                  <input
                    type="number"
                    value={usage.dailyCalls}
                    onChange={(e) => setUsage({ ...usage, dailyCalls: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cache Hit Rate: {usage.cacheHitRate}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={usage.cacheHitRate}
                    onChange={(e) => setUsage({ ...usage, cacheHitRate: parseInt(e.target.value) })}
                    className="w-full accent-orange-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>No caching</span>
                    <span>Fully cached</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Polling Interval: {usage.pollingIntervalSec}s
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="300"
                    step="5"
                    value={usage.pollingIntervalSec}
                    onChange={(e) => setUsage({ ...usage, pollingIntervalSec: parseInt(e.target.value) })}
                    className="w-full accent-orange-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Aggressive (5s)</span>
                    <span>Relaxed (5min)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Peak Traffic Multiplier: {usage.peakMultiplier}x
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={usage.peakMultiplier}
                    onChange={(e) => setUsage({ ...usage, peakMultiplier: parseFloat(e.target.value) })}
                    className="w-full accent-orange-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Steady</span>
                    <span>Very bursty</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Duplicate Requests: {usage.duplicateRequests}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={usage.duplicateRequests}
                    onChange={(e) => setUsage({ ...usage, duplicateRequests: parseInt(e.target.value) })}
                    className="w-full accent-orange-500"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="batching"
                    checked={usage.batchingEnabled}
                    onChange={(e) => setUsage({ ...usage, batchingEnabled: e.target.checked })}
                    className="w-4 h-4 rounded accent-orange-500"
                  />
                  <label htmlFor="batching" className="text-sm text-gray-700 dark:text-gray-300">
                    Batching enabled
                  </label>
                </div>

                <button
                  onClick={() => setUsage(defaultUsage)}
                  className="w-full text-sm text-orange-500 hover:text-orange-600 py-2"
                >
                  Reset to defaults
                </button>
              </div>
            </div>
          </motion.div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Savings Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Potential Monthly Savings</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-bold">${(currentMonthlyCost - optimizedMonthlyCost).toFixed(2)}</span>
                    <span className="text-green-200">/ month</span>
                  </div>
                  <p className="text-green-100 mt-2">
                    {applicableRecs.length} optimizations available
                  </p>
                </div>
                <div className="text-right">
                  <div className="bg-white/20 rounded-lg px-4 py-2">
                    <p className="text-xs text-green-100">Savings</p>
                    <p className="text-2xl font-bold">{estimatedSavings}%</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-green-100 text-sm">Current Cost</p>
                  <p className="text-xl font-semibold">${currentMonthlyCost.toFixed(2)}/mo</p>
                  <p className="text-green-200 text-xs mt-1">
                    {(usage.dailyCalls * 30).toLocaleString()} calls
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-green-100 text-sm">Optimized Cost</p>
                  <p className="text-xl font-semibold">${optimizedMonthlyCost.toFixed(2)}/mo</p>
                  <p className="text-green-200 text-xs mt-1">
                    After implementing recommendations
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Recommendations */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <LightBulbIcon className="w-6 h-6 text-orange-500" />
                Personalized Recommendations
              </h2>

              {recommendations.map((rec, i) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className={`bg-white dark:bg-gray-800 rounded-xl border ${
                    rec.applicable
                      ? 'border-gray-200 dark:border-gray-700'
                      : 'border-gray-100 dark:border-gray-800 opacity-60'
                  } overflow-hidden`}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${impactColors[rec.impact]}`}>
                          {categoryIcons[rec.category]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            {rec.title}
                            {!rec.applicable && (
                              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded-full">
                                {rec.reason}
                              </span>
                            )}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                            {rec.description}
                          </p>
                        </div>
                      </div>

                      {rec.applicable && (
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${impactColors[rec.impact]}`}>
                            -{rec.savingsPercent}%
                          </span>
                          <span className="text-xs text-gray-500">{effortLabels[rec.effort]}</span>
                        </div>
                      )}
                    </div>

                    {rec.applicable && rec.code && (
                      <div className="mt-4">
                        <button
                          onClick={() => setShowCode(showCode === rec.id ? null : rec.id)}
                          className="flex items-center gap-2 text-sm text-orange-500 hover:text-orange-600 font-medium"
                        >
                          <CommandLineIcon className="w-4 h-4" />
                          {showCode === rec.id ? 'Hide code example' : 'Show code example'}
                        </button>

                        <AnimatePresence>
                          {showCode === rec.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3"
                            >
                              <div className="relative">
                                <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto">
                                  <code>{rec.code}</code>
                                </pre>
                                <button
                                  onClick={() => copyCode(rec.id, rec.code!)}
                                  className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                                  title="Copy code"
                                >
                                  {copied === rec.id ? (
                                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <DocumentDuplicateIcon className="w-4 h-4 text-gray-400" />
                                  )}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Wins Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800"
            >
              <h3 className="font-semibold text-orange-800 dark:text-orange-200 flex items-center gap-2 mb-4">
                <RocketLaunchIcon className="w-5 h-5" />
                Quick Wins (implement today)
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {applicableRecs
                  .filter(r => r.effort === 'easy')
                  .slice(0, 4)
                  .map(rec => (
                    <div
                      key={rec.id}
                      className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">{rec.title}</span>
                      <span className="text-green-600 dark:text-green-400 font-medium text-sm">-{rec.savingsPercent}%</span>
                    </div>
                  ))}
              </div>
            </motion.div>

            {/* Related Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid sm:grid-cols-3 gap-4"
            >
              <Link
                href="/spending"
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-orange-500 transition-colors group"
              >
                <CurrencyDollarIcon className="w-6 h-6 text-orange-500 mb-2" />
                <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-orange-500">
                  Cost Tracking
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Monitor actual spending
                </p>
              </Link>

              <Link
                href="/rate-calculator"
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-orange-500 transition-colors group"
              >
                <ClockIcon className="w-6 h-6 text-blue-500 mb-2" />
                <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-orange-500">
                  Rate Limits
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Calculate usage limits
                </p>
              </Link>

              <Link
                href="/snippets"
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-orange-500 transition-colors group"
              >
                <CommandLineIcon className="w-6 h-6 text-purple-500 mb-2" />
                <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-orange-500">
                  Code Snippets
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ready-to-use examples
                </p>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
