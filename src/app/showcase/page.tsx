import type { Metadata } from 'next';
import CommunityShowcase from '@/components/CommunityShowcase';
import Breadcrumbs from '@/components/Breadcrumbs';
import { showcaseProjects, categoryMeta, getFeaturedProjects } from '@/data/showcase';

export const metadata: Metadata = {
  title: 'Community Showcase | Built with x402 Agents',
  description: 'Explore amazing apps, dashboards, bots, and integrations built by developers using Langoustine69 x402 agents. Get inspired and submit your own project.',
  openGraph: {
    title: 'Community Showcase | Langoustine69',
    description: 'Discover what developers are building with x402 micropayment agents.',
    type: 'website',
  },
};

export default function ShowcasePage() {
  const featuredProjects = getFeaturedProjects();
  
  // Calculate stats
  const totalProjects = showcaseProjects.length;
  const totalCategories = Object.keys(categoryMeta).length;
  const totalAgentsUsed = [...new Set(showcaseProjects.flatMap(p => p.agents))].length;

  return (
    <main className="min-h-screen">
      <Breadcrumbs />
      
      {/* Hero */}
      <section className="py-16 px-4 bg-gradient-to-b from-shell-900 to-shell-950">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-lobster-600/10 border border-lobster-500/20 rounded-full text-lobster-400 text-sm mb-6">
            <span>🌟</span>
            <span>Community Gallery</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-shell-100 mb-4">
            Community <span className="gradient-text">Showcase</span>
          </h1>
          
          <p className="text-lg text-shell-400 max-w-2xl mx-auto mb-10">
            Amazing projects and products built by developers using our x402 agents. 
            From fantasy sports apps to DeFi dashboards — see what&apos;s possible.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            <div className="text-center">
              <p className="text-3xl font-bold gradient-text">{totalProjects}</p>
              <p className="text-shell-400 text-sm">Projects</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold gradient-text">{totalCategories}</p>
              <p className="text-shell-400 text-sm">Categories</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold gradient-text">{totalAgentsUsed}</p>
              <p className="text-shell-400 text-sm">Agents Used</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold gradient-text">{featuredProjects.length}</p>
              <p className="text-shell-400 text-sm">Featured</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Showcase */}
      <CommunityShowcase showHeader={false} />

      {/* How to Get Featured */}
      <section className="py-16 px-4 bg-shell-900/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-shell-100 text-center mb-10">
            How to Get Featured 🌟
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-shell-800/50 border border-shell-700 rounded-xl p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-lobster-600/20 rounded-full flex items-center justify-center text-2xl">
                1️⃣
              </div>
              <h3 className="text-shell-200 font-semibold mb-2">Build Something</h3>
              <p className="text-shell-400 text-sm">
                Create an app, bot, dashboard, or integration using any of our x402 agents.
              </p>
            </div>

            <div className="bg-shell-800/50 border border-shell-700 rounded-xl p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-lobster-600/20 rounded-full flex items-center justify-center text-2xl">
                2️⃣
              </div>
              <h3 className="text-shell-200 font-semibold mb-2">Submit Details</h3>
              <p className="text-shell-400 text-sm">
                Share your project name, description, screenshots, and which agents you use.
              </p>
            </div>

            <div className="bg-shell-800/50 border border-shell-700 rounded-xl p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-lobster-600/20 rounded-full flex items-center justify-center text-2xl">
                3️⃣
              </div>
              <h3 className="text-shell-200 font-semibold mb-2">Get Featured</h3>
              <p className="text-shell-400 text-sm">
                We&apos;ll review and add your project. Outstanding projects get featured status!
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <a
              href="/showcase/submit"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-lobster-600 to-lobster-500 hover:from-lobster-500 hover:to-lobster-400 text-white rounded-xl font-semibold transition-all shadow-lg shadow-lobster-600/20 hover:shadow-lobster-500/30"
            >
              <span>🚀</span>
              Submit Your Project
            </a>
          </div>
        </div>
      </section>

      {/* Category Browser */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-shell-100 text-center mb-10">
            Browse by Category
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(categoryMeta).map(([key, { icon, label }]) => {
              const count = showcaseProjects.filter(p => p.category === key).length;
              return (
                <div
                  key={key}
                  className="bg-shell-800/50 border border-shell-700 rounded-xl p-5 hover:border-lobster-500/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl group-hover:scale-110 transition-transform">{icon}</span>
                    <span className="text-shell-200 font-medium">{label}</span>
                  </div>
                  <p className="text-shell-500 text-sm">{count} project{count !== 1 ? 's' : ''}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
