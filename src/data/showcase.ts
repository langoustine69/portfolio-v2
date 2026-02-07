// Community Showcase - Projects built with x402 agents

export interface ShowcaseProject {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  image: string;
  logo?: string;
  url?: string;
  github?: string;
  author: {
    name: string;
    avatar: string;
    handle?: string;
  };
  agents: string[]; // Which agents they use
  category: 'app' | 'dashboard' | 'bot' | 'integration' | 'research' | 'game';
  tags: string[];
  featured?: boolean;
  stats?: {
    users?: string;
    requests?: string;
    stars?: number;
  };
  launchDate: string;
}

export const showcaseProjects: ShowcaseProject[] = [
  {
    id: 'fantasyfooty',
    name: 'FantasyFooty Pro',
    description: 'AI-powered fantasy AFL assistant with real-time player recommendations',
    longDescription: 'FantasyFooty Pro uses AFL Stats Agent to provide real-time player performance analysis, injury updates, and lineup suggestions. Built by sports data enthusiasts for the fantasy sports community.',
    image: '🏈',
    author: { name: 'Alex Torres', avatar: '👨‍💻', handle: '@alextorresdev' },
    agents: ['afl-stats-agent'],
    category: 'app',
    tags: ['AFL', 'Fantasy Sports', 'Mobile App'],
    featured: true,
    stats: { users: '12K+', requests: '500K/month', stars: 234 },
    launchDate: '2025-11-01',
  },
  {
    id: 'solarwatch',
    name: 'SolarWatch Dashboard',
    description: 'Mission control for satellite operators monitoring space weather in real-time',
    longDescription: 'SolarWatch integrates Space Weather Agent to provide instant alerts on solar flares, geomagnetic storms, and radiation events. Critical for satellite ops teams.',
    image: '🛰️',
    author: { name: 'Dr. Priya Sharma', avatar: '🚀', handle: '@priyaspace' },
    agents: ['space-weather-agent'],
    category: 'dashboard',
    tags: ['Aerospace', 'Real-time', 'B2B'],
    featured: true,
    stats: { users: '50+', requests: '1M/month' },
    launchDate: '2025-09-15',
  },
  {
    id: 'defibot',
    name: 'DeFi Sentinel',
    description: 'Telegram bot for crypto sentiment alerts and whale movement tracking',
    longDescription: 'DeFi Sentinel combines multiple agents to deliver instant Telegram notifications on market sentiment shifts, large wallet movements, and trending tokens.',
    image: '🤖',
    author: { name: 'CryptoMarcus', avatar: '⛓️', handle: '@cryptomarcus' },
    agents: ['crypto-sentiment-agent', 'defi-analytics-agent'],
    category: 'bot',
    tags: ['DeFi', 'Telegram', 'Alerts'],
    featured: true,
    stats: { users: '8K+', requests: '2M/month' },
    launchDate: '2025-10-20',
  },
  {
    id: 'f1insights',
    name: 'F1 Insights Hub',
    description: 'Race prediction engine powered by telemetry data and ML models',
    longDescription: 'Combines F1 Telemetry Agent data with custom machine learning models to predict race outcomes, optimal pit strategies, and driver performance trends.',
    image: '🏎️',
    author: { name: 'Emma Rodriguez', avatar: '📊', handle: '@emmadata' },
    agents: ['f1-telemetry-agent'],
    category: 'research',
    tags: ['F1', 'Machine Learning', 'Predictions'],
    stats: { users: '5K+', stars: 127 },
    launchDate: '2025-12-01',
  },
  {
    id: 'newsdigest',
    name: 'TechPulse Daily',
    description: 'Automated newsletter generator aggregating tech news with AI summaries',
    longDescription: 'TechPulse uses Tech News Agent to curate daily briefings, automatically generating summaries and sending personalized newsletters to subscribers.',
    image: '📰',
    author: { name: 'Jordan Lee', avatar: '📧', handle: '@jordandev' },
    agents: ['tech-news-agent'],
    category: 'integration',
    tags: ['Newsletter', 'Automation', 'AI Summary'],
    stats: { users: '25K subscribers' },
    launchDate: '2025-08-10',
  },
  {
    id: 'yieldradar',
    name: 'Yield Radar',
    description: 'DeFi yield optimization dashboard tracking APYs across 50+ protocols',
    longDescription: 'Yield Radar aggregates data from DeFi Analytics Agent to help users find the best yield opportunities, track impermanent loss, and optimize their positions.',
    image: '💰',
    author: { name: 'Wei Chen', avatar: '💹', handle: '@weidefi' },
    agents: ['defi-analytics-agent'],
    category: 'dashboard',
    tags: ['DeFi', 'Yield Farming', 'Analytics'],
    stats: { users: '3K+', requests: '800K/month' },
    launchDate: '2025-11-15',
  },
  {
    id: 'spacetrivia',
    name: 'Cosmic Trivia',
    description: 'Mobile game featuring daily space facts and astronomy quizzes',
    longDescription: 'Cosmic Trivia pulls real-time space data to generate dynamic trivia questions about current astronomical events, satellite positions, and space weather.',
    image: '🌌',
    author: { name: 'Astro Games', avatar: '🎮' },
    agents: ['space-weather-agent'],
    category: 'game',
    tags: ['Education', 'Gaming', 'Mobile'],
    stats: { users: '50K downloads' },
    launchDate: '2025-07-01',
  },
  {
    id: 'squadbuilder',
    name: 'NRL Squad Builder',
    description: 'Visual team builder with salary cap management for NRL fantasy',
    longDescription: 'Interactive tool that uses NRL Stats Agent to help fantasy managers build optimal squads within salary cap constraints, with historical performance data.',
    image: '🏉',
    author: { name: 'RugbyTech', avatar: '🦘', handle: '@rugbytech' },
    agents: ['nrl-stats-agent'],
    category: 'app',
    tags: ['NRL', 'Fantasy Sports', 'Web App'],
    stats: { users: '6K+' },
    launchDate: '2026-01-05',
  },
];

export const getShowcaseByCategory = (category: ShowcaseProject['category']) =>
  showcaseProjects.filter(p => p.category === category);

export const getFeaturedProjects = () =>
  showcaseProjects.filter(p => p.featured);

export const getProjectsByAgent = (agentId: string) =>
  showcaseProjects.filter(p => p.agents.includes(agentId));

export const categoryMeta: Record<ShowcaseProject['category'], { icon: string; label: string }> = {
  app: { icon: '📱', label: 'Applications' },
  dashboard: { icon: '📊', label: 'Dashboards' },
  bot: { icon: '🤖', label: 'Bots' },
  integration: { icon: '🔗', label: 'Integrations' },
  research: { icon: '🔬', label: 'Research' },
  game: { icon: '🎮', label: 'Games' },
};
