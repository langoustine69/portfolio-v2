'use client';

import { useState, useEffect } from 'react';

interface FlowStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  httpStatus?: string;
  code?: string;
  sender: 'client' | 'agent' | 'payment';
}

const flowSteps: FlowStep[] = [
  {
    id: 1,
    title: 'Client Makes Request',
    description: 'Your application sends an HTTP request to the agent endpoint, just like any normal API call.',
    icon: '📱',
    sender: 'client',
    code: `fetch('https://agent.x402.org/api/weather', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ city: 'Sydney' })
})`,
  },
  {
    id: 2,
    title: 'Agent Returns 402',
    description: 'The agent responds with HTTP 402 Payment Required, including payment details in the response headers.',
    icon: '🦞',
    httpStatus: '402',
    sender: 'agent',
    code: `HTTP/1.1 402 Payment Required
X-Payment-Required: true
X-Payment-Amount: 0.001
X-Payment-Currency: USD
X-Payment-Address: 0x1234...
X-Payment-Network: base`,
  },
  {
    id: 3,
    title: 'Client Initiates Payment',
    description: 'The x402 client library automatically handles the micropayment using the configured wallet or payment method.',
    icon: '💳',
    sender: 'payment',
    code: `// x402 SDK handles this automatically
const payment = await x402.pay({
  amount: '0.001',
  currency: 'USD',
  address: '0x1234...',
  network: 'base'
});`,
  },
  {
    id: 4,
    title: 'Payment Confirmed',
    description: 'The payment is confirmed on-chain (usually within seconds on L2 networks like Base).',
    icon: '✅',
    sender: 'payment',
    code: `{
  "txHash": "0xabc123...",
  "confirmed": true,
  "blockNumber": 12345678
}`,
  },
  {
    id: 5,
    title: 'Request Replayed with Proof',
    description: 'The original request is automatically replayed with the payment proof attached.',
    icon: '🔄',
    sender: 'client',
    code: `fetch('https://agent.x402.org/api/weather', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Payment-Proof': '0xabc123...'
  },
  body: JSON.stringify({ city: 'Sydney' })
})`,
  },
  {
    id: 6,
    title: 'Agent Delivers Response',
    description: 'The agent verifies the payment and returns the actual API response. The whole flow takes ~2-5 seconds.',
    icon: '🎉',
    httpStatus: '200',
    sender: 'agent',
    code: `HTTP/1.1 200 OK
Content-Type: application/json

{
  "city": "Sydney",
  "temperature": 24,
  "conditions": "Sunny",
  "humidity": 65
}`,
  },
];

export default function PaymentFlowVisualizer() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCode, setShowCode] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= flowSteps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (activeStep >= flowSteps.length - 1) {
      setActiveStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setIsPlaying(false);
  };

  const getSenderColor = (sender: string) => {
    switch (sender) {
      case 'client':
        return 'bg-blue-500';
      case 'agent':
        return 'bg-lobster-500';
      case 'payment':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSenderLabel = (sender: string) => {
    switch (sender) {
      case 'client':
        return 'CLIENT';
      case 'agent':
        return 'AGENT';
      case 'payment':
        return 'PAYMENT';
      default:
        return sender.toUpperCase();
    }
  };

  return (
    <div className="space-y-8">
      {/* Flow Diagram */}
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-200 dark:bg-shell-700" />
        
        {/* Progress Line */}
        <div 
          className="absolute left-8 top-0 w-1 bg-lobster-500 transition-all duration-500"
          style={{ height: `${((activeStep + 1) / flowSteps.length) * 100}%` }}
        />

        {/* Steps */}
        <div className="space-y-6">
          {flowSteps.map((step, index) => {
            const isActive = index === activeStep;
            const isPast = index < activeStep;
            const isFuture = index > activeStep;

            return (
              <div
                key={step.id}
                className={`relative pl-20 transition-all duration-300 cursor-pointer ${
                  isFuture ? 'opacity-40' : ''
                }`}
                onClick={() => {
                  setActiveStep(index);
                  setIsPlaying(false);
                }}
              >
                {/* Step Indicator */}
                <div
                  className={`absolute left-4 w-9 h-9 rounded-full border-4 flex items-center justify-center text-lg transition-all duration-300 ${
                    isActive
                      ? 'border-lobster-500 bg-brutal-yellow dark:bg-black scale-125 shadow-brutal'
                      : isPast
                      ? 'border-lobster-500 bg-lobster-500'
                      : 'border-gray-300 dark:border-shell-600 bg-white dark:bg-shell-900'
                  }`}
                >
                  {isPast ? '✓' : step.icon}
                </div>

                {/* Content Card */}
                <div
                  className={`border-4 p-4 transition-all duration-300 ${
                    isActive
                      ? 'border-black dark:border-white bg-white dark:bg-shell-900 shadow-brutal'
                      : 'border-gray-200 dark:border-shell-700 bg-gray-50 dark:bg-shell-800'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-2 py-0.5 text-xs font-bold uppercase text-white ${getSenderColor(
                        step.sender
                      )}`}
                    >
                      {getSenderLabel(step.sender)}
                    </span>
                    {step.httpStatus && (
                      <span
                        className={`px-2 py-0.5 text-xs font-bold uppercase ${
                          step.httpStatus === '200'
                            ? 'bg-green-500 text-white'
                            : step.httpStatus === '402'
                            ? 'bg-brutal-yellow text-black border border-black'
                            : 'bg-gray-500 text-white'
                        }`}
                      >
                        HTTP {step.httpStatus}
                      </span>
                    )}
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                      STEP {step.id}
                    </span>
                  </div>

                  <h3 className="text-lg font-black uppercase text-black dark:text-white mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {step.description}
                  </p>

                  {/* Code Block */}
                  {showCode && step.code && isActive && (
                    <div className="mt-3 bg-shell-900 dark:bg-black border-2 border-black dark:border-shell-600 p-3 overflow-x-auto">
                      <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                        {step.code}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t-4 border-black dark:border-white">
        <button
          onClick={handlePlayPause}
          className="px-6 py-3 bg-lobster-500 text-white font-bold uppercase border-4 border-black hover:bg-lobster-600 transition-colors shadow-brutal"
        >
          {isPlaying ? '⏸ PAUSE' : activeStep >= flowSteps.length - 1 ? '🔄 REPLAY' : '▶ PLAY'}
        </button>

        <button
          onClick={handleReset}
          className="px-6 py-3 bg-white dark:bg-shell-900 text-black dark:text-white font-bold uppercase border-4 border-black dark:border-white hover:bg-brutal-yellow dark:hover:bg-shell-800 transition-colors shadow-brutal-sm"
        >
          ⏮ RESET
        </button>

        <button
          onClick={() => setShowCode(!showCode)}
          className={`px-6 py-3 font-bold uppercase border-4 border-black dark:border-white transition-colors shadow-brutal-sm ${
            showCode
              ? 'bg-black dark:bg-white text-white dark:text-black'
              : 'bg-white dark:bg-shell-900 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-shell-800'
          }`}
        >
          {'</>'} {showCode ? 'HIDE' : 'SHOW'} CODE
        </button>
      </div>

      {/* Quick Navigation */}
      <div className="flex justify-center gap-2">
        {flowSteps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => {
              setActiveStep(index);
              setIsPlaying(false);
            }}
            className={`w-3 h-3 border-2 border-black dark:border-white transition-all ${
              index === activeStep
                ? 'bg-lobster-500 scale-125'
                : index < activeStep
                ? 'bg-lobster-300'
                : 'bg-white dark:bg-shell-800'
            }`}
            aria-label={`Go to step ${index + 1}: ${step.title}`}
          />
        ))}
      </div>
    </div>
  );
}
