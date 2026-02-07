'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { agents } from '@/data/agents';

// Types for workflow nodes and connections
interface WorkflowNode {
  id: string;
  agentId: string;
  x: number;
  y: number;
  inputs?: string[]; // input field names
  outputs?: string[]; // output field names
}

interface Connection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  fromOutput: string;
  toInput: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  connections: Connection[];
  createdAt: string;
  updatedAt: string;
}

// Pre-defined workflow templates
const templates: Workflow[] = [
  {
    id: 'weather-alert',
    name: 'Weather Alert Pipeline',
    description: 'Get weather data, check for severe conditions, and alert if needed',
    nodes: [
      { id: 'n1', agentId: 'weather-intel-agent', x: 100, y: 150, outputs: ['weather_data', 'alerts'] },
      { id: 'n2', agentId: 'natural-events-intel', x: 400, y: 100, inputs: ['location'], outputs: ['events'] },
    ],
    connections: [
      { id: 'c1', fromNodeId: 'n1', toNodeId: 'n2', fromOutput: 'weather_data', toInput: 'location' }
    ],
    createdAt: '2026-02-07',
    updatedAt: '2026-02-07'
  },
  {
    id: 'crypto-fx',
    name: 'Crypto-FX Analysis',
    description: 'Combine crypto prices with FX rates for multi-currency portfolio tracking',
    nodes: [
      { id: 'n1', agentId: 'crypto-price-agent', x: 100, y: 150, outputs: ['prices', 'market_data'] },
      { id: 'n2', agentId: 'fx-intel', x: 400, y: 150, inputs: ['base_currency'], outputs: ['fx_rates'] },
    ],
    connections: [
      { id: 'c1', fromNodeId: 'n1', toNodeId: 'n2', fromOutput: 'prices', toInput: 'base_currency' }
    ],
    createdAt: '2026-02-07',
    updatedAt: '2026-02-07'
  },
  {
    id: 'security-research',
    name: 'Security Research',
    description: 'Cross-reference security vulnerabilities with Wikipedia context',
    nodes: [
      { id: 'n1', agentId: 'security-intel', x: 100, y: 150, outputs: ['vulnerabilities', 'cves'] },
      { id: 'n2', agentId: 'wikipedia-intel', x: 400, y: 150, inputs: ['topic'], outputs: ['context'] },
    ],
    connections: [
      { id: 'c1', fromNodeId: 'n1', toNodeId: 'n2', fromOutput: 'cves', toInput: 'topic' }
    ],
    createdAt: '2026-02-07',
    updatedAt: '2026-02-07'
  }
];

export default function WorkflowBuilderPage() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState('My Workflow');
  const [savedWorkflows, setSavedWorkflows] = useState<Workflow[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [connecting, setConnecting] = useState<{ nodeId: string; output: string } | null>(null);
  const [draggedAgent, setDraggedAgent] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });

  // Load saved workflows from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('x402-workflows');
    if (saved) {
      try {
        setSavedWorkflows(JSON.parse(saved));
      } catch { /* ignore */ }
    }
  }, []);

  // Get agent by ID
  const getAgent = (agentId: string) => agents.find(a => a.id === agentId);
  const liveAgents = agents.filter(a => a.status === 'live');

  // Handle drag start from sidebar
  const handleDragStart = (e: React.DragEvent, agentId: string) => {
    e.dataTransfer.setData('agentId', agentId);
    setDraggedAgent(agentId);
  };

  // Handle drop on canvas
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const agentId = e.dataTransfer.getData('agentId');
    if (!agentId || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - canvasOffset.x;
    const y = e.clientY - rect.top - canvasOffset.y;

    const agent = getAgent(agentId);
    if (!agent) return;

    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      agentId,
      x,
      y,
      inputs: ['data_in', 'config'],
      outputs: ['result', 'status']
    };

    setNodes(prev => [...prev, newNode]);
    setDraggedAgent(null);
  }, [canvasOffset]);

  // Handle node drag within canvas
  const handleNodeDrag = useCallback((nodeId: string, deltaX: number, deltaY: number) => {
    setNodes(prev => prev.map(n => 
      n.id === nodeId ? { ...n, x: n.x + deltaX, y: n.y + deltaY } : n
    ));
  }, []);

  // Start connection
  const startConnection = (nodeId: string, output: string) => {
    setConnecting({ nodeId, output });
  };

  // Complete connection
  const completeConnection = (nodeId: string, input: string) => {
    if (connecting && connecting.nodeId !== nodeId) {
      const newConnection: Connection = {
        id: `conn-${Date.now()}`,
        fromNodeId: connecting.nodeId,
        toNodeId: nodeId,
        fromOutput: connecting.output,
        toInput: input
      };
      setConnections(prev => [...prev, newConnection]);
    }
    setConnecting(null);
  };

  // Delete node
  const deleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.fromNodeId !== nodeId && c.toNodeId !== nodeId));
    setSelectedNode(null);
  };

  // Delete connection
  const deleteConnection = (connId: string) => {
    setConnections(prev => prev.filter(c => c.id !== connId));
  };

  // Save workflow
  const saveWorkflow = () => {
    const workflow: Workflow = {
      id: `wf-${Date.now()}`,
      name: workflowName,
      description: `${nodes.length} agents chained together`,
      nodes,
      connections,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [...savedWorkflows, workflow];
    setSavedWorkflows(updated);
    localStorage.setItem('x402-workflows', JSON.stringify(updated));
  };

  // Load workflow
  const loadWorkflow = (workflow: Workflow) => {
    setNodes(workflow.nodes);
    setConnections(workflow.connections);
    setWorkflowName(workflow.name);
    setShowTemplates(false);
  };

  // Clear canvas
  const clearCanvas = () => {
    setNodes([]);
    setConnections([]);
    setSelectedNode(null);
    setWorkflowName('My Workflow');
  };

  // Generate workflow code
  const generateCode = () => {
    if (nodes.length === 0) return '// Add agents to your workflow first';
    
    let code = `// x402 Multi-Agent Workflow: ${workflowName}\n`;
    code += `// Generated by langoustine69.dev\n\n`;
    code += `import { x402Client } from '@anthropic/x402-client';\n\n`;
    code += `async function runWorkflow() {\n`;
    code += `  const client = new x402Client();\n\n`;

    // Generate node variables
    nodes.forEach((node, i) => {
      const agent = getAgent(node.agentId);
      code += `  // Step ${i + 1}: ${agent?.name}\n`;
      code += `  const step${i + 1} = await client.call('${agent?.railwayUrl}', {\n`;
      
      // Find inputs from connections
      const inputConns = connections.filter(c => c.toNodeId === node.id);
      if (inputConns.length > 0) {
        inputConns.forEach(conn => {
          const fromIdx = nodes.findIndex(n => n.id === conn.fromNodeId);
          code += `    ${conn.toInput}: step${fromIdx + 1}.${conn.fromOutput},\n`;
        });
      } else {
        code += `    // input parameters\n`;
      }
      code += `  });\n\n`;
    });

    code += `  return step${nodes.length};\n`;
    code += `}\n`;

    return code;
  };

  // Render SVG connections
  const renderConnections = () => {
    return connections.map(conn => {
      const fromNode = nodes.find(n => n.id === conn.fromNodeId);
      const toNode = nodes.find(n => n.id === conn.toNodeId);
      if (!fromNode || !toNode) return null;

      const x1 = fromNode.x + 240; // Right side of node
      const y1 = fromNode.y + 60;  // Center height
      const x2 = toNode.x;         // Left side of node
      const y2 = toNode.y + 60;

      // Bezier curve control points
      const cpx1 = x1 + 50;
      const cpx2 = x2 - 50;

      return (
        <g key={conn.id} className="group cursor-pointer" onClick={() => deleteConnection(conn.id)}>
          <path
            d={`M${x1},${y1} C${cpx1},${y1} ${cpx2},${y2} ${x2},${y2}`}
            fill="none"
            stroke="url(#gradient-line)"
            strokeWidth={3}
            className="group-hover:stroke-red-500 transition-colors"
          />
          <circle cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} r={8} 
            className="fill-zinc-800 stroke-zinc-600 group-hover:fill-red-500 group-hover:stroke-red-400" 
            strokeWidth={2}
          />
          <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 + 4} 
            className="fill-zinc-400 group-hover:fill-white text-xs select-none" 
            textAnchor="middle">×</text>
        </g>
      );
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold text-orange-500 hover:text-orange-400">
              🦞
            </Link>
            <div className="h-6 w-px bg-zinc-700" />
            <h1 className="text-lg font-semibold">Workflow Builder</h1>
            <span className="px-2 py-0.5 text-xs font-medium bg-orange-500/20 text-orange-400 rounded-full">
              Beta
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-orange-500"
              placeholder="Workflow name..."
            />
            <button
              onClick={() => setShowTemplates(true)}
              className="px-3 py-1.5 text-sm border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              📋 Templates
            </button>
            <button
              onClick={saveWorkflow}
              disabled={nodes.length === 0}
              className="px-3 py-1.5 text-sm bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💾 Save
            </button>
            <button
              onClick={() => setShowExport(true)}
              disabled={nodes.length === 0}
              className="px-3 py-1.5 text-sm bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📤 Export
            </button>
            <button
              onClick={clearCanvas}
              className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 rounded-lg transition-colors"
            >
              🗑️ Clear
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-57px)]">
        {/* Sidebar - Agent Palette */}
        <aside className="w-72 border-r border-zinc-800 bg-zinc-900/30 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
              Drag Agents to Canvas
            </h2>
            <div className="space-y-2">
              {liveAgents.map(agent => (
                <div
                  key={agent.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, agent.id)}
                  className={`
                    p-3 rounded-lg border border-zinc-700 bg-zinc-800/50 
                    cursor-grab active:cursor-grabbing hover:border-orange-500/50 
                    hover:bg-zinc-800 transition-all group
                    ${draggedAgent === agent.id ? 'opacity-50 border-orange-500' : ''}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{agent.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate group-hover:text-orange-400 transition-colors">
                        {agent.name}
                      </h3>
                      <p className="text-xs text-zinc-500 truncate">{agent.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Canvas */}
        <main 
          ref={canvasRef}
          className="flex-1 relative overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => setSelectedNode(null)}
        >
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(63 63 70) 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}
          />

          {/* SVG layer for connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            <defs>
              <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#fb923c" />
              </linearGradient>
            </defs>
            <g style={{ pointerEvents: 'auto' }}>
              {renderConnections()}
            </g>
          </svg>

          {/* Nodes */}
          {nodes.map(node => {
            const agent = getAgent(node.agentId);
            if (!agent) return null;

            return (
              <WorkflowNodeComponent
                key={node.id}
                node={node}
                agent={agent}
                isSelected={selectedNode === node.id}
                isConnecting={connecting !== null}
                onSelect={() => setSelectedNode(node.id)}
                onDrag={handleNodeDrag}
                onDelete={() => deleteNode(node.id)}
                onStartConnection={startConnection}
                onCompleteConnection={completeConnection}
              />
            );
          })}

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl">🔗</div>
                <h2 className="text-xl font-semibold text-zinc-400">
                  Drag agents here to build your workflow
                </h2>
                <p className="text-zinc-500 max-w-md">
                  Chain multiple x402 agents together to create powerful multi-step automations.
                  Connect outputs to inputs to pass data between agents.
                </p>
                <button
                  onClick={() => setShowTemplates(true)}
                  className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors"
                >
                  Start from Template
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowTemplates(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Workflow Templates</h2>
              <button onClick={() => setShowTemplates(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto max-h-[60vh]">
              {templates.map(template => (
                <button
                  key={template.id}
                  onClick={() => loadWorkflow(template)}
                  className="w-full p-4 border border-zinc-700 rounded-lg hover:border-orange-500/50 hover:bg-zinc-800/50 transition-all text-left group"
                >
                  <h3 className="font-medium group-hover:text-orange-400 transition-colors">{template.name}</h3>
                  <p className="text-sm text-zinc-500 mt-1">{template.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-zinc-600">{template.nodes.length} agents</span>
                    <span className="text-xs text-zinc-600">•</span>
                    <span className="text-xs text-zinc-600">{template.connections.length} connections</span>
                  </div>
                </button>
              ))}
              {savedWorkflows.length > 0 && (
                <>
                  <div className="border-t border-zinc-800 pt-3 mt-3">
                    <h3 className="text-sm font-medium text-zinc-400 mb-2">Your Saved Workflows</h3>
                  </div>
                  {savedWorkflows.map(wf => (
                    <button
                      key={wf.id}
                      onClick={() => loadWorkflow(wf)}
                      className="w-full p-4 border border-zinc-700 rounded-lg hover:border-orange-500/50 hover:bg-zinc-800/50 transition-all text-left group"
                    >
                      <h3 className="font-medium group-hover:text-orange-400 transition-colors">{wf.name}</h3>
                      <p className="text-sm text-zinc-500 mt-1">{wf.description}</p>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowExport(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Export Workflow Code</h2>
              <button onClick={() => setShowExport(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <div className="p-4">
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-zinc-300 font-mono whitespace-pre-wrap">
                  {generateCode()}
                </pre>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateCode());
                  }}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors"
                >
                  📋 Copy Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Node Component
interface WorkflowNodeComponentProps {
  node: WorkflowNode;
  agent: NonNullable<ReturnType<typeof getAgent>>;
  isSelected: boolean;
  isConnecting: boolean;
  onSelect: () => void;
  onDrag: (nodeId: string, deltaX: number, deltaY: number) => void;
  onDelete: () => void;
  onStartConnection: (nodeId: string, output: string) => void;
  onCompleteConnection: (nodeId: string, input: string) => void;
}

function getAgent(agentId: string) {
  return agents.find(a => a.id === agentId);
}

function WorkflowNodeComponent({
  node,
  agent,
  isSelected,
  isConnecting,
  onSelect,
  onDrag,
  onDelete,
  onStartConnection,
  onCompleteConnection
}: WorkflowNodeComponentProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.port')) return;
    e.stopPropagation();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    onSelect();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStart.current.x;
      const deltaY = e.clientY - dragStart.current.y;
      dragStart.current = { x: e.clientX, y: e.clientY };
      onDrag(node.id, deltaX, deltaY);
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, node.id, onDrag]);

  return (
    <div
      ref={nodeRef}
      className={`
        absolute w-60 bg-zinc-900 border-2 rounded-xl shadow-xl cursor-move select-none
        transition-all duration-150
        ${isSelected ? 'border-orange-500 shadow-orange-500/20' : 'border-zinc-700 hover:border-zinc-500'}
        ${isDragging ? 'scale-105 shadow-2xl' : ''}
      `}
      style={{ left: node.x, top: node.y, zIndex: isSelected ? 10 : 2 }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-zinc-800 flex items-center gap-2 bg-zinc-800/50 rounded-t-xl">
        <span className="text-lg">{agent.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{agent.name}</h3>
          <p className="text-xs text-zinc-500 truncate">{agent.category}</p>
        </div>
        {isSelected && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-red-400 hover:text-red-300 p-1"
          >
            🗑️
          </button>
        )}
      </div>

      {/* Body with ports */}
      <div className="p-3 flex justify-between">
        {/* Input ports */}
        <div className="space-y-2">
          <span className="text-xs text-zinc-500 uppercase">Inputs</span>
          {(node.inputs || ['data']).map(input => (
            <div
              key={input}
              className="port flex items-center gap-2 cursor-pointer group"
              onClick={() => isConnecting && onCompleteConnection(node.id, input)}
            >
              <div className={`
                w-3 h-3 rounded-full border-2 transition-all
                ${isConnecting ? 'border-green-400 bg-green-400/20 scale-125' : 'border-zinc-500 bg-zinc-800 group-hover:border-orange-400'}
              `} />
              <span className="text-xs text-zinc-400">{input}</span>
            </div>
          ))}
        </div>

        {/* Output ports */}
        <div className="space-y-2 text-right">
          <span className="text-xs text-zinc-500 uppercase">Outputs</span>
          {(node.outputs || ['result']).map(output => (
            <div
              key={output}
              className="port flex items-center gap-2 justify-end cursor-pointer group"
              onClick={() => !isConnecting && onStartConnection(node.id, output)}
            >
              <span className="text-xs text-zinc-400">{output}</span>
              <div className="w-3 h-3 rounded-full border-2 border-zinc-500 bg-zinc-800 group-hover:border-orange-400 group-hover:bg-orange-400/20 transition-all" />
            </div>
          ))}
        </div>
      </div>

      {/* Status indicator */}
      <div className="px-3 py-1.5 border-t border-zinc-800 bg-zinc-800/30 rounded-b-xl">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-zinc-500">Live</span>
        </div>
      </div>
    </div>
  );
}
