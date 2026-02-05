'use client';

import Link from 'next/link';
import PaymentFlowVisualizer from '@/components/PaymentFlowVisualizer';
import Breadcrumbs from '@/components/Breadcrumbs';

const benefits = [
  {
    icon: '⚡',
    title: 'Instant Access',
    description: 'No API key signup, no subscription management. Just pay-per-use.',
  },
  {
    icon: '💰',
    title: 'True Micropayments',
    description: 'Pay fractions of a cent per request. Only pay for what you use.',
  },
  {
    icon: '🔒',
    title: 'Trustless',
    description: 'On-chain verification means no disputes, chargebacks, or fraud.',
  },
  {
    icon: '🤖',
    title: 'Agent-Native',
    description: 'AI agents can autonomously pay for services without human intervention.',
  },
  {
    icon: '🌍',
    title: 'Global',
    description: 'No geographic restrictions, bank accounts, or credit checks needed.',
  },
  {
    icon: '🔗',
    title: 'Composable',
    description: 'Agents can chain together, each paying the next. Emergent agent economies.',
  },
];

const faqs = [
  {
    q: 'What networks does x402 support?',
    a: 'Currently Base (Coinbase L2) is the primary network due to low fees (~$0.001 per tx). Support for other L2s is coming.',
  },
  {
    q: 'What wallets work with x402?',
    a: 'Any EVM-compatible wallet works. For agents, we recommend using dedicated wallets with limited funds for autonomous operation.',
  },
  {
    q: 'How fast are payments confirmed?',
    a: 'On Base, confirmations typically take 1-3 seconds. The full request cycle (request → 402 → pay → response) usually completes in 2-5 seconds.',
  },
  {
    q: 'Can I use x402 for A2A (Agent-to-Agent)?',
    a: 'Absolutely! x402 was designed for autonomous agent commerce. Agents can compose services and pay each other without human intervention.',
  },
  {
    q: 'What happens if payment fails?',
    a: 'If payment fails, you get the standard 402 response. No funds are lost. You can retry or use a different payment method.',
  },
  {
    q: 'Is there a minimum payment amount?',
    a: 'Technically no, but gas costs on Base are ~$0.001, so payments below that aren\'t practical. Most agents charge $0.001-$0.01 per request.',
  },
];

export default function X402FlowPage() {
  return (
    <div className="min-h-screen bg-brutal-yellow dark:bg-black">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'x402 Payment Flow', href: '/x402-flow' },
          ]}
        />

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 bg-lobster-500 text-white font-bold uppercase text-sm mb-4">
            INTERACTIVE GUIDE
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase text-black dark:text-white mb-4">
            x402 Payment Flow
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            See exactly how x402 micropayments work, step by step. From request to payment to response — all in seconds.
          </p>
        </div>

        {/* Main Visualizer */}
        <div className="bg-white dark:bg-shell-900 border-4 border-black dark:border-white p-6 shadow-brutal mb-12">
          <PaymentFlowVisualizer />
        </div>

        {/* Benefits Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-black uppercase text-black dark:text-white mb-6 text-center">
            Why x402?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="bg-white dark:bg-shell-900 border-4 border-black dark:border-white p-4 hover:shadow-brutal transition-shadow"
              >
                <div className="text-3xl mb-2">{benefit.icon}</div>
                <h3 className="font-bold uppercase text-black dark:text-white mb-1">
                  {benefit.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Code Example */}
        <section className="mb-12">
          <h2 className="text-2xl font-black uppercase text-black dark:text-white mb-6 text-center">
            Quick Integration
          </h2>
          <div className="bg-shell-900 dark:bg-black border-4 border-black dark:border-shell-600 p-6 shadow-brutal">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2 text-gray-500 text-sm font-mono">client.ts</span>
            </div>
            <pre className="text-sm text-green-400 font-mono overflow-x-auto">
              <code>{`import { x402Client } from '@x402/sdk';

// Initialize with your wallet
const client = x402Client({
  wallet: process.env.WALLET_KEY,
  network: 'base',
});

// Make a paid request - x402 handles the rest
const response = await client.fetch(
  'https://weather-agent.x402.org/api/forecast',
  {
    method: 'POST',
    body: JSON.stringify({ city: 'Sydney' }),
  }
);

// If the agent requires payment, x402 SDK:
// 1. Detects the 402 response
// 2. Pays the required amount
// 3. Retries with payment proof
// 4. Returns the final response

console.log(await response.json());
// { city: 'Sydney', temperature: 24, ... }`}</code>
            </pre>
          </div>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
            The x402 SDK handles payment negotiation automatically. Your code stays clean.
          </p>
        </section>

        {/* Sequence Diagram */}
        <section className="mb-12">
          <h2 className="text-2xl font-black uppercase text-black dark:text-white mb-6 text-center">
            Sequence Overview
          </h2>
          <div className="bg-white dark:bg-shell-900 border-4 border-black dark:border-white p-6 shadow-brutal overflow-x-auto">
            <div className="min-w-[500px]">
              {/* Actors */}
              <div className="flex justify-between mb-4 pb-4 border-b-2 border-gray-200 dark:border-shell-700">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-blue-500 rounded-full flex items-center justify-center text-2xl mb-2">
                    📱
                  </div>
                  <span className="font-bold text-sm uppercase text-black dark:text-white">Client</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-lobster-500 rounded-full flex items-center justify-center text-2xl mb-2">
                    🦞
                  </div>
                  <span className="font-bold text-sm uppercase text-black dark:text-white">Agent</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center text-2xl mb-2">
                    ⛓️
                  </div>
                  <span className="font-bold text-sm uppercase text-black dark:text-white">Blockchain</span>
                </div>
              </div>

              {/* Arrows */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-1/3 text-right pr-4">
                    <span className="text-xs font-mono bg-gray-100 dark:bg-shell-800 px-2 py-1">POST /api</span>
                  </div>
                  <div className="w-1/3 flex items-center">
                    <div className="flex-1 h-0.5 bg-black dark:bg-white" />
                    <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-black dark:border-l-white" />
                  </div>
                  <div className="w-1/3" />
                </div>

                <div className="flex items-center">
                  <div className="w-1/3" />
                  <div className="w-1/3 flex items-center">
                    <div className="w-0 h-0 border-t-4 border-b-4 border-r-8 border-transparent border-r-brutal-yellow" />
                    <div className="flex-1 h-0.5 bg-brutal-yellow" style={{ borderStyle: 'dashed' }} />
                  </div>
                  <div className="w-1/3 pl-4">
                    <span className="text-xs font-mono bg-brutal-yellow px-2 py-1 text-black">402 Payment Required</span>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-1/3 text-right pr-4">
                    <span className="text-xs font-mono bg-green-100 dark:bg-green-900 px-2 py-1 text-green-800 dark:text-green-200">💸 pay()</span>
                  </div>
                  <div className="w-1/3" />
                  <div className="w-1/3 flex items-center">
                    <div className="flex-1 h-0.5 bg-green-500" />
                    <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-green-500" />
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-1/3 text-right pr-4">
                    <span className="text-xs font-mono bg-gray-100 dark:bg-shell-800 px-2 py-1">POST + proof</span>
                  </div>
                  <div className="w-1/3 flex items-center">
                    <div className="flex-1 h-0.5 bg-black dark:bg-white" />
                    <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-black dark:border-l-white" />
                  </div>
                  <div className="w-1/3" />
                </div>

                <div className="flex items-center">
                  <div className="w-1/3" />
                  <div className="w-1/3 flex items-center">
                    <div className="w-0 h-0 border-t-4 border-b-4 border-r-8 border-transparent border-r-green-500" />
                    <div className="flex-1 h-0.5 bg-green-500" />
                  </div>
                  <div className="w-1/3 pl-4">
                    <span className="text-xs font-mono bg-green-500 px-2 py-1 text-white">200 OK + data</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl font-black uppercase text-black dark:text-white mb-6 text-center">
            FAQ
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white dark:bg-shell-900 border-4 border-black dark:border-white p-4"
              >
                <h3 className="font-bold text-black dark:text-white mb-2">
                  Q: {faq.q}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  A: {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-lobster-500 border-4 border-black p-8 shadow-brutal">
          <h2 className="text-2xl font-black uppercase text-white mb-4">
            Ready to Build with x402?
          </h2>
          <p className="text-white/80 mb-6 max-w-lg mx-auto">
            Explore our agents and start making paid API calls in minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/agents"
              className="px-6 py-3 bg-white text-black font-bold uppercase border-4 border-black hover:bg-brutal-yellow transition-colors shadow-brutal"
            >
              Browse Agents →
            </Link>
            <Link
              href="/glossary"
              className="px-6 py-3 bg-black text-white font-bold uppercase border-4 border-black hover:bg-shell-900 transition-colors shadow-brutal"
            >
              x402 Glossary
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
