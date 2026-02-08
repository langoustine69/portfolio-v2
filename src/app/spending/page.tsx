'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ChartPieIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon
} from '@heroicons/react/24/outline'

interface SpendingRecord {
  date: string
  agent: string
  endpoint: string
  calls: number
  cost: number
}

interface AgentSpending {
  agent: string
  total: number
  calls: number
  avgCostPerCall: number
  trend: number // percentage change
}

// Mock spending data
const mockSpendingHistory: SpendingRecord[] = [
  { date: '2026-02-08', agent: 'crypto-sentiment', endpoint: '/analyze', calls: 1250, cost: 0.125 },
  { date: '2026-02-08', agent: 'nft-valuator', endpoint: '/appraise', calls: 340, cost: 0.051 },
  { date: '2026-02-08', agent: 'defi-yield', endpoint: '/rates', calls: 890, cost: 0.089 },
  { date: '2026-02-07', agent: 'crypto-sentiment', endpoint: '/analyze', calls: 1180, cost: 0.118 },
  { date: '2026-02-07', agent: 'nft-valuator', endpoint: '/appraise', calls: 420, cost: 0.063 },
  { date: '2026-02-07', agent: 'defi-yield', endpoint: '/rates', calls: 920, cost: 0.092 },
  { date: '2026-02-07', agent: 'wallet-tracker', endpoint: '/track', calls: 560, cost: 0.084 },
  { date: '2026-02-06', agent: 'crypto-sentiment', endpoint: '/analyze', calls: 1340, cost: 0.134 },
  { date: '2026-02-06', agent: 'nft-valuator', endpoint: '/appraise', calls: 380, cost: 0.057 },
  { date: '2026-02-06', agent: 'defi-yield', endpoint: '/rates', calls: 760, cost: 0.076 },
  { date: '2026-02-05', agent: 'crypto-sentiment', endpoint: '/analyze', calls: 980, cost: 0.098 },
  { date: '2026-02-05', agent: 'wallet-tracker', endpoint: '/track', calls: 620, cost: 0.093 },
  { date: '2026-02-04', agent: 'crypto-sentiment', endpoint: '/analyze', calls: 1120, cost: 0.112 },
  { date: '2026-02-04', agent: 'nft-valuator', endpoint: '/appraise', calls: 290, cost: 0.044 },
  { date: '2026-02-03', agent: 'defi-yield', endpoint: '/rates', calls: 850, cost: 0.085 },
  { date: '2026-02-03', agent: 'wallet-tracker', endpoint: '/track', calls: 480, cost: 0.072 },
  { date: '2026-02-02', agent: 'crypto-sentiment', endpoint: '/analyze', calls: 1050, cost: 0.105 },
  { date: '2026-02-01', agent: 'nft-valuator', endpoint: '/appraise', calls: 350, cost: 0.053 },
]

const timeRanges = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: 'All Time', value: 'all' },
]

export default function SpendingPage() {
  const [timeRange, setTimeRange] = useState('7d')
  const [budgetAlert, setBudgetAlert] = useState<number | null>(null)
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [budgetInput, setBudgetInput] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

  // Calculate spending by agent
  const agentSpending = useMemo<AgentSpending[]>(() => {
    const grouped = mockSpendingHistory.reduce((acc, record) => {
      if (!acc[record.agent]) {
        acc[record.agent] = { total: 0, calls: 0, records: [] }
      }
      acc[record.agent].total += record.cost
      acc[record.agent].calls += record.calls
      acc[record.agent].records.push(record)
      return acc
    }, {} as Record<string, { total: number; calls: number; records: SpendingRecord[] }>)

    return Object.entries(grouped).map(([agent, data]) => ({
      agent,
      total: data.total,
      calls: data.calls,
      avgCostPerCall: data.total / data.calls,
      trend: Math.random() * 40 - 20, // Mock trend
    })).sort((a, b) => b.total - a.total)
  }, [])

  // Calculate totals
  const totals = useMemo(() => {
    const total = mockSpendingHistory.reduce((sum, r) => sum + r.cost, 0)
    const calls = mockSpendingHistory.reduce((sum, r) => sum + r.calls, 0)
    const avgDaily = total / 7
    return { total, calls, avgDaily }
  }, [])

  // Daily spending for chart
  const dailySpending = useMemo(() => {
    const grouped = mockSpendingHistory.reduce((acc, record) => {
      if (!acc[record.date]) acc[record.date] = 0
      acc[record.date] += record.cost
      return acc
    }, {} as Record<string, number>)

    return Object.entries(grouped)
      .map(([date, cost]) => ({ date, cost }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [])

  const maxDailyCost = Math.max(...dailySpending.map(d => d.cost))

  const handleSetBudget = () => {
    const value = parseFloat(budgetInput)
    if (!isNaN(value) && value > 0) {
      setBudgetAlert(value)
      setShowBudgetModal(false)
      setBudgetInput('')
    }
  }

  const exportCSV = () => {
    const headers = ['Date', 'Agent', 'Endpoint', 'Calls', 'Cost (USDC)']
    const rows = mockSpendingHistory.map(r => 
      [r.date, r.agent, r.endpoint, r.calls, r.cost.toFixed(6)].join(',')
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spending-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const isOverBudget = budgetAlert && totals.total > budgetAlert

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
                <CurrencyDollarIcon className="w-8 h-8 text-orange-500" />
                Cost Tracking
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Monitor your API spending across all agents
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBudgetModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <BellIcon className="w-4 h-4" />
                Set Budget Alert
              </button>
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2 mt-6">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeRange === range.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Budget Alert Warning */}
        {isOverBudget && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3"
          >
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
            <div>
              <p className="font-semibold text-red-700 dark:text-red-400">Budget Exceeded!</p>
              <p className="text-sm text-red-600 dark:text-red-400">
                You&apos;ve spent ${totals.total.toFixed(4)} USDC, exceeding your ${budgetAlert?.toFixed(4)} budget.
              </p>
            </div>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Spent</p>
              <CurrencyDollarIcon className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              ${totals.total.toFixed(4)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">USDC</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Calls</p>
              <ChartBarIcon className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {totals.calls.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">API requests</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Avg Cost/Call</p>
              <ChartPieIcon className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              ${(totals.total / totals.calls * 1000).toFixed(4)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">per 1000 calls</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Daily Average</p>
              <CalendarIcon className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              ${totals.avgDaily.toFixed(4)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">USDC/day</p>
          </motion.div>
        </div>

        {/* Spending Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ArrowTrendingUpIcon className="w-5 h-5 text-orange-500" />
            Daily Spending Trend
          </h2>
          <div className="h-48 flex items-end gap-2">
            {dailySpending.map((day, i) => (
              <div key={day.date} className="flex-1 flex flex-col items-center">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.cost / maxDailyCost) * 100}%` }}
                  transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }}
                  className={`w-full rounded-t-lg ${
                    budgetAlert && day.cost > budgetAlert / 7
                      ? 'bg-red-500'
                      : 'bg-gradient-to-t from-orange-500 to-orange-400'
                  }`}
                  title={`${day.date}: $${day.cost.toFixed(4)}`}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 rotate-45 origin-left">
                  {day.date.slice(5)}
                </p>
              </div>
            ))}
          </div>
          {budgetAlert && (
            <div 
              className="border-t-2 border-dashed border-red-400 mt-2 relative"
              style={{ 
                marginTop: `-${((budgetAlert / 7) / maxDailyCost) * 100}%`,
                transform: 'translateY(-100%)'
              }}
            >
              <span className="absolute right-0 -top-4 text-xs text-red-500 bg-white dark:bg-gray-800 px-1">
                Daily budget: ${(budgetAlert / 7).toFixed(4)}
              </span>
            </div>
          )}
        </motion.div>

        {/* Agent Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ChartPieIcon className="w-5 h-5 text-orange-500" />
              Spending by Agent
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {agentSpending.map((agent, i) => (
              <motion.div
                key={agent.agent}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                onClick={() => setSelectedAgent(selectedAgent === agent.agent ? null : agent.agent)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🦞</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {agent.agent}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {agent.calls.toLocaleString()} calls
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ${agent.total.toFixed(4)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ${(agent.avgCostPerCall * 1000).toFixed(4)}/1k calls
                      </p>
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      agent.trend > 0 ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {agent.trend > 0 ? (
                        <ArrowUpRightIcon className="w-4 h-4" />
                      ) : (
                        <ArrowDownRightIcon className="w-4 h-4" />
                      )}
                      {Math.abs(agent.trend).toFixed(1)}%
                    </div>
                    {/* Progress bar */}
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 hidden md:block">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${(agent.total / agentSpending[0].total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedAgent === agent.agent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                  >
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Recent Activity
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {mockSpendingHistory
                        .filter(r => r.agent === agent.agent)
                        .slice(0, 3)
                        .map((record, j) => (
                          <div
                            key={j}
                            className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-sm"
                          >
                            <p className="text-gray-600 dark:text-gray-400">{record.date}</p>
                            <p className="font-mono text-gray-900 dark:text-white">
                              {record.endpoint}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400">
                              {record.calls} calls · ${record.cost.toFixed(4)}
                            </p>
                          </div>
                        ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Budget Modal */}
        {showBudgetModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Set Budget Alert
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Get notified when your spending exceeds this amount for the selected time period.
              </p>
              <div className="flex gap-2 mb-4">
                <span className="flex items-center px-3 bg-gray-100 dark:bg-gray-700 rounded-l-lg text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-r-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <span className="flex items-center px-3 text-gray-500 dark:text-gray-400">
                  USDC
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBudgetModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetBudget}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Set Alert
                </button>
              </div>
              {budgetAlert && (
                <button
                  onClick={() => {
                    setBudgetAlert(null)
                    setShowBudgetModal(false)
                  }}
                  className="w-full mt-3 text-sm text-red-500 hover:text-red-600"
                >
                  Remove current alert (${budgetAlert.toFixed(4)})
                </button>
              )}
            </motion.div>
          </div>
        )}

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-6 text-white"
        >
          <h3 className="font-semibold text-lg mb-3">💡 Cost Optimization Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/10 rounded-lg p-4">
              <p className="font-medium mb-1">Batch Requests</p>
              <p className="opacity-90">Combine multiple queries into single API calls where supported.</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="font-medium mb-1">Cache Responses</p>
              <p className="opacity-90">Cache frequently-used data to reduce redundant API calls.</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="font-medium mb-1">Use Webhooks</p>
              <p className="opacity-90">Subscribe to webhooks instead of polling for updates.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
