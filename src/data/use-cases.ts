export interface UseCase {
  id: string;
  title: string;
  description: string;
  icon: string;
  industry: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  agents: string[];
  problemStatement: string;
  solution: string;
  benefits: string[];
  codeSnippet: {
    language: string;
    code: string;
  };
  estimatedCost: string;
  implementationTime: string;
}

export const useCases: UseCase[] = [
  {
    id: 'crypto-portfolio-tracker',
    title: 'Crypto Portfolio Tracker',
    description: 'Build a real-time cryptocurrency portfolio tracker that monitors prices and calculates portfolio value in any fiat currency.',
    icon: '📈',
    industry: 'Finance',
    difficulty: 'beginner',
    agents: ['crypto-price-agent', 'fx-intel'],
    problemStatement: 'Investors need to track their crypto holdings across multiple coins while seeing values in their local currency.',
    solution: 'Combine Crypto Price Agent for real-time coin prices with FX Intel for currency conversion to build a unified portfolio dashboard.',
    benefits: [
      'Real-time portfolio valuation',
      'Support for 100+ cryptocurrencies',
      'Multi-currency display (USD, EUR, GBP, etc.)',
      'DeFi protocol TVL tracking',
    ],
    codeSnippet: {
      language: 'typescript',
      code: `// Fetch portfolio value with x402 micropayments
const holdings = { BTC: 0.5, ETH: 2.0, SOL: 50 };
const userCurrency = 'EUR';

// Get crypto prices
const prices = await fetch('https://crypto-price-agent.../prices', {
  headers: { 'X-402-Payment': paymentToken }
}).then(r => r.json());

// Convert to user currency
const rate = await fetch(\`https://fx-intel.../rate/USD/\${userCurrency}\`, {
  headers: { 'X-402-Payment': paymentToken }
}).then(r => r.json());

const totalValue = Object.entries(holdings)
  .reduce((sum, [coin, amount]) => 
    sum + (prices[coin] * amount * rate.rate), 0);`,
    },
    estimatedCost: '$0.001 per portfolio update',
    implementationTime: '1-2 hours',
  },
  {
    id: 'emergency-alert-system',
    title: 'Emergency Alert System',
    description: 'Build an automated disaster monitoring system that detects natural events and correlates with weather conditions.',
    icon: '🚨',
    industry: 'Public Safety',
    difficulty: 'intermediate',
    agents: ['natural-events-intel', 'weather-intel-agent'],
    problemStatement: 'Emergency services need early warning systems that detect natural disasters and understand weather factors affecting them.',
    solution: 'Use Natural Events Intel to detect wildfires, floods, and earthquakes, then Weather Intel to analyze conditions and predict spread patterns.',
    benefits: [
      'Real-time disaster detection from NASA EONET',
      'Weather correlation for risk assessment',
      'Air quality monitoring during events',
      'Geographic filtering for relevant alerts',
    ],
    codeSnippet: {
      language: 'typescript',
      code: `// Monitor natural events and correlate with weather
const events = await fetch('https://natural-events-intel.../events/active', {
  headers: { 'X-402-Payment': paymentToken }
}).then(r => r.json());

for (const event of events.filter(e => e.category === 'wildfires')) {
  const [lat, lon] = event.coordinates;
  
  // Check wind conditions at event location
  const weather = await fetch(
    \`https://weather-intel.../forecast?lat=\${lat}&lon=\${lon}\`,
    { headers: { 'X-402-Payment': paymentToken } }
  ).then(r => r.json());
  
  if (weather.windSpeed > 30) {
    sendAlert(\`High spread risk: \${event.title} - Wind: \${weather.windSpeed}mph\`);
  }
}`,
    },
    estimatedCost: '$0.005 per monitoring cycle',
    implementationTime: '3-4 hours',
  },
  {
    id: 'sports-betting-assistant',
    title: 'Sports Betting Assistant',
    description: 'Create a data-driven sports betting assistant that analyzes team stats, player performance, and odds across multiple sports.',
    icon: '🎯',
    industry: 'Gaming',
    difficulty: 'advanced',
    agents: ['nhl-stats-agent', 'premier-league-intel', 'ufc-intel', 'tennis-agent'],
    problemStatement: 'Sports bettors need comprehensive data analysis across multiple leagues to make informed decisions.',
    solution: 'Aggregate real-time stats from multiple sports agents to build predictive models and identify value bets.',
    benefits: [
      'Multi-sport coverage (NHL, Premier League, UFC, Tennis)',
      'Real-time game and player statistics',
      'Historical performance data',
      'Injury and lineup updates',
    ],
    codeSnippet: {
      language: 'typescript',
      code: `// Analyze upcoming NHL game
const game = await fetch('https://nhl-stats-agent.../games/today', {
  headers: { 'X-402-Payment': paymentToken }
}).then(r => r.json());

const homeTeam = await fetch(
  \`https://nhl-stats-agent.../team/\${game.homeTeamId}/stats\`,
  { headers: { 'X-402-Payment': paymentToken } }
).then(r => r.json());

const awayTeam = await fetch(
  \`https://nhl-stats-agent.../team/\${game.awayTeamId}/stats\`,
  { headers: { 'X-402-Payment': paymentToken } }
).then(r => r.json());

const analysis = {
  homeAdvantage: homeTeam.homeWinPct > 0.55,
  recentForm: homeTeam.last5Wins > awayTeam.last5Wins,
  goalsPerGame: homeTeam.goalsPerGame - awayTeam.goalsAgainstPerGame,
};`,
    },
    estimatedCost: '$0.01 per analysis',
    implementationTime: '6-8 hours',
  },
  {
    id: 'content-research-bot',
    title: 'Content Research Bot',
    description: 'Build an AI-powered research assistant that gathers facts, improves writing, and verifies information.',
    icon: '📝',
    industry: 'Media',
    difficulty: 'beginner',
    agents: ['wikipedia-intel', 'word-intel', 'wiki-intel'],
    problemStatement: 'Content creators need quick access to reliable facts, synonyms for better writing, and structured data for accuracy.',
    solution: 'Combine Wikipedia Intel for topic summaries, Word Intel for language improvement, and Wiki Intel for structured entity data.',
    benefits: [
      'Instant topic summaries and facts',
      'Synonym suggestions for varied writing',
      'Structured entity data from Wikidata',
      'Cross-reference verification',
    ],
    codeSnippet: {
      language: 'typescript',
      code: `// Research a topic and improve article language
const topic = 'Artificial Intelligence';

// Get topic summary
const summary = await fetch(
  \`https://wikipedia-intel.../summary/\${encodeURIComponent(topic)}\`,
  { headers: { 'X-402-Payment': paymentToken } }
).then(r => r.json());

// Get structured data
const entityData = await fetch(
  \`https://wiki-intel.../entity/\${topic}\`,
  { headers: { 'X-402-Payment': paymentToken } }
).then(r => r.json());

// Improve draft text with synonyms
const wordToImprove = 'important';
const synonyms = await fetch(
  \`https://word-intel.../synonyms/\${wordToImprove}\`,
  { headers: { 'X-402-Payment': paymentToken } }
).then(r => r.json());

// synonyms: ['crucial', 'significant', 'vital', 'essential']`,
    },
    estimatedCost: '$0.003 per research query',
    implementationTime: '2-3 hours',
  },
  {
    id: 'game-deals-notifier',
    title: 'Game Deals Notifier',
    description: 'Create a notification bot that monitors Steam for game deals and trending titles.',
    icon: '🎮',
    industry: 'Gaming',
    difficulty: 'beginner',
    agents: ['steam-analytics-agent'],
    problemStatement: 'Gamers want to be notified when their wishlist games go on sale or when new popular games are trending.',
    solution: 'Use Steam Analytics Agent to monitor prices, player counts, and trending games, then send notifications when criteria are met.',
    benefits: [
      'Real-time price tracking',
      'Trending game detection',
      'Player count monitoring',
      'Deal alert thresholds',
    ],
    codeSnippet: {
      language: 'typescript',
      code: `// Monitor wishlist games for deals
const wishlist = ['cyberpunk-2077', 'elden-ring', 'baldurs-gate-3'];

for (const gameId of wishlist) {
  const game = await fetch(
    \`https://steam-analytics.../game/\${gameId}\`,
    { headers: { 'X-402-Payment': paymentToken } }
  ).then(r => r.json());
  
  if (game.discountPercent > 30) {
    notify(\`\${game.name} is \${game.discountPercent}% off! Now $\${game.currentPrice}\`);
  }
}

// Also check trending games
const trending = await fetch('https://steam-analytics.../trending', {
  headers: { 'X-402-Payment': paymentToken }
}).then(r => r.json());

trending.slice(0, 5).forEach(game => 
  notify(\`Trending: \${game.name} - \${game.playerCount} players\`));`,
    },
    estimatedCost: '$0.002 per check',
    implementationTime: '1-2 hours',
  },
  {
    id: 'security-vulnerability-scanner',
    title: 'Security Vulnerability Scanner',
    description: 'Build a CI/CD security gate that scans dependencies for known vulnerabilities before deployment.',
    icon: '🛡️',
    industry: 'DevOps',
    difficulty: 'intermediate',
    agents: ['security-intel'],
    problemStatement: 'Development teams need automated security checks to prevent deploying code with known vulnerabilities.',
    solution: 'Integrate Security Intel into your CI/CD pipeline to scan package dependencies and block deployments with critical CVEs.',
    benefits: [
      'Automated vulnerability scanning',
      'CVE lookup with CVSS scores',
      'CISA KEV tracking for active exploits',
      'CI/CD integration ready',
    ],
    codeSnippet: {
      language: 'typescript',
      code: `// CI/CD security gate
const dependencies = require('./package-lock.json').packages;

const vulnerabilities = [];
for (const [pkg, info] of Object.entries(dependencies)) {
  const [name, version] = pkg.split('@');
  if (!name) continue;
  
  const scan = await fetch(
    \`https://security-intel.../scan/\${name}/\${version}\`,
    { headers: { 'X-402-Payment': paymentToken } }
  ).then(r => r.json());
  
  if (scan.vulnerabilities.some(v => v.severity === 'CRITICAL')) {
    vulnerabilities.push({ package: name, version, cves: scan.vulnerabilities });
  }
}

if (vulnerabilities.length > 0) {
  console.error('Critical vulnerabilities found!', vulnerabilities);
  process.exit(1); // Block deployment
}`,
    },
    estimatedCost: '$0.01 per scan (100 packages)',
    implementationTime: '2-3 hours',
  },
];

export const industries = [...new Set(useCases.map(uc => uc.industry))].sort();
export const difficulties = ['beginner', 'intermediate', 'advanced'] as const;
