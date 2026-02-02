export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  type: 'feature' | 'improvement' | 'fix' | 'breaking';
  description: string;
  items: string[];
}

export const changelog: ChangelogEntry[] = [
  {
    version: '2.8.0',
    date: '2026-02-02',
    title: 'SEO & Navigation Enhancements',
    type: 'feature',
    description: 'Improved site navigation and search engine optimization.',
    items: [
      'Added breadcrumb navigation with JSON-LD schema',
      'Custom 404 page with animated lobster',
      'Agent endpoint documentation pages',
      'Enhanced mobile hamburger menu with animations',
    ],
  },
  {
    version: '2.7.0',
    date: '2026-02-01',
    title: 'AI Crawler Optimization',
    type: 'feature',
    description: 'Made the site more discoverable by AI agents and search engines.',
    items: [
      'Auto-generated sitemap with all agents and pages',
      'AI-friendly robots.txt configuration',
      'Enhanced JSON-LD structured data (Organization, FAQ, Service schemas)',
      'Open Graph images for each agent',
      'Recent activity feed showing portfolio updates',
    ],
  },
  {
    version: '2.6.0',
    date: '2026-02-01',
    title: 'Performance & Metrics',
    type: 'feature',
    description: 'Added real-time performance insights and agent metrics.',
    items: [
      'Performance metrics display for each agent',
      'Agent categories navigation with counts',
      'RSS feed for blog posts',
      'Keyboard shortcuts for power users',
    ],
  },
  {
    version: '2.5.0',
    date: '2026-02-01',
    title: 'Interactive Tools',
    type: 'feature',
    description: 'New interactive features for exploring x402 agents.',
    items: [
      'Pricing calculator with cost estimates',
      'Interactive API playground for testing endpoints',
    ],
  },
  {
    version: '2.4.0',
    date: '2026-01-31',
    title: 'Agent Discovery',
    type: 'feature',
    description: 'Enhanced ways to discover and compare agents.',
    items: [
      'Agent comparison tool (side-by-side)',
      'Featured agent carousel on homepage',
      'Agent health status indicators with live pings',
      'Search and filter agents by domain/category',
    ],
  },
  {
    version: '2.3.0',
    date: '2026-01-31',
    title: 'User Engagement',
    type: 'feature',
    description: 'New features for connecting with users.',
    items: [
      'Newsletter signup for updates',
      'Contact form with email integration',
      'Testimonials and social proof section',
      'API usage analytics dashboard',
    ],
  },
  {
    version: '2.2.0',
    date: '2026-01-31',
    title: 'Dark Mode & Theming',
    type: 'feature',
    description: 'Visual customization options.',
    items: [
      'Dark/light mode toggle',
      'Theme persistence in localStorage',
      'Improved color contrast for accessibility',
    ],
  },
  {
    version: '2.1.0',
    date: '2026-01-30',
    title: 'Agent Portfolio Launch',
    type: 'feature',
    description: 'Initial public release of the x402 agent portfolio.',
    items: [
      'Agent grid with live status',
      'Individual agent detail pages',
      'Category-based browsing',
      'GitHub and Railway integrations',
    ],
  },
  {
    version: '2.0.0',
    date: '2026-01-29',
    title: 'Portfolio v2 Rebuild',
    type: 'breaking',
    description: 'Complete rebuild with Next.js 14 and modern stack.',
    items: [
      'Migrated to Next.js 14 App Router',
      'New Tailwind CSS design system',
      'TypeScript throughout',
      'Server-side rendering for SEO',
    ],
  },
];

export function getRecentChanges(limit = 5): ChangelogEntry[] {
  return changelog.slice(0, limit);
}

export function getChangesByType(type: ChangelogEntry['type']): ChangelogEntry[] {
  return changelog.filter(entry => entry.type === type);
}
