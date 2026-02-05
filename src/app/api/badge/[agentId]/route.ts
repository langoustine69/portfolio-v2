import { NextRequest, NextResponse } from 'next/server';
import { agents } from '@/data/agents';

// Badge color schemes
const statusColors = {
  live: { bg: '#22c55e', text: '#fff', label: 'live' },
  offline: { bg: '#ef4444', text: '#fff', label: 'offline' },
  building: { bg: '#f59e0b', text: '#fff', label: 'building' },
};

const styleColors = {
  flat: { labelBg: '#555', labelText: '#fff' },
  'flat-square': { labelBg: '#555', labelText: '#fff' },
  plastic: { labelBg: '#555', labelText: '#fff' },
  'for-the-badge': { labelBg: '#555', labelText: '#fff' },
};

// Check if agent is actually reachable
async function checkAgentHealth(railwayUrl: string): Promise<boolean> {
  if (!railwayUrl) return false;
  
  try {
    const healthUrl = railwayUrl.replace(/\/$/, '') + '/health';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

// Generate SVG badge
function generateBadge(
  label: string,
  status: string,
  statusColor: string,
  style: string = 'flat'
): string {
  const labelWidth = Math.max(label.length * 6.5 + 10, 50);
  const statusWidth = Math.max(status.length * 6.5 + 10, 40);
  const totalWidth = labelWidth + statusWidth;
  
  const isForTheBadge = style === 'for-the-badge';
  const isPlastic = style === 'plastic';
  const isSquare = style === 'flat-square' || isForTheBadge;
  const height = isForTheBadge ? 28 : 20;
  const fontSize = isForTheBadge ? 10 : 11;
  const textY = isForTheBadge ? 18 : 14;
  const radius = isSquare ? 0 : 3;
  
  const displayLabel = isForTheBadge ? label.toUpperCase() : label;
  const displayStatus = isForTheBadge ? status.toUpperCase() : status;
  
  // Gradient for plastic style
  const gradientDef = isPlastic ? `
    <linearGradient id="smooth" x2="0" y2="100%">
      <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
      <stop offset="1" stop-opacity=".1"/>
    </linearGradient>` : '';
  
  const gradientOverlay = isPlastic ? `
    <rect rx="${radius}" width="${totalWidth}" height="${height}" fill="url(#smooth)"/>` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}" role="img" aria-label="${label}: ${status}">
  <title>${label}: ${status}</title>
  <defs>${gradientDef}</defs>
  <g shape-rendering="crispEdges">
    <rect rx="${radius}" width="${labelWidth}" height="${height}" fill="#555"/>
    <rect rx="${radius}" x="${labelWidth}" width="${statusWidth}" height="${height}" fill="${statusColor}"/>
    ${radius > 0 ? `<rect x="${labelWidth}" width="${radius}" height="${height}" fill="${statusColor}"/>` : ''}
  </g>
  ${gradientOverlay}
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="${fontSize}">
    <text x="${labelWidth / 2}" y="${textY}" fill="#fff" ${isForTheBadge ? 'font-weight="bold" letter-spacing="1"' : ''}>${displayLabel}</text>
    <text x="${labelWidth + statusWidth / 2}" y="${textY}" fill="#fff" ${isForTheBadge ? 'font-weight="bold" letter-spacing="1"' : ''}>${displayStatus}</text>
  </g>
</svg>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;
  const { searchParams } = new URL(request.url);
  
  // Query params
  const style = searchParams.get('style') || 'flat';
  const label = searchParams.get('label'); // Custom label override
  const live = searchParams.get('live') === 'true'; // Real-time health check
  
  // Find the agent
  const agent = agents.find(a => a.id === agentId);
  
  if (!agent) {
    // Return a "not found" badge
    const svg = generateBadge('agent', 'not found', '#999', style);
    return new NextResponse(svg, {
      status: 404,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
  
  // Determine status
  let status = agent.status;
  
  // If live check requested and agent has a URL, verify it's actually up
  if (live && agent.railwayUrl && agent.status === 'live') {
    const isHealthy = await checkAgentHealth(agent.railwayUrl);
    if (!isHealthy) {
      status = 'offline';
    }
  }
  
  const statusInfo = statusColors[status] || statusColors.offline;
  const displayLabel = label || agent.name;
  
  const svg = generateBadge(displayLabel, statusInfo.label, statusInfo.bg, style);
  
  // Cache for 5 minutes (or 30 seconds if live check)
  const cacheTime = live ? 30 : 300;
  
  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': `public, max-age=${cacheTime}, s-maxage=${cacheTime}`,
      'X-Agent-Id': agent.id,
      'X-Agent-Status': status,
    },
  });
}
