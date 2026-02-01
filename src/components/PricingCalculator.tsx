'use client';

import { useState, useMemo } from 'react';
import { getLiveAgents, Agent } from '@/data/agents';

interface PricingTier {
  name: string;
  satsPerCall: number;
  description: string;
}

const pricingTiers: PricingTier[] = [
  { name: 'Basic', satsPerCall: 1, description: 'Simple lookups, health checks' },
  { name: 'Standard', satsPerCall: 5, description: 'Data queries, search results' },
  { name: 'Premium', satsPerCall: 10, description: 'Full reports, batch operations' },
];

const volumePresets = [
  { label: '100/day', daily: 100 },
  { label: '1K/day', daily: 1000 },
  { label: '10K/day', daily: 10000 },
  { label: '100K/day', daily: 100000 },
];

// Approximate BTC price in USD (conservative estimate)
const BTC_USD = 100000;
const SATS_PER_BTC = 100_000_000;

export default function PricingCalculator() {
  const liveAgents = getLiveAgents();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedTier, setSelectedTier] = useState<PricingTier>(pricingTiers[1]);
  const [dailyCalls, setDailyCalls] = useState(1000);
  const [customCalls, setCustomCalls] = useState('1000');

  const calculations = useMemo(() => {
    const dailySats = dailyCalls * selectedTier.satsPerCall;
    const weeklySats = dailySats * 7;
    const monthlySats = dailySats * 30;
    const yearlySats = dailySats * 365;

    const satsToUsd = (sats: number) => (sats / SATS_PER_BTC) * BTC_USD;

    return {
      daily: { sats: dailySats, usd: satsToUsd(dailySats) },
      weekly: { sats: weeklySats, usd: satsToUsd(weeklySats) },
      monthly: { sats: monthlySats, usd: satsToUsd(monthlySats) },
      yearly: { sats: yearlySats, usd: satsToUsd(yearlySats) },
      perCall: { sats: selectedTier.satsPerCall, usd: satsToUsd(selectedTier.satsPerCall) },
    };
  }, [dailyCalls, selectedTier]);

  const formatSats = (sats: number) => {
    if (sats >= 1_000_000) return `${(sats / 1_000_000).toFixed(2)}M`;
    if (sats >= 1_000) return `${(sats / 1_000).toFixed(1)}K`;
    return sats.toLocaleString();
  };

  const formatUsd = (usd: number) => {
    if (usd < 0.01) return `$${usd.toFixed(6)}`;
    if (usd < 1) return `$${usd.toFixed(4)}`;
    return `$${usd.toFixed(2)}`;
  };

  const handleCustomCallsChange = (value: string) => {
    setCustomCalls(value);
    const parsed = parseInt(value.replace(/,/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0) {
      setDailyCalls(parsed);
    }
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-shell-100 mb-3">💰 Pricing Calculator</h2>
          <p className="text-shell-400 max-w-2xl mx-auto">
            Estimate your x402 micropayment costs. All agents use Bitcoin Lightning for instant, low-cost payments.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="bg-shell-900/50 border border-shell-700 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-shell-100 mb-4">Configure</h3>

            {/* Agent Selection */}
            <div className="mb-6">
              <label className="block text-shell-300 text-sm mb-2">Select Agent (optional)</label>
              <select
                value={selectedAgent?.id || ''}
                onChange={(e) => {
                  const agent = liveAgents.find(a => a.id === e.target.value);
                  setSelectedAgent(agent || null);
                }}
                className="w-full bg-shell-800 border border-shell-600 rounded-lg px-4 py-2.5 text-shell-100 focus:outline-none focus:border-lobster-500 transition-colors"
              >
                <option value="">All agents (generic estimate)</option>
                {liveAgents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.icon} {agent.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Pricing Tier */}
            <div className="mb-6">
              <label className="block text-shell-300 text-sm mb-2">Request Type</label>
              <div className="grid grid-cols-3 gap-2">
                {pricingTiers.map((tier) => (
                  <button
                    key={tier.name}
                    onClick={() => setSelectedTier(tier)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedTier.name === tier.name
                        ? 'bg-lobster-600 text-white border-lobster-500'
                        : 'bg-shell-800 text-shell-300 border-shell-600 hover:border-shell-500'
                    } border`}
                  >
                    {tier.name}
                    <span className="block text-xs opacity-75">{tier.satsPerCall} sat</span>
                  </button>
                ))}
              </div>
              <p className="text-shell-500 text-xs mt-2">{selectedTier.description}</p>
            </div>

            {/* Volume Selection */}
            <div className="mb-6">
              <label className="block text-shell-300 text-sm mb-2">Daily API Calls</label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {volumePresets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setDailyCalls(preset.daily);
                      setCustomCalls(preset.daily.toLocaleString());
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      dailyCalls === preset.daily
                        ? 'bg-lobster-600/20 text-lobster-400 border-lobster-500'
                        : 'bg-shell-800 text-shell-300 border-shell-600 hover:border-shell-500'
                    } border`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={customCalls}
                  onChange={(e) => handleCustomCallsChange(e.target.value)}
                  placeholder="Custom amount"
                  className="w-full bg-shell-800 border border-shell-600 rounded-lg px-4 py-2.5 text-shell-100 focus:outline-none focus:border-lobster-500 transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-shell-500 text-sm">
                  calls/day
                </span>
              </div>
            </div>

            {/* Selected Agent Info */}
            {selectedAgent && (
              <div className="bg-shell-800/50 rounded-lg p-4 border border-shell-700">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedAgent.icon}</span>
                  <div>
                    <p className="text-shell-100 font-medium">{selectedAgent.name}</p>
                    <p className="text-shell-500 text-sm">{selectedAgent.category}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="bg-gradient-to-br from-lobster-900/20 to-shell-900/50 border border-lobster-800/30 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-shell-100 mb-4">Estimated Costs</h3>

            {/* Per-call Cost */}
            <div className="bg-shell-800/50 rounded-lg p-4 mb-4 border border-shell-700">
              <div className="flex items-center justify-between">
                <span className="text-shell-400">Per API call</span>
                <div className="text-right">
                  <span className="text-lobster-400 font-bold text-lg">
                    {calculations.perCall.sats} sats
                  </span>
                  <span className="text-shell-500 text-sm ml-2">
                    ≈ {formatUsd(calculations.perCall.usd)}
                  </span>
                </div>
              </div>
            </div>

            {/* Time-based Costs */}
            <div className="space-y-3">
              {[
                { label: 'Daily', data: calculations.daily },
                { label: 'Weekly', data: calculations.weekly },
                { label: 'Monthly', data: calculations.monthly, highlight: true },
                { label: 'Yearly', data: calculations.yearly },
              ].map((row) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between py-3 px-4 rounded-lg ${
                    row.highlight
                      ? 'bg-lobster-600/10 border border-lobster-500/30'
                      : 'bg-shell-800/30'
                  }`}
                >
                  <span className={row.highlight ? 'text-shell-100 font-medium' : 'text-shell-400'}>
                    {row.label}
                  </span>
                  <div className="text-right">
                    <span className={`font-semibold ${row.highlight ? 'text-lobster-400' : 'text-shell-200'}`}>
                      {formatSats(row.data.sats)} sats
                    </span>
                    <span className="text-shell-500 text-sm ml-2">
                      ≈ {formatUsd(row.data.usd)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Note */}
            <div className="mt-6 p-4 bg-shell-800/30 rounded-lg border border-shell-700">
              <p className="text-shell-500 text-sm">
                <span className="text-shell-400">💡 Note:</span> Estimates based on BTC @ ${BTC_USD.toLocaleString()}. 
                Actual costs depend on agent-specific pricing and Bitcoin market rates.
              </p>
            </div>

            {/* CTA */}
            <div className="mt-6">
              <a
                href="https://github.com/langoustine69"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-lobster-600 hover:bg-lobster-500 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Start Using Agents →
              </a>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-8 text-center">
          <p className="text-shell-400 text-sm mb-3">Accepted payment methods</p>
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-shell-300">
              <span className="text-xl">⚡</span>
              <span className="text-sm">Lightning</span>
            </div>
            <div className="flex items-center gap-2 text-shell-300">
              <span className="text-xl">💎</span>
              <span className="text-sm">USDC (Base)</span>
            </div>
            <div className="flex items-center gap-2 text-shell-300">
              <span className="text-xl">🔷</span>
              <span className="text-sm">ETH</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
