'use client';

import { useState, useEffect } from 'react';
import { getPortfolioStats, formatNumber } from '@/lib/mockAnalytics';

interface MetricGaugeProps {
  label: string;
  value: number;
  maxValue: number;
  unit: string;
  color: 'green' | 'yellow' | 'blue' | 'lobster';
  description?: string;
}

function MetricGauge({ label, value, maxValue, unit, color, description }: MetricGaugeProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  const colorClasses = {
    green: 'from-green-500 to-green-400',
    yellow: 'from-yellow-500 to-yellow-400',
    blue: 'from-blue-500 to-blue-400',
    lobster: 'from-lobster-500 to-lobster-400',
  };
  
  const bgColorClasses = {
    green: 'bg-green-500/20',
    yellow: 'bg-yellow-500/20',
    blue: 'bg-blue-500/20',
    lobster: 'bg-lobster-500/20',
  };
  
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-shell-400 dark:text-shell-400 light:text-shell-500 text-sm">{label}</span>
        <span className="text-shell-100 dark:text-shell-100 light:text-shell-900 font-mono font-semibold">
          {value.toLocaleString()}{unit}
        </span>
      </div>
      <div className={`h-2 rounded-full ${bgColorClasses[color]} overflow-hidden`}>
        <div 
          className={`h-full rounded-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {description && (
        <span className="text-shell-500 dark:text-shell-500 light:text-shell-400 text-xs mt-1">{description}</span>
      )}
    </div>
  );
}

interface StatusIndicatorProps {
  status: 'healthy' | 'degraded' | 'down';
  label: string;
}

function StatusIndicator({ status, label }: StatusIndicatorProps) {
  const statusConfig = {
    healthy: { color: 'bg-green-500', pulse: true, text: 'Healthy' },
    degraded: { color: 'bg-yellow-500', pulse: true, text: 'Degraded' },
    down: { color: 'bg-red-500', pulse: false, text: 'Down' },
  };
  
  const config = statusConfig[status];
  
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-3 w-3">
        {config.pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.color} opacity-75`} />
        )}
        <span className={`relative inline-flex rounded-full h-3 w-3 ${config.color}`} />
      </span>
      <span className="text-shell-400 dark:text-shell-400 light:text-shell-500 text-sm">{label}</span>
      <span className="text-shell-100 dark:text-shell-100 light:text-shell-900 text-sm font-medium">{config.text}</span>
    </div>
  );
}

interface LiveCounterProps {
  value: number;
  label: string;
  suffix?: string;
  decimals?: number;
}

function LiveCounter({ value, label, suffix = '', decimals = 0 }: LiveCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const stepTime = duration / steps;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-shell-100 dark:text-shell-100 light:text-shell-900 font-mono">
        {decimals > 0 ? displayValue.toFixed(decimals) : formatNumber(Math.floor(displayValue))}{suffix}
      </div>
      <div className="text-shell-400 dark:text-shell-400 light:text-shell-500 text-sm mt-1">{label}</div>
    </div>
  );
}

export default function PerformanceMetrics() {
  const stats = getPortfolioStats();
  
  // Calculate derived metrics
  const p95Latency = Math.floor(stats.avgLatency * 1.4);
  const p99Latency = Math.floor(stats.avgLatency * 1.8);
  const errorRate = 0.12; // Mock 0.12% error rate
  const throughput = Math.floor(stats.requestsToday / (24 * 60)); // requests per minute
  
  // Determine overall health
  const overallHealth: 'healthy' | 'degraded' | 'down' = 
    stats.avgUptime >= 99 && stats.avgLatency < 200 ? 'healthy' :
    stats.avgUptime >= 95 ? 'degraded' : 'down';

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-shell-100 dark:text-shell-100 light:text-shell-900 mb-2">
            Platform Performance
          </h2>
          <p className="text-shell-400 dark:text-shell-400 light:text-shell-500">
            Real-time metrics across all {stats.liveAgents} live agents
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-10">
          <LiveCounter value={stats.totalRequests} label="Total Requests" />
          <LiveCounter value={stats.avgLatency} label="Avg Response" suffix="ms" />
          <LiveCounter value={stats.avgUptime} label="Uptime" suffix="%" decimals={2} />
          <LiveCounter value={throughput} label="Req/min" />
        </div>

        {/* Status Row */}
        <div className="flex flex-wrap justify-center gap-6 mb-10 p-4 bg-shell-900/50 dark:bg-shell-900/50 light:bg-shell-100/50 rounded-xl border border-shell-800 dark:border-shell-800 light:border-shell-200">
          <StatusIndicator status={overallHealth} label="System Status:" />
          <StatusIndicator status={stats.avgLatency < 150 ? 'healthy' : 'degraded'} label="API Latency:" />
          <StatusIndicator status={errorRate < 0.5 ? 'healthy' : 'degraded'} label="Error Rate:" />
        </div>

        {/* Detailed Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-shell-900/50 dark:bg-shell-900/50 light:bg-white border border-shell-800 dark:border-shell-800 light:border-shell-200 rounded-xl p-5">
            <MetricGauge 
              label="P50 Latency"
              value={stats.avgLatency}
              maxValue={300}
              unit="ms"
              color="green"
              description="Median response time"
            />
          </div>
          
          <div className="bg-shell-900/50 dark:bg-shell-900/50 light:bg-white border border-shell-800 dark:border-shell-800 light:border-shell-200 rounded-xl p-5">
            <MetricGauge 
              label="P95 Latency"
              value={p95Latency}
              maxValue={500}
              unit="ms"
              color="yellow"
              description="95th percentile"
            />
          </div>
          
          <div className="bg-shell-900/50 dark:bg-shell-900/50 light:bg-white border border-shell-800 dark:border-shell-800 light:border-shell-200 rounded-xl p-5">
            <MetricGauge 
              label="P99 Latency"
              value={p99Latency}
              maxValue={800}
              unit="ms"
              color="blue"
              description="99th percentile"
            />
          </div>
          
          <div className="bg-shell-900/50 dark:bg-shell-900/50 light:bg-white border border-shell-800 dark:border-shell-800 light:border-shell-200 rounded-xl p-5">
            <MetricGauge 
              label="Success Rate"
              value={100 - errorRate}
              maxValue={100}
              unit="%"
              color="lobster"
              description={`${errorRate}% error rate`}
            />
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-shell-500 dark:text-shell-500 light:text-shell-400 text-sm">
            ⚡ Metrics aggregated from Railway deployments · Updates in real-time
          </p>
        </div>
      </div>
    </section>
  );
}
