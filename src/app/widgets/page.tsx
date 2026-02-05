'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { agents, categories } from '@/data/agents';
import Breadcrumbs from '@/components/Breadcrumbs';

type WidgetStyle = 'card' | 'compact' | 'minimal';
type WidgetTheme = 'dark' | 'light';

const widgetStyles: { value: WidgetStyle; label: string; description: string; dimensions: string }[] = [
  { value: 'card', label: 'Card', description: 'Rich card with all details', dimensions: '360×280' },
  { value: 'compact', label: 'Compact', description: 'Horizontal bar widget', dimensions: '400×60' },
  { value: 'minimal', label: 'Minimal', description: 'Tiny inline badge', dimensions: '180×32' },
];

const accentColors = [
  { value: '#f97316', label: 'Coral', class: 'bg-orange-500' },
  { value: '#3b82f6', label: 'Blue', class: 'bg-blue-500' },
  { value: '#10b981', label: 'Green', class: 'bg-emerald-500' },
  { value: '#8b5cf6', label: 'Purple', class: 'bg-violet-500' },
  { value: '#ec4899', label: 'Pink', class: 'bg-pink-500' },
  { value: '#f59e0b', label: 'Amber', class: 'bg-amber-500' },
];

export default function WidgetsPage() {
  const [selectedAgent, setSelectedAgent] = useState<string>(agents.find(a => a.status === 'live')?.id || agents[0].id);
  const [selectedStyle, setSelectedStyle] = useState<WidgetStyle>('card');
  const [selectedTheme, setSelectedTheme] = useState<WidgetTheme>('dark');
  const [showPricing, setShowPricing] = useState(true);
  const [showFeatures, setShowFeatures] = useState(true);
  const [accentColor, setAccentColor] = useState('#f97316');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const liveAgents = useMemo(() => agents.filter(a => a.status === 'live'), []);

  const filteredAgents = useMemo(() => {
    return liveAgents.filter(agent => {
      const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        agent.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [liveAgents, selectedCategory, searchQuery]);

  const baseUrl = 'https://langoustine69.dev';
  
  const getWidgetUrl = () => {
    const params = new URLSearchParams();
    if (selectedStyle !== 'card') params.set('style', selectedStyle);
    if (selectedTheme !== 'dark') params.set('theme', selectedTheme);
    if (!showPricing) params.set('pricing', 'false');
    if (!showFeatures) params.set('features', 'false');
    if (accentColor !== '#f97316') params.set('accent', accentColor);
    
    let url = `${baseUrl}/api/widget/${selectedAgent}`;
    if (params.toString()) url += `?${params.toString()}`;
    return url;
  };

  const getDimensions = () => {
    const style = widgetStyles.find(s => s.value === selectedStyle);
    if (!style) return { width: 360, height: 280 };
    const [w, h] = style.dimensions.split('×').map(Number);
    return { width: w, height: h };
  };

  const getIframeEmbed = () => {
    const { width, height } = getDimensions();
    return `<iframe src="${getWidgetUrl()}" width="${width}" height="${height}" frameborder="0" style="border-radius: 12px; overflow: hidden;"></iframe>`;
  };

  const getScriptEmbed = () => {
    const { width, height } = getDimensions();
    return `<div id="langoustine-widget-${selectedAgent}"></div>
<script>
(function() {
  var container = document.getElementById('langoustine-widget-${selectedAgent}');
  var iframe = document.createElement('iframe');
  iframe.src = '${getWidgetUrl()}';
  iframe.width = '${width}';
  iframe.height = '${height}';
  iframe.frameBorder = '0';
  iframe.style.borderRadius = '12px';
  iframe.style.overflow = 'hidden';
  container.appendChild(iframe);
})();
</script>`;
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  const currentAgent = agents.find(a => a.id === selectedAgent);

  return (
    <main className="min-h-screen bg-gradient-to-b from-reef-950 via-reef-900 to-reef-950">
      {/* Hero */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Widgets', href: '/widgets' },
            ]}
          />
          
          <div className="text-center mt-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              <span className="text-coral-400">📦</span> Embeddable Widgets
            </h1>
            <p className="text-lg text-shell-300 max-w-3xl mx-auto">
              Add rich, interactive agent widgets to your website, documentation, or blog.
              Customize the look and feel to match your brand.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* Agent Selector */}
            <div className="bg-reef-800/50 rounded-xl p-6 border border-reef-700/50">
              <h2 className="text-lg font-semibold text-white mb-4">1. Select Agent</h2>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search agents..."
                  className="bg-reef-900 border border-reef-600 rounded-lg px-3 py-2 text-white placeholder-shell-500 text-sm focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-reef-900 border border-reef-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                {filteredAgents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                      selectedAgent === agent.id
                        ? 'bg-coral-500/20 border-coral-500 border'
                        : 'bg-reef-900/50 border-reef-700/50 border hover:bg-reef-800/50'
                    }`}
                  >
                    <span className="text-2xl">{agent.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium text-sm truncate">{agent.name}</div>
                      <div className="text-shell-500 text-xs">{agent.category}</div>
                    </div>
                    {selectedAgent === agent.id && (
                      <span className="text-coral-400">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Style Selector */}
            <div className="bg-reef-800/50 rounded-xl p-6 border border-reef-700/50">
              <h2 className="text-lg font-semibold text-white mb-4">2. Choose Style</h2>
              <div className="grid grid-cols-3 gap-3">
                {widgetStyles.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => setSelectedStyle(style.value)}
                    className={`p-4 rounded-lg text-center transition-all ${
                      selectedStyle === style.value
                        ? 'bg-coral-500/20 border-coral-500 border-2'
                        : 'bg-reef-900/50 border-reef-700/50 border hover:bg-reef-800/50'
                    }`}
                  >
                    <div className="text-white font-medium text-sm">{style.label}</div>
                    <div className="text-shell-500 text-xs mt-1">{style.dimensions}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Customization */}
            <div className="bg-reef-800/50 rounded-xl p-6 border border-reef-700/50">
              <h2 className="text-lg font-semibold text-white mb-4">3. Customize</h2>
              
              {/* Theme */}
              <div className="mb-4">
                <label className="block text-sm text-shell-300 mb-2">Theme</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedTheme('dark')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedTheme === 'dark'
                        ? 'bg-reef-950 text-white border-2 border-coral-500'
                        : 'bg-reef-700 text-shell-300 hover:bg-reef-600'
                    }`}
                  >
                    🌙 Dark
                  </button>
                  <button
                    onClick={() => setSelectedTheme('light')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedTheme === 'light'
                        ? 'bg-white text-gray-900 border-2 border-coral-500'
                        : 'bg-reef-700 text-shell-300 hover:bg-reef-600'
                    }`}
                  >
                    ☀️ Light
                  </button>
                </div>
              </div>

              {/* Accent Color */}
              <div className="mb-4">
                <label className="block text-sm text-shell-300 mb-2">Accent Color</label>
                <div className="flex gap-2">
                  {accentColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setAccentColor(color.value)}
                      className={`w-8 h-8 rounded-full ${color.class} transition-all ${
                        accentColor === color.value
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-reef-800'
                          : 'hover:scale-110'
                      }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              {/* Toggles (for card style) */}
              {selectedStyle === 'card' && (
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showFeatures}
                      onChange={(e) => setShowFeatures(e.target.checked)}
                      className="w-4 h-4 text-coral-500 bg-reef-900 border-reef-600 rounded focus:ring-coral-500"
                    />
                    <span className="text-sm text-shell-300">Show features</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPricing}
                      onChange={(e) => setShowPricing(e.target.checked)}
                      className="w-4 h-4 text-coral-500 bg-reef-900 border-reef-600 rounded focus:ring-coral-500"
                    />
                    <span className="text-sm text-shell-300">Show x402 badge</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Preview & Embed Codes */}
          <div className="space-y-6">
            {/* Live Preview */}
            <div className="bg-reef-800/50 rounded-xl p-6 border border-reef-700/50">
              <h2 className="text-lg font-semibold text-white mb-4">Live Preview</h2>
              <div className={`flex items-center justify-center p-6 rounded-lg ${
                selectedTheme === 'light' ? 'bg-gray-100' : 'bg-reef-950'
              }`} style={{ minHeight: '200px' }}>
                <iframe
                  key={`${selectedAgent}-${selectedStyle}-${selectedTheme}-${accentColor}-${showFeatures}-${showPricing}`}
                  src={getWidgetUrl().replace('https://langoustine69.dev', '')}
                  width={getDimensions().width}
                  height={getDimensions().height}
                  frameBorder="0"
                  style={{ borderRadius: '12px', overflow: 'hidden' }}
                />
              </div>
              {currentAgent && (
                <p className="text-center text-shell-500 text-sm mt-3">
                  Previewing: {currentAgent.icon} {currentAgent.name}
                </p>
              )}
            </div>

            {/* Embed Codes */}
            <div className="bg-reef-800/50 rounded-xl p-6 border border-reef-700/50">
              <h2 className="text-lg font-semibold text-white mb-4">4. Get Embed Code</h2>
              
              {/* iframe embed */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-shell-300">HTML (iframe)</label>
                  <button
                    onClick={() => copyToClipboard(getIframeEmbed(), 'iframe')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                      copiedType === 'iframe'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-reef-700 text-shell-300 hover:bg-reef-600'
                    }`}
                  >
                    {copiedType === 'iframe' ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-reef-900 rounded-lg p-3 text-xs text-shell-300 font-mono overflow-x-auto whitespace-pre-wrap break-all">
                  {getIframeEmbed()}
                </pre>
              </div>

              {/* Script embed */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-shell-300">JavaScript (dynamic)</label>
                  <button
                    onClick={() => copyToClipboard(getScriptEmbed(), 'script')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                      copiedType === 'script'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-reef-700 text-shell-300 hover:bg-reef-600'
                    }`}
                  >
                    {copiedType === 'script' ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-reef-900 rounded-lg p-3 text-xs text-shell-300 font-mono overflow-x-auto whitespace-pre-wrap break-all">
                  {getScriptEmbed()}
                </pre>
              </div>

              {/* Direct URL */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-shell-300">Direct URL</label>
                  <button
                    onClick={() => copyToClipboard(getWidgetUrl(), 'url')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                      copiedType === 'url'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-reef-700 text-shell-300 hover:bg-reef-600'
                    }`}
                  >
                    {copiedType === 'url' ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                <code className="block bg-reef-900 rounded-lg p-3 text-xs text-coral-400 font-mono overflow-x-auto break-all">
                  {getWidgetUrl()}
                </code>
              </div>
            </div>

            {/* Also check badges */}
            <div className="bg-reef-800/30 rounded-xl p-4 border border-reef-700/30 text-center">
              <p className="text-shell-400 text-sm">
                Need smaller status badges for GitHub READMEs?{' '}
                <Link href="/badges" className="text-coral-400 hover:underline">
                  Check out our badges →
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* API Documentation */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">🔧 Widget API</h2>
          
          <div className="bg-reef-800/50 rounded-xl p-6 border border-reef-700/50">
            <h3 className="text-lg font-semibold text-white mb-3">Endpoint</h3>
            <code className="block bg-reef-900 rounded-lg p-4 text-coral-400 font-mono text-sm mb-6">
              GET /api/widget/[agentId]
            </code>

            <h3 className="text-lg font-semibold text-white mb-3">Query Parameters</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-shell-400 border-b border-reef-700">
                    <th className="pb-2 pr-4">Parameter</th>
                    <th className="pb-2 pr-4">Type</th>
                    <th className="pb-2 pr-4">Default</th>
                    <th className="pb-2">Description</th>
                  </tr>
                </thead>
                <tbody className="text-shell-300">
                  <tr className="border-b border-reef-700/30">
                    <td className="py-2 pr-4 font-mono text-coral-400">style</td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">card</td>
                    <td className="py-2">Widget style: card, compact, minimal</td>
                  </tr>
                  <tr className="border-b border-reef-700/30">
                    <td className="py-2 pr-4 font-mono text-coral-400">theme</td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">dark</td>
                    <td className="py-2">Color theme: dark, light</td>
                  </tr>
                  <tr className="border-b border-reef-700/30">
                    <td className="py-2 pr-4 font-mono text-coral-400">accent</td>
                    <td className="py-2 pr-4">hex</td>
                    <td className="py-2 pr-4">#f97316</td>
                    <td className="py-2">Accent color (hex code)</td>
                  </tr>
                  <tr className="border-b border-reef-700/30">
                    <td className="py-2 pr-4 font-mono text-coral-400">features</td>
                    <td className="py-2 pr-4">boolean</td>
                    <td className="py-2 pr-4">true</td>
                    <td className="py-2">Show features list (card style only)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-coral-400">pricing</td>
                    <td className="py-2 pr-4">boolean</td>
                    <td className="py-2 pr-4">true</td>
                    <td className="py-2">Show x402 badge (card style only)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-semibold text-white mt-6 mb-3">Examples</h3>
            <div className="space-y-3">
              <div>
                <p className="text-shell-400 text-sm mb-1">Default card widget:</p>
                <code className="block bg-reef-900 rounded p-2 text-xs text-shell-300 font-mono">
                  /api/widget/crypto-price-agent
                </code>
              </div>
              <div>
                <p className="text-shell-400 text-sm mb-1">Compact light theme with blue accent:</p>
                <code className="block bg-reef-900 rounded p-2 text-xs text-shell-300 font-mono">
                  /api/widget/weather-intel-agent?style=compact&theme=light&accent=%233b82f6
                </code>
              </div>
              <div>
                <p className="text-shell-400 text-sm mb-1">Minimal dark theme:</p>
                <code className="block bg-reef-900 rounded p-2 text-xs text-shell-300 font-mono">
                  /api/widget/natural-events-intel?style=minimal
                </code>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
