'use client';

import { useState, useEffect, useCallback } from 'react';
import { agents, getLiveAgents } from '@/data/agents';

interface Step {
  id: number;
  title: string;
  description: string;
  content: React.ReactNode;
}

interface QuickStartWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickStartWizard({ isOpen, onClose }: QuickStartWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [copiedCommand, setCopiedCommand] = useState(false);
  
  const liveAgents = getLiveAgents().slice(0, 6);
  const selectedAgentData = selectedAgent 
    ? agents.find(a => a.id === selectedAgent) 
    : liveAgents[0];

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
      if (currentStep < 3) setCurrentStep(prev => prev + 1);
    } else if (e.key === 'ArrowLeft') {
      if (currentStep > 0) setCurrentStep(prev => prev - 1);
    }
  }, [isOpen, currentStep, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const curlCommand = selectedAgentData?.railwayUrl 
    ? `curl -X POST ${selectedAgentData.railwayUrl}/api/a2a \\
  -H "Content-Type: application/json" \\
  -H "X-PAYMENT: <payment_token>" \\
  -d '{"jsonrpc":"2.0","method":"tasks/send","params":{"message":{"role":"user","parts":[{"text":"Hello!"}]}},"id":"1"}'`
    : '';

  const steps: Step[] = [
    {
      id: 0,
      title: 'Welcome to x402 Agents 🦞',
      description: 'Learn how to use micropayment-powered AI agents',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <span className="text-6xl">🦞</span>
            <h3 className="text-2xl font-bold text-shell-100 mt-4">
              Welcome to Langoustine69
            </h3>
            <p className="text-shell-400 mt-2">
              Your gateway to x402 micropayment agents
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-shell-800/50 border border-shell-700 rounded-xl p-4 text-center">
              <span className="text-3xl mb-2 block">💸</span>
              <h4 className="text-shell-100 font-medium">Pay Per Request</h4>
              <p className="text-shell-400 text-sm mt-1">
                Only pay for what you use. No subscriptions.
              </p>
            </div>
            <div className="bg-shell-800/50 border border-shell-700 rounded-xl p-4 text-center">
              <span className="text-3xl mb-2 block">⚡</span>
              <h4 className="text-shell-100 font-medium">Instant Access</h4>
              <p className="text-shell-400 text-sm mt-1">
                No API keys needed. Start in seconds.
              </p>
            </div>
            <div className="bg-shell-800/50 border border-shell-700 rounded-xl p-4 text-center">
              <span className="text-3xl mb-2 block">🔗</span>
              <h4 className="text-shell-100 font-medium">On-Chain Payments</h4>
              <p className="text-shell-400 text-sm mt-1">
                USDC on Base chain. Transparent & fast.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 1,
      title: 'Choose an Agent',
      description: 'Select an agent to try',
      content: (
        <div className="space-y-4">
          <p className="text-shell-400 text-center">
            Pick an agent to explore. Each provides real-time data via the x402 protocol.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
            {liveAgents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`
                  p-4 rounded-xl border text-left transition-all
                  ${selectedAgent === agent.id || (!selectedAgent && agent.id === liveAgents[0].id)
                    ? 'bg-lobster-500/20 border-lobster-500 ring-2 ring-lobster-500/50'
                    : 'bg-shell-800/50 border-shell-700 hover:border-shell-600'
                  }
                `}
              >
                <span className="text-2xl block mb-2">{agent.icon}</span>
                <h4 className="text-shell-100 font-medium text-sm">{agent.name}</h4>
                <p className="text-shell-500 text-xs mt-1 line-clamp-2">{agent.category}</p>
              </button>
            ))}
          </div>
          
          {selectedAgentData && (
            <div className="mt-6 p-4 bg-shell-800/30 border border-shell-700 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedAgentData.icon}</span>
                <div>
                  <h4 className="text-shell-100 font-medium">{selectedAgentData.name}</h4>
                  <p className="text-shell-400 text-sm">{selectedAgentData.description}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 2,
      title: 'Make Your First Request',
      description: 'Call the agent API',
      content: (
        <div className="space-y-4">
          <p className="text-shell-400 text-center">
            x402 agents use the A2A (Agent-to-Agent) protocol. Here's how to call one:
          </p>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2 text-shell-400 text-sm">
              <span className="bg-lobster-500/20 text-lobster-400 px-2 py-1 rounded text-xs font-mono">
                POST
              </span>
              <code className="font-mono text-shell-300">
                {selectedAgentData?.railwayUrl}/api/a2a
              </code>
            </div>

            <div className="relative">
              <pre className="bg-shell-900 border border-shell-700 rounded-xl p-4 overflow-x-auto text-sm">
                <code className="text-shell-300 font-mono whitespace-pre-wrap break-all">
                  {curlCommand}
                </code>
              </pre>
              <button
                onClick={() => copyToClipboard(curlCommand)}
                className="absolute top-2 right-2 p-2 bg-shell-800 hover:bg-shell-700 rounded-lg transition-colors"
                title="Copy to clipboard"
              >
                {copiedCommand ? (
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-shell-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-amber-400">💡</span>
                <div className="text-sm">
                  <p className="text-amber-300 font-medium">Payment Required</p>
                  <p className="text-amber-400/80 mt-1">
                    The X-PAYMENT header contains a payment token. Without it, the request returns a 402 status with payment details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: "You're Ready! 🎉",
      description: 'Start building with x402 agents',
      content: (
        <div className="space-y-6 text-center">
          <span className="text-6xl block">🚀</span>
          <h3 className="text-2xl font-bold text-shell-100">
            You're all set!
          </h3>
          <p className="text-shell-400 max-w-md mx-auto">
            Explore our {getLiveAgents().length} live agents and start integrating real-time data into your applications.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <a
              href="/agents"
              className="bg-lobster-600 hover:bg-lobster-500 text-white p-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <span>🔍</span>
              Browse All Agents
            </a>
            <a
              href="/playground"
              className="bg-shell-800 hover:bg-shell-700 text-shell-100 p-4 rounded-xl font-medium transition-colors border border-shell-700 flex items-center justify-center gap-2"
            >
              <span>⚡</span>
              Try the Playground
            </a>
          </div>

          <div className="mt-8 pt-8 border-t border-shell-700">
            <h4 className="text-shell-300 font-medium mb-4">Helpful Resources</h4>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="https://github.com/daydreamsai/lucid-agents"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-shell-400 hover:text-lobster-400 transition-colors"
              >
                📚 Lucid Agents SDK
              </a>
              <span className="text-shell-600">•</span>
              <a
                href="/docs"
                className="text-sm text-shell-400 hover:text-lobster-400 transition-colors"
              >
                📖 Documentation
              </a>
              <span className="text-shell-600">•</span>
              <a
                href="https://github.com/langoustine69"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-shell-400 hover:text-lobster-400 transition-colors"
              >
                🐙 GitHub
              </a>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-shell-900 border border-shell-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-shell-800">
          <div>
            <h2 className="text-xl font-bold text-shell-100">
              {currentStepData.title}
            </h2>
            <p className="text-shell-400 text-sm mt-1">
              {currentStepData.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-shell-800 rounded-lg transition-colors"
            aria-label="Close wizard"
          >
            <svg className="w-5 h-5 text-shell-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-shell-800/50">
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={`
                  flex-1 h-1.5 rounded-full transition-all
                  ${index <= currentStep ? 'bg-lobster-500' : 'bg-shell-700'}
                `}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-shell-500">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span className="text-shell-600">Use ← → keys to navigate</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {currentStepData.content}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-shell-800 bg-shell-900/50">
          <button
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 0}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${currentStep === 0
                ? 'text-shell-600 cursor-not-allowed'
                : 'text-shell-300 hover:bg-shell-800'
              }
            `}
          >
            ← Back
          </button>

          <div className="flex gap-2">
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="px-6 py-2 bg-lobster-600 hover:bg-lobster-500 text-white rounded-lg font-medium transition-colors"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-2 bg-lobster-600 hover:bg-lobster-500 text-white rounded-lg font-medium transition-colors"
              >
                Get Started 🦞
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to persist wizard state
export function useQuickStartWizard() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeenWizard, setHasSeenWizard] = useState(true);

  useEffect(() => {
    const seen = localStorage.getItem('langoustine69-wizard-seen');
    setHasSeenWizard(!!seen);
  }, []);

  const openWizard = () => setIsOpen(true);
  
  const closeWizard = () => {
    setIsOpen(false);
    localStorage.setItem('langoustine69-wizard-seen', 'true');
    setHasSeenWizard(true);
  };

  const resetWizard = () => {
    localStorage.removeItem('langoustine69-wizard-seen');
    setHasSeenWizard(false);
  };

  return { isOpen, hasSeenWizard, openWizard, closeWizard, resetWizard };
}
