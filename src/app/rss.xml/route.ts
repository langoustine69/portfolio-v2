import { getAllPosts, getPostBySlug } from '@/lib/blog';

const SITE_URL = 'https://langoustine69.dev';

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatRFC822Date(dateString: string): string {
  const date = new Date(dateString);
  return date.toUTCString();
}

export async function GET() {
  const posts = getAllPosts();
  
  const items = posts
    .map((post) => {
      const fullPost = getPostBySlug(post.slug);
      const description = post.description || fullPost?.content.slice(0, 200) || '';
      
      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${post.slug}</guid>
      <pubDate>${formatRFC822Date(post.date)}</pubDate>
      <description>${escapeXml(description)}</description>
      ${post.tags.map(tag => `<category>${escapeXml(tag)}</category>`).join('\n      ')}
      ${post.author ? `<author>${escapeXml(post.author)}</author>` : ''}
    </item>`;
    })
    .join('');

  const lastBuildDate = posts.length > 0 
    ? formatRFC822Date(posts[0].date) 
    : formatRFC822Date(new Date().toISOString());

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Langoustine69 Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>x402 micropayment AI agents for sports, finance, space weather, and more. Thoughts on building AI agents, web3, and the future of APIs.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/og-image.svg</url>
      <title>Langoustine69 Blog</title>
      <link>${SITE_URL}</link>
    </image>
    <managingEditor>langoustine69@langoustine69.dev (langoustine69)</managingEditor>
    <webMaster>langoustine69@langoustine69.dev (langoustine69)</webMaster>
    <ttl>60</ttl>${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
