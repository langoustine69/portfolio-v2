import { NextRequest, NextResponse } from 'next/server';
import { agents } from '@/data/agents';

type WidgetStyle = 'card' | 'compact' | 'minimal';
type WidgetTheme = 'dark' | 'light' | 'auto';

interface WidgetParams {
  style: WidgetStyle;
  theme: WidgetTheme;
  showPricing: boolean;
  showFeatures: boolean;
  accentColor: string;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'live': return '#10b981';
    case 'offline': return '#ef4444';
    case 'building': return '#f59e0b';
    default: return '#6b7280';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'live': return '● Live';
    case 'offline': return '○ Offline';
    case 'building': return '◐ Building';
    default: return status;
  }
}

function generateCardWidget(agent: typeof agents[0], params: WidgetParams, baseUrl: string): string {
  const isDark = params.theme === 'dark' || params.theme === 'auto';
  const bgColor = isDark ? '#0f172a' : '#ffffff';
  const textColor = isDark ? '#f1f5f9' : '#1e293b';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const borderColor = isDark ? '#334155' : '#e2e8f0';
  const statusColor = getStatusColor(agent.status);
  const accentColor = params.accentColor || '#f97316';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${agent.name} Widget</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: transparent;
    }
    .widget {
      background: ${bgColor};
      border: 1px solid ${borderColor};
      border-radius: 12px;
      padding: 20px;
      max-width: 360px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    .header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .icon {
      font-size: 32px;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${isDark ? '#1e293b' : '#f1f5f9'};
      border-radius: 10px;
    }
    .title-group { flex: 1; }
    .name {
      font-size: 18px;
      font-weight: 700;
      color: ${textColor};
      margin-bottom: 2px;
    }
    .category {
      font-size: 12px;
      color: ${mutedColor};
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .status {
      font-size: 11px;
      font-weight: 600;
      color: ${statusColor};
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .description {
      font-size: 14px;
      color: ${mutedColor};
      line-height: 1.5;
      margin-bottom: 16px;
    }
    .features {
      display: ${params.showFeatures ? 'flex' : 'none'};
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 16px;
    }
    .feature {
      font-size: 11px;
      padding: 4px 8px;
      background: ${isDark ? '#1e293b' : '#f1f5f9'};
      color: ${mutedColor};
      border-radius: 4px;
    }
    .pricing {
      display: ${params.showPricing ? 'flex' : 'none'};
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      padding: 12px;
      background: ${isDark ? '#1e293b' : '#f8fafc'};
      border-radius: 8px;
    }
    .pricing-label {
      font-size: 12px;
      color: ${mutedColor};
    }
    .pricing-value {
      font-size: 14px;
      font-weight: 600;
      color: ${accentColor};
    }
    .cta {
      display: block;
      width: 100%;
      padding: 12px 16px;
      background: ${accentColor};
      color: white;
      text-decoration: none;
      text-align: center;
      font-weight: 600;
      font-size: 14px;
      border-radius: 8px;
      transition: opacity 0.2s;
    }
    .cta:hover { opacity: 0.9; }
    .powered {
      text-align: center;
      margin-top: 12px;
      font-size: 10px;
      color: ${mutedColor};
    }
    .powered a { color: ${accentColor}; text-decoration: none; }
  </style>
</head>
<body>
  <div class="widget">
    <div class="header">
      <div class="icon">${agent.icon}</div>
      <div class="title-group">
        <div class="name">${agent.name}</div>
        <div class="category">${agent.category}</div>
      </div>
      <div class="status">${getStatusLabel(agent.status)}</div>
    </div>
    <p class="description">${agent.description.slice(0, 150)}${agent.description.length > 150 ? '...' : ''}</p>
    <div class="features">
      ${agent.features.slice(0, 4).map(f => `<span class="feature">${f}</span>`).join('')}
    </div>
    <div class="pricing">
      <span class="pricing-label">Powered by</span>
      <span class="pricing-value">x402 Micropayments</span>
    </div>
    <a href="${baseUrl}/agents/${agent.id}" target="_blank" rel="noopener" class="cta">
      View Agent →
    </a>
    <div class="powered">
      Powered by <a href="${baseUrl}" target="_blank">langoustine69.dev</a>
    </div>
  </div>
</body>
</html>`;
}

function generateCompactWidget(agent: typeof agents[0], params: WidgetParams, baseUrl: string): string {
  const isDark = params.theme === 'dark' || params.theme === 'auto';
  const bgColor = isDark ? '#0f172a' : '#ffffff';
  const textColor = isDark ? '#f1f5f9' : '#1e293b';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const borderColor = isDark ? '#334155' : '#e2e8f0';
  const statusColor = getStatusColor(agent.status);
  const accentColor = params.accentColor || '#f97316';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${agent.name} Widget</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: transparent; }
    .widget {
      display: flex;
      align-items: center;
      gap: 12px;
      background: ${bgColor};
      border: 1px solid ${borderColor};
      border-radius: 10px;
      padding: 12px 16px;
      max-width: 400px;
    }
    .icon { font-size: 24px; }
    .info { flex: 1; min-width: 0; }
    .name { font-size: 14px; font-weight: 600; color: ${textColor}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .meta { font-size: 11px; color: ${mutedColor}; display: flex; align-items: center; gap: 8px; }
    .status { color: ${statusColor}; font-weight: 500; }
    .cta {
      padding: 8px 14px;
      background: ${accentColor};
      color: white;
      text-decoration: none;
      font-weight: 600;
      font-size: 12px;
      border-radius: 6px;
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <a href="${baseUrl}/agents/${agent.id}" target="_blank" rel="noopener" class="widget">
    <span class="icon">${agent.icon}</span>
    <div class="info">
      <div class="name">${agent.name}</div>
      <div class="meta">
        <span>${agent.category}</span>
        <span class="status">${getStatusLabel(agent.status)}</span>
      </div>
    </div>
    <span class="cta">View</span>
  </a>
</body>
</html>`;
}

function generateMinimalWidget(agent: typeof agents[0], params: WidgetParams, baseUrl: string): string {
  const isDark = params.theme === 'dark' || params.theme === 'auto';
  const bgColor = isDark ? '#0f172a' : '#ffffff';
  const textColor = isDark ? '#f1f5f9' : '#1e293b';
  const borderColor = isDark ? '#334155' : '#e2e8f0';
  const statusColor = getStatusColor(agent.status);
  const accentColor = params.accentColor || '#f97316';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${agent.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: transparent; }
    .widget {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: ${bgColor};
      border: 1px solid ${borderColor};
      border-radius: 6px;
      padding: 6px 12px;
      text-decoration: none;
      color: ${textColor};
      font-size: 13px;
      font-weight: 500;
    }
    .widget:hover { border-color: ${accentColor}; }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: ${statusColor}; }
    .icon { font-size: 16px; }
  </style>
</head>
<body>
  <a href="${baseUrl}/agents/${agent.id}" target="_blank" rel="noopener" class="widget">
    <span class="icon">${agent.icon}</span>
    <span>${agent.name}</span>
    <span class="dot"></span>
  </a>
</body>
</html>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;
  const agent = agents.find(a => a.id === agentId);

  if (!agent) {
    return new NextResponse('Agent not found', { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  
  const widgetParams: WidgetParams = {
    style: (searchParams.get('style') as WidgetStyle) || 'card',
    theme: (searchParams.get('theme') as WidgetTheme) || 'dark',
    showPricing: searchParams.get('pricing') !== 'false',
    showFeatures: searchParams.get('features') !== 'false',
    accentColor: searchParams.get('accent') || '#f97316',
  };

  const baseUrl = 'https://langoustine69.dev';
  
  let html: string;
  switch (widgetParams.style) {
    case 'compact':
      html = generateCompactWidget(agent, widgetParams, baseUrl);
      break;
    case 'minimal':
      html = generateMinimalWidget(agent, widgetParams, baseUrl);
      break;
    default:
      html = generateCardWidget(agent, widgetParams, baseUrl);
  }

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'X-Frame-Options': 'ALLOWALL',
    },
  });
}
