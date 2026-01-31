import { Metadata } from 'next';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

export const metadata: Metadata = {
  title: 'API Analytics',
  description: 'Usage analytics and performance metrics for Langoustine69 x402 agents.',
};

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">📊</span>
            <h1 className="text-3xl font-bold text-shell-100">API Analytics</h1>
          </div>
          <p className="text-shell-400">
            Real-time usage metrics and performance data across all x402 agents.
          </p>
        </div>

        <AnalyticsDashboard />
      </div>
    </div>
  );
}
