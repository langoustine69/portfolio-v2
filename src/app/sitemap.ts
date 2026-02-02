import { MetadataRoute } from 'next';
import { agents } from '@/data/agents';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://langoustine69.dev';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guides/quickstart`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/api/agents`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/changelog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/status`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
  ];

  // Dynamic agent pages
  const agentPages: MetadataRoute.Sitemap = agents.map((agent) => ({
    url: `${baseUrl}/agents/${agent.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: agent.status === 'live' ? 0.9 : 0.5,
  }));

  // Category-based URLs (for SEO)
  const categories = [...new Set(agents.map(a => a.category))];
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/?category=${encodeURIComponent(category)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...agentPages, ...categoryPages];
}
