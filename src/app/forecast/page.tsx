'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  CalculatorIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  AdjustmentsHorizontalIcon,
  CurrencyDollarIcon,
  LightBulbIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

// Historical spending data (mock - last 30 days)
const historicalData = [
  { date: '2026-01-12', calls: 2100, cost: 0.21 },
  { date: '2026-01-13', calls: 2340, cost: 0.234 },
  { date: '2026-01-14', calls: 1980, cost: 0.198 },
  { date: '2026-01-15', calls: 2560, cost: 0.256 },
  { date: '2026-01-16', calls: 2890, cost: 0.289 },
  { date: '2026-01-17', calls: 3120, cost: 0.312 },
  { date: '2026-01-18', calls: 2780, cost: 0.278 },
  { date: '2026-01-19', calls: 3450, cost: 0.345 },
  { date: '2026-01-20', calls: 3210, cost: 0.321 },
  { date: '2026-01-21', calls: 3680, cost: 0.368 },
  { date: '2026-01-22', calls: 3890, cost: 0.389 },
  { date: '2026-01-23', calls: 4120, cost: 0.412 },
  { date: '2026-01-24', calls: 3560, cost: 0.356 },
  { date: '2026-01-25', calls: 4230, cost: 0.423 },
  { date: '2026-01-26', calls: 4560, cost: 0.456 },
  { date: '2026-01-27', calls: 4890, cost: 0.489 },
  { date: '2026-01-28', calls: 4340, cost: 0.434 },
  { date: '2026-01-29', calls: 5120, cost: 0.512 },
  { date: '2026-01-30', calls: 5450, cost: 0.545 },
  { date: '2026-01-31', calls: 5890, cost: 0.589 },
  { date: '2026-02-01', calls: 5230, cost: 0.523 },
  { date: '2026-02-02', calls: 6120, cost: 0.612 },
  { date: '2026-02-03', calls: 6450, cost: 0.645 },
  { date: '2026-02-04', calls: 6890, cost: 0.689 },
  { date: '2026-02-05', calls: 6340, cost: 0.634 },
  { date: '2026-02-06', calls: 7120, cost: 0.712 },
  { date: '2026-02-07', calls: 7450, cost: 0.745 },
  { date: '2026-02-08', calls: 7890, cost: 0.789 },
  { date: '2026-02-09', calls: 8230, cost: 0.823 },
  { date: '2026-02-10', calls: 8560, cost: 0.856 },
]

// Simple linear regression for trend
function linearRegression(data: { x: number; y: number }[]) {
  const n = data.length
  const sumX = data.reduce((a, d) => a + d.x, 0)
  const sumY = data.reduce((a, d) => a + d.y, 0)
  const sumXY = data.reduce((a, d) => a + d.x * d.y, 0)
  const sumX2 = data.reduce((a, d) => a + d.x * d.x, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  return { slope, intercept }
}

type ForecastPeriod = '7d' | '30d' | '90d' | '365d'

const forecastPeriods: { label: string; value: ForecastPeriod; days: number }[] = [
  { label: '7 Days', value: '7d', days: 7 },
  { label: '30 Days', value: '30d', days: 30 },
  { label: '90 Days', value: '90d', days: 90 },
  { label: '1 Year', value: '365d', days: 365 },
]

export default function ForecastPage() {
  const [forecastPeriod, setForecastPeriod] = useState<ForecastPeriod>('30d')
  const [growthModifier, setGrowthModifier] = useState(0) // percentage adjustment
  const [monthlyBudget, setMonthlyBudget] = useState('')
  const [showScenarios, setShowScenarios] = useState(false)

  // Calculate trend from historical data
  const trend = useMemo(() => {
    const dataPoints = historicalData.map((d, i) => ({ x: i, y: d.cost }))
    return linearRegression(dataPoints)
  }, [])

  // Calculate statistics
  const stats = useMemo(() => {
    const costs = historicalData.map(d => d.cost)
    const avg = costs.reduce((a, b) => a + b, 0) / costs.length
    const recent7 = costs.slice(-7)
    const recent7Avg = recent7.reduce((a, b) => a + b, 0) / 7
    const growthRate = ((recent7Avg - costs.slice(0, 7).reduce((a, b) => a + b, 0) / 7) / (costs.slice(0, 7).reduce((a, b) => a + b, 0) / 7)) * 100
    
    return {
      avgDaily: avg,
      recent7Avg,
      growthRate,
      totalLast30: costs.reduce((a, b) => a + b, 0),
      dailyGrowth: trend.slope
    }
  }, [trend])

  // Generate forecast
  const forecast = useMemo(() => {
    const days = forecastPeriods.find(p => p.value === forecastPeriod)?.days || 30
    const startIndex = historicalData.length
    const adjustedSlope = trend.slope * (1 + growthModifier / 100)
    
    const projectedDays: { date: string; cost: number; costLow: number; costHigh: number }[] = []
    let totalCost = 0
    
    for (let i = 0; i < days; i++) {
      const baseDate = new Date('2026-02-10')
      baseDate.setDate(baseDate.getDate() + i + 1)
      const dateStr = baseDate.toISOString().split('T')[0]
      
      const projectedCost = Math.max(0, trend.intercept + adjustedSlope * (startIndex + i))
      const variance = projectedCost * 0.15 // 15% variance for confidence interval
      
      projectedDays.push({
        date: dateStr,
        cost: projectedCost,
        costLow: Math.max(0, projectedCost - variance),
        costHigh: projectedCost + variance
      })
      totalCost += projectedCost
    }
    
    return {
      days: projectedDays,
      totalCost,
      avgDaily: totalCost / days,
      endDate: projectedDays[projectedDays.length - 1]?.date
    }
  }, [forecastPeriod, growthModifier, trend])

  // Budget analysis
  const budgetAnalysis = useMemo(() => {
    const budget = parseFloat(monthlyBudget)
    if (!budget || isNaN(budget)) return null
    
    const projectedMonthly = forecast.avgDaily * 30
    const surplus = budget - projectedMonthly
    const daysUntilBudget = budget / forecast.avgDaily
    
    return {
      projectedMonthly,
      surplus,
      percentOfBudget: (projectedMonthly / budget) * 100,
      daysUntilBudget,
      isOverBudget: surplus < 0
    }
  }, [monthlyBudget, forecast])

  // Scenarios
  const scenarios = useMemo(() => [
    {
      name: 'Conservative',
      modifier: -20,
      icon: '🐢',
      description: 'Reduced growth, optimized usage'
    },
    {
      name: 'Current Trend',
      modifier: 0,
      icon: '📈',
      description: 'Continue current trajectory'
    },
    {
      name: 'Aggressive',
      modifier: 50,
      icon: '🚀',
      description: 'Rapid scaling scenario'
    },
    {
      name: 'Hypergrowth',
      modifier: 100,
      icon: '⚡',
      description: '2x current growth rate'
    }
  ], [])

  const maxHistorical = Math.max(...historicalData.map(d => d.cost))
  const maxForecast = Math.max(...forecast.days.map(d => d.costHigh))
  const maxValue = Math.max(maxHistorical, maxForecast)

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <Link href="/" className="hover:text-orange-500">Home</Link>
            <ChevronRightIcon className="w-4 h-4" />
            <Link href="/spending" className="hover:text-orange-500">Spending</Link>
            <ChevronRightIcon className="w-4 h-4" />
            <span className="text-gray-900 dark:text-white">Forecast</span>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <ArrowTrendingUpIcon className="w-8 h-8 text-orange-500" />
                Cost Forecast
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Predict future API spending based on usage trends
              </p>
            </div>
            <button
              onClick={() => setShowScenarios(!showScenarios)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
              {showScenarios ? 'Hide' : 'Show'} Scenarios
            </button>
          </div>
        </motion.div>

        {/* Current Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <p className="text-gray-500 dark:text-gray-400 text-sm">Last 30 Days</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              ${stats.totalLast30.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">total spent</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <p className="text-gray-500 dark:text-gray-400 text-sm">Daily Average</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              ${stats.avgDaily.toFixed(3)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">USDC/day</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <p className="text-gray-500 dark:text-gray-400 text-sm">Growth Rate</p>
            <p className={`text-2xl font-bold mt-2 ${stats.growthRate > 0 ? 'text-orange-500' : 'text-green-500'}`}>
              {stats.growthRate > 0 ? '+' : ''}{stats.growthRate.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">vs 30d ago</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <p className="text-gray-500 dark:text-gray-400 text-sm">Daily Trend</p>
            <p className={`text-2xl font-bold mt-2 ${stats.dailyGrowth > 0 ? 'text-orange-500' : 'text-green-500'}`}>
              {stats.dailyGrowth > 0 ? '+' : ''}${stats.dailyGrowth.toFixed(4)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">per day change</p>
          </motion.div>
        </div>

        {/* Scenarios Panel */}
        {showScenarios && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {scenarios.map((scenario) => {
                const isActive = growthModifier === scenario.modifier
                return (
                  <button
                    key={scenario.name}
                    onClick={() => setGrowthModifier(scenario.modifier)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isActive
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-orange-300'
                    }`}
                  >
                    <span className="text-2xl">{scenario.icon}</span>
                    <p className="font-semibold text-gray-900 dark:text-white mt-2">
                      {scenario.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {scenario.description}
                    </p>
                    <p className={`text-sm mt-2 font-medium ${
                      scenario.modifier > 0 ? 'text-orange-500' : scenario.modifier < 0 ? 'text-green-500' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {scenario.modifier > 0 ? '+' : ''}{scenario.modifier}% growth
                    </p>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Forecast Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8"
        >
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Forecast Period
              </label>
              <div className="flex gap-2">
                {forecastPeriods.map((period) => (
                  <button
                    key={period.value}
                    onClick={() => setForecastPeriod(period.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      forecastPeriod === period.value
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Growth Adjustment: {growthModifier > 0 ? '+' : ''}{growthModifier}%
              </label>
              <input
                type="range"
                min="-50"
                max="100"
                value={growthModifier}
                onChange={(e) => setGrowthModifier(parseInt(e.target.value))}
                className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Monthly Budget (optional)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">$</span>
                <input
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  placeholder="0.00"
                  className="w-32 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
                <span className="text-gray-500 dark:text-gray-400 text-sm">USDC</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Forecast Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-orange-500" />
              Cost Projection
            </h2>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                Historical
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                Forecast
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-orange-200 rounded-full"></span>
                Confidence
              </span>
            </div>
          </div>

          {/* Chart */}
          <div className="relative h-64 mb-4">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-8 w-16 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>${maxValue.toFixed(2)}</span>
              <span>${(maxValue * 0.5).toFixed(2)}</span>
              <span>$0.00</span>
            </div>

            {/* Chart area */}
            <div className="ml-16 h-full flex items-end gap-px overflow-x-auto pb-8">
              {/* Historical bars */}
              {historicalData.slice(-14).map((day, i) => (
                <div
                  key={`hist-${i}`}
                  className="flex-shrink-0 w-6 flex flex-col items-center group relative"
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.cost / maxValue) * 100}%` }}
                    transition={{ delay: 0.5 + i * 0.02 }}
                    className="w-full bg-blue-500 rounded-t"
                  />
                  <span className="absolute -bottom-6 text-[10px] text-gray-400 rotate-45 origin-left whitespace-nowrap">
                    {day.date.slice(5)}
                  </span>
                  <div className="hidden group-hover:block absolute -top-8 bg-gray-900 text-white text-xs px-2 py-1 rounded z-10 whitespace-nowrap">
                    ${day.cost.toFixed(3)}
                  </div>
                </div>
              ))}

              {/* Divider */}
              <div className="flex-shrink-0 w-1 h-full bg-gray-300 dark:bg-gray-600 mx-1 relative">
                <span className="absolute -top-6 -left-4 text-xs text-gray-500 whitespace-nowrap">Today</span>
              </div>

              {/* Forecast bars */}
              {forecast.days.slice(0, 21).map((day, i) => (
                <div
                  key={`forecast-${i}`}
                  className="flex-shrink-0 w-6 flex flex-col items-center group relative"
                >
                  {/* Confidence interval */}
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ 
                      height: `${((day.costHigh - day.costLow) / maxValue) * 100}%`,
                      opacity: 1
                    }}
                    transition={{ delay: 0.7 + i * 0.02 }}
                    className="w-full bg-orange-200 dark:bg-orange-900/30 absolute"
                    style={{ bottom: `${(day.costLow / maxValue) * 100}%` }}
                  />
                  {/* Main forecast */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.cost / maxValue) * 100}%` }}
                    transition={{ delay: 0.7 + i * 0.02 }}
                    className="w-full bg-orange-500 rounded-t relative z-10"
                  />
                  <span className="absolute -bottom-6 text-[10px] text-gray-400 rotate-45 origin-left whitespace-nowrap">
                    {day.date.slice(5)}
                  </span>
                  <div className="hidden group-hover:block absolute -top-12 bg-gray-900 text-white text-xs px-2 py-1 rounded z-20 whitespace-nowrap">
                    ${day.cost.toFixed(3)}
                    <br />
                    <span className="text-gray-400">±${(day.costHigh - day.cost).toFixed(3)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Forecast Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl p-6 text-white"
          >
            <CalendarDaysIcon className="w-8 h-8 mb-4 opacity-80" />
            <p className="text-orange-100 text-sm">Projected {forecastPeriod} Total</p>
            <p className="text-3xl font-bold mt-1">${forecast.totalCost.toFixed(2)}</p>
            <p className="text-orange-100 text-sm mt-2">
              Through {forecast.endDate}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <CalculatorIcon className="w-8 h-8 text-blue-500 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Avg Daily (Projected)</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              ${forecast.avgDaily.toFixed(3)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {growthModifier !== 0 && (
                <span className={growthModifier > 0 ? 'text-orange-500' : 'text-green-500'}>
                  {growthModifier > 0 ? '+' : ''}{growthModifier}% adjustment applied
                </span>
              )}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <CurrencyDollarIcon className="w-8 h-8 text-green-500 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Monthly Projection</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              ${(forecast.avgDaily * 30).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              ${(forecast.avgDaily * 365).toFixed(2)}/year
            </p>
          </motion.div>
        </div>

        {/* Budget Analysis */}
        {budgetAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className={`rounded-xl p-6 border mb-8 ${
              budgetAnalysis.isOverBudget
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            }`}
          >
            <div className="flex items-start gap-4">
              {budgetAnalysis.isOverBudget ? (
                <ExclamationTriangleIcon className="w-8 h-8 text-red-500 flex-shrink-0" />
              ) : (
                <CheckCircleIcon className="w-8 h-8 text-green-500 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h3 className={`font-semibold text-lg ${
                  budgetAnalysis.isOverBudget ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'
                }`}>
                  {budgetAnalysis.isOverBudget ? 'Projected Over Budget' : 'Within Budget'}
                </h3>
                <p className={`text-sm mt-1 ${
                  budgetAnalysis.isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                }`}>
                  {budgetAnalysis.isOverBudget
                    ? `Projected to exceed budget by $${Math.abs(budgetAnalysis.surplus).toFixed(2)}/month`
                    : `$${budgetAnalysis.surplus.toFixed(2)} buffer remaining per month`
                  }
                </p>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Budget</p>
                    <p className="font-semibold text-gray-900 dark:text-white">${parseFloat(monthlyBudget).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Projected</p>
                    <p className="font-semibold text-gray-900 dark:text-white">${budgetAnalysis.projectedMonthly.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Usage</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{budgetAnalysis.percentOfBudget.toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Days to Budget</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{budgetAnalysis.daysUntilBudget.toFixed(0)} days</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8"
        >
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <LightBulbIcon className="w-5 h-5 text-yellow-500" />
            Cost Management Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.growthRate > 50 && (
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="font-medium text-orange-700 dark:text-orange-400">⚡ High Growth Alert</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Your usage is growing {stats.growthRate.toFixed(0)}% month-over-month. Consider implementing caching or rate limiting.
                </p>
              </div>
            )}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="font-medium text-blue-700 dark:text-blue-400">💾 Cache Responses</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Implement caching for frequently-used endpoints. Could reduce costs by 20-40%.
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="font-medium text-green-700 dark:text-green-400">📦 Batch Requests</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Combine multiple queries into single API calls where supported.
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="font-medium text-purple-700 dark:text-purple-400">🔔 Use Webhooks</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Subscribe to webhooks instead of polling for real-time updates.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start gap-4">
            <InformationCircleIcon className="w-6 h-6 text-gray-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">How We Calculate Forecasts</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Forecasts are generated using linear regression on your last 30 days of usage data. 
                The confidence interval represents ±15% variance based on historical volatility. 
                Actual costs may vary based on usage patterns, new integrations, and external factors.
              </p>
              <div className="flex gap-4 mt-4">
                <Link
                  href="/spending"
                  className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1"
                >
                  View Spending History
                  <ChevronRightIcon className="w-4 h-4" />
                </Link>
                <Link
                  href="/optimizer"
                  className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1"
                >
                  Optimize Costs
                  <ChevronRightIcon className="w-4 h-4" />
                </Link>
                <Link
                  href="/alerts"
                  className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1"
                >
                  Set Alerts
                  <ChevronRightIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
