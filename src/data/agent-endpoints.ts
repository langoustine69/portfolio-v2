// Agent endpoint documentation data
export interface EndpointParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: string;
}

export interface EndpointDoc {
  path: string;
  method: 'GET' | 'POST';
  name: string;
  description: string;
  paid: boolean;
  params?: EndpointParam[];
  exampleResponse?: object;
  notes?: string;
}

// Default Lucid Agent endpoints (all agents have these)
export const defaultEndpoints: EndpointDoc[] = [
  {
    path: '/',
    method: 'GET',
    name: 'Health Check',
    description: 'Returns agent status and basic info.',
    paid: false,
    exampleResponse: { status: 'ok', agent: 'agent-name', version: '1.0.0' },
  },
  {
    path: '/.well-known/agent.json',
    method: 'GET',
    name: 'Agent Manifest',
    description: 'A2A discovery manifest with agent capabilities, entrypoints, and payment info.',
    paid: false,
    exampleResponse: {
      name: 'Agent Name',
      description: 'Agent description',
      entrypoints: ['overview', 'search'],
      payments: { required: true, currency: 'USDC', network: 'base' },
    },
  },
];

// Agent-specific endpoint configurations
export const agentEndpoints: Record<string, EndpointDoc[]> = {
  'golf-intel': [
    {
      path: '/entrypoints/overview/invoke',
      method: 'POST',
      name: 'Overview',
      description: 'Get comprehensive golf overview including live scores, upcoming events, and recent results.',
      paid: false,
      exampleResponse: {
        pga_leaderboard: { event: 'The Masters', leader: 'Player Name', score: '-12' },
        lpga_scores: [],
        upcoming_events: [],
      },
    },
    {
      path: '/entrypoints/pga-leaderboard/invoke',
      method: 'POST',
      name: 'PGA Leaderboard',
      description: 'Current PGA Tour event leaderboard with player positions and scores.',
      paid: true,
      exampleResponse: { event: 'Tournament Name', leaderboard: [] },
    },
    {
      path: '/entrypoints/lpga-scores/invoke',
      method: 'POST',
      name: 'LPGA Scores',
      description: 'LPGA Tour scores and standings.',
      paid: true,
    },
    {
      path: '/entrypoints/player-scorecard/invoke',
      method: 'POST',
      name: 'Player Scorecard',
      description: 'Detailed scorecard for a specific player.',
      paid: true,
      params: [
        { name: 'player', type: 'string', required: true, description: 'Player name to search', example: 'Scottie Scheffler' },
      ],
    },
    {
      path: '/entrypoints/full-report/invoke',
      method: 'POST',
      name: 'Full Report',
      description: 'Comprehensive golf report across all tours.',
      paid: true,
    },
  ],

  'premier-league-intel': [
    {
      path: '/entrypoints/overview/invoke',
      method: 'POST',
      name: 'Overview',
      description: 'Premier League overview with live scores and standings.',
      paid: false,
    },
    {
      path: '/entrypoints/live-scores/invoke',
      method: 'POST',
      name: 'Live Scores',
      description: 'Current live match scores.',
      paid: true,
    },
    {
      path: '/entrypoints/standings/invoke',
      method: 'POST',
      name: 'Standings',
      description: 'Full league table with points, goal difference, and form.',
      paid: true,
    },
    {
      path: '/entrypoints/team-search/invoke',
      method: 'POST',
      name: 'Team Search',
      description: 'Search for team information.',
      paid: true,
      params: [
        { name: 'query', type: 'string', required: true, description: 'Team name to search', example: 'Arsenal' },
      ],
    },
  ],

  'wikipedia-intel': [
    {
      path: '/entrypoints/overview/invoke',
      method: 'POST',
      name: 'Overview',
      description: 'Daily digest of current events, trending articles, and historical facts.',
      paid: false,
    },
    {
      path: '/entrypoints/current-news/invoke',
      method: 'POST',
      name: 'Current News',
      description: 'Wikipedia current events and news.',
      paid: true,
    },
    {
      path: '/entrypoints/on-this-day/invoke',
      method: 'POST',
      name: 'On This Day',
      description: 'Historical events that happened on this date.',
      paid: true,
    },
    {
      path: '/entrypoints/article-lookup/invoke',
      method: 'POST',
      name: 'Article Lookup',
      description: 'Fetch Wikipedia article content.',
      paid: true,
      params: [
        { name: 'title', type: 'string', required: true, description: 'Article title', example: 'Artificial_intelligence' },
      ],
    },
  ],

  'sports-data-agent': [
    {
      path: '/entrypoints/overview/invoke',
      method: 'POST',
      name: 'Overview',
      description: 'Multi-sport dashboard with live scores across all leagues.',
      paid: false,
    },
    {
      path: '/entrypoints/live-scores/invoke',
      method: 'POST',
      name: 'Live Scores',
      description: 'Live scores for a specific league.',
      paid: true,
      params: [
        { name: 'league', type: 'string', required: true, description: 'League code (nfl, nba, mlb, nhl, epl, laliga, bundesliga, seriea, ligue1, mls, liga-mx, ucl)', example: 'nba' },
      ],
    },
    {
      path: '/entrypoints/standings/invoke',
      method: 'POST',
      name: 'Standings',
      description: 'Current league standings/table.',
      paid: true,
      params: [
        { name: 'league', type: 'string', required: true, description: 'League code', example: 'epl' },
      ],
    },
    {
      path: '/entrypoints/team-info/invoke',
      method: 'POST',
      name: 'Team Info',
      description: 'Detailed team information.',
      paid: true,
      params: [
        { name: 'league', type: 'string', required: true, description: 'League code', example: 'nba' },
        { name: 'team', type: 'string', required: true, description: 'Team name', example: 'Lakers' },
      ],
    },
  ],

  'hn-intel': [
    {
      path: '/entrypoints/overview/invoke',
      method: 'POST',
      name: 'Overview',
      description: 'Top Hacker News stories and trending discussions.',
      paid: false,
    },
    {
      path: '/entrypoints/top-stories/invoke',
      method: 'POST',
      name: 'Top Stories',
      description: 'Current top stories from HN front page.',
      paid: true,
      params: [
        { name: 'limit', type: 'number', required: false, description: 'Number of stories (default: 10)', example: '20' },
      ],
    },
    {
      path: '/entrypoints/story-details/invoke',
      method: 'POST',
      name: 'Story Details',
      description: 'Get full story with comments.',
      paid: true,
      params: [
        { name: 'id', type: 'number', required: true, description: 'HN story ID', example: '12345678' },
      ],
    },
  ],

  'ai-model-registry': [
    {
      path: '/entrypoints/overview/invoke',
      method: 'POST',
      name: 'Overview',
      description: 'Summary of available AI models and top picks by category.',
      paid: false,
    },
    {
      path: '/entrypoints/model-lookup/invoke',
      method: 'POST',
      name: 'Model Lookup',
      description: 'Get detailed info about a specific model.',
      paid: true,
      params: [
        { name: 'model', type: 'string', required: true, description: 'Model ID', example: 'anthropic/claude-3-opus' },
      ],
    },
    {
      path: '/entrypoints/compare/invoke',
      method: 'POST',
      name: 'Compare Models',
      description: 'Compare multiple models side-by-side.',
      paid: true,
      params: [
        { name: 'models', type: 'string[]', required: true, description: 'Array of model IDs to compare', example: '["gpt-4", "claude-3-opus"]' },
      ],
    },
    {
      path: '/entrypoints/search/invoke',
      method: 'POST',
      name: 'Search Models',
      description: 'Search models by name, provider, or capability.',
      paid: true,
      params: [
        { name: 'query', type: 'string', required: true, description: 'Search query', example: 'vision' },
      ],
    },
  ],

  'defi-intel': [
    {
      path: '/entrypoints/overview/invoke',
      method: 'POST',
      name: 'Overview',
      description: 'DeFi market overview with total TVL and top protocols.',
      paid: false,
    },
    {
      path: '/entrypoints/chain-tvl/invoke',
      method: 'POST',
      name: 'Chain TVL',
      description: 'Total Value Locked by blockchain.',
      paid: true,
      params: [
        { name: 'chain', type: 'string', required: false, description: 'Chain name (optional, returns all if omitted)', example: 'ethereum' },
      ],
    },
    {
      path: '/entrypoints/protocol-lookup/invoke',
      method: 'POST',
      name: 'Protocol Lookup',
      description: 'Detailed protocol information.',
      paid: true,
      params: [
        { name: 'protocol', type: 'string', required: true, description: 'Protocol name', example: 'aave' },
      ],
    },
    {
      path: '/entrypoints/top-yields/invoke',
      method: 'POST',
      name: 'Top Yields',
      description: 'Highest yield opportunities across DeFi.',
      paid: true,
    },
  ],

  'ip-intel-agent': [
    {
      path: '/entrypoints/overview/invoke',
      method: 'POST',
      name: 'Overview',
      description: 'Sample IP intelligence demonstration.',
      paid: false,
    },
    {
      path: '/entrypoints/lookup/invoke',
      method: 'POST',
      name: 'IP Lookup',
      description: 'Full intelligence on an IP address from 3 sources.',
      paid: true,
      params: [
        { name: 'ip', type: 'string', required: true, description: 'IPv4 or IPv6 address', example: '8.8.8.8' },
      ],
      exampleResponse: {
        ip: '8.8.8.8',
        country: 'United States',
        city: 'Mountain View',
        isp: 'Google LLC',
        is_proxy: false,
        is_vpn: false,
      },
    },
    {
      path: '/entrypoints/batch/invoke',
      method: 'POST',
      name: 'Batch Lookup',
      description: 'Look up multiple IPs at once.',
      paid: true,
      params: [
        { name: 'ips', type: 'string[]', required: true, description: 'Array of IP addresses', example: '["8.8.8.8", "1.1.1.1"]' },
      ],
    },
  ],

  'domain-intel': [
    {
      path: '/entrypoints/overview/invoke',
      method: 'POST',
      name: 'Overview',
      description: 'Domain intelligence overview.',
      paid: false,
    },
    {
      path: '/entrypoints/dns/invoke',
      method: 'POST',
      name: 'DNS Records',
      description: 'DNS record lookup (A, AAAA, MX, TXT, etc.).',
      paid: true,
      params: [
        { name: 'domain', type: 'string', required: true, description: 'Domain name', example: 'example.com' },
        { name: 'type', type: 'string', required: false, description: 'Record type (default: A)', example: 'MX' },
      ],
    },
    {
      path: '/entrypoints/ssl/invoke',
      method: 'POST',
      name: 'SSL Certificates',
      description: 'SSL/TLS certificate information.',
      paid: true,
      params: [
        { name: 'domain', type: 'string', required: true, description: 'Domain name', example: 'google.com' },
      ],
    },
    {
      path: '/entrypoints/full-report/invoke',
      method: 'POST',
      name: 'Full Report',
      description: 'Complete domain intelligence report.',
      paid: true,
      params: [
        { name: 'domain', type: 'string', required: true, description: 'Domain name', example: 'github.com' },
      ],
    },
  ],

  'github-dev-intel': [
    {
      path: '/entrypoints/overview/invoke',
      method: 'POST',
      name: 'Overview',
      description: 'GitHub trending repos and activity.',
      paid: false,
    },
    {
      path: '/entrypoints/trending/invoke',
      method: 'POST',
      name: 'Trending Repos',
      description: 'Trending repositories by language.',
      paid: true,
      params: [
        { name: 'language', type: 'string', required: false, description: 'Programming language filter', example: 'typescript' },
        { name: 'since', type: 'string', required: false, description: 'Time range: daily, weekly, monthly', example: 'weekly' },
      ],
    },
    {
      path: '/entrypoints/repo-stats/invoke',
      method: 'POST',
      name: 'Repo Stats',
      description: 'Repository statistics and info.',
      paid: true,
      params: [
        { name: 'repo', type: 'string', required: true, description: 'Repository (owner/name)', example: 'vercel/next.js' },
      ],
    },
    {
      path: '/entrypoints/compare/invoke',
      method: 'POST',
      name: 'Compare Repos',
      description: 'Compare multiple repositories.',
      paid: true,
      params: [
        { name: 'repos', type: 'string[]', required: true, description: 'Array of repos to compare', example: '["facebook/react", "vuejs/vue"]' },
      ],
    },
  ],

  'sec-filings-agent': [
    {
      path: '/entrypoints/overview/invoke',
      method: 'POST',
      name: 'Overview',
      description: 'Recent SEC filings overview.',
      paid: false,
    },
    {
      path: '/entrypoints/company-lookup/invoke',
      method: 'POST',
      name: 'Company Lookup',
      description: 'Look up company by ticker symbol.',
      paid: true,
      params: [
        { name: 'ticker', type: 'string', required: true, description: 'Stock ticker symbol', example: 'AAPL' },
      ],
    },
    {
      path: '/entrypoints/filings/invoke',
      method: 'POST',
      name: 'Get Filings',
      description: 'Search company SEC filings.',
      paid: true,
      params: [
        { name: 'ticker', type: 'string', required: true, description: 'Stock ticker', example: 'TSLA' },
        { name: 'type', type: 'string', required: false, description: 'Filing type (10-K, 10-Q, 8-K)', example: '10-K' },
      ],
    },
    {
      path: '/entrypoints/insider-trades/invoke',
      method: 'POST',
      name: 'Insider Trades',
      description: 'Form 4 insider trading data.',
      paid: true,
      params: [
        { name: 'ticker', type: 'string', required: true, description: 'Stock ticker', example: 'NVDA' },
      ],
    },
  ],
};

// Get endpoints for an agent
export function getAgentEndpoints(agentId: string): EndpointDoc[] {
  const specific = agentEndpoints[agentId] || [];
  
  // If agent has specific endpoints defined, use them with defaults
  if (specific.length > 0) {
    return [...defaultEndpoints, ...specific];
  }
  
  // Generic fallback for agents without specific docs
  return [
    ...defaultEndpoints,
    {
      path: '/entrypoints/overview/invoke',
      method: 'POST',
      name: 'Overview',
      description: 'Get an overview of available data from this agent.',
      paid: false,
    },
  ];
}
