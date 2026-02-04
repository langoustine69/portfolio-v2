'use client';

import Link from 'next/link';
import { useI18n } from './I18nProvider';
import QuickStartButton from './QuickStartButton';

interface HomeHeroProps {
  liveAgentCount: number;
}

export default function HomeHero({ liveAgentCount }: HomeHeroProps) {
  const { t } = useI18n();

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-shell-950/50 to-shell-950" />
      
      <div className="relative max-w-7xl mx-auto text-center">
        <div className="mb-6">
          <span className="inline-block px-4 py-1.5 bg-lobster-500/10 text-lobster-400 rounded-full text-sm font-medium border border-lobster-500/20">
            🦞 {liveAgentCount} {t('home.hero.agentsBadge')}
          </span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="gradient-text">Langoustine69</span>
          <br />
          <span className="text-shell-100">{t('home.hero.portfolioTitle')}</span>
        </h1>
        
        <p className="text-xl text-shell-400 max-w-2xl mx-auto mb-8">
          {t('home.hero.description')}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <QuickStartButton />
          <Link
            href="/agents"
            className="bg-shell-800 hover:bg-shell-700 text-white px-6 py-3 rounded-lg font-medium transition-colors border border-shell-700"
          >
            {t('home.hero.cta')}
          </Link>
          <a
            href="https://github.com/langoustine69"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-shell-800/50 hover:bg-shell-700 text-shell-300 hover:text-white px-6 py-3 rounded-lg font-medium transition-colors border border-shell-700"
          >
            {t('home.hero.github')}
          </a>
        </div>
      </div>
    </section>
  );
}
