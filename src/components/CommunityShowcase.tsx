'use client';

import { useState } from 'react';
import Link from 'next/link';
import { showcaseProjects, ShowcaseProject, categoryMeta } from '@/data/showcase';

interface CommunityShowcaseProps {
  limit?: number;
  showFilters?: boolean;
  showHeader?: boolean;
  compact?: boolean;
}

type CategoryFilter = ShowcaseProject['category'] | 'all';

export default function CommunityShowcase({
  limit,
  showFilters = true,
  showHeader = true,
  compact = false,
}: CommunityShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = showcaseProjects.filter(project => {
    const matchesCategory = activeCategory === 'all' || project.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const displayProjects = limit ? filteredProjects.slice(0, limit) : filteredProjects;

  const categories: CategoryFilter[] = ['all', 'app', 'dashboard', 'bot', 'integration', 'research', 'game'];

  return (
    <section className={`${compact ? 'py-8' : 'py-16'} px-4`}>
      <div className="max-w-7xl mx-auto">
        {showHeader && (
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-lobster-600/10 border border-lobster-500/20 rounded-full text-lobster-400 text-sm mb-4">
              <span>🌟</span>
              <span>Community Showcase</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-shell-100 mb-3">
              Built with x402 Agents
            </h2>
            <p className="text-shell-400 max-w-2xl mx-auto">
              Discover amazing projects and products powered by our agents. 
              From fantasy sports apps to DeFi dashboards — see what developers are building.
            </p>
          </div>
        )}

        {showFilters && (
          <div className="mb-8 space-y-4">
            {/* Search */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-10 bg-shell-800 border border-shell-700 rounded-xl text-shell-100 placeholder:text-shell-500 focus:outline-none focus:border-lobster-500/50"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-shell-500">
                  🔍
                </span>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeCategory === cat
                      ? 'bg-lobster-600 text-white shadow-lg shadow-lobster-600/20'
                      : 'bg-shell-800 text-shell-400 hover:text-shell-200 hover:bg-shell-700 border border-shell-700'
                  }`}
                >
                  {cat === 'all' ? '✨ All' : `${categoryMeta[cat].icon} ${categoryMeta[cat].label}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Project Grid */}
        <div className={`grid gap-6 ${compact ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {displayProjects.map((project) => (
            <ShowcaseCard key={project.id} project={project} />
          ))}
        </div>

        {displayProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-shell-500 text-lg">No projects found matching your criteria</p>
            <button
              onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
              className="mt-4 text-lobster-400 hover:text-lobster-300"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* CTA */}
        {!compact && (
          <div className="mt-12 text-center">
            <div className="inline-flex flex-col sm:flex-row gap-4 items-center justify-center p-6 bg-gradient-to-r from-shell-800/50 to-shell-900/50 border border-shell-700 rounded-2xl">
              <div className="text-left">
                <p className="text-shell-200 font-medium">Built something cool with our agents?</p>
                <p className="text-shell-400 text-sm">Get featured in our showcase!</p>
              </div>
              <Link
                href="/showcase/submit"
                className="px-6 py-3 bg-lobster-600 hover:bg-lobster-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-lobster-600/20 hover:shadow-lobster-500/30"
              >
                Submit Your Project
              </Link>
            </div>
          </div>
        )}

        {limit && displayProjects.length >= limit && (
          <div className="mt-8 text-center">
            <Link
              href="/showcase"
              className="inline-flex items-center gap-2 px-6 py-3 bg-shell-800 hover:bg-shell-700 border border-shell-700 text-shell-200 rounded-xl transition-all"
            >
              View All Projects
              <span>→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function ShowcaseCard({ project }: { project: ShowcaseProject }) {
  const categoryInfo = categoryMeta[project.category];

  return (
    <article className="group bg-shell-800/50 border border-shell-700 rounded-2xl overflow-hidden hover:border-lobster-500/30 transition-all hover:shadow-xl hover:shadow-lobster-500/5">
      {/* Header with emoji/logo */}
      <div className="relative h-32 bg-gradient-to-br from-shell-700/50 to-shell-800/50 flex items-center justify-center">
        <span className="text-6xl transform group-hover:scale-110 transition-transform">
          {project.image}
        </span>
        {project.featured && (
          <span className="absolute top-3 right-3 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
            ⭐ Featured
          </span>
        )}
        <span className="absolute top-3 left-3 px-2 py-1 bg-shell-900/60 text-shell-300 text-xs rounded-full">
          {categoryInfo.icon} {categoryInfo.label}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-shell-100 mb-2 group-hover:text-lobster-400 transition-colors">
          {project.name}
        </h3>
        <p className="text-shell-400 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-shell-700/50 text-shell-400 text-xs rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Stats */}
        {project.stats && (
          <div className="flex gap-4 mb-4 py-3 border-t border-shell-700/50">
            {project.stats.users && (
              <div className="text-center">
                <p className="text-shell-200 font-semibold text-sm">{project.stats.users}</p>
                <p className="text-shell-500 text-xs">Users</p>
              </div>
            )}
            {project.stats.requests && (
              <div className="text-center">
                <p className="text-shell-200 font-semibold text-sm">{project.stats.requests}</p>
                <p className="text-shell-500 text-xs">Requests</p>
              </div>
            )}
            {project.stats.stars && (
              <div className="text-center">
                <p className="text-shell-200 font-semibold text-sm">⭐ {project.stats.stars}</p>
                <p className="text-shell-500 text-xs">Stars</p>
              </div>
            )}
          </div>
        )}

        {/* Author */}
        <div className="flex items-center justify-between pt-3 border-t border-shell-700/50">
          <div className="flex items-center gap-2">
            <span className="text-lg">{project.author.avatar}</span>
            <div>
              <p className="text-shell-300 text-sm font-medium">{project.author.name}</p>
              {project.author.handle && (
                <p className="text-shell-500 text-xs">{project.author.handle}</p>
              )}
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-2">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-shell-700 hover:bg-shell-600 rounded-lg text-shell-400 hover:text-shell-200 transition-all"
                aria-label="View on GitHub"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>
            )}
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-lobster-600 hover:bg-lobster-500 rounded-lg text-white transition-all"
                aria-label="Visit project"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
