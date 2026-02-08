'use client';

import { useState, useMemo } from 'react';
import { getLiveAgents, Agent } from '@/data/agents';

interface UsagePattern {
  name: string;
  description: string;
  peakMultiplier: number;
  icon: string;
  callsPerHour: number[];
}

const usagePatterns: UsagePattern[] = [
  {
    name: 'Steady',
    description: 'Consistent usage throughout the day',
    icon: '📊',
    peakMultiplier: 1.2,
    callsPerHour: Array(24).fill(100),
  },
  {
    name: 'Business Hours',
    description: 'Peak during 9am-6pm, minimal overnight',
    icon: '🏢',
    peakMultiplier: 2.5,
    callsPerHour: [5,5,5,5,5,5,5,20,100,200,250,250,200,250,250,200,150,100,50,30,20,10,5,5],
  },
  {
    name: 'Burst Traffic',
    description: 'Sporadic high-volume bursts',
    icon: '⚡',
    peakMultiplier: 5,
    callsPerHour: [10,10,10,10,10,10,500,50,10,10,10,500,10,10,500,10,10,10,10,10,10,10,10,10],
  },
  {
    name: 'Event-Driven',
    description: 'Spikes during specific events (sports, news)',
    icon: '🎯',
    peakMultiplier: 10,
    callsPerHour: [20,20,20,20,20,20,20,20,50,100,150,200,50,50,50,100,200,500,800,400,100,50,30,20],
  },
];

interface PriceTier {
  name: string;
  pricePerCall: number;
}

const priceTiers: PriceTier[] = [
  { name: 'Basic', pricePerCall: 0.001 },
  { name: 'Standard', pricePerCall: 0.002 },
  { name: 'Premium', pricePerCall: 0.005 },
];

export default function RateLimitCalculator() {
  const liveAgents = getLiveAgents();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(liveAgents[0] || null);
  const [selectedPattern, setSelectedPattern] = useState<UsagePattern>(usagePatterns[0]);
  const [dailyCalls, setDailyCalls] = useState(5000);
  const [customCalls, setCustomCalls] = useState('5000');
  const [priceTier, setPriceTier] = useState<PriceTier>(priceTiers[1]);

  const analysis = useMemo(() => {
    if (!selectedAgent) return null;

    const rateLimit = selectedAgent.rateLimit || {
      requestsPerMinute: 60,
      requestsPerHour: 1000,
      requestsPerDay: 10000,
      burstLimit: 10,
    };

    // Scale pattern to match daily calls
    const patternSum = selectedPattern.callsPerHour.reduce((a, b) => a + b, 0);
    const scaleFactor = dailyCalls / patternSum;
    const scaledHourly = selectedPattern.callsPerHour.map(h => Math.round(h * scaleFactor));
    const peakHour = Math.max(...scaledHourly);
    const peakMinute = Math.round(peakHour / 60 * selectedPattern.peakMultiplier);
    const actualDaily = scaledHourly.reduce((a, b) => a + b, 0);

    // Rate limit analysis
    const hourlyLimit = rateLimit.requestsPerHour || 1000;
    const minuteLimit = rateLimit.requestsPerMinute || 60;
    const dailyLimit = rateLimit.requestsPerDay || hourlyLimit * 24;
    const burstLimit = rateLimit.burstLimit || 10;

    const hourlyExceeds = peakHour > hourlyLimit;
    const minuteExceeds = peakMinute > minuteLimit;
    const dailyExceeds = actualDaily > dailyLimit;
    const burstExceeds = peakMinute > burstLimit * 60;

    // Calculate throttled calls
    let throttledCalls = 0;
    scaledHourly.forEach(hourCalls => {
      if (hourCalls > hourlyLimit) {
        throttledCalls += hourCalls - hourlyLimit;
      }
    });

    // Cost calculation
    const successfulCalls = actualDaily - throttledCalls;
    const dailyCost = successfulCalls * priceTier.pricePerCall;
    const monthlyCost = dailyCost * 30;
    const yearlyCost = dailyCost * 365;

    // Recommendations
    const recommendations: string[] = [];
    if (hourlyExceeds) {
      recommendations.push(`Spread ${peakHour - hourlyLimit} peak-hour calls across other hours`);
    }
    if (minuteExceeds) {
      recommendations.push('Add request queuing to smooth burst traffic');
    }
    if (dailyExceeds) {
      recommendations.push('Consider multiple agent instances or contact for enterprise limits');
    }
    if (throttledCalls > 0) {
      recommendations.push(`~${throttledCalls.toLocaleString()} calls/day may be throttled (${Math.round(throttledCalls/actualDaily*100)}%)`);
    }
    if (recommendations.length === 0) {
      recommendations.push('Your usage fits within rate limits ✓');
    }

    return {
      scaledHourly,
      peakHour,
      peakMinute,
      actualDaily,
      hourlyLimit,
      minuteLimit,
      dailyLimit,
      burstLimit,
      hourlyExceeds,
      minuteExceeds,
      dailyExceeds,
      burstExceeds,
      throttledCalls,
      successfulCalls,
      dailyCost,
      monthlyCost,
      yearlyCost,
      recommendations,
      utilizationPercent: Math.round((peakHour / hourlyLimit) * 100),
    };
  }, [selectedAgent, selectedPattern, dailyCalls, priceTier]);

  const handleDailyCallsChange = (value: string) => {
    setCustomCalls(value);
    const parsed = parseInt(value.replace(/,/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0) {
      setDailyCalls(parsed);
    }
  };

  const formatUsdc = (usdc: number) => {
    if (usdc < 0.01) return `$${usdc.toFixed(4)}`;
    if (usdc < 1) return `$${usdc.toFixed(3)}`;
    if (usdc < 100) return `$${usdc.toFixed(2)}`;
    return `$${usdc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusColor = (exceeds: boolean) => 
    exceeds ? 'text-red-400' : 'text-green-400';

  const getStatusIcon = (exceeds: boolean) => 
    exceeds ? '⚠️' : '✓';

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-shell-100 mb-3">📈 Rate Limit Calculator</h2>
          <p className="text-shell-400 max-w-2xl mx-auto">
            Estimate costs based on your expected usage patterns. See if you'll hit rate limits and plan accordingly.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-shell-900/50 border border-shell-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-shell-100 mb-4">Configure Usage</h3>

              {/* Agent Selection */}
              <div className="mb-5">
                <label className="block text-shell-300 text-sm mb-2">Select Agent</label>
                <select
                  value={selectedAgent?.id || ''}
                  onChange={(e) => {
                    const agent = liveAgents.find(a => a.id === e.target.value);
                    setSelectedAgent(agent || null);
                  }}
                  className="w-full bg-shell-800 border border-shell-600 rounded-lg px-4 py-2.5 text-shell-100 focus:outline-none focus:border-lobster-500 transition-colors"
                >
                  {liveAgents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.icon} {agent.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Daily Calls */}
              <div className="mb-5">
                <label className="block text-shell-300 text-sm mb-2">Expected Daily Calls</label>
                <div className="relative">
                  <input
                    type="text"
                    value={customCalls}
                    onChange={(e) => handleDailyCallsChange(e.target.value)}
                    className="w-full bg-shell-800 border border-shell-600 rounded-lg px-4 py-2.5 text-shell-100 focus:outline-none focus:border-lobster-500 transition-colors pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-shell-500 text-sm">
                    /day
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  {[1000, 5000, 10000, 50000].map(v => (
                    <button
                      key={v}
                      onClick={() => { setDailyCalls(v); setCustomCalls(v.toLocaleString()); }}
                      className={`flex-1 px-2 py-1 text-xs rounded border transition-all ${
                        dailyCalls === v
                          ? 'bg-lobster-600/20 border-lobster-500 text-lobster-400'
                          : 'bg-shell-800 border-shell-600 text-shell-400 hover:border-shell-500'
                      }`}
                    >
                      {v >= 1000 ? `${v/1000}K` : v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Tier */}
              <div className="mb-5">
                <label className="block text-shell-300 text-sm mb-2">Price Tier</label>
                <div className="grid grid-cols-3 gap-2">
                  {priceTiers.map((tier) => (
                    <button
                      key={tier.name}
                      onClick={() => setPriceTier(tier)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                        priceTier.name === tier.name
                          ? 'bg-lobster-600 text-white border-lobster-500'
                          : 'bg-shell-800 text-shell-300 border-shell-600 hover:border-shell-500'
                      }`}
                    >
                      {tier.name}
                      <span className="block text-xs opacity-75">${tier.pricePerCall}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Usage Pattern Selection */}
            <div className="bg-shell-900/50 border border-shell-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-shell-100 mb-4">Usage Pattern</h3>
              <div className="space-y-2">
                {usagePatterns.map((pattern) => (
                  <button
                    key={pattern.name}
                    onClick={() => setSelectedPattern(pattern)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all border ${
                      selectedPattern.name === pattern.name
                        ? 'bg-lobster-600/10 border-lobster-500 text-shell-100'
                        : 'bg-shell-800 border-shell-600 text-shell-300 hover:border-shell-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{pattern.icon}</span>
                      <div>
                        <div className="font-medium">{pattern.name}</div>
                        <div className="text-xs text-shell-500">{pattern.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Analysis Panel */}
          <div className="lg:col-span-2 space-y-6">
            {analysis && selectedAgent && (
              <>
                {/* Rate Limit Status */}
                <div className="bg-shell-900/50 border border-shell-700 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-shell-100 mb-4">
                    Rate Limit Analysis for {selectedAgent.icon} {selectedAgent.name}
                  </h3>
                  
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-shell-800/50 rounded-lg p-4 border border-shell-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-shell-400 text-sm">Hourly Peak</span>
                        <span className={getStatusColor(analysis.hourlyExceeds)}>
                          {getStatusIcon(analysis.hourlyExceeds)}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-shell-100">
                        {analysis.peakHour.toLocaleString()}
                      </div>
                      <div className="text-shell-500 text-sm">
                        Limit: {analysis.hourlyLimit.toLocaleString()}/hr
                      </div>
                      <div className="mt-2 h-2 bg-shell-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            analysis.utilizationPercent > 100 ? 'bg-red-500' : 
                            analysis.utilizationPercent > 80 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(analysis.utilizationPercent, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-shell-500 mt-1">
                        {analysis.utilizationPercent}% of limit
                      </div>
                    </div>

                    <div className="bg-shell-800/50 rounded-lg p-4 border border-shell-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-shell-400 text-sm">Minute Peak</span>
                        <span className={getStatusColor(analysis.minuteExceeds)}>
                          {getStatusIcon(analysis.minuteExceeds)}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-shell-100">
                        {analysis.peakMinute.toLocaleString()}
                      </div>
                      <div className="text-shell-500 text-sm">
                        Limit: {analysis.minuteLimit}/min
                      </div>
                    </div>

                    <div className="bg-shell-800/50 rounded-lg p-4 border border-shell-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-shell-400 text-sm">Daily Total</span>
                        <span className={getStatusColor(analysis.dailyExceeds)}>
                          {getStatusIcon(analysis.dailyExceeds)}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-shell-100">
                        {analysis.actualDaily.toLocaleString()}
                      </div>
                      <div className="text-shell-500 text-sm">
                        {analysis.dailyLimit ? `Limit: ${analysis.dailyLimit.toLocaleString()}/day` : 'No daily limit'}
                      </div>
                    </div>

                    <div className="bg-shell-800/50 rounded-lg p-4 border border-shell-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-shell-400 text-sm">Burst Handling</span>
                        <span className={getStatusColor(analysis.burstExceeds)}>
                          {getStatusIcon(analysis.burstExceeds)}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-shell-100">
                        {analysis.burstLimit}
                      </div>
                      <div className="text-shell-500 text-sm">
                        concurrent requests
                      </div>
                    </div>
                  </div>

                  {/* Hourly Distribution Chart */}
                  <div className="mb-4">
                    <div className="text-shell-300 text-sm mb-2">24-Hour Traffic Distribution</div>
                    <div className="flex items-end gap-0.5 h-20 bg-shell-800/30 rounded-lg p-2">
                      {analysis.scaledHourly.map((calls, hour) => {
                        const maxCalls = Math.max(...analysis.scaledHourly);
                        const height = maxCalls > 0 ? (calls / maxCalls) * 100 : 0;
                        const exceeds = calls > analysis.hourlyLimit;
                        return (
                          <div
                            key={hour}
                            className={`flex-1 rounded-t transition-all ${
                              exceeds ? 'bg-red-500' : 'bg-lobster-500'
                            }`}
                            style={{ height: `${Math.max(height, 2)}%` }}
                            title={`${hour}:00 - ${calls.toLocaleString()} calls`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-xs text-shell-500 mt-1">
                      <span>00:00</span>
                      <span>06:00</span>
                      <span>12:00</span>
                      <span>18:00</span>
                      <span>24:00</span>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className={`rounded-lg p-4 border ${
                    analysis.throttledCalls > 0 
                      ? 'bg-yellow-900/20 border-yellow-700/50' 
                      : 'bg-green-900/20 border-green-700/50'
                  }`}>
                    <div className="text-sm font-medium text-shell-200 mb-2">
                      {analysis.throttledCalls > 0 ? '⚠️ Recommendations' : '✅ Status'}
                    </div>
                    <ul className="space-y-1">
                      {analysis.recommendations.map((rec, i) => (
                        <li key={i} className="text-shell-400 text-sm flex items-start gap-2">
                          <span className="text-shell-500">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Cost Estimate */}
                <div className="bg-gradient-to-br from-lobster-900/20 to-shell-900/50 border border-lobster-800/30 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-shell-100 mb-4">💰 Cost Estimate</h3>
                  
                  <div className="grid sm:grid-cols-3 gap-4 mb-4">
                    <div className="bg-shell-800/50 rounded-lg p-4 border border-shell-700">
                      <div className="text-shell-400 text-sm mb-1">Daily</div>
                      <div className="text-xl font-bold text-lobster-400">
                        {formatUsdc(analysis.dailyCost)}
                      </div>
                      <div className="text-shell-500 text-xs">
                        {analysis.successfulCalls.toLocaleString()} successful calls
                      </div>
                    </div>

                    <div className="bg-lobster-600/10 rounded-lg p-4 border border-lobster-500/30">
                      <div className="text-shell-300 text-sm mb-1">Monthly</div>
                      <div className="text-2xl font-bold text-lobster-400">
                        {formatUsdc(analysis.monthlyCost)}
                      </div>
                      <div className="text-shell-500 text-xs">
                        ~{(analysis.successfulCalls * 30).toLocaleString()} calls
                      </div>
                    </div>

                    <div className="bg-shell-800/50 rounded-lg p-4 border border-shell-700">
                      <div className="text-shell-400 text-sm mb-1">Yearly</div>
                      <div className="text-xl font-bold text-lobster-400">
                        {formatUsdc(analysis.yearlyCost)}
                      </div>
                      <div className="text-shell-500 text-xs">
                        ~{(analysis.successfulCalls * 365).toLocaleString()} calls
                      </div>
                    </div>
                  </div>

                  {analysis.throttledCalls > 0 && (
                    <div className="bg-red-900/20 rounded-lg p-3 border border-red-700/30 text-sm">
                      <span className="text-red-400 font-medium">⚠️ Throttled calls:</span>
                      <span className="text-shell-300 ml-2">
                        ~{analysis.throttledCalls.toLocaleString()} calls/day won't be processed due to rate limits
                      </span>
                    </div>
                  )}

                  <div className="mt-4 text-center">
                    <a
                      href={selectedAgent.railwayUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-lobster-600 hover:bg-lobster-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                    >
                      Try {selectedAgent.name} →
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
