'use client';

import Link from 'next/link';
import { Agent, agents } from '@/data/agents';

interface RelatedAgentsProps {
  currentAgent: Agent;
  maxAgents?: number;
}

// Define cross-category relationships for complementary suggestions
const categoryRelationships: Record<string, string[]> = {
  'DeFi': ['Finance', 'Analytics', 'News'],
  'Finance': ['DeFi', 'Analytics', 'News'],
  'Weather': ['Geoscience', 'Travel', 'Events'],
  'Geoscience': ['Weather', 'News', 'Analytics'],
  'News': ['Analytics', 'DeFi', 'Finance', 'Social'],
  'Analytics': ['DeFi', 'Finance', 'News'],
  'Language': ['Content', 'AI', 'Social'],
  'Content': ['Language', 'AI', 'Social'],
  'Social': ['Content', 'Language', 'News'],
  'Travel': ['Weather', 'Events', 'Maps'],
  'Events': ['Weather', 'Travel', 'News'],
  'AI': ['Language', 'Content', 'Analytics'],
  'Maps': ['Travel', 'Weather', 'Geoscience'],
};

function getRelatedAgents(currentAgent: Agent, maxCount: number): Agent[] {
  const related: Agent[] = [];
  const seenIds = new Set([currentAgent.id]);

  // First, get agents from the same category
  const sameCategory = agents.filter(
    (a) => a.category === currentAgent.category && a.id !== currentAgent.id && a.status === 'live'
  );
  
  for (const agent of sameCategory) {
    if (related.length >= maxCount) break;
    if (!seenIds.has(agent.id)) {
      related.push(agent);
      seenIds.add(agent.id);
    }
  }

  // If we need more, get from related categories
  if (related.length < maxCount) {
    const relatedCategories = categoryRelationships[currentAgent.category] || [];
    
    for (const category of relatedCategories) {
      if (related.length >= maxCount) break;
      
      const categoryAgents = agents.filter(
        (a) => a.category === category && !seenIds.has(a.id) && a.status === 'live'
      );
      
      for (const agent of categoryAgents) {
        if (related.length >= maxCount) break;
        related.push(agent);
        seenIds.add(agent.id);
      }
    }
  }

  // If still need more, add any live agents
  if (related.length < maxCount) {
    const remaining = agents.filter(
      (a) => !seenIds.has(a.id) && a.status === 'live'
    );
    
    for (const agent of remaining) {
      if (related.length >= maxCount) break;
      related.push(agent);
      seenIds.add(agent.id);
    }
  }

  return related;
}

function getRecommendationReason(currentAgent: Agent, relatedAgent: Agent): string {
  if (currentAgent.category === relatedAgent.category) {
    return `Also in ${currentAgent.category}`;
  }
  
  const relationships = categoryRelationships[currentAgent.category] || [];
  if (relationships.includes(relatedAgent.category)) {
    return `Complements ${currentAgent.name}`;
  }
  
  return 'Popular agent';
}

export default function RelatedAgents({ currentAgent, maxAgents = 3 }: RelatedAgentsProps) {
  const relatedAgents = getRelatedAgents(currentAgent, maxAgents);

  if (relatedAgents.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-sm font-medium text-[#666] uppercase tracking-wider mb-4">
        Related Agents
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {relatedAgents.map((agent) => {
          const reason = getRecommendationReason(currentAgent, agent);
          
          return (
            <Link
              key={agent.id}
              href={`/agents/${agent.id}`}
              className="group p-4 bg-[#1a1a1a] border border-[#333] rounded-lg hover:border-[#ff6b9d] transition-all hover:scale-[1.02]"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{agent.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white group-hover:text-[#ff6b9d] font-medium truncate transition-colors">
                    {agent.name}
                  </h3>
                  <p className="text-[#666] text-xs mt-1 truncate">{reason}</p>
                  <p className="text-[#888] text-sm mt-2 line-clamp-2">
                    {agent.description.split('.')[0]}.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#333]">
                <span className="text-[#666] text-xs">{agent.category}</span>
                <span className="text-[#ff6b9d] text-xs font-medium group-hover:translate-x-0.5 transition-transform">
                  View →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      
      {/* View All Link */}
      <div className="mt-4 text-center">
        <Link
          href={`/?category=${encodeURIComponent(currentAgent.category)}`}
          className="text-[#ff6b9d] hover:text-[#ff8bb0] text-sm font-medium transition-colors"
        >
          View all {currentAgent.category} agents →
        </Link>
      </div>
    </div>
  );
}
