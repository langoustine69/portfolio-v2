#!/usr/bin/env npx ts-node
/**
 * Sitemap & IndexNow Ping Script
 * 
 * Notifies search engines about content updates after deploy.
 * Uses IndexNow protocol (supported by Bing, Yandex, Naver, Seznam, DuckDuckGo).
 * 
 * Note: Google deprecated sitemap ping in June 2023. They recommend:
 * - Proper <lastmod> in sitemap
 * - Submitting sitemap via Search Console
 * 
 * Usage: npx ts-node scripts/ping-sitemaps.ts
 * Or:    npm run ping-sitemaps
 */

const SITE_URL = 'https://langoustine69.dev';
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;
const INDEXNOW_KEY = 'langoustine69-indexnow';

interface PingResult {
  engine: string;
  url: string;
  status: 'success' | 'failed' | 'deprecated';
  statusCode?: number;
  message?: string;
}

// IndexNow endpoints - all share the same key
const INDEXNOW_ENDPOINTS = [
  { name: 'Bing/IndexNow', host: 'www.bing.com' },
  { name: 'Yandex', host: 'yandex.com' },
  { name: 'Naver', host: 'searchadvisor.naver.com' },
  { name: 'Seznam', host: 'search.seznam.cz' },
];

// Key pages to notify about (most important for SEO)
const KEY_URLS = [
  SITE_URL,
  `${SITE_URL}/agents`,
  `${SITE_URL}/compare`,
  `${SITE_URL}/blog`,
  `${SITE_URL}/status`,
  `${SITE_URL}/sitemap.xml`,
];

async function pingIndexNow(
  endpoint: { name: string; host: string },
  urls: string[]
): Promise<PingResult> {
  // IndexNow batch submission
  const pingUrl = `https://${endpoint.host}/indexnow`;
  
  try {
    const response = await fetch(pingUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'Langoustine69-IndexNow/1.0',
      },
      body: JSON.stringify({
        host: 'langoustine69.dev',
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    });

    // IndexNow returns various success codes
    const isSuccess = response.status >= 200 && response.status < 300;
    
    return {
      engine: endpoint.name,
      url: pingUrl,
      status: isSuccess ? 'success' : 'failed',
      statusCode: response.status,
      message: isSuccess 
        ? `Submitted ${urls.length} URLs successfully` 
        : `HTTP ${response.status}: ${response.statusText}`,
    };
  } catch (error) {
    return {
      engine: endpoint.name,
      url: pingUrl,
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function pingAllSearchEngines(): Promise<void> {
  console.log('🦞 Langoustine69 IndexNow Pinger\n');
  console.log(`📍 Site URL: ${SITE_URL}`);
  console.log(`🗺️  Sitemap:  ${SITEMAP_URL}`);
  console.log(`🔑 Key:      ${INDEXNOW_KEY}\n`);
  console.log('ℹ️  Note: Google deprecated sitemap ping in 2023. Use Search Console instead.\n');
  console.log(`Submitting ${KEY_URLS.length} URLs to IndexNow endpoints...\n`);

  const results: PingResult[] = [];

  for (const endpoint of INDEXNOW_ENDPOINTS) {
    process.stdout.write(`  ${endpoint.name}... `);
    const result = await pingIndexNow(endpoint, KEY_URLS);
    results.push(result);

    if (result.status === 'success') {
      console.log(`✅ ${result.message}`);
    } else {
      console.log(`❌ ${result.message}`);
    }
  }

  console.log('\n📊 Summary:');
  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'failed').length;
  
  console.log(`  ✅ Successful: ${successful}/${results.length}`);
  if (failed > 0) console.log(`  ❌ Failed: ${failed}`);

  // Output JSON for CI/CD pipelines
  if (process.env.CI || process.env.OUTPUT_JSON) {
    console.log('\n📄 JSON Output:');
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      sitemapUrl: SITEMAP_URL,
      urlsSubmitted: KEY_URLS.length,
      results: results.map(r => ({
        engine: r.engine,
        status: r.status,
        statusCode: r.statusCode,
        message: r.message,
      })),
      summary: { successful, failed, total: results.length },
    }, null, 2));
  }

  console.log('\n✨ Done! Search engines will process your URLs soon.\n');
  console.log('📝 Remember: Submit sitemap to Google Search Console for best coverage.\n');
}

// Export for programmatic use
export { pingAllSearchEngines, pingIndexNow, INDEXNOW_ENDPOINTS, KEY_URLS, SITEMAP_URL };

// Run if executed directly
pingAllSearchEngines();
