import { Metadata } from 'next';
import AgentCompare from '@/components/AgentCompare';

export const metadata: Metadata = {
  title: 'Compare Agents',
  description: 'Compare x402 agents side-by-side. See features, status, API sources, and capabilities across multiple agents.',
  openGraph: {
    title: 'Compare Agents | langoustine69',
    description: 'Compare x402 agents side-by-side. See features, status, API sources, and capabilities.',
  },
};

export default function ComparePage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-shell-100 dark:text-shell-100 light:text-shell-900 mb-2">
            ⚖️ Compare Agents
          </h1>
          <p className="text-shell-400 dark:text-shell-400 light:text-shell-600">
            Select up to 4 agents to compare their features, status, and capabilities side-by-side.
          </p>
        </div>

        {/* Comparison Tool */}
        <AgentCompare />
      </div>
    </div>
  );
}
