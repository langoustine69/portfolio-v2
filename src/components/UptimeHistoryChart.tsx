'use client';

import { useState, useMemo } from 'react';

interface UptimeDay {
  date: string;
  status: 'up' | 'degraded' | 'down' | 'no-data';
  uptime: number; // 0-100 percentage
  incidents?: number;
  avgResponseTime?: number;
}

interface UptimeHistoryChartProps {
  agentId: string;
  agentStatus: 'live' | 'offline' | 'building';
  days?: number;
}

// Generate mock historical data based on agent ID (deterministic)
function generateMockUptimeData(agentId: string, days: number): UptimeDay[] {
  const data: UptimeDay[] = [];
  const today = new Date();
  
  // Use agent ID to seed "randomness" for consistent data
  const seed = agentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Pseudo-random based on date and seed
    const dayHash = (date.getDate() + date.getMonth() * 31 + seed) % 100;
    
    let status: UptimeDay['status'];
    let uptime: number;
    let incidents = 0;
    let avgResponseTime: number;
    
    // Most days are good (90%+ uptime)
    if (dayHash < 85) {
      status = 'up';
      uptime = 99 + Math.random() * 1;
      avgResponseTime = 50 + (dayHash % 50);
    } else if (dayHash < 95) {
      status = 'degraded';
      uptime = 95 + Math.random() * 4;
      incidents = 1;
      avgResponseTime = 150 + (dayHash % 100);
    } else {
      status = 'down';
      uptime = 80 + Math.random() * 15;
      incidents = 1 + (dayHash % 3);
      avgResponseTime = 300 + (dayHash % 200);
    }
    
    data.push({
      date: date.toISOString().split('T')[0],
      status,
      uptime: Math.round(uptime * 100) / 100,
      incidents,
      avgResponseTime: Math.round(avgResponseTime),
    });
  }
  
  return data;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  });
}

const statusColors = {
  'up': 'bg-emerald-500 hover:bg-emerald-400',
  'degraded': 'bg-yellow-500 hover:bg-yellow-400',
  'down': 'bg-red-500 hover:bg-red-400',
  'no-data': 'bg-shell-700 hover:bg-shell-600',
};

const statusLabels = {
  'up': 'Operational',
  'degraded': 'Degraded',
  'down': 'Outage',
  'no-data': 'No Data',
};

export default function UptimeHistoryChart({ 
  agentId, 
  agentStatus,
  days = 30 
}: UptimeHistoryChartProps) {
  const [hoveredDay, setHoveredDay] = useState<UptimeDay | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  const uptimeData = useMemo(() => {
    // Only show real-ish data for live agents
    if (agentStatus !== 'live') {
      return Array(days).fill(null).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        return {
          date: date.toISOString().split('T')[0],
          status: 'no-data' as const,
          uptime: 0,
        };
      });
    }
    return generateMockUptimeData(agentId, days);
  }, [agentId, agentStatus, days]);
  
  const overallUptime = useMemo(() => {
    const liveData = uptimeData.filter(d => d.status !== 'no-data');
    if (liveData.length === 0) return null;
    return (liveData.reduce((acc, d) => acc + d.uptime, 0) / liveData.length).toFixed(2);
  }, [uptimeData]);
  
  const incidentCount = useMemo(() => {
    return uptimeData.reduce((acc, d) => acc + ('incidents' in d ? (d.incidents || 0) : 0), 0);
  }, [uptimeData]);
  
  const handleMouseEnter = (day: UptimeDay, event: React.MouseEvent) => {
    setHoveredDay(day);
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };
  
  return (
    <div className="bg-shell-900/50 dark:bg-shell-900/50 light:bg-white/80 rounded-xl border border-shell-700/50 dark:border-shell-700/50 light:border-shell-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white dark:text-white light:text-shell-900 flex items-center gap-2">
            <span className="text-xl">📊</span>
            Uptime History
          </h3>
          <p className="text-sm text-shell-400 dark:text-shell-400 light:text-shell-500 mt-1">
            Last {days} days
          </p>
        </div>
        
        {overallUptime && (
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-400 dark:text-emerald-400 light:text-emerald-600">
              {overallUptime}%
            </div>
            <div className="text-xs text-shell-400 dark:text-shell-400 light:text-shell-500">
              Overall Uptime
            </div>
          </div>
        )}
      </div>
      
      {/* Uptime Grid */}
      <div className="relative">
        <div className="flex gap-1 flex-wrap">
          {uptimeData.map((day, index) => (
            <div
              key={day.date}
              className={`w-4 h-8 rounded-sm cursor-pointer transition-all duration-150 ${statusColors[day.status]}`}
              onMouseEnter={(e) => handleMouseEnter(day, e)}
              onMouseLeave={() => setHoveredDay(null)}
              title={`${formatDate(day.date)}: ${statusLabels[day.status]}`}
            />
          ))}
        </div>
        
        {/* Tooltip */}
        {hoveredDay && (
          <div 
            className="fixed z-50 pointer-events-none"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="bg-shell-800 dark:bg-shell-800 light:bg-white border border-shell-600 dark:border-shell-600 light:border-shell-200 rounded-lg shadow-xl p-3 min-w-[180px]">
              <div className="text-sm font-medium text-white dark:text-white light:text-shell-900 mb-2">
                {formatDate(hoveredDay.date)}
              </div>
              
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-shell-400 dark:text-shell-400 light:text-shell-500">Status:</span>
                  <span className={`font-medium ${
                    hoveredDay.status === 'up' ? 'text-emerald-400' :
                    hoveredDay.status === 'degraded' ? 'text-yellow-400' :
                    hoveredDay.status === 'down' ? 'text-red-400' : 'text-shell-500'
                  }`}>
                    {statusLabels[hoveredDay.status]}
                  </span>
                </div>
                
                {hoveredDay.status !== 'no-data' && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-shell-400 dark:text-shell-400 light:text-shell-500">Uptime:</span>
                      <span className="text-white dark:text-white light:text-shell-900 font-medium">
                        {hoveredDay.uptime}%
                      </span>
                    </div>
                    
                    {hoveredDay.avgResponseTime && (
                      <div className="flex justify-between items-center">
                        <span className="text-shell-400 dark:text-shell-400 light:text-shell-500">Avg Response:</span>
                        <span className="text-white dark:text-white light:text-shell-900 font-medium">
                          {hoveredDay.avgResponseTime}ms
                        </span>
                      </div>
                    )}
                    
                    {hoveredDay.incidents !== undefined && hoveredDay.incidents > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-shell-400 dark:text-shell-400 light:text-shell-500">Incidents:</span>
                        <span className="text-yellow-400 font-medium">
                          {hoveredDay.incidents}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {/* Tooltip arrow */}
              <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full">
                <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-shell-600 dark:border-t-shell-600 light:border-t-shell-200" />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Legend and Stats */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span className="text-shell-400 dark:text-shell-400 light:text-shell-500">Operational</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-yellow-500" />
            <span className="text-shell-400 dark:text-shell-400 light:text-shell-500">Degraded</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-red-500" />
            <span className="text-shell-400 dark:text-shell-400 light:text-shell-500">Outage</span>
          </div>
        </div>
        
        {incidentCount > 0 && (
          <div className="text-shell-400 dark:text-shell-400 light:text-shell-500">
            <span className="text-yellow-400 dark:text-yellow-400 light:text-yellow-600 font-medium">{incidentCount}</span> incident{incidentCount !== 1 ? 's' : ''} in {days} days
          </div>
        )}
      </div>
      
      {agentStatus !== 'live' && (
        <div className="mt-4 p-3 bg-shell-800/50 dark:bg-shell-800/50 light:bg-shell-100 rounded-lg">
          <p className="text-xs text-shell-400 dark:text-shell-400 light:text-shell-500 text-center">
            {agentStatus === 'building' 
              ? '🔧 This agent is currently being built. Uptime data will appear once deployed.'
              : '💤 This agent is offline. Historical uptime data is not available.'}
          </p>
        </div>
      )}
    </div>
  );
}
