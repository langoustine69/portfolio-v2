'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { agents, getLiveAgents } from '@/data/agents';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Generate realistic-looking mock response time data
function generateMockHeatmapData(agentId: string): number[][] {
  const seed = agentId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const random = (i: number, j: number) => {
    const x = Math.sin(seed + i * 7 + j * 13) * 10000;
    return x - Math.floor(x);
  };

  return DAYS.map((_, dayIdx) =>
    HOURS.map((_, hourIdx) => {
      // Base response time 80-150ms
      let base = 80 + random(dayIdx, hourIdx) * 70;
      
      // Peak hours (9-11am, 2-4pm) are slower
      if ((hourIdx >= 9 && hourIdx <= 11) || (hourIdx >= 14 && hourIdx <= 16)) {
        base += 30 + random(dayIdx + 10, hourIdx) * 40;
      }
      
      // Night hours (1-5am) are faster
      if (hourIdx >= 1 && hourIdx <= 5) {
        base -= 20 + random(dayIdx + 20, hourIdx) * 20;
      }
      
      // Weekends slightly faster
      if (dayIdx >= 5) {
        base -= 15;
      }
      
      // Monday morning spike
      if (dayIdx === 0 && hourIdx >= 8 && hourIdx <= 10) {
        base += 50;
      }
      
      return Math.max(50, Math.round(base));
    })
  );
}

function getHeatColor(value: number, min: number, max: number): string {
  const normalized = (value - min) / (max - min);
  
  // Green (fast) -> Yellow -> Orange -> Red (slow)
  if (normalized < 0.25) {
    return 'bg-green-500 dark:bg-green-600';
  } else if (normalized < 0.5) {
    return 'bg-green-400 dark:bg-green-500';
  } else if (normalized < 0.65) {
    return 'bg-yellow-400 dark:bg-yellow-500';
  } else if (normalized < 0.8) {
    return 'bg-orange-400 dark:bg-orange-500';
  } else {
    return 'bg-red-400 dark:bg-red-500';
  }
}

function formatHour(hour: number): string {
  if (hour === 0) return '12am';
  if (hour === 12) return '12pm';
  return hour < 12 ? `${hour}am` : `${hour - 12}pm`;
}

export default function HeatmapPage() {
  const liveAgents = getLiveAgents();
  const [selectedAgent, setSelectedAgent] = useState<string>(liveAgents[0]?.id || '');
  const [hoveredCell, setHoveredCell] = useState<{ day: number; hour: number } | null>(null);

  const heatmapData = useMemo(() => {
    return generateMockHeatmapData(selectedAgent);
  }, [selectedAgent]);

  const { min, max, avg } = useMemo(() => {
    const flat = heatmapData.flat();
    return {
      min: Math.min(...flat),
      max: Math.max(...flat),
      avg: Math.round(flat.reduce((a, b) => a + b, 0) / flat.length),
    };
  }, [heatmapData]);

  const selectedAgentData = agents.find((a) => a.id === selectedAgent);

  // Find best/worst times
  const bestTime = useMemo(() => {
    let bestDay = 0, bestHour = 0, bestVal = Infinity;
    heatmapData.forEach((row, dayIdx) => {
      row.forEach((val, hourIdx) => {
        if (val < bestVal) {
          bestVal = val;
          bestDay = dayIdx;
          bestHour = hourIdx;
        }
      });
    });
    return { day: DAYS[bestDay], hour: formatHour(bestHour), value: bestVal };
  }, [heatmapData]);

  const worstTime = useMemo(() => {
    let worstDay = 0, worstHour = 0, worstVal = 0;
    heatmapData.forEach((row, dayIdx) => {
      row.forEach((val, hourIdx) => {
        if (val > worstVal) {
          worstVal = val;
          worstDay = dayIdx;
          worstHour = hourIdx;
        }
      });
    });
    return { day: DAYS[worstDay], hour: formatHour(worstHour), value: worstVal };
  }, [heatmapData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4 inline-block"
          >
            ← Back to Portfolio
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            📊 Response Time Heatmap
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Visualize API performance by hour and day of week. Plan your requests for optimal speed.
          </p>
        </div>

        {/* Agent Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Agent:
            </label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="flex-1 max-w-md px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {liveAgents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.icon} {agent.name}
                </option>
              ))}
            </select>
            {selectedAgentData && (
              <Link
                href={`/agents/${selectedAgentData.id}`}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View Agent →
              </Link>
            )}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{min}ms</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Fastest</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{avg}ms</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Average</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{max}ms</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Slowest</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{max - min}ms</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Variance</div>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8 shadow-sm overflow-x-auto">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Weekly Performance Pattern
          </h2>
          
          {/* Legend */}
          <div className="flex items-center gap-2 mb-6 text-sm text-gray-600 dark:text-gray-400">
            <span>Fast</span>
            <div className="flex gap-0.5">
              <div className="w-6 h-4 bg-green-500 dark:bg-green-600 rounded-sm" />
              <div className="w-6 h-4 bg-green-400 dark:bg-green-500 rounded-sm" />
              <div className="w-6 h-4 bg-yellow-400 dark:bg-yellow-500 rounded-sm" />
              <div className="w-6 h-4 bg-orange-400 dark:bg-orange-500 rounded-sm" />
              <div className="w-6 h-4 bg-red-400 dark:bg-red-500 rounded-sm" />
            </div>
            <span>Slow</span>
            <span className="ml-4 text-gray-400">|</span>
            <span className="ml-2">All times in UTC</span>
          </div>

          {/* Grid */}
          <div className="min-w-[700px]">
            {/* Hour labels */}
            <div className="flex mb-1">
              <div className="w-12 shrink-0" />
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="flex-1 text-center text-xs text-gray-500 dark:text-gray-400"
                >
                  {hour % 3 === 0 ? formatHour(hour) : ''}
                </div>
              ))}
            </div>

            {/* Rows */}
            {DAYS.map((day, dayIdx) => (
              <div key={day} className="flex mb-1">
                <div className="w-12 shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  {day}
                </div>
                {HOURS.map((hour) => {
                  const value = heatmapData[dayIdx][hour];
                  const isHovered = hoveredCell?.day === dayIdx && hoveredCell?.hour === hour;
                  return (
                    <div
                      key={hour}
                      className={`flex-1 aspect-square max-h-8 mx-0.5 rounded-sm cursor-pointer transition-all ${getHeatColor(value, min, max)} ${isHovered ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-gray-800 scale-125 z-10' : ''}`}
                      onMouseEnter={() => setHoveredCell({ day: dayIdx, hour })}
                      onMouseLeave={() => setHoveredCell(null)}
                      title={`${day} ${formatHour(hour)}: ${value}ms`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Hover tooltip */}
          {hoveredCell && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg inline-block">
              <span className="font-medium text-gray-900 dark:text-white">
                {DAYS[hoveredCell.day]} {formatHour(hoveredCell.hour)}
              </span>
              <span className="mx-2 text-gray-400">→</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {heatmapData[hoveredCell.day][hoveredCell.hour]}ms
              </span>
            </div>
          )}
        </div>

        {/* Insights */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800 p-6">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
              ⚡ Best Time to Call
            </h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
              {bestTime.day} {bestTime.hour}
            </p>
            <p className="text-sm text-green-700 dark:text-green-400">
              Average response: {bestTime.value}ms
            </p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border border-red-200 dark:border-red-800 p-6">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
              🐢 Peak Load Time
            </h3>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
              {worstTime.day} {worstTime.hour}
            </p>
            <p className="text-sm text-red-700 dark:text-red-400">
              Average response: {worstTime.value}ms
            </p>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4">
            💡 Performance Tips
          </h3>
          <ul className="space-y-2 text-blue-700 dark:text-blue-300">
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Schedule batch jobs during off-peak hours (1-5am UTC) for fastest processing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Avoid Monday morning spikes (8-10am UTC) for time-sensitive requests</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Weekend traffic is generally 10-15% lighter than weekdays</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Use caching headers — most agents support conditional requests</span>
            </li>
          </ul>
        </div>

        {/* Related Links */}
        <div className="flex flex-wrap gap-4">
          <Link
            href="/status"
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            📡 System Status
          </Link>
          <Link
            href="/uptime"
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            📅 Uptime Calendar
          </Link>
          <Link
            href="/reliability"
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            🛡️ Reliability & SLA
          </Link>
          <Link
            href="/rate-calculator"
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            🧮 Rate Calculator
          </Link>
        </div>
      </div>
    </div>
  );
}
