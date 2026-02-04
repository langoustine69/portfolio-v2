'use client';

import { useState, useMemo } from 'react';
import { agents, getLiveAgents, type Agent } from '@/data/agents';

type BadgeStyle = 'flat' | 'flat-square' | 'plastic' | 'for-the-badge';
type BadgeType = 'status' | 'category' | 'version' | 'health';

interface BadgeConfig {
  type: BadgeType;
  style: BadgeStyle;
  agentId: string;
}

const statusColors: Record<string, string> = {
  live: '22c55e',      // green
  offline: 'ef4444',   // red
  building: 'f59e0b',  // amber
};

const categoryColors: Record<string, string> = {
  'DeFi': '8b5cf6',
  'Finance': '3b82f6',
  'Sports': '22c55e',
  'Space': '6366f1',
  'Weather': '06b6d4',
  'Tech News': 'f97316',
  'Motorsport': 'ef4444',
  'Geoscience': '84cc16',
  'Utilities': '64748b',
};

function generateShieldsBadgeUrl(agent: Agent, type: BadgeType, style: BadgeStyle): string {
  const baseUrl = 'https://img.shields.io/badge';
  const encode = (s: string) => encodeURIComponent(s.replace(/-/g, '--').replace(/_/g, '__'));
  
  switch (type) {
    case 'status': {
      const label = encode(agent.name);
      const message = encode(agent.status);
      const color = statusColors[agent.status] || '64748b';
      return `${baseUrl}/${label}-${message}-${color}?style=${style}&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiPjwvY2lyY2xlPjwvc3ZnPg==`;
    }
    case 'category': {
      const label = encode('Langoustine69');
      const message = encode(agent.category);
      const color = categoryColors[agent.category] || '64748b';
      return `${baseUrl}/${label}-${message}-${color}?style=${style}`;
    }
    case 'version': {
      const label = encode(agent.name);
      const version = agent.changelog?.[0]?.version || 'v1.0.0';
      const message = encode(version);
      return `${baseUrl}/${label}-${message}-blue?style=${style}`;
    }
    case 'health': {
      const label = encode(agent.name);
      const message = encode('x402 enabled');
      return `${baseUrl}/${label}-${message}-8b5cf6?style=${style}&logo=ethereum&logoColor=white`;
    }
    default:
      return '';
  }
}

function BadgePreview({ url }: { url: string }) {
  return (
    <div className="flex items-center justify-center p-4 bg-shell-800/50 rounded-lg min-h-[60px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={url} 
        alt="Badge preview" 
        className="h-auto"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    </div>
  );
}

function CodeSnippet({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-shell-400">{label}</span>
        <button
          onClick={handleCopy}
          className="text-xs text-lobster-500 hover:text-lobster-400 transition-colors"
        >
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="text-xs bg-shell-900 p-2 rounded overflow-x-auto">
        <code className="text-shell-300">{code}</code>
      </pre>
    </div>
  );
}

export default function BadgeGenerator() {
  const liveAgents = getLiveAgents();
  
  const [config, setConfig] = useState<BadgeConfig>({
    type: 'status',
    style: 'flat',
    agentId: liveAgents[0]?.id || '',
  });

  const selectedAgent = useMemo(
    () => agents.find(a => a.id === config.agentId),
    [config.agentId]
  );

  const badgeUrl = useMemo(() => {
    if (!selectedAgent) return '';
    return generateShieldsBadgeUrl(selectedAgent, config.type, config.style);
  }, [selectedAgent, config.type, config.style]);

  const markdownCode = `[![${selectedAgent?.name || 'Agent'} Status](${badgeUrl})](https://langoustine69.dev/agents/${config.agentId})`;
  const htmlCode = `<a href="https://langoustine69.dev/agents/${config.agentId}"><img src="${badgeUrl}" alt="${selectedAgent?.name || 'Agent'} Status" /></a>`;

  const badgeTypes: { value: BadgeType; label: string; desc: string }[] = [
    { value: 'status', label: 'Status', desc: 'Shows live/offline status' },
    { value: 'category', label: 'Category', desc: 'Shows agent category' },
    { value: 'version', label: 'Version', desc: 'Shows current version' },
    { value: 'health', label: 'x402 Enabled', desc: 'Shows x402 payment status' },
  ];

  const badgeStyles: { value: BadgeStyle; label: string }[] = [
    { value: 'flat', label: 'Flat' },
    { value: 'flat-square', label: 'Flat Square' },
    { value: 'plastic', label: 'Plastic' },
    { value: 'for-the-badge', label: 'For the Badge' },
  ];

  return (
    <section className="py-16 px-4" id="badge-generator">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">
            <span className="text-lobster-500">🏷️</span> Badge Generator
          </h2>
          <p className="text-shell-400">
            Embed status badges in your README to showcase agent integrations
          </p>
        </div>

        <div className="bg-shell-800/50 rounded-xl p-6 space-y-6">
          {/* Agent Selector */}
          <div>
            <label className="block text-sm font-medium text-shell-300 mb-2">
              Select Agent
            </label>
            <select
              value={config.agentId}
              onChange={(e) => setConfig(c => ({ ...c, agentId: e.target.value }))}
              className="w-full bg-shell-900 border border-shell-700 rounded-lg px-4 py-2.5 text-white focus:border-lobster-500 focus:ring-1 focus:ring-lobster-500 outline-none transition-colors"
            >
              {liveAgents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.icon} {agent.name}
                </option>
              ))}
            </select>
          </div>

          {/* Badge Type */}
          <div>
            <label className="block text-sm font-medium text-shell-300 mb-2">
              Badge Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {badgeTypes.map(bt => (
                <button
                  key={bt.value}
                  onClick={() => setConfig(c => ({ ...c, type: bt.value }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    config.type === bt.value
                      ? 'bg-lobster-600 text-white'
                      : 'bg-shell-700 text-shell-300 hover:bg-shell-600'
                  }`}
                  title={bt.desc}
                >
                  {bt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Badge Style */}
          <div>
            <label className="block text-sm font-medium text-shell-300 mb-2">
              Style
            </label>
            <div className="flex flex-wrap gap-2">
              {badgeStyles.map(bs => (
                <button
                  key={bs.value}
                  onClick={() => setConfig(c => ({ ...c, style: bs.value }))}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    config.style === bs.value
                      ? 'bg-lobster-600 text-white'
                      : 'bg-shell-700 text-shell-300 hover:bg-shell-600'
                  }`}
                >
                  {bs.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-shell-300 mb-2">
              Preview
            </label>
            <BadgePreview url={badgeUrl} />
          </div>

          {/* Code Snippets */}
          <div className="space-y-3 pt-2 border-t border-shell-700">
            <CodeSnippet label="Markdown" code={markdownCode} />
            <CodeSnippet label="HTML" code={htmlCode} />
            <CodeSnippet label="Image URL" code={badgeUrl} />
          </div>

          {/* All Badges Preview */}
          {selectedAgent && (
            <div className="pt-4 border-t border-shell-700">
              <label className="block text-sm font-medium text-shell-300 mb-3">
                All Badge Types for {selectedAgent.name}
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {badgeTypes.map(bt => (
                  <img
                    key={bt.value}
                    src={generateShieldsBadgeUrl(selectedAgent, bt.value, config.style)}
                    alt={`${bt.label} badge`}
                    className="h-auto"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 bg-shell-800/30 rounded-lg">
          <h4 className="text-sm font-semibold text-lobster-400 mb-2">💡 Pro Tips</h4>
          <ul className="text-sm text-shell-400 space-y-1">
            <li>• Add badges to your project README to show x402 agent integrations</li>
            <li>• Use the status badge to show real-time availability</li>
            <li>• Link badges to the agent page for easy discovery</li>
            <li>• Combine multiple badges for a complete overview</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
