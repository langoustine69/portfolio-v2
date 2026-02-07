import MetricsExport from '@/components/MetricsExport';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata = {
  title: 'Export Metrics | Langoustine69',
  description: 'Download your x402 agent usage data in CSV, JSON, or Parquet format. Export revenue, transactions, response times, and more.',
  openGraph: {
    title: 'Export Metrics | Langoustine69',
    description: 'Download your x402 agent usage data in CSV, JSON, or Parquet format.',
    type: 'website',
  },
};

export default function MetricsExportPage() {
  return (
    <div className="min-h-screen">
      {/* Breadcrumbs */}
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <Breadcrumbs 
          items={[
            { label: 'Home', href: '/' },
            { label: 'Analytics', href: '/analytics' },
            { label: 'Export Metrics', href: '/metrics-export' },
          ]} 
        />
      </div>
      
      {/* Header */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium mb-4">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Data Export
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-4">
            Agent Metrics Export
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Download comprehensive usage data for your x402 agents. Analyze revenue trends, 
            track performance, and integrate with your data pipelines.
          </p>
        </div>
      </section>
      
      {/* Main Export Component */}
      <MetricsExport />
      
      {/* Features Grid */}
      <section className="py-16 px-4 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white text-center mb-8">
            What&apos;s Included
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '💰', title: 'Revenue Data', desc: 'Daily revenue in USD per agent' },
              { icon: '📈', title: 'Transaction Counts', desc: 'Number of x402 payments processed' },
              { icon: '⚡', title: 'Response Times', desc: 'Average latency in milliseconds' },
              { icon: '✅', title: 'Success Rates', desc: 'Request success percentages' },
              { icon: '👥', title: 'Unique Callers', desc: 'Distinct agents/users per day' },
              { icon: '📊', title: 'Avg Payment', desc: 'Average payment per transaction' },
            ].map((item) => (
              <div 
                key={item.title}
                className="bg-white dark:bg-zinc-800 rounded-xl p-5 border border-zinc-200 dark:border-zinc-700"
              >
                <span className="text-2xl mb-2 block">{item.icon}</span>
                <h3 className="font-medium text-zinc-900 dark:text-white mb-1">{item.title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Code Examples */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white text-center mb-8">
            Example Usage
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Python Example */}
            <div className="bg-zinc-900 rounded-xl overflow-hidden">
              <div className="px-4 py-2 bg-zinc-800 border-b border-zinc-700 flex items-center gap-2">
                <span className="text-yellow-400">🐍</span>
                <span className="text-sm text-zinc-300 font-mono">Python (pandas)</span>
              </div>
              <pre className="p-4 text-sm text-zinc-300 overflow-x-auto">
                <code>{`import pandas as pd

# Load CSV export
df = pd.read_csv('x402-metrics-30d.csv')

# Revenue by agent
revenue = df.groupby('agent_id')['revenue_usd'].sum()
print(revenue.sort_values(ascending=False))

# Daily trends
daily = df.groupby('date').agg({
    'revenue_usd': 'sum',
    'transactions': 'sum'
})
daily.plot()`}</code>
              </pre>
            </div>
            
            {/* SQL Example */}
            <div className="bg-zinc-900 rounded-xl overflow-hidden">
              <div className="px-4 py-2 bg-zinc-800 border-b border-zinc-700 flex items-center gap-2">
                <span className="text-blue-400">🔷</span>
                <span className="text-sm text-zinc-300 font-mono">SQL (DuckDB)</span>
              </div>
              <pre className="p-4 text-sm text-zinc-300 overflow-x-auto">
                <code>{`-- Load JSON export directly
SELECT 
  agent_name,
  SUM(revenue) as total_revenue,
  AVG(success_rate) as avg_success
FROM read_json('x402-metrics-30d.json')
GROUP BY agent_name
ORDER BY total_revenue DESC;

-- Convert to Parquet
COPY (SELECT * FROM metrics) 
TO 'metrics.parquet';`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
