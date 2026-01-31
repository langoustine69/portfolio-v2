import { agents, getLiveAgents } from '@/data/agents';

export interface AgentAnalytics {
  id: string;
  name: string;
  icon: string;
  totalRequests: number;
  weeklyRequests: number;
  revenue: number;  // in USDC cents
  avgLatency: number;  // in ms
  uptime: number;  // percentage
  dailyRequests: number[];  // last 7 days
}

export interface PortfolioStats {
  totalRequests: number;
  totalRevenue: number;
  avgLatency: number;
  avgUptime: number;
  liveAgents: number;
  requestsToday: number;
  revenueToday: number;
}

// Generate deterministic mock data based on agent id
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function generateAgentAnalytics(): AgentAnalytics[] {
  const liveAgents = getLiveAgents();
  
  return liveAgents.map(agent => {
    const seed = hashString(agent.id);
    const baseRequests = Math.floor(seededRandom(seed) * 8000) + 2000;
    const weeklyMultiplier = seededRandom(seed + 1) * 0.3 + 0.15;
    const weeklyRequests = Math.floor(baseRequests * weeklyMultiplier);
    
    // Generate daily requests for last 7 days
    const dailyRequests = Array.from({ length: 7 }, (_, i) => {
      const dayVariance = seededRandom(seed + i + 100) * 0.4 + 0.8;
      return Math.floor((weeklyRequests / 7) * dayVariance);
    });
    
    // Revenue at $0.001 - $0.01 per request
    const pricePerRequest = (seededRandom(seed + 2) * 0.009 + 0.001);
    const revenue = Math.floor(baseRequests * pricePerRequest * 100); // in cents
    
    return {
      id: agent.id,
      name: agent.name,
      icon: agent.icon,
      totalRequests: baseRequests,
      weeklyRequests,
      revenue,
      avgLatency: Math.floor(seededRandom(seed + 3) * 150) + 50,
      uptime: 98 + seededRandom(seed + 4) * 2,
      dailyRequests,
    };
  }).sort((a, b) => b.totalRequests - a.totalRequests);
}

export function getPortfolioStats(): PortfolioStats {
  const analytics = generateAgentAnalytics();
  const liveAgents = getLiveAgents();
  
  const totalRequests = analytics.reduce((sum, a) => sum + a.totalRequests, 0);
  const totalRevenue = analytics.reduce((sum, a) => sum + a.revenue, 0);
  const avgLatency = Math.floor(analytics.reduce((sum, a) => sum + a.avgLatency, 0) / analytics.length);
  const avgUptime = analytics.reduce((sum, a) => sum + a.uptime, 0) / analytics.length;
  
  const requestsToday = analytics.reduce((sum, a) => sum + a.dailyRequests[6], 0);
  const revenueToday = Math.floor((totalRevenue / totalRequests) * requestsToday);
  
  return {
    totalRequests,
    totalRevenue,
    avgLatency,
    avgUptime,
    liveAgents: liveAgents.length,
    requestsToday,
    revenueToday,
  };
}

export function formatUSDC(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}
