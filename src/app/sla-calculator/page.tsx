'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';

interface SLAPreset {
  name: string;
  uptime: number;
  description: string;
  tier: string;
  color: string;
}

const slaPresets: SLAPreset[] = [
  { name: 'Two Nines', uptime: 99, description: 'Basic availability', tier: 'Hobby', color: 'text-slate-400' },
  { name: 'Three Nines', uptime: 99.9, description: 'Standard business', tier: 'Standard', color: 'text-blue-400' },
  { name: 'Three & Half Nines', uptime: 99.95, description: 'High availability', tier: 'Business', color: 'text-orange-400' },
  { name: 'Four Nines', uptime: 99.99, description: 'Enterprise grade', tier: 'Enterprise', color: 'text-violet-400' },
  { name: 'Five Nines', uptime: 99.999, description: 'Mission critical', tier: 'Critical', color: 'text-emerald-400' },
];

interface DowntimeResult {
  period: string;
  totalTime: string;
  downtimeAllowed: string;
  icon: string;
}

function formatDuration(minutes: number): string {
  if (minutes < 1) {
    const seconds = Math.round(minutes * 60);
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
  if (minutes < 60) {
    const rounded = Math.round(minutes * 10) / 10;
    return `${rounded} minute${rounded !== 1 ? 's' : ''}`;
  }
  const hours = minutes / 60;
  if (hours < 24) {
    const rounded = Math.round(hours * 10) / 10;
    return `${rounded} hour${rounded !== 1 ? 's' : ''}`;
  }
  const days = hours / 24;
  const rounded = Math.round(days * 10) / 10;
  return `${rounded} day${rounded !== 1 ? 's' : ''}`;
}

function calculateDowntime(uptimePercent: number): DowntimeResult[] {
  const downtimePercent = 100 - uptimePercent;
  
  // Time periods in minutes
  const periodsMinutes = {
    'Per Year': 365.25 * 24 * 60,
    'Per Month': 30.44 * 24 * 60,
    'Per Week': 7 * 24 * 60,
    'Per Day': 24 * 60,
  };

  const icons: Record<string, string> = {
    'Per Year': '📅',
    'Per Month': '🗓️',
    'Per Week': '📆',
    'Per Day': '🌅',
  };

  return Object.entries(periodsMinutes).map(([period, totalMinutes]) => {
    const downtimeMinutes = (downtimePercent / 100) * totalMinutes;
    return {
      period,
      totalTime: formatDuration(totalMinutes),
      downtimeAllowed: formatDuration(downtimeMinutes),
      icon: icons[period],
    };
  });
}

function UptimeBar({ uptime }: { uptime: number }) {
  const downtimeWidth = Math.max(0.5, 100 - uptime);
  
  return (
    <div className="relative h-8 rounded-lg overflow-hidden bg-shell-700/50">
      <div 
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400"
        style={{ width: `${uptime}%` }}
      />
      <div 
        className="absolute inset-y-0 right-0 bg-gradient-to-r from-red-500 to-red-400"
        style={{ width: `${downtimeWidth}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-medium">
        <span className="text-white drop-shadow">✅ Uptime: {uptime}%</span>
        <span className="text-white drop-shadow">❌ Down: {(100 - uptime).toFixed(uptime >= 99.99 ? 4 : 2)}%</span>
      </div>
    </div>
  );
}

export default function SLACalculatorPage() {
  const [uptimeInput, setUptimeInput] = useState('99.9');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(1); // Default to 99.9%

  const uptimePercent = useMemo(() => {
    const parsed = parseFloat(uptimeInput);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) return 99.9;
    return parsed;
  }, [uptimeInput]);

  const downtimeResults = useMemo(() => calculateDowntime(uptimePercent), [uptimePercent]);

  const handlePresetClick = (preset: SLAPreset, index: number) => {
    setUptimeInput(preset.uptime.toString());
    setSelectedPreset(index);
  };

  const handleInputChange = (value: string) => {
    setUptimeInput(value);
    setSelectedPreset(null);
  };

  // Determine severity color based on yearly downtime
  const getYearlyDowntimeColor = () => {
    const yearlyMinutes = (100 - uptimePercent) / 100 * 365.25 * 24 * 60;
    if (yearlyMinutes < 60) return 'text-emerald-400'; // < 1 hour
    if (yearlyMinutes < 60 * 8) return 'text-green-400'; // < 8 hours
    if (yearlyMinutes < 60 * 24) return 'text-yellow-400'; // < 1 day
    if (yearlyMinutes < 60 * 24 * 3) return 'text-orange-400'; // < 3 days
    return 'text-red-400';
  };

  return (
    <main className="min-h-screen bg-shell-900">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Breadcrumbs items={[{ label: 'SLA Calculator', href: '/sla-calculator' }]} />

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-coral-400 mb-4 flex items-center gap-3">
            <span>🧮</span> SLA Downtime Calculator
          </h1>
          <p className="text-shell-300 text-lg max-w-3xl">
            What does &quot;99.9% uptime&quot; actually mean? Enter an SLA percentage to see 
            exactly how much downtime is allowed per year, month, week, and day.
          </p>
        </div>

        {/* Preset Buttons */}
        <section className="mb-8">
          <div className="text-sm text-shell-400 mb-3">Quick presets:</div>
          <div className="flex flex-wrap gap-2">
            {slaPresets.map((preset, index) => (
              <button
                key={preset.name}
                onClick={() => handlePresetClick(preset, index)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedPreset === index
                    ? 'bg-coral-500 text-white ring-2 ring-coral-400/50'
                    : 'bg-shell-800 text-shell-300 hover:bg-shell-700 border border-shell-700'
                }`}
              >
                <span className={selectedPreset === index ? 'text-white' : preset.color}>
                  {preset.uptime}%
                </span>
                <span className="ml-2 text-shell-400">({preset.name})</span>
              </button>
            ))}
          </div>
        </section>

        {/* Custom Input */}
        <section className="mb-10">
          <div className="bg-shell-800/50 backdrop-blur rounded-2xl border border-shell-700/50 p-6">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-shell-300 mb-2">
                  Uptime Percentage
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    max="100"
                    value={uptimeInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="w-full bg-shell-900 border border-shell-600 rounded-xl px-4 py-3 text-2xl font-mono text-shell-100 focus:outline-none focus:ring-2 focus:ring-coral-500/50 focus:border-coral-500"
                    placeholder="99.9"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-shell-400">%</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm text-shell-400 mb-2">Downtime Allowed</div>
                <div className={`text-3xl font-bold ${getYearlyDowntimeColor()}`}>
                  {downtimeResults[0]?.downtimeAllowed}
                  <span className="text-lg text-shell-400 font-normal ml-2">per year</span>
                </div>
              </div>
            </div>

            {/* Visual Bar */}
            <div className="mt-6">
              <UptimeBar uptime={uptimePercent} />
            </div>
          </div>
        </section>

        {/* Results Grid */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-shell-100 mb-4">Allowed Downtime Breakdown</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {downtimeResults.map((result) => (
              <div
                key={result.period}
                className="bg-shell-800/40 rounded-xl p-5 border border-shell-700/30 hover:border-shell-600/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{result.icon}</span>
                  <span className="text-shell-400 font-medium">{result.period}</span>
                </div>
                <div className={`text-2xl font-bold ${getYearlyDowntimeColor()}`}>
                  {result.downtimeAllowed}
                </div>
                <div className="text-xs text-shell-500 mt-1">
                  of {result.totalTime} total
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison Table */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-shell-100 mb-4">SLA Comparison Chart</h2>
          <div className="bg-shell-800/40 rounded-2xl border border-shell-700/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-shell-700/30">
                    <th className="text-left px-4 py-3 text-shell-300 font-medium">SLA Level</th>
                    <th className="text-left px-4 py-3 text-shell-300 font-medium">Uptime</th>
                    <th className="text-right px-4 py-3 text-shell-300 font-medium">Down/Year</th>
                    <th className="text-right px-4 py-3 text-shell-300 font-medium">Down/Month</th>
                    <th className="text-right px-4 py-3 text-shell-300 font-medium">Down/Week</th>
                    <th className="text-left px-4 py-3 text-shell-300 font-medium">Typical Use</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-shell-700/30">
                  {slaPresets.map((preset) => {
                    const results = calculateDowntime(preset.uptime);
                    const isSelected = parseFloat(uptimeInput) === preset.uptime;
                    return (
                      <tr 
                        key={preset.name} 
                        className={`hover:bg-shell-700/20 transition-colors cursor-pointer ${
                          isSelected ? 'bg-coral-500/10 border-l-2 border-coral-500' : ''
                        }`}
                        onClick={() => handlePresetClick(preset, slaPresets.indexOf(preset))}
                      >
                        <td className="px-4 py-3">
                          <span className={`font-medium ${preset.color}`}>{preset.name}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-shell-100">{preset.uptime}%</td>
                        <td className="text-right px-4 py-3 text-shell-200">{results[0].downtimeAllowed}</td>
                        <td className="text-right px-4 py-3 text-shell-200">{results[1].downtimeAllowed}</td>
                        <td className="text-right px-4 py-3 text-shell-200">{results[2].downtimeAllowed}</td>
                        <td className="px-4 py-3 text-shell-400">{preset.description}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* The Nines Explained */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-shell-100 mb-4 flex items-center gap-2">
            <span>📚</span> Understanding &quot;The Nines&quot;
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-shell-800/40 rounded-xl p-5 border border-shell-700/30">
              <h3 className="font-semibold text-shell-100 mb-3">Why Nines Matter</h3>
              <p className="text-shell-300 text-sm mb-4">
                Each additional &quot;nine&quot; represents a 10x improvement in reliability. 
                Going from 99% to 99.9% reduces allowed downtime from 3.65 days to 8.76 hours per year.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-shell-700/30">
                  <span className="text-shell-400">99% → 99.9%</span>
                  <span className="text-emerald-400">10x better</span>
                </div>
                <div className="flex justify-between py-2 border-b border-shell-700/30">
                  <span className="text-shell-400">99.9% → 99.99%</span>
                  <span className="text-emerald-400">10x better</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-shell-400">99.99% → 99.999%</span>
                  <span className="text-emerald-400">10x better</span>
                </div>
              </div>
            </div>

            <div className="bg-shell-800/40 rounded-xl p-5 border border-shell-700/30">
              <h3 className="font-semibold text-shell-100 mb-3">Cost vs Reliability</h3>
              <p className="text-shell-300 text-sm mb-4">
                Higher SLAs cost exponentially more to achieve. Each additional nine typically 
                requires 10x the investment in infrastructure and redundancy.
              </p>
              <div className="bg-shell-900/50 rounded-lg p-4">
                <div className="text-xs text-shell-400 mb-2">Relative Infrastructure Cost</div>
                <div className="space-y-2">
                  {[
                    { nines: '99%', width: 10, cost: '$' },
                    { nines: '99.9%', width: 25, cost: '$$' },
                    { nines: '99.99%', width: 50, cost: '$$$' },
                    { nines: '99.999%', width: 100, cost: '$$$$' },
                  ].map((item) => (
                    <div key={item.nines} className="flex items-center gap-2">
                      <span className="text-xs text-shell-400 w-16">{item.nines}</span>
                      <div className="flex-1 h-2 bg-shell-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-coral-500 to-orange-500"
                          style={{ width: `${item.width}%` }}
                        />
                      </div>
                      <span className="text-xs text-shell-400 w-10">{item.cost}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Real World Context */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-shell-100 mb-4 flex items-center gap-2">
            <span>🌍</span> Real-World Context
          </h2>
          <div className="bg-shell-800/40 rounded-xl p-5 border border-shell-700/30">
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="text-shell-400 mb-2">Major cloud providers typically offer:</div>
                <ul className="space-y-1 text-shell-200">
                  <li>• AWS EC2: 99.99% SLA</li>
                  <li>• Google Cloud: 99.95-99.99%</li>
                  <li>• Azure VMs: 99.9-99.99%</li>
                </ul>
              </div>
              <div>
                <div className="text-shell-400 mb-2">What the nines feel like:</div>
                <ul className="space-y-1 text-shell-200">
                  <li>• 99%: Noticeable, regular outages</li>
                  <li>• 99.9%: Rare but memorable outages</li>
                  <li>• 99.99%: &quot;Was that site ever down?&quot;</li>
                </ul>
              </div>
              <div>
                <div className="text-shell-400 mb-2">Incident budget example:</div>
                <ul className="space-y-1 text-shell-200">
                  <li>• At 99.9%, you can have ~8 hours of incidents per year</li>
                  <li>• That&apos;s about 40 minutes per month</li>
                  <li>• Or ~10 minutes per week</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Formula */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-shell-100 mb-4 flex items-center gap-2">
            <span>📐</span> The Formula
          </h2>
          <div className="bg-shell-800/40 rounded-xl p-5 border border-shell-700/30">
            <div className="bg-shell-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <div className="text-shell-400">// Calculate allowed downtime</div>
              <div className="text-coral-400">
                Downtime = (100 - Uptime%) × Total Time
              </div>
              <div className="mt-4 text-shell-400">// Example for 99.9% over 1 year:</div>
              <div className="text-shell-200">
                Downtime = (100 - 99.9) × 525,600 minutes
              </div>
              <div className="text-shell-200">
                Downtime = 0.1% × 525,600 = <span className="text-emerald-400">525.6 minutes</span> = <span className="text-emerald-400">8.76 hours</span>
              </div>
            </div>
          </div>
        </section>

        {/* Related Links */}
        <section className="bg-gradient-to-r from-coral-500/10 to-orange-500/10 rounded-2xl p-6 border border-coral-500/20">
          <h2 className="text-lg font-semibold text-shell-100 mb-4">Related Resources</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              href="/reliability"
              className="bg-shell-800/50 rounded-xl p-4 hover:bg-shell-700/50 transition-colors group"
            >
              <div className="text-lg mb-1">📊</div>
              <div className="font-medium text-shell-100 group-hover:text-coral-400 transition-colors">Reliability & SLA</div>
              <div className="text-xs text-shell-400">Our uptime guarantees</div>
            </Link>
            <Link
              href="/status"
              className="bg-shell-800/50 rounded-xl p-4 hover:bg-shell-700/50 transition-colors group"
            >
              <div className="text-lg mb-1">🟢</div>
              <div className="font-medium text-shell-100 group-hover:text-coral-400 transition-colors">System Status</div>
              <div className="text-xs text-shell-400">Live agent health</div>
            </Link>
            <Link
              href="/uptime"
              className="bg-shell-800/50 rounded-xl p-4 hover:bg-shell-700/50 transition-colors group"
            >
              <div className="text-lg mb-1">📅</div>
              <div className="font-medium text-shell-100 group-hover:text-coral-400 transition-colors">Uptime Calendar</div>
              <div className="text-xs text-shell-400">30-day history</div>
            </Link>
            <Link
              href="/alerts"
              className="bg-shell-800/50 rounded-xl p-4 hover:bg-shell-700/50 transition-colors group"
            >
              <div className="text-lg mb-1">🔔</div>
              <div className="font-medium text-shell-100 group-hover:text-coral-400 transition-colors">Alerts Setup</div>
              <div className="text-xs text-shell-400">Downtime notifications</div>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
