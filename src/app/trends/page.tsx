'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CalendarIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  LightBulbIcon,
  BoltIcon,
  SunIcon,
  MoonIcon,
  FireIcon,
  ChartPieIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'

// Extended historical data - 60 days with hourly granularity (aggregated)
const generateHistoricalData = () => {
  const data: { date: string; hour: number; calls: number; cost: number }[] = []
  const startDate = new Date('2025-12-13')
  
  for (let day = 0; day < 60; day++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + day)
    const dateStr = date.toISOString().split('T')[0]
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    
    // Generate hourly data with realistic patterns
    for (let hour = 0; hour < 24; hour++) {
      // Base usage varies by time of day
      let baseMultiplier = 1
      if (hour >= 9 && hour <= 17) baseMultiplier = 2.5  // Peak business hours
      else if (hour >= 18 && hour <= 22) baseMultiplier = 1.8  // Evening
      else if (hour >= 6 && hour <= 8) baseMultiplier = 1.5  // Morning ramp
      else baseMultiplier = 0.4  // Night
      
      // Weekend adjustment
      if (isWeekend) baseMultiplier *= 0.6
      
      // Growth trend over time
      const growthFactor = 1 + (day / 60) * 0.8
      
      // Add some randomness
      const noise = 0.7 + Math.random() * 0.6
      
      const calls = Math.round(50 * baseMultiplier * growthFactor * noise)
      const cost = calls * 0.0001
      
      data.push({ date: dateStr, hour, calls, cost })
    }
  }
  return data
}

const hourlyData = generateHistoricalData()

// Aggregate to daily
const dailyData = Object.entries(
  hourlyData.reduce((acc, d) => {
    if (!acc[d.date]) acc[d.date] = { calls: 0, cost: 0 }
    acc[d.date].calls += d.calls
    acc[d.date].cost += d.cost
    return acc
  }, {} as Record<string, { calls: number; cost: number }>)
).map(([date, data]) => ({ date, ...data }))

// Calculate moving averages
function calculateMovingAverage(data: number[], window: number): number[] {
  const result: number[] = []
  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      result.push(data.slice(0, i + 1).reduce((a, b) => a + b, 0) / (i + 1))
    } else {
      result.push(data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0) / window)
    }
  }
  return result
}

// Detect anomalies (values > 2 standard deviations from mean)
function detectAnomalies(data: number[]): number[] {
  const mean = data.reduce((a, b) => a + b, 0) / data.length
  const stdDev = Math.sqrt(data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length)
  return data.map((val, i) => Math.abs(val - mean) > 2 * stdDev ? i : -1).filter(i => i !== -1)
}

type TimeRange = '7d' | '30d' | '60d'
type ViewMode = 'calls' | 'cost'

export default function TrendsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [viewMode, setViewMode] = useState<ViewMode>('calls')
  const [showAnomalies, setShowAnomalies] = useState(true)

  // Filter data by time range
  const filteredDaily = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 60
    return dailyData.slice(-days)
  }, [timeRange])

  // Calculate statistics
  const stats = useMemo(() => {
    const values = filteredDaily.map(d => viewMode === 'calls' ? d.calls : d.cost)
    const total = values.reduce((a, b) => a + b, 0)
    const avg = total / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)
    
    // Week-over-week change
    const recent7 = values.slice(-7)
    const prev7 = values.slice(-14, -7)
    const recent7Total = recent7.reduce((a, b) => a + b, 0)
    const prev7Total = prev7.length === 7 ? prev7.reduce((a, b) => a + b, 0) : recent7Total
    const wowChange = prev7Total > 0 ? ((recent7Total - prev7Total) / prev7Total) * 100 : 0
    
    // Moving averages
    const ma7 = calculateMovingAverage(values, 7)
    const ma30 = calculateMovingAverage(values, 30)
    
    // Trend direction (last 7 days slope)
    const recentSlope = (ma7[ma7.length - 1] - ma7[Math.max(0, ma7.length - 7)]) / 7
    const trendDirection = recentSlope > 0.01 * avg ? 'up' : recentSlope < -0.01 * avg ? 'down' : 'stable'
    
    // Anomalies
    const anomalyIndices = detectAnomalies(values)
    
    return {
      total,
      avg,
      min,
      max,
      wowChange,
      ma7,
      ma30,
      trendDirection,
      anomalyIndices
    }
  }, [filteredDaily, viewMode])

  // Hourly distribution (aggregated across all days)
  const hourlyDistribution = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 60
    const recentHourly = hourlyData.filter(d => {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - days)
      return new Date(d.date) >= cutoff
    })
    
    const byHour = Array(24).fill(0).map(() => ({ calls: 0, cost: 0, count: 0 }))
    recentHourly.forEach(d => {
      byHour[d.hour].calls += d.calls
      byHour[d.hour].cost += d.cost
      byHour[d.hour].count++
    })
    
    return byHour.map((h, hour) => ({
      hour,
      avgCalls: h.count > 0 ? h.calls / h.count : 0,
      avgCost: h.count > 0 ? h.cost / h.count : 0
    }))
  }, [timeRange])

  // Day of week distribution
  const dayOfWeekDistribution = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const byDay = Array(7).fill(0).map(() => ({ calls: 0, cost: 0, count: 0 }))
    
    filteredDaily.forEach(d => {
      const dow = new Date(d.date).getDay()
      byDay[dow].calls += d.calls
      byDay[dow].cost += d.cost
      byDay[dow].count++
    })
    
    return byDay.map((d, i) => ({
      day: dayNames[i],
      dayIndex: i,
      avgCalls: d.count > 0 ? d.calls / d.count : 0,
      avgCost: d.count > 0 ? d.cost / d.count : 0,
      isWeekend: i === 0 || i === 6
    }))
  }, [filteredDaily])

  // Find peak hours
  const peakHours = useMemo(() => {
    const sorted = [...hourlyDistribution]
      .map((h, i) => ({ ...h, hour: i }))
      .sort((a, b) => b.avgCalls - a.avgCalls)
    return {
      peak: sorted[0],
      low: sorted[sorted.length - 1]
    }
  }, [hourlyDistribution])

  // Insights
  const insights = useMemo(() => {
    const result: { type: 'success' | 'warning' | 'info'; title: string; description: string }[] = []
    
    // Trend insight
    if (stats.trendDirection === 'up') {
      result.push({
        type: stats.wowChange > 30 ? 'warning' : 'info',
        title: 'Growing Usage',
        description: `Usage is trending upward with ${stats.wowChange.toFixed(1)}% week-over-week growth.`
      })
    } else if (stats.trendDirection === 'down') {
      result.push({
        type: 'info',
        title: 'Declining Usage',
        description: `Usage is trending down ${Math.abs(stats.wowChange).toFixed(1)}% week-over-week.`
      })
    }
    
    // Peak hour insight
    const peakHourLabel = peakHours.peak.hour >= 12 
      ? `${peakHours.peak.hour - 12 || 12}PM`
      : `${peakHours.peak.hour || 12}AM`
    result.push({
      type: 'success',
      title: `Peak at ${peakHourLabel} UTC`,
      description: `Highest average activity at ${peakHourLabel}. Consider caching during peak hours.`
    })
    
    // Weekend insight
    const weekdayAvg = dayOfWeekDistribution.filter(d => !d.isWeekend).reduce((a, d) => a + d.avgCalls, 0) / 5
    const weekendAvg = dayOfWeekDistribution.filter(d => d.isWeekend).reduce((a, d) => a + d.avgCalls, 0) / 2
    const weekendDrop = ((weekdayAvg - weekendAvg) / weekdayAvg) * 100
    if (weekendDrop > 20) {
      result.push({
        type: 'info',
        title: 'Weekend Slowdown',
        description: `Usage drops ${weekendDrop.toFixed(0)}% on weekends. Great time for maintenance.`
      })
    }
    
    // Anomaly insight
    if (stats.anomalyIndices.length > 0) {
      result.push({
        type: 'warning',
        title: `${stats.anomalyIndices.length} Anomal${stats.anomalyIndices.length === 1 ? 'y' : 'ies'} Detected`,
        description: `Unusual activity spikes detected. Check for bot traffic or integration issues.`
      })
    }
    
    return result
  }, [stats, peakHours, dayOfWeekDistribution])

  const maxDaily = Math.max(...filteredDaily.map(d => viewMode === 'calls' ? d.calls : d.cost))
  const maxHourly = Math.max(...hourlyDistribution.map(h => viewMode === 'calls' ? h.avgCalls : h.avgCost))
  const maxDayOfWeek = Math.max(...dayOfWeekDistribution.map(d => viewMode === 'calls' ? d.avgCalls : d.avgCost))

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
            <span className="text-gray-900 dark:text-white">Usage Trends</span>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <SparklesIcon className="w-8 h-8 text-orange-500" />
                Usage Trends
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Discover patterns and insights from your API usage history
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAnomalies(!showAnomalies)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                  showAnomalies
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <ExclamationTriangleIcon className="w-4 h-4" />
                Anomalies
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex gap-2">
              {(['7d', '30d', '60d'] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-orange-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '60 Days'}
                </button>
              ))}
            </div>
            <div className="flex gap-2 border-l border-gray-200 dark:border-gray-700 pl-4">
              {(['calls', 'cost'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === mode
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {mode === 'calls' ? 'API Calls' : 'Cost'}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total</p>
              <ChartBarIcon className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {viewMode === 'calls' 
                ? stats.total.toLocaleString()
                : `$${stats.total.toFixed(2)}`
              }
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {viewMode === 'calls' ? 'requests' : 'USDC'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Daily Avg</p>
              <CalendarIcon className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {viewMode === 'calls'
                ? stats.avg.toLocaleString(undefined, { maximumFractionDigits: 0 })
                : `$${stats.avg.toFixed(3)}`
              }
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">per day</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <p className="text-gray-500 dark:text-gray-400 text-sm">WoW Change</p>
              {stats.wowChange >= 0 ? (
                <ArrowTrendingUpIcon className="w-5 h-5 text-orange-500" />
              ) : (
                <ArrowTrendingDownIcon className="w-5 h-5 text-green-500" />
              )}
            </div>
            <p className={`text-2xl font-bold mt-2 ${
              stats.wowChange >= 0 ? 'text-orange-500' : 'text-green-500'
            }`}>
              {stats.wowChange >= 0 ? '+' : ''}{stats.wowChange.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">vs last week</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Trend</p>
              {stats.trendDirection === 'up' ? (
                <ArrowTrendingUpIcon className="w-5 h-5 text-orange-500" />
              ) : stats.trendDirection === 'down' ? (
                <ArrowTrendingDownIcon className="w-5 h-5 text-green-500" />
              ) : (
                <ArrowPathIcon className="w-5 h-5 text-gray-500" />
              )}
            </div>
            <p className={`text-2xl font-bold mt-2 capitalize ${
              stats.trendDirection === 'up' ? 'text-orange-500' :
              stats.trendDirection === 'down' ? 'text-green-500' : 'text-gray-500'
            }`}>
              {stats.trendDirection}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">7-day trend</p>
          </motion.div>
        </div>

        {/* Daily Chart with Moving Averages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-orange-500" />
              Daily Usage with Moving Averages
            </h2>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                Daily
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-1 bg-blue-500 rounded-full"></span>
                7-day MA
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-1 bg-purple-500 rounded-full"></span>
                30-day MA
              </span>
              {showAnomalies && (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  Anomaly
                </span>
              )}
            </div>
          </div>

          <div className="relative h-64">
            {/* Chart */}
            <div className="h-full flex items-end gap-1 overflow-x-auto pb-8">
              {filteredDaily.map((day, i) => {
                const value = viewMode === 'calls' ? day.calls : day.cost
                const isAnomaly = showAnomalies && stats.anomalyIndices.includes(i)
                const ma7Value = stats.ma7[i]
                const ma30Value = stats.ma30[i]
                
                return (
                  <div
                    key={day.date}
                    className="flex-shrink-0 flex flex-col items-center group relative"
                    style={{ width: `${100 / filteredDaily.length}%`, minWidth: '12px' }}
                  >
                    {/* Bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(value / maxDaily) * 100}%` }}
                      transition={{ delay: 0.4 + i * 0.01 }}
                      className={`w-full rounded-t ${
                        isAnomaly 
                          ? 'bg-red-500' 
                          : 'bg-gradient-to-t from-orange-500 to-orange-400'
                      }`}
                    />
                    
                    {/* MA lines (positioned absolutely) */}
                    {i > 0 && (
                      <>
                        <div
                          className="absolute w-full h-0.5 bg-blue-500 opacity-80"
                          style={{ bottom: `${(ma7Value / maxDaily) * 100}%` }}
                        />
                        {timeRange !== '7d' && (
                          <div
                            className="absolute w-full h-0.5 bg-purple-500 opacity-60"
                            style={{ bottom: `${(ma30Value / maxDaily) * 100}%` }}
                          />
                        )}
                      </>
                    )}
                    
                    {/* X-axis label (show every N) */}
                    {(i % Math.ceil(filteredDaily.length / 10) === 0 || i === filteredDaily.length - 1) && (
                      <span className="absolute -bottom-6 text-[10px] text-gray-400 whitespace-nowrap">
                        {day.date.slice(5)}
                      </span>
                    )}
                    
                    {/* Tooltip */}
                    <div className="hidden group-hover:block absolute -top-16 bg-gray-900 text-white text-xs px-2 py-1 rounded z-10 whitespace-nowrap">
                      <p className="font-medium">{day.date}</p>
                      <p>{viewMode === 'calls' ? `${value.toLocaleString()} calls` : `$${value.toFixed(3)}`}</p>
                      {isAnomaly && <p className="text-red-400">⚠️ Anomaly</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Two-column layout: Hourly + Day of Week */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Hourly Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <ClockIcon className="w-5 h-5 text-orange-500" />
              Hourly Distribution
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Average {viewMode === 'calls' ? 'requests' : 'cost'} per hour (UTC)
            </p>
            
            <div className="h-48 flex items-end gap-1">
              {hourlyDistribution.map((h, i) => {
                const value = viewMode === 'calls' ? h.avgCalls : h.avgCost
                const isPeak = i === peakHours.peak.hour
                const isLow = i === peakHours.low.hour
                const isNight = i < 6 || i >= 22
                const isBusiness = i >= 9 && i <= 17
                
                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center group relative"
                  >
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(value / maxHourly) * 100}%` }}
                      transition={{ delay: 0.5 + i * 0.02 }}
                      className={`w-full rounded-t ${
                        isPeak ? 'bg-orange-500' :
                        isLow ? 'bg-gray-400' :
                        isNight ? 'bg-indigo-400' :
                        isBusiness ? 'bg-green-500' : 'bg-blue-400'
                      }`}
                    />
                    {(i % 4 === 0) && (
                      <span className="absolute -bottom-5 text-[10px] text-gray-400">
                        {i}:00
                      </span>
                    )}
                    {/* Tooltip */}
                    <div className="hidden group-hover:block absolute -top-12 bg-gray-900 text-white text-xs px-2 py-1 rounded z-10 whitespace-nowrap">
                      {i}:00 UTC
                      <br />
                      {viewMode === 'calls' 
                        ? `${value.toFixed(0)} calls`
                        : `$${value.toFixed(4)}`
                      }
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-8 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-green-500 rounded"></span>
                Business hours
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-indigo-400 rounded"></span>
                Night
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-orange-500 rounded"></span>
                Peak
              </span>
            </div>
          </motion.div>

          {/* Day of Week Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <CalendarIcon className="w-5 h-5 text-orange-500" />
              Day of Week
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Average {viewMode === 'calls' ? 'requests' : 'cost'} per day
            </p>
            
            <div className="space-y-3">
              {dayOfWeekDistribution.map((d) => {
                const value = viewMode === 'calls' ? d.avgCalls : d.avgCost
                const percentage = (value / maxDayOfWeek) * 100
                
                return (
                  <div key={d.day} className="flex items-center gap-3">
                    <span className={`w-10 text-sm font-medium ${
                      d.isWeekend ? 'text-purple-500' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {d.day}
                    </span>
                    <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.6 + d.dayIndex * 0.05 }}
                        className={`h-full rounded-full ${
                          d.isWeekend 
                            ? 'bg-purple-500' 
                            : 'bg-gradient-to-r from-orange-500 to-amber-500'
                        }`}
                      />
                    </div>
                    <span className="w-20 text-sm text-gray-600 dark:text-gray-400 text-right">
                      {viewMode === 'calls'
                        ? value.toLocaleString(undefined, { maximumFractionDigits: 0 })
                        : `$${value.toFixed(3)}`
                      }
                    </span>
                  </div>
                )
              })}
            </div>
            
            <div className="flex gap-4 mt-6 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-orange-500 rounded"></span>
                Weekday
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-purple-500 rounded"></span>
                Weekend
              </span>
            </div>
          </motion.div>
        </div>

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <LightBulbIcon className="w-5 h-5 text-yellow-500" />
            Insights & Patterns
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                className={`p-4 rounded-xl border ${
                  insight.type === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : insight.type === 'warning'
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                }`}
              >
                <p className={`font-medium ${
                  insight.type === 'success' ? 'text-green-700 dark:text-green-400' :
                  insight.type === 'warning' ? 'text-orange-700 dark:text-orange-400' :
                  'text-blue-700 dark:text-blue-400'
                }`}>
                  {insight.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {insight.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-orange-500 mb-2">
              <FireIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Peak Hour</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {peakHours.peak.hour}:00 UTC
            </p>
            <p className="text-xs text-gray-500">
              {viewMode === 'calls'
                ? `${peakHours.peak.avgCalls.toFixed(0)} calls/hour`
                : `$${peakHours.peak.avgCost.toFixed(4)}/hour`
              }
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-blue-500 mb-2">
              <MoonIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Quietest Hour</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {peakHours.low.hour}:00 UTC
            </p>
            <p className="text-xs text-gray-500">
              {viewMode === 'calls'
                ? `${peakHours.low.avgCalls.toFixed(0)} calls/hour`
                : `$${peakHours.low.avgCost.toFixed(4)}/hour`
              }
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-green-500 mb-2">
              <ArrowTrendingUpIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Max Day</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {viewMode === 'calls'
                ? stats.max.toLocaleString()
                : `$${stats.max.toFixed(3)}`
              }
            </p>
            <p className="text-xs text-gray-500">highest daily</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-purple-500 mb-2">
              <ArrowTrendingDownIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Min Day</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {viewMode === 'calls'
                ? stats.min.toLocaleString()
                : `$${stats.min.toFixed(3)}`
              }
            </p>
            <p className="text-xs text-gray-500">lowest daily</p>
          </div>
        </motion.div>

        {/* Related Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Related Tools</h3>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/spending"
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
            >
              <ChartPieIcon className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cost Tracking</span>
            </Link>
            <Link
              href="/forecast"
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
            >
              <ArrowTrendingUpIcon className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cost Forecast</span>
            </Link>
            <Link
              href="/heatmap"
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
            >
              <FireIcon className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Response Heatmap</span>
            </Link>
            <Link
              href="/optimizer"
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cost Optimizer</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
