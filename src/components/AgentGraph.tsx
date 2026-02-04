'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { agents, Agent } from '@/data/agents';
import Link from 'next/link';

interface Node {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  agent: Agent;
}

interface Edge {
  source: string;
  target: string;
  type: 'category' | 'synergy';
}

// Define agent synergies based on complementary use cases
const SYNERGIES: Record<string, string[]> = {
  'crypto-price-agent': ['meme-coin-tracker', 'solana-ecosystem-intel'],
  'meme-coin-tracker': ['crypto-price-agent', 'solana-ecosystem-intel'],
  'solana-ecosystem-intel': ['crypto-price-agent', 'meme-coin-tracker'],
  'weather-intel-agent': ['natural-events-intel', 'surf-conditions-intel'],
  'natural-events-intel': ['weather-intel-agent'],
  'surf-conditions-intel': ['weather-intel-agent'],
  'space-weather-agent': ['natural-events-intel'],
  'afl-stats-agent': ['nfl-intel-agent', 'f1-stats-agent'],
  'nfl-intel-agent': ['afl-stats-agent', 'f1-stats-agent'],
  'f1-stats-agent': ['nfl-intel-agent', 'afl-stats-agent'],
  'us-congress-intel': ['ai-policy-tracker'],
  'ai-policy-tracker': ['us-congress-intel'],
  'arxiv-ai-research': ['ai-policy-tracker'],
};

function buildGraph(filteredAgents: Agent[]): { nodes: Node[]; edges: Edge[] } {
  const agentIds = new Set(filteredAgents.map(a => a.id));
  
  // Create nodes with initial positions in a circle
  const nodes: Node[] = filteredAgents.map((agent, i) => {
    const angle = (2 * Math.PI * i) / filteredAgents.length;
    const radius = 200;
    return {
      id: agent.id,
      x: 300 + radius * Math.cos(angle),
      y: 250 + radius * Math.sin(angle),
      vx: 0,
      vy: 0,
      agent,
    };
  });

  // Create edges for same-category connections and synergies
  const edges: Edge[] = [];
  const edgeSet = new Set<string>();

  for (let i = 0; i < filteredAgents.length; i++) {
    for (let j = i + 1; j < filteredAgents.length; j++) {
      const a = filteredAgents[i];
      const b = filteredAgents[j];
      const key = [a.id, b.id].sort().join('--');
      
      if (edgeSet.has(key)) continue;

      // Same category connection
      if (a.category === b.category) {
        edges.push({ source: a.id, target: b.id, type: 'category' });
        edgeSet.add(key);
      }
      // Synergy connection
      else if (SYNERGIES[a.id]?.includes(b.id) || SYNERGIES[b.id]?.includes(a.id)) {
        edges.push({ source: a.id, target: b.id, type: 'synergy' });
        edgeSet.add(key);
      }
    }
  }

  return { nodes, edges };
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'DeFi': '#f59e0b',
    'Sports': '#22c55e',
    'Weather': '#3b82f6',
    'Space': '#8b5cf6',
    'Geoscience': '#ef4444',
    'Politics': '#ec4899',
    'Research': '#14b8a6',
    'Ocean': '#0ea5e9',
  };
  return colors[category] || '#6b7280';
}

export default function AgentGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [filter, setFilter] = useState<'all' | 'live'>('live');
  const [dimensions, setDimensions] = useState({ width: 600, height: 500 });
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const animationRef = useRef<number>(0);
  const draggingRef = useRef<Node | null>(null);

  // Filter agents and rebuild graph
  useEffect(() => {
    const filteredAgents = filter === 'live' 
      ? agents.filter(a => a.status === 'live')
      : agents;
    const { nodes, edges } = buildGraph(filteredAgents);
    
    // Scale positions to current dimensions
    nodes.forEach(n => {
      n.x = (n.x / 600) * dimensions.width;
      n.y = (n.y / 500) * dimensions.height;
    });
    
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [filter, dimensions]);

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.min(rect.width - 32, 800),
          height: Math.min(500, window.innerHeight * 0.5),
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Force-directed simulation
  const simulate = useCallback(() => {
    const nodes = nodesRef.current;
    const edges = edgesRef.current;
    
    // Apply forces
    for (const node of nodes) {
      // Repulsion from other nodes
      for (const other of nodes) {
        if (node.id === other.id) continue;
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = 1500 / (dist * dist);
        node.vx += (dx / dist) * force;
        node.vy += (dy / dist) * force;
      }

      // Attraction to center
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;
      node.vx += (centerX - node.x) * 0.003;
      node.vy += (centerY - node.y) * 0.003;
    }

    // Spring forces from edges
    for (const edge of edges) {
      const source = nodes.find(n => n.id === edge.source);
      const target = nodes.find(n => n.id === edge.target);
      if (!source || !target) continue;

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const idealDist = edge.type === 'category' ? 100 : 150;
      const force = (dist - idealDist) * 0.02;

      source.vx += (dx / dist) * force;
      source.vy += (dy / dist) * force;
      target.vx -= (dx / dist) * force;
      target.vy -= (dy / dist) * force;
    }

    // Update positions with damping
    for (const node of nodes) {
      if (draggingRef.current?.id === node.id) continue;
      
      node.vx *= 0.85;
      node.vy *= 0.85;
      node.x += node.vx;
      node.y += node.vy;

      // Boundary constraints
      const margin = 40;
      node.x = Math.max(margin, Math.min(dimensions.width - margin, node.x));
      node.y = Math.max(margin, Math.min(dimensions.height - margin, node.y));
    }
  }, [dimensions]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      simulate();
      
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      // Draw edges
      for (const edge of edgesRef.current) {
        const source = nodesRef.current.find(n => n.id === edge.source);
        const target = nodesRef.current.find(n => n.id === edge.target);
        if (!source || !target) continue;

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = edge.type === 'category' 
          ? 'rgba(239, 68, 68, 0.3)' 
          : 'rgba(59, 130, 246, 0.2)';
        ctx.lineWidth = edge.type === 'category' ? 2 : 1;
        if (edge.type === 'synergy') {
          ctx.setLineDash([4, 4]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.stroke();
      }

      // Draw nodes
      for (const node of nodesRef.current) {
        const isSelected = selectedNode?.id === node.id;
        const isHovered = hoveredNode?.id === node.id;
        const color = getCategoryColor(node.agent.category);
        
        // Glow effect for selected/hovered
        if (isSelected || isHovered) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 28, 0, Math.PI * 2);
          ctx.fillStyle = `${color}33`;
          ctx.fill();
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = node.agent.status === 'live' ? color : '#374151';
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#fff' : isHovered ? '#e5e7eb' : '#1f2937';
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.setLineDash([]);
        ctx.stroke();

        // Icon
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.agent.icon, node.x, node.y);
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationRef.current);
  }, [simulate, selectedNode, hoveredNode, dimensions]);

  // Mouse interactions
  const getNodeAt = (x: number, y: number): Node | null => {
    for (const node of nodesRef.current) {
      const dx = x - node.x;
      const dy = y - node.y;
      if (dx * dx + dy * dy < 400) return node;
    }
    return null;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (draggingRef.current) {
      draggingRef.current.x = x;
      draggingRef.current.y = y;
      draggingRef.current.vx = 0;
      draggingRef.current.vy = 0;
    } else {
      setHoveredNode(getNodeAt(x, y));
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const node = getNodeAt(x, y);
    
    if (node) {
      draggingRef.current = node;
      setSelectedNode(node);
    }
  };

  const handleMouseUp = () => {
    draggingRef.current = null;
  };

  // Get connected agents for selected node
  const getConnections = (nodeId: string) => {
    return edgesRef.current
      .filter(e => e.source === nodeId || e.target === nodeId)
      .map(e => {
        const otherId = e.source === nodeId ? e.target : e.source;
        const other = nodesRef.current.find(n => n.id === otherId);
        return { agent: other?.agent, type: e.type };
      })
      .filter(c => c.agent) as Array<{ agent: Agent; type: 'category' | 'synergy' }>;
  };

  const categories = [...new Set(agents.map(a => a.category))];

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-shell-100 mb-2">
            🔗 Agent Ecosystem
          </h2>
          <p className="text-shell-400 max-w-xl mx-auto">
            Explore how our agents connect and complement each other. 
            Drag nodes to rearrange. Click to see details.
          </p>
        </div>

        {/* Filter */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setFilter('live')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'live'
                ? 'bg-lobster-600 text-white'
                : 'bg-shell-800 text-shell-400 hover:text-shell-200'
            }`}
          >
            Live Agents
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-lobster-600 text-white'
                : 'bg-shell-800 text-shell-400 hover:text-shell-200'
            }`}
          >
            All Agents
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mb-6 text-xs">
          {categories.slice(0, 6).map(cat => (
            <div key={cat} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getCategoryColor(cat) }}
              />
              <span className="text-shell-400">{cat}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 border-l border-shell-700 pl-4">
            <div className="w-6 border-t-2 border-red-500/50" />
            <span className="text-shell-500">Same category</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 border-t border-dashed border-blue-500/50" />
            <span className="text-shell-500">Synergy</span>
          </div>
        </div>

        <div ref={containerRef} className="flex flex-col lg:flex-row gap-6">
          {/* Canvas */}
          <div className="flex-1 bg-shell-900/50 rounded-2xl border border-shell-700 p-4 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={dimensions.width}
              height={dimensions.height}
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="cursor-pointer"
              style={{ width: dimensions.width, height: dimensions.height }}
            />
          </div>

          {/* Details panel */}
          <div className="lg:w-72 bg-shell-800/50 border border-shell-700 rounded-xl p-5">
            {selectedNode ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: getCategoryColor(selectedNode.agent.category) + '33' }}
                  >
                    {selectedNode.agent.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-shell-100">
                      {selectedNode.agent.name}
                    </h3>
                    <p className="text-shell-500 text-sm">{selectedNode.agent.category}</p>
                  </div>
                </div>

                <p className="text-shell-400 text-sm mb-4 line-clamp-3">
                  {selectedNode.agent.description}
                </p>

                {/* Connections */}
                <div className="mb-4">
                  <h4 className="text-shell-300 text-xs uppercase tracking-wide mb-2">
                    Connections
                  </h4>
                  <div className="space-y-2">
                    {getConnections(selectedNode.id).length > 0 ? (
                      getConnections(selectedNode.id).map(({ agent, type }) => (
                        <div
                          key={agent.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span>{agent.icon}</span>
                          <span className="text-shell-300 truncate flex-1">
                            {agent.name}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            type === 'category' 
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {type}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-shell-600 text-sm">No direct connections</p>
                    )}
                  </div>
                </div>

                <Link
                  href={`/agents/${selectedNode.agent.id}`}
                  className="block w-full text-center bg-lobster-600 hover:bg-lobster-500 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                >
                  View Agent →
                </Link>
              </>
            ) : (
              <div className="text-center text-shell-500 py-8">
                <p className="text-4xl mb-3">👆</p>
                <p>Click an agent node to see details</p>
              </div>
            )}
          </div>
        </div>

        {/* Hovered tooltip */}
        {hoveredNode && !selectedNode && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-shell-800 border border-shell-700 rounded-lg px-4 py-2 shadow-lg z-50">
            <span className="mr-2">{hoveredNode.agent.icon}</span>
            <span className="text-shell-200">{hoveredNode.agent.name}</span>
            <span className="text-shell-500 ml-2">• Click to select</span>
          </div>
        )}
      </div>
    </section>
  );
}
