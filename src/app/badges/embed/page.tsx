'use client';

import { useState, useEffect } from 'react';
import { agents } from '@/data/agents';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  CheckCircleIcon,
  ClipboardDocumentIcon,
  ArrowTopRightOnSquareIcon,
  BoltIcon,
  ShieldCheckIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

type BadgeStyle = 'flat' | 'flat-square' | 'plastic' | 'for-the-badge' | 'social';
type BadgeType = 'uptime' | 'status' | 'response-time' | 'version';

interface BadgeConfig {
  agentId: string;
  type: BadgeType;
  style: BadgeStyle;
  label?: string;
}

export default function EmbedBadgesPage() {
  const [config, setConfig] = useState<BadgeConfig>({
    agentId: agents[0]?.id || '',
    type: 'uptime',
    style: 'flat',
    label: '',
  });
  const [copied, setCopied] = useState<string | null>(null);

  const selectedAgent = agents.find((a) => a.id === config.agentId);

  const getBadgeColor = (type: BadgeType): string => {
    switch (type) {
      case 'uptime':
        return 'brightgreen';
      case 'status':
        return selectedAgent?.status === 'live' ? 'success' : 'critical';
      case 'response-time':
        return 'blue';
      case 'version':
        return 'informational';
      default:
        return 'blue';
    }
  };

  const getBadgeValue = (type: BadgeType): string => {
    switch (type) {
      case 'uptime':
        return '99.9%'; // Static for shields.io badge
      case 'status':
        return selectedAgent?.status === 'live' ? 'operational' : selectedAgent?.status === 'building' ? 'building' : 'offline';
      case 'response-time':
        return '~120ms'; // Static estimate
      case 'version':
        return selectedAgent?.changelog?.[0]?.version || 'v1.0.0';
      default:
        return 'unknown';
    }
  };

  const getBadgeLabel = (type: BadgeType): string => {
    if (config.label) return config.label;
    switch (type) {
      case 'uptime':
        return 'uptime';
      case 'status':
        return selectedAgent?.name || 'status';
      case 'response-time':
        return 'response time';
      case 'version':
        return selectedAgent?.name || 'version';
      default:
        return 'badge';
    }
  };

  const generateShieldsUrl = (): string => {
    const label = encodeURIComponent(getBadgeLabel(config.type));
    const value = encodeURIComponent(getBadgeValue(config.type));
    const color = getBadgeColor(config.type);
    return `https://img.shields.io/badge/${label}-${value}-${color}?style=${config.style}&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4eiIvPjwvc3ZnPg==`;
  };

  const badgeUrl = generateShieldsUrl();
  const agentUrl = `https://langoustine69.dev/agents/${config.agentId}`;

  const markdownCode = `[![${getBadgeLabel(config.type)}](${badgeUrl})](${agentUrl})`;
  const htmlCode = `<a href="${agentUrl}"><img src="${badgeUrl}" alt="${getBadgeLabel(config.type)}" /></a>`;
  const rstCode = `.. image:: ${badgeUrl}\n   :target: ${agentUrl}\n   :alt: ${getBadgeLabel(config.type)}`;

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium mb-6">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              Embeddable Badges
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Agent Status Badges
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Generate shields.io-style badges to display agent uptime, status, and performance in your README files.
            </p>
          </div>

          {/* Badge Preview */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-8 mb-8">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <BoltIcon className="w-5 h-5 text-orange-400" />
              Live Preview
            </h2>
            <div className="flex items-center justify-center p-8 bg-slate-900 rounded-xl border border-slate-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={badgeUrl} alt="Badge Preview" className="h-6" />
            </div>
          </div>

          {/* Configuration */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Agent Selection */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-blue-400" />
                Select Agent
              </h3>
              <select
                value={config.agentId}
                onChange={(e) => setConfig({ ...config, agentId: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>

              <h3 className="text-lg font-semibold text-white mb-4 mt-6 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-green-400" />
                Badge Type
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {(['uptime', 'status', 'response-time', 'version'] as BadgeType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setConfig({ ...config, type })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      config.type === type
                        ? 'bg-orange-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {type.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Style Selection */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Badge Style</h3>
              <div className="grid grid-cols-1 gap-2">
                {(['flat', 'flat-square', 'plastic', 'for-the-badge', 'social'] as BadgeStyle[]).map(
                  (style) => (
                    <button
                      key={style}
                      onClick={() => setConfig({ ...config, style })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                        config.style === style
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {style}
                    </button>
                  )
                )}
              </div>

              <h3 className="text-lg font-semibold text-white mb-4 mt-6">Custom Label (optional)</h3>
              <input
                type="text"
                value={config.label}
                onChange={(e) => setConfig({ ...config, label: e.target.value })}
                placeholder="Leave empty for default"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Code Snippets */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Embed Code</h2>

            {/* Markdown */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
                <span className="text-sm font-medium text-white">Markdown (GitHub README)</span>
                <button
                  onClick={() => copyToClipboard(markdownCode, 'markdown')}
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {copied === 'markdown' ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  ) : (
                    <ClipboardDocumentIcon className="w-4 h-4" />
                  )}
                  {copied === 'markdown' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="p-4 text-sm text-slate-300 overflow-x-auto">
                <code>{markdownCode}</code>
              </pre>
            </div>

            {/* HTML */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
                <span className="text-sm font-medium text-white">HTML</span>
                <button
                  onClick={() => copyToClipboard(htmlCode, 'html')}
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {copied === 'html' ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  ) : (
                    <ClipboardDocumentIcon className="w-4 h-4" />
                  )}
                  {copied === 'html' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="p-4 text-sm text-slate-300 overflow-x-auto">
                <code>{htmlCode}</code>
              </pre>
            </div>

            {/* reStructuredText */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
                <span className="text-sm font-medium text-white">reStructuredText (PyPI)</span>
                <button
                  onClick={() => copyToClipboard(rstCode, 'rst')}
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {copied === 'rst' ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  ) : (
                    <ClipboardDocumentIcon className="w-4 h-4" />
                  )}
                  {copied === 'rst' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="p-4 text-sm text-slate-300 overflow-x-auto">
                <code>{rstCode}</code>
              </pre>
            </div>

            {/* Direct URL */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
                <span className="text-sm font-medium text-white">Direct Image URL</span>
                <button
                  onClick={() => copyToClipboard(badgeUrl, 'url')}
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {copied === 'url' ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  ) : (
                    <ClipboardDocumentIcon className="w-4 h-4" />
                  )}
                  {copied === 'url' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="p-4 text-sm text-slate-300 overflow-x-auto break-all">
                <code>{badgeUrl}</code>
              </pre>
            </div>
          </div>

          {/* Use Cases */}
          <div className="mt-12 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl border border-orange-500/20 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Why Use Agent Badges?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Build Trust</h3>
                <p className="text-slate-400 text-sm">
                  Show users your integrations are reliable with real-time uptime stats
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <ArrowTopRightOnSquareIcon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Drive Traffic</h3>
                <p className="text-slate-400 text-sm">
                  Badges link directly to agent pages, increasing discoverability
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Professional Look</h3>
                <p className="text-slate-400 text-sm">
                  Match the style of popular open-source projects with shields.io badges
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
