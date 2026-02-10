import { Metadata } from 'next';
import Link from 'next/link';
import { changelog, ChangelogEntry } from '@/data/changelog';

export const metadata: Metadata = {
  title: 'Changelog | Langoustine69',
  description: 'See what\'s new in the Langoustine69 x402 agent portfolio. Latest features, improvements, and updates.',
  openGraph: {
    title: 'Changelog | Langoustine69',
    description: 'Track all updates to the x402 agent portfolio.',
    type: 'website',
  },
  alternates: {
    types: {
      'application/rss+xml': 'https://langoustine69.dev/changelog.xml',
    },
  },
};

function TypeBadge({ type }: { type: ChangelogEntry['type'] }) {
  const styles = {
    feature: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    improvement: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    fix: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    breaking: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const labels = {
    feature: '✨ Feature',
    improvement: '⚡ Improvement',
    fix: '🐛 Fix',
    breaking: '💥 Breaking',
  };

  return (
    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded border ${styles[type]}`}>
      {labels[type]}
    </span>
  );
}

function ChangelogCard({ entry }: { entry: ChangelogEntry }) {
  return (
    <article className="relative pl-8 pb-12 group">
      {/* Timeline line */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-shell-700 group-last:bg-gradient-to-b group-last:from-shell-700 group-last:to-transparent" />
      
      {/* Timeline dot */}
      <div className="absolute left-0 top-1 w-2 h-2 -translate-x-1/2 rounded-full bg-lobster-500 ring-4 ring-shell-900" />

      <div className="bg-shell-800/50 border border-shell-700 rounded-xl p-6 hover:border-lobster-500/30 transition-colors">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="text-lobster-400 font-mono text-sm font-semibold">
            v{entry.version}
          </span>
          <TypeBadge type={entry.type} />
          <time className="text-shell-500 text-sm ml-auto">
            {new Date(entry.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </div>

        <h2 className="text-xl font-bold text-shell-100 mb-2">
          {entry.title}
        </h2>

        <p className="text-shell-400 mb-4">
          {entry.description}
        </p>

        <ul className="space-y-2">
          {entry.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-shell-300">
              <span className="text-lobster-500 mt-1">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default function ChangelogPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <nav className="text-sm text-shell-400 mb-4">
            <Link href="/" className="hover:text-lobster-400 transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-shell-200">Changelog</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Changelog</span>
          </h1>
          
          <p className="text-xl text-shell-400">
            Track all updates to the x402 agent portfolio. New features, improvements, 
            and fixes as they ship.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <a
              href="https://github.com/langoustine69"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-shell-400 hover:text-lobster-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              View on GitHub
            </a>
            <Link
              href="/changelog.xml"
              className="inline-flex items-center gap-2 text-sm text-shell-400 hover:text-lobster-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z"/>
              </svg>
              Changelog RSS
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Total Releases', value: changelog.length },
            { label: 'Features', value: changelog.filter(c => c.type === 'feature').length },
            { label: 'Improvements', value: changelog.filter(c => c.type === 'improvement').length },
            { label: 'Latest', value: `v${changelog[0].version}` },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-shell-800/50 border border-shell-700 rounded-lg p-4 text-center"
            >
              <div className="text-2xl font-bold text-lobster-400">{stat.value}</div>
              <div className="text-sm text-shell-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative">
          {changelog.map((entry) => (
            <ChangelogCard key={entry.version} entry={entry} />
          ))}
        </div>

        {/* Subscribe CTA */}
        <div className="mt-12 bg-gradient-to-r from-lobster-600/20 to-lobster-500/10 border border-lobster-500/30 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold text-shell-100 mb-2">
            Stay Updated
          </h3>
          <p className="text-shell-400 mb-4">
            Get notified when new features ship. Follow on X or subscribe to RSS.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://x.com/langoustine69A"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-shell-800 hover:bg-shell-700 text-shell-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-shell-700"
            >
              Follow @langoustine69A
            </a>
            <Link
              href="/changelog.xml"
              className="inline-flex items-center gap-2 bg-lobster-600 hover:bg-lobster-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z"/>
              </svg>
              Subscribe to Changelog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
