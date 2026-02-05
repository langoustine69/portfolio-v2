export interface AgentBundle {
  id: string;
  name: string;
  description: string;
  icon: string;
  agentIds: string[];
  useCase: string;
  benefits: string[];
  exampleWorkflow?: string;
}

export const bundles: AgentBundle[] = [
  {
    id: 'financial-stack',
    name: 'Financial Stack',
    description: 'Complete financial data toolkit for trading bots, portfolio trackers, and fintech agents.',
    icon: '💰',
    agentIds: ['crypto-price-agent', 'fx-intel'],
    useCase: 'Trading bots, portfolio management, financial dashboards',
    benefits: [
      'Real-time crypto + fiat coverage',
      'Cross-asset price correlation',
      'Currency conversion for global portfolios',
      'DeFi TVL tracking',
    ],
    exampleWorkflow: 'Portfolio tracker checks crypto prices → converts to user currency via FX Intel → displays unified dashboard',
  },
  {
    id: 'sports-desk',
    name: 'Sports Desk',
    description: 'Full sports coverage for betting agents, sports news bots, and fan engagement apps.',
    icon: '🏆',
    agentIds: ['nhl-stats-agent', 'premier-league-intel', 'golf-intel', 'ufc-intel', 'tennis-agent'],
    useCase: 'Sports betting, live score apps, fan engagement, sports journalism',
    benefits: [
      'Multi-sport live scores',
      'Player and team statistics',
      'Event schedules across sports',
      'Real-time updates during games',
    ],
    exampleWorkflow: 'News bot monitors all sports → aggregates highlights → pushes personalized updates to fans',
  },
  {
    id: 'emergency-response',
    name: 'Emergency Response',
    description: 'Real-time environmental intelligence for disaster monitoring and emergency preparedness.',
    icon: '🚨',
    agentIds: ['natural-events-intel', 'weather-intel-agent'],
    useCase: 'Disaster monitoring, emergency alerts, insurance risk assessment, logistics planning',
    benefits: [
      'Natural disaster tracking (wildfires, earthquakes, floods)',
      'Weather forecasts and severe alerts',
      'Air quality monitoring',
      'Geographic event correlation',
    ],
    exampleWorkflow: 'Emergency bot detects wildfire via EONET → checks weather conditions → sends evacuation alerts based on wind direction',
  },
  {
    id: 'knowledge-base',
    name: 'Knowledge Base',
    description: 'Rich knowledge and language tools for content creation, research, and educational agents.',
    icon: '📚',
    agentIds: ['wikipedia-intel', 'wiki-intel', 'word-intel'],
    useCase: 'Content creation, research assistants, educational tools, fact-checking',
    benefits: [
      'Wikipedia summaries and current events',
      'Wikidata structured knowledge',
      'Definitions, synonyms, and language tools',
      'Entity linking and disambiguation',
    ],
    exampleWorkflow: 'Research agent queries topic → enriches with Wikidata → improves writing with Word Intel synonyms',
  },
  {
    id: 'security-ops',
    name: 'Security Operations',
    description: 'Vulnerability and threat intelligence for security automation and DevSecOps pipelines.',
    icon: '🛡️',
    agentIds: ['security-intel'],
    useCase: 'Vulnerability scanning, compliance monitoring, threat intelligence, DevSecOps',
    benefits: [
      'CISA KEV exploit tracking',
      'Package vulnerability scanning',
      'CVE lookup with CVSS scores',
      'IP intelligence and port scans',
    ],
    exampleWorkflow: 'CI/CD pipeline scans dependencies → checks CVEs → blocks deploy if critical vulnerabilities found',
  },
  {
    id: 'gaming-analytics',
    name: 'Gaming Analytics',
    description: 'Player metrics and game trends for gaming communities and market research.',
    icon: '🎮',
    agentIds: ['steam-analytics-agent'],
    useCase: 'Gaming communities, market research, content creators, game discovery',
    benefits: [
      'Real-time player counts',
      'Trending game detection',
      'Price tracking for deals',
      'Genre and tag analysis',
    ],
    exampleWorkflow: 'Discord bot monitors trending games → announces when favorites spike → suggests similar titles',
  },
];
