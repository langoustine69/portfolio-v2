import AgentGrid from '@/components/AgentGrid';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import ApiPlayground from '@/components/ApiPlayground';
import PricingCalculator from '@/components/PricingCalculator';
import Testimonials from '@/components/Testimonials';
import ContactForm from '@/components/ContactForm';
import RecentActivity from '@/components/RecentActivity';
import AgentGraph from '@/components/AgentGraph';
import { HomePageJsonLd } from '@/components/JsonLd';
import { agents, getLiveAgents } from '@/data/agents';
import HomeHero from '@/components/HomeHero';
import { CategorySection, LiveAgentsHeader, TechStackSection, CTASection } from '@/components/HomeSections';

export default function Home() {
  const liveAgents = getLiveAgents();

  // Prepare category data
  const categories = [
    { icon: '🏈', name: 'Sports', count: agents.filter(a => a.category === 'Sports').length },
    { icon: '💰', name: 'Finance', count: agents.filter(a => a.category === 'Finance').length },
    { icon: '🌌', name: 'Space', count: agents.filter(a => a.category === 'Space').length },
    { icon: '📰', name: 'Tech News', count: agents.filter(a => a.category === 'Tech News').length },
    { icon: '🏎️', name: 'Motorsport', count: agents.filter(a => a.category === 'Motorsport').length },
    { icon: '⛓️', name: 'DeFi', count: agents.filter(a => a.category === 'DeFi').length },
  ];

  return (
    <div className="min-h-screen">
      {/* JSON-LD Structured Data - Organization, WebSite, Service, FAQ */}
      <HomePageJsonLd />
      
      {/* Hero Section - Translated */}
      <HomeHero liveAgentCount={liveAgents.length} />

      {/* Featured Carousel */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <FeaturedCarousel autoPlayInterval={5000} showControls />
        </div>
      </section>

      {/* Featured Categories - Translated */}
      <CategorySection categories={categories} />

      {/* Live Agents */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <LiveAgentsHeader />
          <AgentGrid showFilters={false} limit={6} showDetails />
        </div>
      </section>

      {/* Agent Ecosystem Graph */}
      <section className="bg-shell-900/30">
        <AgentGraph />
      </section>

      {/* Recent Activity Feed */}
      <section className="bg-shell-900/30">
        <RecentActivity limit={6} />
      </section>

      {/* API Playground */}
      <ApiPlayground />

      {/* Pricing Calculator */}
      <section className="bg-shell-900/30">
        <PricingCalculator />
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Tech Stack - Translated */}
      <TechStackSection />

      {/* CTA - Translated */}
      <CTASection />

      {/* Contact Form */}
      <section className="bg-shell-900/30">
        <ContactForm />
      </section>
    </div>
  );
}
