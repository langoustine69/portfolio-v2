import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { bundles } from '@/data/bundles';
import { agents } from '@/data/agents';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const bundle = bundles.find(b => b.id === id);
  
  if (!bundle) {
    return { title: 'Bundle Not Found' };
  }

  return {
    title: `${bundle.name} Bundle | Langoustine69`,
    description: bundle.description,
    openGraph: {
      title: `${bundle.name} Bundle | Langoustine69`,
      description: bundle.description,
    },
  };
}

export function generateStaticParams() {
  return bundles.map(bundle => ({ id: bundle.id }));
}

export default async function BundleDetailPage({ params }: Props) {
  const { id } = await params;
  const bundle = bundles.find(b => b.id === id);

  if (!bundle) {
    notFound();
  }

  const bundleAgents = bundle.agentIds
    .map(agentId => agents.find(a => a.id === agentId))
    .filter(Boolean);

  const liveCount = bundleAgents.filter(a => a?.status === 'live').length;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 py-12">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-4xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-white/80 text-sm mb-6">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/bundles" className="hover:text-white">Bundles</Link>
            <span>/</span>
            <span className="text-white">{bundle.name}</span>
          </nav>

          <div className="text-white">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl">{bundle.icon}</span>
              <div>
                <h1 className="text-3xl md:text-4xl font-black">{bundle.name}</h1>
                <p className="text-white/80">
                  {bundleAgents.length} agent{bundleAgents.length !== 1 ? 's' : ''} • {liveCount} live
                </p>
              </div>
            </div>
            <p className="text-lg text-white/90 max-w-2xl">
              {bundle.description}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Agents in Bundle */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Agents in this Bundle
          </h2>
          <div className="grid gap-4">
            {bundleAgents.map((agent) => (
              <Link 
                key={agent?.id} 
                href={`/agents/${agent?.id}`}
                className="group"
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg hover:border-orange-400 dark:hover:border-orange-500 transition-all flex items-center gap-4">
                  <span className="text-3xl group-hover:scale-110 transition-transform">
                    {agent?.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        {agent?.name}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        agent?.status === 'live'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : agent?.status === 'building'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {agent?.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                      {agent?.description}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Use Cases */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Use Cases
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-gray-700 dark:text-gray-300">
              {bundle.useCase}
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Benefits
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <ul className="space-y-3">
              {bundle.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Example Workflow */}
        {bundle.exampleWorkflow && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Example Workflow
            </h2>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200 dark:border-orange-800 p-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <p className="text-gray-700 dark:text-gray-300 italic">
                  {bundle.exampleWorkflow}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Compare Agents CTA */}
        <section className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">
              Compare these agents side-by-side
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              See features, rate limits, and pricing in detail
            </p>
          </div>
          <Link
            href={`/compare?agents=${bundle.agentIds.join(',')}`}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap"
          >
            Compare Agents
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </section>
      </div>
    </main>
  );
}
