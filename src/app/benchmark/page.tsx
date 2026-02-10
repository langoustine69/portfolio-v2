'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  BoltIcon,
  PlayIcon,
  StopIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  CpuChipIcon,
  SignalIcon,
  BeakerIcon,
  RocketLaunchIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import Breadcrumbs from '@/components/Breadcrumbs'
import { agents } from '@/data/agents'

interface BenchmarkConfig {
  agentId: string
  iterations: number
  concurrency: number
  warmupRuns: number
  delayBetweenMs: number
}

interface BenchmarkResult {
  agentId: string
  agentName: string
  iterations: number
  concurrency: number
  results: number[]
  errors: number
  startTime: Date
  endTime: Date
  stats: {
    min: number
    max: number
    mean: number
    median: number
    p95: number
    p99: number
    stdDev: number
    successRate: number
    throughput: number
  }
}

const defaultConfig: BenchmarkConfig = {
  agentId: '',
  iterations: 20,
  concurrency: 1,
  warmupRuns: 3,
  delayBetweenMs: 100,
}

const liveAgents = agents.filter(a => a.status === 'live')

function calculateStats(times: number[], errors: number, totalMs: number): BenchmarkResult['stats'] {
  if (times.length === 0) {
    return {
      min: 0,
      max: 0,
      mean: 0,
      median: 0,
      p95: 0,
      p99: 0,
      stdDev: 0,
      successRate: 0,
      throughput: 0,
    }
  }

  const sorted = [...times].sort((a, b) => a - b)
  const sum = sorted.reduce((a, b) => a + b, 0)
  const mean = sum / sorted.length
  const variance = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / sorted.length

  const p95Index = Math.floor(sorted.length * 0.95)
  const p99Index = Math.floor(sorted.length * 0.99)

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean: Math.round(mean),
    median: sorted[Math.floor(sorted.length / 2)],
    p95: sorted[Math.min(p95Index, sorted.length - 1)],
    p99: sorted[Math.min(p99Index, sorted.length - 1)],
    stdDev: Math.round(Math.sqrt(variance)),
    successRate: ((times.length) / (times.length + errors)) * 100,
    throughput: totalMs > 0 ? (times.length / (totalMs / 1000)) : 0,
  }
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

export default function BenchmarkPage() {
  const [config, setConfig] = useState<BenchmarkConfig>(defaultConfig)
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentPhase, setCurrentPhase] = useState<'idle' | 'warmup' | 'running' | 'complete'>('idle')
  const [result, setResult] = useState<BenchmarkResult | null>(null)
  const [liveResults, setLiveResults] = useState<number[]>([])
  const [copied, setCopied] = useState(false)
  const abortRef = useRef(false)

  const selectedAgent = liveAgents.find(a => a.id === config.agentId)

  // Simulated benchmark (in real app, would make actual API calls)
  const runBenchmark = useCallback(async () => {
    if (!config.agentId) return

    abortRef.current = false
    setIsRunning(true)
    setProgress(0)
    setLiveResults([])
    setResult(null)
    setCurrentPhase('warmup')

    const agent = liveAgents.find(a => a.id === config.agentId)
    if (!agent) return

    const times: number[] = []
    let errors = 0
    const startTime = new Date()

    // Warmup phase
    for (let i = 0; i < config.warmupRuns; i++) {
      if (abortRef.current) break
      await new Promise(r => setTimeout(r, 50))
      setProgress(((i + 1) / config.warmupRuns) * 10)
    }

    if (abortRef.current) {
      setIsRunning(false)
      setCurrentPhase('idle')
      return
    }

    setCurrentPhase('running')

    // Main benchmark
    const totalIterations = config.iterations
    const batches = Math.ceil(totalIterations / config.concurrency)

    for (let batch = 0; batch < batches; batch++) {
      if (abortRef.current) break

      const batchSize = Math.min(config.concurrency, totalIterations - batch * config.concurrency)
      const batchPromises = []

      for (let i = 0; i < batchSize; i++) {
        batchPromises.push(
          (async () => {
            // Simulate API call with realistic latency distribution
            const baseLatency = 80 + Math.random() * 120 // 80-200ms base
            const jitter = Math.random() * 50 - 25 // ±25ms jitter
            const occasionalSlowdown = Math.random() > 0.95 ? Math.random() * 300 : 0 // 5% chance of slow response
            const latency = Math.max(30, baseLatency + jitter + occasionalSlowdown)

            // Simulate occasional errors (2% rate)
            if (Math.random() > 0.98) {
              errors++
              return null
            }

            await new Promise(r => setTimeout(r, latency))
            return latency
          })()
        )
      }

      const batchResults = await Promise.all(batchPromises)
      batchResults.forEach(r => {
        if (r !== null) {
          times.push(r)
          setLiveResults(prev => [...prev, r])
        }
      })

      setProgress(10 + ((batch + 1) / batches) * 90)

      // Delay between batches
      if (config.delayBetweenMs > 0 && batch < batches - 1) {
        await new Promise(r => setTimeout(r, config.delayBetweenMs))
      }
    }

    const endTime = new Date()
    const totalMs = endTime.getTime() - startTime.getTime()

    if (!abortRef.current) {
      const stats = calculateStats(times, errors, totalMs)
      setResult({
        agentId: config.agentId,
        agentName: agent.name,
        iterations: config.iterations,
        concurrency: config.concurrency,
        results: times,
        errors,
        startTime,
        endTime,
        stats,
      })
      setCurrentPhase('complete')
    }

    setIsRunning(false)
  }, [config])

  const stopBenchmark = () => {
    abortRef.current = true
  }

  const exportResults = () => {
    if (!result) return

    const data = {
      benchmark: {
        agent: result.agentName,
        agentId: result.agentId,
        iterations: result.iterations,
        concurrency: result.concurrency,
        timestamp: result.startTime.toISOString(),
      },
      statistics: result.stats,
      rawResults: result.results,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `benchmark-${result.agentId}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyResults = () => {
    if (!result) return

    const text = `
Benchmark Results: ${result.agentName}
═══════════════════════════════════════
Iterations: ${result.iterations}
Concurrency: ${result.concurrency}
Success Rate: ${result.stats.successRate.toFixed(1)}%
Throughput: ${result.stats.throughput.toFixed(2)} req/s

Latency Statistics:
  Min:    ${formatMs(result.stats.min)}
  Max:    ${formatMs(result.stats.max)}
  Mean:   ${formatMs(result.stats.mean)}
  Median: ${formatMs(result.stats.median)}
  P95:    ${formatMs(result.stats.p95)}
  P99:    ${formatMs(result.stats.p99)}
  StdDev: ${formatMs(result.stats.stdDev)}
`.trim()

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getLatencyColor = (ms: number) => {
    if (ms < 100) return 'text-green-500'
    if (ms < 200) return 'text-yellow-500'
    if (ms < 500) return 'text-orange-500'
    return 'text-red-500'
  }

  const getLatencyBarWidth = (ms: number, max: number) => {
    return Math.min(100, (ms / max) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Performance Benchmark', href: '/benchmark' },
          ]}
        />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <BeakerIcon className="w-8 h-8 text-orange-500" />
            Performance Benchmark
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
            Test agent response times, throughput, and reliability with configurable load tests
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CpuChipIcon className="w-5 h-5 text-orange-500" />
                Benchmark Configuration
              </h2>

              <div className="space-y-5">
                {/* Agent Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Agent
                  </label>
                  <select
                    value={config.agentId}
                    onChange={(e) => setConfig({ ...config, agentId: e.target.value })}
                    disabled={isRunning}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                  >
                    <option value="">Choose an agent...</option>
                    {liveAgents.map(agent => (
                      <option key={agent.id} value={agent.id}>
                        {agent.icon} {agent.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Iterations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Iterations: {config.iterations}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={config.iterations}
                    onChange={(e) => setConfig({ ...config, iterations: parseInt(e.target.value) })}
                    disabled={isRunning}
                    className="w-full accent-orange-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Quick (5)</span>
                    <span>Thorough (100)</span>
                  </div>
                </div>

                {/* Concurrency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Concurrency: {config.concurrency}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={config.concurrency}
                    onChange={(e) => setConfig({ ...config, concurrency: parseInt(e.target.value) })}
                    disabled={isRunning}
                    className="w-full accent-orange-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Sequential</span>
                    <span>Parallel (10)</span>
                  </div>
                </div>

                {/* Warmup Runs */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Warmup Runs: {config.warmupRuns}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={config.warmupRuns}
                    onChange={(e) => setConfig({ ...config, warmupRuns: parseInt(e.target.value) })}
                    disabled={isRunning}
                    className="w-full accent-orange-500"
                  />
                </div>

                {/* Delay Between Requests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Delay Between: {config.delayBetweenMs}ms
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="50"
                    value={config.delayBetweenMs}
                    onChange={(e) => setConfig({ ...config, delayBetweenMs: parseInt(e.target.value) })}
                    disabled={isRunning}
                    className="w-full accent-orange-500"
                  />
                </div>

                {/* Run/Stop Button */}
                <div className="pt-2">
                  {!isRunning ? (
                    <button
                      onClick={runBenchmark}
                      disabled={!config.agentId}
                      className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                      <PlayIcon className="w-5 h-5" />
                      Run Benchmark
                    </button>
                  ) : (
                    <button
                      onClick={stopBenchmark}
                      className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                      <StopIcon className="w-5 h-5" />
                      Stop Benchmark
                    </button>
                  )}
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm text-blue-800 dark:text-blue-200">
                  <div className="flex gap-2">
                    <InformationCircleIcon className="w-5 h-5 shrink-0" />
                    <p>
                      Benchmarks use simulated latencies for demo purposes. In production, 
                      these would make real API calls to measure actual response times.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Bar */}
            <AnimatePresence>
              {isRunning && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {currentPhase === 'warmup' ? '🔥 Warming up...' : '🚀 Running benchmark...'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  {/* Live Results Sparkline */}
                  {liveResults.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-2">Live Latency (ms)</p>
                      <div className="flex items-end gap-0.5 h-12">
                        {liveResults.slice(-50).map((ms, i) => (
                          <div
                            key={i}
                            className={`w-1.5 rounded-t ${getLatencyColor(ms)} bg-current opacity-70`}
                            style={{ height: `${Math.min(100, (ms / 500) * 100)}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Summary Cards */}
                  <div className="grid sm:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                        <ClockIcon className="w-4 h-4" />
                        Mean Latency
                      </div>
                      <p className={`text-2xl font-bold ${getLatencyColor(result.stats.mean)}`}>
                        {formatMs(result.stats.mean)}
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                        <ChartBarIcon className="w-4 h-4" />
                        P95 Latency
                      </div>
                      <p className={`text-2xl font-bold ${getLatencyColor(result.stats.p95)}`}>
                        {formatMs(result.stats.p95)}
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                        <RocketLaunchIcon className="w-4 h-4" />
                        Throughput
                      </div>
                      <p className="text-2xl font-bold text-blue-500">
                        {result.stats.throughput.toFixed(1)}/s
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                        <CheckCircleIcon className="w-4 h-4" />
                        Success Rate
                      </div>
                      <p className={`text-2xl font-bold ${result.stats.successRate >= 99 ? 'text-green-500' : result.stats.successRate >= 95 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {result.stats.successRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Detailed Stats */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <SignalIcon className="w-5 h-5 text-orange-500" />
                        Latency Distribution
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={copyResults}
                          className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-500 transition-colors"
                        >
                          {copied ? (
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          ) : (
                            <DocumentDuplicateIcon className="w-4 h-4" />
                          )}
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          onClick={exportResults}
                          className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-500 transition-colors"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" />
                          Export JSON
                        </button>
                      </div>
                    </div>

                    {/* Stats Table */}
                    <div className="space-y-4">
                      {[
                        { label: 'Minimum', value: result.stats.min, icon: '🏃' },
                        { label: 'Maximum', value: result.stats.max, icon: '🐢' },
                        { label: 'Mean', value: result.stats.mean, icon: '📊' },
                        { label: 'Median', value: result.stats.median, icon: '⚖️' },
                        { label: 'P95', value: result.stats.p95, icon: '📈' },
                        { label: 'P99', value: result.stats.p99, icon: '🔝' },
                        { label: 'Std Deviation', value: result.stats.stdDev, icon: '📉' },
                      ].map((stat) => (
                        <div key={stat.label} className="flex items-center gap-4">
                          <span className="w-6 text-center">{stat.icon}</span>
                          <span className="w-28 text-sm text-gray-600 dark:text-gray-400">{stat.label}</span>
                          <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${
                                stat.value < 100 ? 'bg-green-500' :
                                stat.value < 200 ? 'bg-yellow-500' :
                                stat.value < 500 ? 'bg-orange-500' : 'bg-red-500'
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${getLatencyBarWidth(stat.value, result.stats.max)}%` }}
                              transition={{ duration: 0.5, delay: 0.1 }}
                            />
                          </div>
                          <span className={`w-20 text-right font-mono text-sm ${getLatencyColor(stat.value)}`}>
                            {formatMs(stat.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Latency Histogram */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <ChartBarIcon className="w-5 h-5 text-orange-500" />
                      Response Time Histogram
                    </h3>
                    <div className="flex items-end gap-1 h-40">
                      {(() => {
                        // Create buckets
                        const buckets = [0, 50, 100, 150, 200, 250, 300, 400, 500, 1000]
                        const counts = new Array(buckets.length).fill(0)
                        result.results.forEach(ms => {
                          for (let i = 0; i < buckets.length; i++) {
                            if (ms <= buckets[i] || i === buckets.length - 1) {
                              counts[i]++
                              break
                            }
                          }
                        })
                        const maxCount = Math.max(...counts, 1)

                        return buckets.map((bucket, i) => (
                          <div key={bucket} className="flex-1 flex flex-col items-center gap-1">
                            <motion.div
                              className={`w-full rounded-t ${
                                bucket <= 100 ? 'bg-green-500' :
                                bucket <= 200 ? 'bg-yellow-500' :
                                bucket <= 500 ? 'bg-orange-500' : 'bg-red-500'
                              }`}
                              initial={{ height: 0 }}
                              animate={{ height: `${(counts[i] / maxCount) * 100}%` }}
                              transition={{ duration: 0.5, delay: i * 0.05 }}
                            />
                            <span className="text-xs text-gray-500 rotate-45 origin-left whitespace-nowrap">
                              {bucket < 1000 ? `${bucket}ms` : '1s+'}
                            </span>
                          </div>
                        ))
                      })()}
                    </div>
                  </div>

                  {/* Test Info */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                      <span>Agent: <strong>{result.agentName}</strong></span>
                      <span>Iterations: <strong>{result.iterations}</strong></span>
                      <span>Concurrency: <strong>{result.concurrency}</strong></span>
                      <span>Errors: <strong className={result.errors > 0 ? 'text-red-500' : 'text-green-500'}>{result.errors}</strong></span>
                      <span>Duration: <strong>{formatMs(result.endTime.getTime() - result.startTime.getTime())}</strong></span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty State */}
            {!isRunning && !result && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center"
              >
                <BeakerIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Ready to Benchmark
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Select an agent and configure your test parameters, then click &quot;Run Benchmark&quot; 
                  to measure response times and reliability.
                </p>
              </motion.div>
            )}

            {/* Related Tools */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid sm:grid-cols-3 gap-4"
            >
              <Link
                href="/heatmap"
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-orange-500 transition-colors group"
              >
                <ChartBarIcon className="w-6 h-6 text-orange-500 mb-2" />
                <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-orange-500">
                  Response Heatmap
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Visualize latency by time
                </p>
              </Link>

              <Link
                href="/latency-map"
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-orange-500 transition-colors group"
              >
                <SignalIcon className="w-6 h-6 text-blue-500 mb-2" />
                <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-orange-500">
                  Global Latency
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Response times by region
                </p>
              </Link>

              <Link
                href="/reliability"
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-orange-500 transition-colors group"
              >
                <CheckCircleIcon className="w-6 h-6 text-green-500 mb-2" />
                <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-orange-500">
                  SLA & Reliability
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Uptime guarantees
                </p>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
