'use client';

import Link from 'next/link';
import { AgentBundle } from '@/data/bundles';
import { agents as allAgents } from '@/data/agents';

interface BundleCardProps {
  bundle: AgentBundle;
}

export default function BundleCard({ bundle }: BundleCardProps) {
  const bundleAgents = bundle.agentIds
    .map(id => allAgents.find(a => a.id === id))
    .filter(Boolean);

  const liveCount = bundleAgents.filter(a => a?.status === 'live').length;
  const totalAgents = bundleAgents.length;

  return (
    <Link href={`/bundles/${bundle.id}`}>
      <div className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-orange-400 dark:hover:border-orange-500 transition-all duration-200 cursor-pointer">
        {/* Icon and Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="text-4xl flex-shrink-0 group-hover:scale-110 transition-transform">
            {bundle.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors truncate">
              {bundle.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {totalAgents} agent{totalAgents !== 1 ? 's' : ''} • {liveCount} live
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {bundle.description}
        </p>

        {/* Agent Icons Preview */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex -space-x-2">
            {bundleAgents.slice(0, 5).map((agent) => (
              <div
                key={agent?.id}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-sm"
                title={agent?.name}
              >
                {agent?.icon}
              </div>
            ))}
            {bundleAgents.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium text-orange-600 dark:text-orange-400">
                +{bundleAgents.length - 5}
              </div>
            )}
          </div>
        </div>

        {/* Use Case Tag */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium text-gray-700 dark:text-gray-300">Use case:</span>{' '}
          {bundle.useCase.split(',')[0]}
        </div>

        {/* Hover Arrow */}
        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-orange-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
