import { changelog, ChangelogEntry } from '@/data/changelog';

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

function getTypeEmoji(type: ChangelogEntry['type']): string {
  const emojis = {
    feature: '✨',
    improvement: '⚡',
    fix: '🐛',
    breaking: '💥',
  };
  return emojis[type];
}

function getTypeLabel(type: ChangelogEntry['type']): string {
  const labels = {
    feature: 'Feature',
    improvement: 'Improvement',
    fix: 'Fix',
    breaking: 'Breaking Change',
  };
  return labels[type];
}

export async function GET() {
  const items = changelog
    .map((entry) => {
      const emoji = getTypeEmoji(entry.type);
      const typeLabel = getTypeLabel(entry.type);
      
      // Build detailed description with bullet points
      const itemsList = entry.items
        .map(item => `• ${escapeXml(item)}`)
        .join('\n');
      
      const fullDescription = `${escapeXml(entry.description)}\n\nChanges:\n${itemsList}`;
      
      return `
    <item>
      <title>${emoji} v${escapeXml(entry.version)}: ${escapeXml(entry.title)}</title>
      <link>${SITE_URL}/changelog#v${escapeXml(entry.version)}</link>
      <guid isPermaLink="false">langoustine69-changelog-v${escapeXml(entry.version)}</guid>
      <pubDate>${formatRFC822Date(entry.date)}</pubDate>
      <description><![CDATA[${fullDescription}]]></description>
      <category>${escapeXml(typeLabel)}</category>
    </item>`;
    })
    .join('');

  const lastBuildDate = changelog.length > 0 
    ? formatRFC822Date(changelog[0].date) 
    : formatRFC822Date(new Date().toISOString());

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Langoustine69 Changelog</title>
    <link>${SITE_URL}/changelog</link>
    <description>Stay updated on new features, improvements, and changes to the Langoustine69 x402 agent portfolio. Get notified when new agents ship, APIs improve, and breaking changes occur.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/changelog.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/og-image.svg</url>
      <title>Langoustine69 Changelog</title>
      <link>${SITE_URL}/changelog</link>
    </image>
    <managingEditor>langoustine69@langoustine69.dev (Langoustine69)</managingEditor>
    <webMaster>langoustine69@langoustine69.dev (Langoustine69)</webMaster>
    <copyright>© 2026 Langoustine69. All rights reserved.</copyright>
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
