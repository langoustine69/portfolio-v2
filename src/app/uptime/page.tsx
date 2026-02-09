'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { agents } from '@/data/agents';
import Breadcrumbs from '@/components/Breadcrumbs';

// Generate mock uptime data for the last 30 days
function generateUptimeData(agentId: string) {
  const data: { date: string; uptime: number; incidents: number; avgLatency: number }[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Seed random based on agent + date for consistent results
    const seed = agentId.length + i + dateStr.charCodeAt(5);
    const rand = () => {
      const x = Math.sin(seed * (data.length + 1)) * 10000;
      return x - Math.floor(x);
    };
    
    // Most days are 99.9%+, occasional issues
    const baseUptime = 99.9 + rand() * 0.1;
    const hasIncident = rand() > 0.92;
    const uptime = hasIncident ? 95 + rand() * 4.5 : baseUptime;
    const incidents = hasIncident ? Math.floor(rand() * 3) + 1 : 0;
    const avgLatency = 50 + rand() * 150;
    
    data.push({ date: dateStr, uptime: Math.round(uptime * 100) / 100, incidents, avgLatency: Math.round(avgLatency) });
  }
  
  return data;
}

function getUptimeColor(uptime: number): string {
  if (uptime >= 99.9) return 'bg-emerald-500';
  if (uptime >= 99.5) return 'bg-emerald-400';
  if (uptime >= 99) return 'bg-yellow-400';
  if (uptime >= 95) return 'bg-orange-400';
  return 'bg-red-500';
}

function getUptimeLabel(uptime: number): string {
  if (uptime >= 99.9) return 'Excellent';
  if (uptime >= 99.5) return 'Good';
  if (uptime >= 99) return 'Degraded';
  if (uptime >= 95) return 'Issues';
  return 'Outage';
}

interface DayData {
  date: string;
  uptime: number;
  incidents: number;
  avgLatency: number;
}

export default function UptimeCalendarPage() {
  const liveAgents = useMemo(() => agents.filter(a => a.status === 'live'), []);
  const [selectedAgent, setSelectedAgent] = useState<string | 'all'>('all');
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [hoveredDay, setHoveredDay] = useState<{ agentId: string; data: DayData } | null>(null);

  // Generate uptime data for all agents
  const uptimeByAgent = useMemo(() => {
    const map = new Map<string, DayData[]>();
    liveAgents.forEach(agent => {
      map.set(agent.id, generateUptimeData(agent.id));
    });
    return map;
  }, [liveAgents]);

  // Aggregate data for "all agents" view
  const aggregatedData = useMemo(() => {
    const days: DayData[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      let totalUptime = 0;
      let totalIncidents = 0;
      let totalLatency = 0;
      let count = 0;
      
      uptimeByAgent.forEach((data) => {
        const dayData = data.find(d => d.date === dateStr);
        if (dayData) {
          totalUptime += dayData.uptime;
          totalIncidents += dayData.incidents;
          totalLatency += dayData.avgLatency;
          count++;
        }
      });
      
      days.push({
        date: dateStr,
        uptime: count > 0 ? Math.round((totalUptime / count) * 100) / 100 : 0,
        incidents: totalIncidents,
        avgLatency: count > 0 ? Math.round(totalLatency / count) : 0,
      });
    }
    
    return days;
  }, [uptimeByAgent]);

  const displayData = selectedAgent === 'all' 
    ? aggregatedData 
    : uptimeByAgent.get(selectedAgent) || [];

  // Calculate overall stats
  const stats = useMemo(() => {
    const avgUptime = displayData.reduce((sum, d) => sum + d.uptime, 0) / displayData.length;
    const totalIncidents = displayData.reduce((sum, d) => sum + d.incidents, 0);
    const avgLatency = displayData.reduce((sum, d) => sum + d.avgLatency, 0) / displayData.length;
    const perfectDays = displayData.filter(d => d.uptime >= 99.9).length;
    
    return {
      avgUptime: avgUptime.toFixed(3),
      totalIncidents,
      avgLatency: Math.round(avgLatency),
      perfectDays,
    };
  }, [displayData]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getDayOfWeek = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.getDay();
  };

  // Group days by week for calendar layout
  const weeks = useMemo(() => {
    const result: (DayData | null)[][] = [];
    let currentWeek: (DayData | null)[] = [];
    
    // Pad first week with nulls
    if (displayData.length > 0) {
      const firstDayOfWeek = getDayOfWeek(displayData[0].date);
      for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push(null);
      }
    }
    
    displayData.forEach((day, idx) => {
      currentWeek.push(day);
      
      if (getDayOfWeek(day.date) === 6 || idx === displayData.length - 1) {
        // Pad last week with nulls
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        result.push(currentWeek);
        currentWeek = [];
      }
    });
    
    return result;
  }, [displayData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-shell-950 to-shell-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Uptime Calendar', href: '/uptime' },
          ]}
        />

        {/* Header */}
        <div className="mt-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">📅</span>
            <h1 className="text-3xl font-bold text-white">Uptime Calendar</h1>
          </div>
          <p className="text-shell-300 max-w-2xl">
            30-day uptime history across all agents. Each cell shows daily uptime percentage 
            with color coding. Click any day for detailed metrics.
          </p>
        </div>

        {/* Agent Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-shell-300 mb-2">Select Agent</label>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="bg-shell-800 border border-shell-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-lobster-500 focus:border-transparent min-w-[250px]"
          >
            <option value="all">All Agents (Aggregate)</option>
            {liveAgents.map(agent => (
              <option key={agent.id} value={agent.id}>
                {agent.icon} {agent.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-shell-800/50 rounded-xl p-4 border border-shell-700">
            <div className="text-shell-400 text-sm mb-1">Avg Uptime</div>
            <div className="text-2xl font-bold text-emerald-400">{stats.avgUptime}%</div>
          </div>
          <div className="bg-shell-800/50 rounded-xl p-4 border border-shell-700">
            <div className="text-shell-400 text-sm mb-1">Total Incidents</div>
            <div className="text-2xl font-bold text-white">{stats.totalIncidents}</div>
          </div>
          <div className="bg-shell-800/50 rounded-xl p-4 border border-shell-700">
            <div className="text-shell-400 text-sm mb-1">Avg Latency</div>
            <div className="text-2xl font-bold text-white">{stats.avgLatency}ms</div>
          </div>
          <div className="bg-shell-800/50 rounded-xl p-4 border border-shell-700">
            <div className="text-shell-400 text-sm mb-1">Perfect Days</div>
            <div className="text-2xl font-bold text-emerald-400">{stats.perfectDays}/30</div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-shell-800/30 rounded-2xl p-6 border border-shell-700 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">30-Day Uptime History</h2>
            <div className="flex items-center gap-2 text-sm text-shell-400">
              <span className="w-3 h-3 rounded bg-emerald-500"></span> Excellent
              <span className="w-3 h-3 rounded bg-yellow-400"></span> Degraded
              <span className="w-3 h-3 rounded bg-red-500"></span> Outage
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs text-shell-400 font-medium py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar weeks */}
          <div className="space-y-2">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="grid grid-cols-7 gap-2">
                {week.map((day, dayIdx) => (
                  <div
                    key={dayIdx}
                    className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs cursor-pointer transition-all ${
                      day 
                        ? `${getUptimeColor(day.uptime)} hover:ring-2 hover:ring-white/50`
                        : 'bg-shell-800/20'
                    }`}
                    onClick={() => day && setSelectedDay(day)}
                    onMouseEnter={() => day && setHoveredDay({ agentId: selectedAgent, data: day })}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    {day && (
                      <>
                        <span className="font-bold text-white text-shadow">
                          {new Date(day.date + 'T00:00:00').getDate()}
                        </span>
                        <span className="text-[10px] text-white/80">
                          {day.uptime.toFixed(1)}%
                        </span>
                        {day.incidents > 0 && (
                          <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Hover tooltip */}
          {hoveredDay && (
            <div className="mt-4 p-3 bg-shell-700 rounded-lg text-sm">
              <div className="font-medium text-white mb-1">{formatDate(hoveredDay.data.date)}</div>
              <div className="grid grid-cols-3 gap-4 text-shell-300">
                <div>Uptime: <span className="text-white">{hoveredDay.data.uptime}%</span></div>
                <div>Incidents: <span className="text-white">{hoveredDay.data.incidents}</span></div>
                <div>Latency: <span className="text-white">{hoveredDay.data.avgLatency}ms</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Selected Day Details */}
        {selectedDay && (
          <div className="bg-shell-800/50 rounded-2xl p-6 border border-shell-700 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                📊 {formatDate(selectedDay.date)} Details
              </h2>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-shell-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-shell-700/50 rounded-lg p-4">
                <div className="text-shell-400 text-sm mb-1">Uptime</div>
                <div className={`text-2xl font-bold ${
                  selectedDay.uptime >= 99.5 ? 'text-emerald-400' : 
                  selectedDay.uptime >= 99 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {selectedDay.uptime}%
                </div>
                <div className="text-xs text-shell-400 mt-1">
                  {getUptimeLabel(selectedDay.uptime)}
                </div>
              </div>
              
              <div className="bg-shell-700/50 rounded-lg p-4">
                <div className="text-shell-400 text-sm mb-1">Incidents</div>
                <div className={`text-2xl font-bold ${
                  selectedDay.incidents === 0 ? 'text-emerald-400' : 'text-orange-400'
                }`}>
                  {selectedDay.incidents}
                </div>
                <div className="text-xs text-shell-400 mt-1">
                  {selectedDay.incidents === 0 ? 'No issues' : 'Resolved'}
                </div>
              </div>
              
              <div className="bg-shell-700/50 rounded-lg p-4">
                <div className="text-shell-400 text-sm mb-1">Avg Latency</div>
                <div className="text-2xl font-bold text-white">
                  {selectedDay.avgLatency}ms
                </div>
                <div className="text-xs text-shell-400 mt-1">
                  {selectedDay.avgLatency < 100 ? 'Fast' : selectedDay.avgLatency < 200 ? 'Normal' : 'Slow'}
                </div>
              </div>
              
              <div className="bg-shell-700/50 rounded-lg p-4">
                <div className="text-shell-400 text-sm mb-1">Status</div>
                <div className={`text-2xl font-bold ${
                  selectedDay.uptime >= 99.9 ? 'text-emerald-400' : 'text-yellow-400'
                }`}>
                  {selectedDay.uptime >= 99.9 ? '✓' : '⚠'}
                </div>
                <div className="text-xs text-shell-400 mt-1">
                  {selectedDay.uptime >= 99.9 ? 'All systems go' : 'Minor issues'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Per-Agent Breakdown (when viewing all) */}
        {selectedAgent === 'all' && (
          <div className="bg-shell-800/30 rounded-2xl p-6 border border-shell-700">
            <h2 className="text-lg font-semibold text-white mb-4">Agent Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveAgents.map(agent => {
                const agentData = uptimeByAgent.get(agent.id) || [];
                const avgUptime = agentData.reduce((sum, d) => sum + d.uptime, 0) / agentData.length;
                const incidents = agentData.reduce((sum, d) => sum + d.incidents, 0);
                
                return (
                  <Link
                    key={agent.id}
                    href={`/agents/${agent.id}`}
                    className="bg-shell-700/30 rounded-lg p-4 hover:bg-shell-700/50 transition-colors border border-shell-600"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{agent.icon}</span>
                      <span className="font-medium text-white">{agent.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getUptimeColor(avgUptime)}`}></div>
                        <span className="text-shell-300">{avgUptime.toFixed(2)}%</span>
                      </div>
                      {incidents > 0 && (
                        <span className="text-orange-400">{incidents} incident{incidents > 1 ? 's' : ''}</span>
                      )}
                    </div>
                    {/* Mini uptime bar */}
                    <div className="mt-3 flex gap-[2px]">
                      {agentData.slice(-14).map((day, idx) => (
                        <div
                          key={idx}
                          className={`flex-1 h-2 rounded-sm ${getUptimeColor(day.uptime)}`}
                          title={`${day.date}: ${day.uptime}%`}
                        />
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Links */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/status"
            className="text-lobster-400 hover:text-lobster-300 text-sm flex items-center gap-1"
          >
            ← Real-time Status
          </Link>
          <Link
            href="/reliability"
            className="text-lobster-400 hover:text-lobster-300 text-sm flex items-center gap-1"
          >
            SLA & Reliability →
          </Link>
          <Link
            href="/alerts"
            className="text-lobster-400 hover:text-lobster-300 text-sm flex items-center gap-1"
          >
            Configure Alerts →
          </Link>
        </div>
      </div>
    </div>
  );
}
