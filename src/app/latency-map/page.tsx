'use client';

import { useState, useMemo } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { agents } from '@/data/agents';

interface Region {
  id: string;
  name: string;
  code: string;
  x: number; // SVG x position (0-100)
  y: number; // SVG y position (0-100)
  latency: number; // ms
  status: 'excellent' | 'good' | 'moderate' | 'slow';
}

// Simulated latency data by region (Railway servers are US-based)
const generateRegionData = (): Region[] => [
  { id: 'us-west', name: 'US West', code: 'US-W', x: 15, y: 40, latency: 25, status: 'excellent' },
  { id: 'us-east', name: 'US East', code: 'US-E', x: 25, y: 42, latency: 35, status: 'excellent' },
  { id: 'canada', name: 'Canada', code: 'CA', x: 20, y: 30, latency: 40, status: 'excellent' },
  { id: 'mexico', name: 'Mexico', code: 'MX', x: 18, y: 52, latency: 55, status: 'good' },
  { id: 'brazil', name: 'Brazil', code: 'BR', x: 32, y: 68, latency: 120, status: 'moderate' },
  { id: 'argentina', name: 'Argentina', code: 'AR', x: 28, y: 80, latency: 140, status: 'moderate' },
  { id: 'uk', name: 'United Kingdom', code: 'UK', x: 48, y: 32, latency: 85, status: 'good' },
  { id: 'germany', name: 'Germany', code: 'DE', x: 52, y: 35, latency: 90, status: 'good' },
  { id: 'france', name: 'France', code: 'FR', x: 50, y: 38, latency: 92, status: 'good' },
  { id: 'spain', name: 'Spain', code: 'ES', x: 47, y: 44, latency: 95, status: 'good' },
  { id: 'italy', name: 'Italy', code: 'IT', x: 54, y: 42, latency: 98, status: 'good' },
  { id: 'netherlands', name: 'Netherlands', code: 'NL', x: 51, y: 33, latency: 88, status: 'good' },
  { id: 'sweden', name: 'Sweden', code: 'SE', x: 55, y: 25, latency: 100, status: 'good' },
  { id: 'poland', name: 'Poland', code: 'PL', x: 56, y: 34, latency: 105, status: 'moderate' },
  { id: 'russia', name: 'Russia', code: 'RU', x: 70, y: 28, latency: 150, status: 'moderate' },
  { id: 'turkey', name: 'Turkey', code: 'TR', x: 58, y: 44, latency: 115, status: 'moderate' },
  { id: 'uae', name: 'UAE', code: 'AE', x: 62, y: 52, latency: 160, status: 'moderate' },
  { id: 'india', name: 'India', code: 'IN', x: 70, y: 52, latency: 200, status: 'slow' },
  { id: 'singapore', name: 'Singapore', code: 'SG', x: 77, y: 60, latency: 180, status: 'slow' },
  { id: 'hong-kong', name: 'Hong Kong', code: 'HK', x: 80, y: 52, latency: 170, status: 'slow' },
  { id: 'japan', name: 'Japan', code: 'JP', x: 88, y: 42, latency: 120, status: 'moderate' },
  { id: 'south-korea', name: 'South Korea', code: 'KR', x: 85, y: 44, latency: 130, status: 'moderate' },
  { id: 'australia', name: 'Australia', code: 'AU', x: 85, y: 75, latency: 190, status: 'slow' },
  { id: 'new-zealand', name: 'New Zealand', code: 'NZ', x: 92, y: 82, latency: 210, status: 'slow' },
  { id: 'south-africa', name: 'South Africa', code: 'ZA', x: 55, y: 78, latency: 220, status: 'slow' },
  { id: 'nigeria', name: 'Nigeria', code: 'NG', x: 52, y: 58, latency: 180, status: 'slow' },
  { id: 'egypt', name: 'Egypt', code: 'EG', x: 56, y: 50, latency: 130, status: 'moderate' },
];

const statusColors = {
  excellent: { bg: 'bg-green-500', text: 'text-green-400', fill: '#22c55e', glow: '#22c55e40' },
  good: { bg: 'bg-blue-500', text: 'text-blue-400', fill: '#3b82f6', glow: '#3b82f640' },
  moderate: { bg: 'bg-yellow-500', text: 'text-yellow-400', fill: '#eab308', glow: '#eab30840' },
  slow: { bg: 'bg-red-500', text: 'text-red-400', fill: '#ef4444', glow: '#ef444440' },
};

const statusLabels = {
  excellent: '< 50ms',
  good: '50-100ms',
  moderate: '100-150ms',
  slow: '> 150ms',
};

export default function LatencyMapPage() {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  
  const regions = useMemo(() => generateRegionData(), []);
  const liveAgents = agents.filter(a => a.status === 'live');
  
  const stats = useMemo(() => {
    const latencies = regions.map(r => r.latency);
    return {
      avgGlobal: Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length),
      minLatency: Math.min(...latencies),
      maxLatency: Math.max(...latencies),
      excellentCount: regions.filter(r => r.status === 'excellent').length,
      goodCount: regions.filter(r => r.status === 'good').length,
      moderateCount: regions.filter(r => r.status === 'moderate').length,
      slowCount: regions.filter(r => r.status === 'slow').length,
    };
  }, [regions]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: 'Global Latency Map', href: '/latency-map' },
        ]} />
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            🌍 Global Latency Map
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Real-time response times from {regions.length} regions worldwide. 
            See how our agents perform for your users everywhere.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700">
            <div className="text-3xl font-bold text-white">{stats.avgGlobal}ms</div>
            <div className="text-sm text-gray-400">Global Average</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700">
            <div className="text-3xl font-bold text-green-400">{stats.minLatency}ms</div>
            <div className="text-sm text-gray-400">Best Latency</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700">
            <div className="text-3xl font-bold text-red-400">{stats.maxLatency}ms</div>
            <div className="text-sm text-gray-400">Highest Latency</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700">
            <div className="text-3xl font-bold text-blue-400">{regions.length}</div>
            <div className="text-sm text-gray-400">Regions Monitored</div>
          </div>
        </div>

        {/* Agent Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <label className="text-gray-400 text-sm">Agent:</label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Agents (Average)</option>
              {liveAgents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.icon} {agent.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {Object.entries(statusLabels).map(([status, label]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${statusColors[status as keyof typeof statusColors].bg}`} />
                <span className="text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Map */}
        <div className="bg-gray-800/30 rounded-2xl border border-gray-700 p-4 mb-8 overflow-hidden">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-auto max-h-[600px]"
            style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)' }}
          >
            {/* Simplified World Map Outline */}
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Continents (simplified paths) */}
            <g fill="#2d3748" stroke="#4a5568" strokeWidth="0.2" opacity="0.6">
              {/* North America */}
              <path d="M5,25 Q15,20 25,22 Q30,25 28,35 Q32,40 30,50 Q25,55 20,52 Q15,55 10,50 Q8,40 5,35 Z" />
              {/* South America */}
              <path d="M25,55 Q32,58 35,65 Q33,75 30,85 Q25,88 22,82 Q20,70 22,60 Z" />
              {/* Europe */}
              <path d="M45,25 Q55,22 58,28 Q60,35 55,40 Q50,42 45,38 Q42,32 45,25 Z" />
              {/* Africa */}
              <path d="M45,45 Q55,42 60,50 Q58,65 55,75 Q50,80 45,75 Q42,60 45,45 Z" />
              {/* Asia */}
              <path d="M58,20 Q75,18 88,25 Q92,35 85,45 Q78,55 70,58 Q62,55 58,45 Q55,35 58,20 Z" />
              {/* Australia */}
              <path d="M78,68 Q88,65 92,72 Q90,80 85,82 Q78,80 78,68 Z" />
            </g>

            {/* Connection Lines to Railway (US) */}
            {regions.map(region => (
              <line
                key={`line-${region.id}`}
                x1="20"
                y1="40"
                x2={region.x}
                y2={region.y}
                stroke={statusColors[region.status].fill}
                strokeWidth="0.15"
                opacity={hoveredRegion === region.id || selectedRegion?.id === region.id ? 0.6 : 0.15}
                strokeDasharray="1,1"
              />
            ))}

            {/* Region Points */}
            {regions.map(region => {
              const isHovered = hoveredRegion === region.id;
              const isSelected = selectedRegion?.id === region.id;
              const colors = statusColors[region.status];
              
              return (
                <g
                  key={region.id}
                  className="cursor-pointer transition-transform"
                  onClick={() => setSelectedRegion(selectedRegion?.id === region.id ? null : region)}
                  onMouseEnter={() => setHoveredRegion(region.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                >
                  {/* Glow Effect */}
                  <circle
                    cx={region.x}
                    cy={region.y}
                    r={isHovered || isSelected ? 3 : 2}
                    fill={colors.glow}
                    className="transition-all duration-200"
                  />
                  {/* Main Point */}
                  <circle
                    cx={region.x}
                    cy={region.y}
                    r={isHovered || isSelected ? 1.5 : 1}
                    fill={colors.fill}
                    filter="url(#glow)"
                    className="transition-all duration-200"
                  />
                  {/* Pulse Animation for Selected */}
                  {(isHovered || isSelected) && (
                    <circle
                      cx={region.x}
                      cy={region.y}
                      r="2"
                      fill="none"
                      stroke={colors.fill}
                      strokeWidth="0.3"
                      opacity="0.5"
                    >
                      <animate
                        attributeName="r"
                        values="1.5;4;1.5"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.5;0;0.5"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                  {/* Label on Hover */}
                  {(isHovered || isSelected) && (
                    <g>
                      <rect
                        x={region.x + 2}
                        y={region.y - 3}
                        width="12"
                        height="6"
                        rx="0.5"
                        fill="#1a1a2e"
                        stroke={colors.fill}
                        strokeWidth="0.2"
                      />
                      <text
                        x={region.x + 3}
                        y={region.y + 0.5}
                        fill="white"
                        fontSize="2"
                        fontWeight="bold"
                      >
                        {region.code}: {region.latency}ms
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Server Location Marker */}
            <g>
              <circle cx="20" cy="40" r="2" fill="#f97316" filter="url(#glow)" />
              <text x="20" y="36" fill="#f97316" fontSize="2" textAnchor="middle" fontWeight="bold">
                🦞 Railway
              </text>
            </g>
          </svg>
        </div>

        {/* Region Details Panel */}
        {selectedRegion && (
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 mb-8 animate-fade-in">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  {selectedRegion.name}
                  <span className={`px-2 py-1 rounded text-xs ${statusColors[selectedRegion.status].bg}`}>
                    {selectedRegion.status.toUpperCase()}
                  </span>
                </h3>
                <p className="text-gray-400">Region Code: {selectedRegion.code}</p>
              </div>
              <button
                onClick={() => setSelectedRegion(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className={`text-2xl font-bold ${statusColors[selectedRegion.status].text}`}>
                  {selectedRegion.latency}ms
                </div>
                <div className="text-sm text-gray-400">Average Latency</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">
                  {Math.round(selectedRegion.latency * 0.85)}ms
                </div>
                <div className="text-sm text-gray-400">P50 Response</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">
                  {Math.round(selectedRegion.latency * 1.3)}ms
                </div>
                <div className="text-sm text-gray-400">P95 Response</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">99.9%</div>
                <div className="text-sm text-gray-400">Availability</div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-900/30 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">💡 Performance Tips for {selectedRegion.name}</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                {selectedRegion.status === 'slow' && (
                  <>
                    <li>• Consider implementing request caching to reduce round-trips</li>
                    <li>• Use batch endpoints to minimize API calls</li>
                    <li>• Implement optimistic UI updates for better perceived performance</li>
                  </>
                )}
                {selectedRegion.status === 'moderate' && (
                  <>
                    <li>• Response times are acceptable for most use cases</li>
                    <li>• Consider caching for frequently accessed data</li>
                  </>
                )}
                {(selectedRegion.status === 'good' || selectedRegion.status === 'excellent') && (
                  <>
                    <li>• Excellent response times for real-time applications</li>
                    <li>• No optimization needed for standard use cases</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Region Table */}
        <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden mb-8">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">📊 All Regions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm text-gray-400 font-medium">Region</th>
                  <th className="text-left px-4 py-3 text-sm text-gray-400 font-medium">Code</th>
                  <th className="text-left px-4 py-3 text-sm text-gray-400 font-medium">Latency</th>
                  <th className="text-left px-4 py-3 text-sm text-gray-400 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-sm text-gray-400 font-medium">P95</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {regions
                  .sort((a, b) => a.latency - b.latency)
                  .map(region => (
                    <tr
                      key={region.id}
                      className="hover:bg-gray-800/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedRegion(region)}
                    >
                      <td className="px-4 py-3 text-white">{region.name}</td>
                      <td className="px-4 py-3 text-gray-400 font-mono">{region.code}</td>
                      <td className="px-4 py-3">
                        <span className={statusColors[region.status].text}>{region.latency}ms</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${statusColors[region.status].bg}`}>
                          {region.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{Math.round(region.latency * 1.3)}ms</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">📈 Latency Distribution</h3>
          <div className="flex items-end gap-2 h-32">
            {[
              { label: 'Excellent', count: stats.excellentCount, color: 'bg-green-500' },
              { label: 'Good', count: stats.goodCount, color: 'bg-blue-500' },
              { label: 'Moderate', count: stats.moderateCount, color: 'bg-yellow-500' },
              { label: 'Slow', count: stats.slowCount, color: 'bg-red-500' },
            ].map(item => (
              <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className={`w-full ${item.color} rounded-t transition-all duration-500`}
                  style={{ height: `${(item.count / regions.length) * 100}%`, minHeight: item.count > 0 ? '8px' : '0' }}
                />
                <div className="text-center">
                  <div className="text-white font-bold">{item.count}</div>
                  <div className="text-xs text-gray-400">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Tips */}
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-500/30 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">🚀 Global Performance Optimization</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-orange-400">💾</span>
                <div>
                  <div className="text-white font-medium">Implement Caching</div>
                  <div className="text-sm text-gray-400">Cache responses locally to reduce latency for repeat requests</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-orange-400">📦</span>
                <div>
                  <div className="text-white font-medium">Use Batch Endpoints</div>
                  <div className="text-sm text-gray-400">Combine multiple requests into single API calls</div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-orange-400">⚡</span>
                <div>
                  <div className="text-white font-medium">Optimistic Updates</div>
                  <div className="text-sm text-gray-400">Update UI immediately, sync with server in background</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-orange-400">🔄</span>
                <div>
                  <div className="text-white font-medium">Smart Retries</div>
                  <div className="text-sm text-gray-400">Use exponential backoff for transient failures</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a href="/status" className="text-orange-400 hover:text-orange-300 transition-colors">
            📊 System Status →
          </a>
          <a href="/reliability" className="text-orange-400 hover:text-orange-300 transition-colors">
            🎯 SLA & Reliability →
          </a>
          <a href="/heatmap" className="text-orange-400 hover:text-orange-300 transition-colors">
            🗓️ Response Time Heatmap →
          </a>
          <a href="/benchmarks" className="text-orange-400 hover:text-orange-300 transition-colors">
            ⚡ Benchmarks →
          </a>
        </div>
      </div>
    </main>
  );
}
