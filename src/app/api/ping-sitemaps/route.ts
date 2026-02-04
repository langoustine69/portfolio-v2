import { NextResponse } from 'next/server';

const SITE_URL = 'https://langoustine69.dev';
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;
const INDEXNOW_KEY = 'langoustine69-indexnow';

// IndexNow endpoints (Bing, Yandex, Naver, Seznam all support this)
const INDEXNOW_ENDPOINTS = [
  { name: 'Bing', host: 'www.bing.com' },
  { name: 'Yandex', host: 'yandex.com' },
  { name: 'Naver', host: 'searchadvisor.naver.com' },
  { name: 'Seznam', host: 'search.seznam.cz' },
];

// Key pages to notify
const KEY_URLS = [
  SITE_URL,
  `${SITE_URL}/agents`,
  `${SITE_URL}/compare`,
  `${SITE_URL}/blog`,
  `${SITE_URL}/status`,
];

interface PingResult {
  engine: string;
  status: 'success' | 'failed';
  statusCode?: number;
  message: string;
}

async function pingIndexNow(
  endpoint: { name: string; host: string },
  urls: string[]
): Promise<PingResult> {
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

    const isSuccess = response.status >= 200 && response.status < 300;

    return {
      engine: endpoint.name,
      status: isSuccess ? 'success' : 'failed',
      statusCode: response.status,
      message: isSuccess
        ? `Submitted ${urls.length} URLs`
        : `HTTP ${response.status}: ${response.statusText}`,
    };
  } catch (error) {
    return {
      engine: endpoint.name,
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * POST /api/ping-sitemaps
 * 
 * Trigger IndexNow pings to search engines.
 * Useful for deploy webhooks or manual refresh.
 * 
 * Body (optional):
 * - urls: string[] - specific URLs to submit (defaults to KEY_URLS)
 * 
 * Query params:
 * - key: Simple API key for protection (set PING_API_KEY env var)
 */
export async function POST(request: Request) {
  // Optional API key protection
  const { searchParams } = new URL(request.url);
  const providedKey = searchParams.get('key');
  const expectedKey = process.env.PING_API_KEY;

  if (expectedKey && providedKey !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse optional custom URLs from body
  let urlsToSubmit = KEY_URLS;
  try {
    const body = await request.json().catch(() => ({}));
    if (body.urls && Array.isArray(body.urls)) {
      urlsToSubmit = body.urls.slice(0, 10000); // IndexNow limit
    }
  } catch {
    // Use default URLs
  }

  const results: PingResult[] = [];

  for (const endpoint of INDEXNOW_ENDPOINTS) {
    const result = await pingIndexNow(endpoint, urlsToSubmit);
    results.push(result);
  }

  const successful = results.filter((r) => r.status === 'success').length;
  const failed = results.filter((r) => r.status === 'failed').length;

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    sitemapUrl: SITEMAP_URL,
    urlsSubmitted: urlsToSubmit.length,
    results,
    summary: {
      successful,
      failed,
      total: results.length,
    },
    note: 'Google deprecated sitemap ping in 2023. Use Search Console for Google indexing.',
  });
}

/**
 * GET /api/ping-sitemaps
 * 
 * Returns info about the endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/ping-sitemaps',
    method: 'POST',
    description: 'Ping search engines via IndexNow protocol',
    sitemapUrl: SITEMAP_URL,
    defaultUrls: KEY_URLS,
    engines: INDEXNOW_ENDPOINTS.map((e) => e.name),
    note: 'Google deprecated sitemap ping in 2023. IndexNow is supported by Bing, Yandex, Naver, Seznam, and DuckDuckGo.',
    usage: {
      default: 'POST /api/ping-sitemaps - submits default key URLs',
      custom: 'POST /api/ping-sitemaps with body { "urls": ["url1", "url2"] }',
      protected: 'Set PING_API_KEY env var, then pass ?key=yourkey',
    },
  });
}
