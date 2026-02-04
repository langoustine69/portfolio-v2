import { Metadata } from 'next';
import { agents, Agent } from '@/data/agents';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import DeepCompareClient from './DeepCompareClient';

interface Props {
  params: Promise<{ ids: string[] }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ids } = await params;
  const selectedAgents = ids
    .map(id => agents.find(a => a.id === id))
    .filter(Boolean) as Agent[];
  
  if (selectedAgents.length === 0) {
    return { title: 'Compare Agents' };
  }

  const names = selectedAgents.map(a => a.name).join(' vs ');
  return {
    title: `${names} | Deep Comparison`,
    description: `Detailed comparison of ${names} - features, rate limits, changelogs, and integration examples.`,
    openGraph: {
      title: `${names} | Deep Comparison`,
      description: `Side-by-side deep dive: ${selectedAgents.map(a => a.name).join(', ')}`,
    },
  };
}

export default async function DeepComparePage({ params }: Props) {
  const { ids } = await params;
  
  // Validate and find agents
  const selectedAgents = ids
    .slice(0, 4) // Max 4 agents
    .map(id => agents.find(a => a.id === id))
    .filter(Boolean) as Agent[];

  if (selectedAgents.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-shell-400 mb-4">
            <Link href="/compare" className="hover:text-lobster-400 transition-colors">
              ⚖️ Compare
            </Link>
            <span>/</span>
            <span className="text-shell-300">Deep Comparison</span>
          </div>
          <h1 className="text-3xl font-bold text-shell-100 dark:text-shell-100 light:text-shell-900 mb-2">
            🔬 Deep Comparison
          </h1>
          <p className="text-shell-400 dark:text-shell-400 light:text-shell-600">
            Detailed analysis of {selectedAgents.map(a => a.name).join(' vs ')}
          </p>
        </div>

        {/* Share URL */}
        <div className="mb-8 bg-shell-900/50 dark:bg-shell-900/50 light:bg-white border border-shell-800 dark:border-shell-800 light:border-shell-200 rounded-lg p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-shell-400">📎 Share this comparison:</span>
              <code className="text-sm bg-shell-800 dark:bg-shell-800 light:bg-shell-100 px-3 py-1 rounded text-lobster-400 font-mono">
                /compare/deep/{ids.join('/')}
              </code>
            </div>
            <Link
              href="/compare"
              className="text-sm text-shell-400 hover:text-lobster-400 transition-colors"
            >
              ← Back to comparison tool
            </Link>
          </div>
        </div>

        {/* Client-side comparison content */}
        <DeepCompareClient agents={selectedAgents} />
      </div>
    </div>
  );
}
