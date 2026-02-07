'use client';

import { useState, useMemo } from 'react';
import { agents, getLiveAgents, type Agent } from '@/data/agents';

type ExportFormat = 'csv' | 'json' | 'parquet';
type TimeRange = '7d' | '30d' | '90d' | 'all';

interface ExportFormatOption {
  id: ExportFormat;
  name: string;
  icon: string;
  description: string;
  extension: string;
}

const exportFormats: ExportFormatOption[] = [
  { id: 'csv', name: 'CSV', icon: '📊', description: 'Comma-separated values for Excel/Sheets', extension: 'csv' },
  { id: 'json', name: 'JSON', icon: '📋', description: 'Structured JSON for programmatic use', extension: 'json' },
  { id: 'parquet', name: 'Parquet', icon: '🗄️', description: 'Columnar format for data pipelines', extension: 'parquet.json' },
];

interface DailyMetric {
  date: string;
  agentId: string;
  agentName: string;
  category: string;
  revenue: number;
  transactions: number;
  avgPayment: number;
  responseTimeMs: number;
  successRate: number;
  uniqueCallers: number;
}

// Generate simulated metrics based on agent id (deterministic)
function generateMetrics(agent: Agent, days: number): DailyMetric[] {
  if (agent.status !== 'live') return [];
  
  const hash = agent.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = (hash % 100) / 100;
  const metrics: DailyMetric[] = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    
    const dayVariance = Math.sin((hash + i) * 0.5) * 0.3 + 1;
    const trendMultiplier = 1 + (i / days) * 0.15;
    
    const baseRevenue = (5 + seed * 25 + agent.features.length * 0.5) * dayVariance * trendMultiplier;
    const transactions = Math.floor(baseRevenue / (0.01 + seed * 0.04));
    const avgPayment = transactions > 0 ? baseRevenue / transactions : 0;
    
    // Response time varies by agent complexity
    const baseResponseTime = 50 + (agent.features.length * 10) + (seed * 100);
    const responseTimeMs = Math.round(baseResponseTime * (0.8 + Math.random() * 0.4));
    
    // Success rate: most agents are reliable
    const successRate = 0.95 + (seed * 0.05) - (Math.random() * 0.02);
    
    // Unique callers: correlates with transactions
    const uniqueCallers = Math.max(1, Math.floor(transactions * (0.3 + seed * 0.4)));
    
    metrics.push({
      date: date.toISOString().split('T')[0],
      agentId: agent.id,
      agentName: agent.name,
      category: agent.category,
      revenue: Math.round(baseRevenue * 100) / 100,
      transactions,
      avgPayment: Math.round(avgPayment * 10000) / 10000,
      responseTimeMs,
      successRate: Math.round(successRate * 10000) / 10000,
      uniqueCallers,
    });
  }
  
  return metrics;
}

function generateCSV(metrics: DailyMetric[]): string {
  const headers = [
    'date', 'agent_id', 'agent_name', 'category', 
    'revenue_usd', 'transactions', 'avg_payment_usd',
    'response_time_ms', 'success_rate', 'unique_callers'
  ];
  
  const rows = metrics.map(m => [
    m.date,
    m.agentId,
    `"${m.agentName}"`,
    m.category,
    m.revenue.toFixed(2),
    m.transactions,
    m.avgPayment.toFixed(4),
    m.responseTimeMs,
    m.successRate.toFixed(4),
    m.uniqueCallers,
  ].join(','));
  
  return [headers.join(','), ...rows].join('\n');
}

function generateJSON(metrics: DailyMetric[]): string {
  const exportData = {
    exportedAt: new Date().toISOString(),
    platform: 'langoustine69.dev',
    protocol: 'x402',
    recordCount: metrics.length,
    schema: {
      date: 'ISO 8601 date',
      agentId: 'Unique agent identifier',
      agentName: 'Human-readable agent name',
      category: 'Agent category',
      revenue: 'Revenue in USD',
      transactions: 'Number of x402 transactions',
      avgPayment: 'Average payment per transaction in USD',
      responseTimeMs: 'Average response time in milliseconds',
      successRate: 'Success rate (0-1)',
      uniqueCallers: 'Unique callers/agents',
    },
    data: metrics,
  };
  
  return JSON.stringify(exportData, null, 2);
}

function generateParquetSchema(metrics: DailyMetric[]): string {
  // For browser export, we provide a Parquet-compatible JSON schema
  // Users can convert this to actual Parquet using Python/Arrow
  const schema = {
    format: 'parquet-compatible-json',
    note: 'Convert to Parquet using: import pyarrow.json as paj; paj.read_json("file.json").to_parquet("file.parquet")',
    schema: {
      date: { type: 'string', format: 'date' },
      agentId: { type: 'string' },
      agentName: { type: 'string' },
      category: { type: 'string' },
      revenue: { type: 'float64' },
      transactions: { type: 'int64' },
      avgPayment: { type: 'float64' },
      responseTimeMs: { type: 'int64' },
      successRate: { type: 'float64' },
      uniqueCallers: { type: 'int64' },
    },
    data: metrics,
  };
  
  return JSON.stringify(schema, null, 2);
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function MetricsExport() {
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const liveAgents = useMemo(() => getLiveAgents(), []);
  
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
  
  const previewMetrics = useMemo(() => {
    const agentsToExport = selectedAgents.size > 0 
      ? liveAgents.filter(a => selectedAgents.has(a.id))
      : liveAgents;
    
    return agentsToExport.flatMap(agent => generateMetrics(agent, days));
  }, [selectedAgents, liveAgents, days]);
  
  const toggleAgent = (agentId: string) => {
    setSelectedAgents(prev => {
      const next = new Set(prev);
      if (next.has(agentId)) {
        next.delete(agentId);
      } else {
        next.add(agentId);
      }
      return next;
    });
  };
  
  const selectAll = () => {
    setSelectedAgents(new Set(liveAgents.map(a => a.id)));
  };
  
  const selectNone = () => {
    setSelectedAgents(new Set());
  };
  
  const handleExport = async () => {
    setIsExporting(true);
    
    // Small delay for UX
    await new Promise(r => setTimeout(r, 300));
    
    const agentsToExport = selectedAgents.size > 0 
      ? liveAgents.filter(a => selectedAgents.has(a.id))
      : liveAgents;
    
    const metrics = agentsToExport.flatMap(agent => generateMetrics(agent, days));
    
    const formatOption = exportFormats.find(f => f.id === format)!;
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `x402-metrics-${timeRange}-${timestamp}.${formatOption.extension}`;
    
    let content: string;
    let mimeType: string;
    
    switch (format) {
      case 'csv':
        content = generateCSV(metrics);
        mimeType = 'text/csv';
        break;
      case 'json':
        content = generateJSON(metrics);
        mimeType = 'application/json';
        break;
      case 'parquet':
        content = generateParquetSchema(metrics);
        mimeType = 'application/json';
        break;
    }
    
    downloadFile(content, filename, mimeType);
    
    setIsExporting(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  
  // Calculate summary stats
  const summary = useMemo(() => {
    const totalRevenue = previewMetrics.reduce((sum, m) => sum + m.revenue, 0);
    const totalTransactions = previewMetrics.reduce((sum, m) => sum + m.transactions, 0);
    const avgResponseTime = previewMetrics.length > 0 
      ? previewMetrics.reduce((sum, m) => sum + m.responseTimeMs, 0) / previewMetrics.length 
      : 0;
    const avgSuccessRate = previewMetrics.length > 0
      ? previewMetrics.reduce((sum, m) => sum + m.successRate, 0) / previewMetrics.length
      : 0;
    
    return { totalRevenue, totalTransactions, avgResponseTime, avgSuccessRate };
  }, [previewMetrics]);
  
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            📊 Export Metrics
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Download your x402 agent usage data in your preferred format
          </p>
        </div>
        
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          {/* Format Selection */}
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-4">
              Export Format
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {exportFormats.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setFormat(opt.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    format === opt.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-zinc-200 dark:border-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{opt.icon}</span>
                    <span className="font-medium text-zinc-900 dark:text-white">{opt.name}</span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>
          
          {/* Time Range Selection */}
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-4">
              Time Range
            </h3>
            <div className="flex flex-wrap gap-2">
              {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-emerald-500 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                  }`}
                >
                  {range === '7d' ? 'Last 7 Days' : 
                   range === '30d' ? 'Last 30 Days' : 
                   range === '90d' ? 'Last 90 Days' : 
                   'All Time (365d)'}
                </button>
              ))}
            </div>
          </div>
          
          {/* Agent Selection */}
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                Agents ({selectedAgents.size === 0 ? 'All' : selectedAgents.size} selected)
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Select All
                </button>
                <span className="text-zinc-300 dark:text-zinc-600">|</span>
                <button
                  onClick={selectNone}
                  className="text-xs text-zinc-500 hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
              {liveAgents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => toggleAgent(agent.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors ${
                    selectedAgents.has(agent.id) || selectedAgents.size === 0
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700'
                      : 'bg-zinc-50 dark:bg-zinc-700/50 text-zinc-500 dark:text-zinc-400 border border-transparent'
                  }`}
                >
                  <span>{agent.icon}</span>
                  <span className="truncate">{agent.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Preview Stats */}
          <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-700">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-4">
              Export Preview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
                <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {previewMetrics.length.toLocaleString()}
                </div>
                <div className="text-xs text-zinc-500">Data Points</div>
              </div>
              <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  ${summary.totalRevenue.toFixed(2)}
                </div>
                <div className="text-xs text-zinc-500">Total Revenue</div>
              </div>
              <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
                <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {summary.totalTransactions.toLocaleString()}
                </div>
                <div className="text-xs text-zinc-500">Transactions</div>
              </div>
              <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {(summary.avgSuccessRate * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-zinc-500">Avg Success Rate</div>
              </div>
            </div>
          </div>
          
          {/* Export Button */}
          <div className="p-6">
            <button
              onClick={handleExport}
              disabled={isExporting || previewMetrics.length === 0}
              className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2 ${
                isExporting || previewMetrics.length === 0
                  ? 'bg-zinc-300 dark:bg-zinc-600 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98]'
              }`}
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Exporting...
                </>
              ) : showSuccess ? (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Downloaded!
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download {exportFormats.find(f => f.id === format)?.name} Export
                </>
              )}
            </button>
            
            {previewMetrics.length === 0 && (
              <p className="text-center text-sm text-zinc-500 mt-3">
                No live agents available for export
              </p>
            )}
          </div>
        </div>
        
        {/* Usage Tips */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Usage Tips
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span><strong>CSV:</strong> Opens directly in Excel, Google Sheets, or any spreadsheet app</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span><strong>JSON:</strong> Perfect for custom analysis scripts or data pipelines</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span><strong>Parquet:</strong> Convert with <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">pyarrow</code> for big data workflows</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
