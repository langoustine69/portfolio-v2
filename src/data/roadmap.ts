export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: 'shipped' | 'in-progress' | 'planned' | 'considering';
  category: 'agent' | 'feature' | 'integration' | 'infrastructure';
  eta?: string; // e.g., "Q1 2026", "Feb 2026"
  icon: string;
  votes?: number;
  shippedDate?: string;
}

export const roadmapItems: RoadmapItem[] = [
  // Shipped
  {
    id: 'natural-events-intel',
    title: 'Natural Events Intel Agent',
    description: 'Real-time natural events from NASA EONET - wildfires, floods, storms, volcanoes.',
    status: 'shipped',
    category: 'agent',
    icon: '🌋',
    shippedDate: '2026-01-28',
  },
  {
    id: 'weather-intel-agent',
    title: 'Weather Intel Agent',
    description: 'Multi-source weather intelligence with forecasts, air quality, and severe alerts.',
    status: 'shipped',
    category: 'agent',
    icon: '🌤️',
    shippedDate: '2026-01-25',
  },
  {
    id: 'agent-leaderboard',
    title: 'Agent Leaderboard',
    description: 'Rankings page showing top agents by popularity, uptime, and performance.',
    status: 'shipped',
    category: 'feature',
    icon: '🏆',
    shippedDate: '2026-02-05',
  },
  {
    id: 'discovery-quiz',
    title: 'Agent Discovery Quiz',
    description: 'Interactive wizard to help users find the right agent for their needs.',
    status: 'shipped',
    category: 'feature',
    icon: '🎯',
    shippedDate: '2026-02-05',
  },
  {
    id: 'i18n-support',
    title: 'Multi-language Support',
    description: 'Full translation coverage for 6 languages: EN, ES, ZH, JA, DE, FR.',
    status: 'shipped',
    category: 'feature',
    icon: '🌐',
    shippedDate: '2026-02-04',
  },

  // In Progress
  {
    id: 'sentiment-agent',
    title: 'Social Sentiment Agent',
    description: 'Real-time sentiment analysis from X/Twitter and Reddit for any topic or token.',
    status: 'in-progress',
    category: 'agent',
    icon: '📊',
    eta: 'Feb 2026',
    votes: 47,
  },
  {
    id: 'flight-tracker',
    title: 'Flight Tracker Agent',
    description: 'Live flight tracking with delays, cancellations, and airport status updates.',
    status: 'in-progress',
    category: 'agent',
    icon: '✈️',
    eta: 'Feb 2026',
    votes: 38,
  },
  {
    id: 'webhook-notifications',
    title: 'Webhook Notifications',
    description: 'Subscribe to agent events via webhooks for status changes and alerts.',
    status: 'in-progress',
    category: 'feature',
    icon: '🔔',
    eta: 'Feb 2026',
    votes: 52,
  },

  // Planned
  {
    id: 'music-charts-agent',
    title: 'Music Charts Agent',
    description: 'Billboard, Spotify, and Apple Music chart data in real-time.',
    status: 'planned',
    category: 'agent',
    icon: '🎵',
    eta: 'Q1 2026',
    votes: 29,
  },
  {
    id: 'earthquake-agent',
    title: 'Earthquake Monitoring Agent',
    description: 'USGS earthquake data with magnitude, location, and tsunami alerts.',
    status: 'planned',
    category: 'agent',
    icon: '🌍',
    eta: 'Q1 2026',
    votes: 34,
  },
  {
    id: 'gas-price-agent',
    title: 'Gas Price Agent',
    description: 'Real-time fuel prices by location across US and Europe.',
    status: 'planned',
    category: 'agent',
    icon: '⛽',
    eta: 'Q1 2026',
    votes: 22,
  },
  {
    id: 'sdk-generation',
    title: 'Auto SDK Generation',
    description: 'Automatically generate TypeScript and Python SDKs for all agents.',
    status: 'planned',
    category: 'feature',
    icon: '📦',
    eta: 'Q1 2026',
    votes: 61,
  },
  {
    id: 'usage-dashboard',
    title: 'Developer Usage Dashboard',
    description: 'Track your API usage, costs, and quotas across all agents.',
    status: 'planned',
    category: 'feature',
    icon: '📈',
    eta: 'Q2 2026',
    votes: 45,
  },

  // Considering
  {
    id: 'movie-showtimes',
    title: 'Movie Showtimes Agent',
    description: 'Cinema showtimes and movie info by location.',
    status: 'considering',
    category: 'agent',
    icon: '🎬',
    votes: 18,
  },
  {
    id: 'package-tracker',
    title: 'Package Tracking Agent',
    description: 'Multi-carrier package tracking (UPS, FedEx, USPS, DHL).',
    status: 'considering',
    category: 'agent',
    icon: '📦',
    votes: 31,
  },
  {
    id: 'transit-agent',
    title: 'Public Transit Agent',
    description: 'Real-time public transit data for major cities worldwide.',
    status: 'considering',
    category: 'agent',
    icon: '🚇',
    votes: 24,
  },
  {
    id: 'rate-limiting-tiers',
    title: 'Premium Rate Limit Tiers',
    description: 'Higher rate limits for power users via subscription.',
    status: 'considering',
    category: 'infrastructure',
    icon: '⚡',
    votes: 15,
  },
  {
    id: 'agent-chaining',
    title: 'Agent Chaining / Workflows',
    description: 'Chain multiple agents together for complex data pipelines.',
    status: 'considering',
    category: 'feature',
    icon: '🔗',
    votes: 56,
  },
];

export function getItemsByStatus(status: RoadmapItem['status']): RoadmapItem[] {
  return roadmapItems
    .filter(item => item.status === status)
    .sort((a, b) => (b.votes || 0) - (a.votes || 0));
}

export function getRecentlyShipped(limit = 5): RoadmapItem[] {
  return roadmapItems
    .filter(item => item.status === 'shipped' && item.shippedDate)
    .sort((a, b) => new Date(b.shippedDate!).getTime() - new Date(a.shippedDate!).getTime())
    .slice(0, limit);
}
