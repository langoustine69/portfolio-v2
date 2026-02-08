import { Metadata } from 'next';
import { RequestSimulator } from '@/components/RequestSimulator';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'API Request Simulator | Langoustine69',
  description: 'Build and test x402 agent API requests with our step-by-step simulator. Generate code snippets in cURL, JavaScript, Python, Go, and Rust.',
  openGraph: {
    title: 'API Request Simulator - Build Agent Requests',
    description: 'Step-by-step request builder for x402 agents. Select an agent, configure parameters, export production-ready code.',
    type: 'website',
    url: 'https://langoustine69.dev/simulator',
  },
};

export default function SimulatorPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Developer Tools', href: '/guides' },
    { label: 'Request Simulator', href: '/simulator' },
  ];

  return (
    <main className="min-h-screen bg-zinc-950 text-white pb-20">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 py-12 relative">
          <Breadcrumbs items={breadcrumbItems} />
          
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🧪</span>
              <h1 className="text-3xl md:text-4xl font-bold">
                API Request Simulator
              </h1>
            </div>
            <p className="text-zinc-400 text-lg max-w-2xl">
              Build API requests step-by-step with our guided simulator. Configure parameters, 
              preview requests, and export production-ready code in your preferred language.
            </p>
            
            <div className="flex flex-wrap gap-3 mt-6">
              <span className="px-3 py-1.5 bg-zinc-800 rounded-lg text-sm text-zinc-400">
                🎯 Guided workflow
              </span>
              <span className="px-3 py-1.5 bg-zinc-800 rounded-lg text-sm text-zinc-400">
                📋 5 languages supported
              </span>
              <span className="px-3 py-1.5 bg-zinc-800 rounded-lg text-sm text-zinc-400">
                ⚡ Copy & paste ready
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Simulator */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <RequestSimulator />
      </section>

      {/* Related Tools */}
      <section className="max-w-7xl mx-auto px-6 pt-8">
        <h2 className="text-xl font-semibold mb-6">Related Developer Tools</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <a 
            href="/api-playground" 
            className="group bg-zinc-900 rounded-xl p-6 border border-zinc-800 hover:border-amber-500/50 transition-all"
          >
            <span className="text-2xl">🎮</span>
            <h3 className="text-lg font-medium mt-3 group-hover:text-amber-400 transition-colors">
              API Playground
            </h3>
            <p className="text-zinc-400 text-sm mt-2">
              Interactive environment to test live API calls
            </p>
          </a>
          <a 
            href="/sdk" 
            className="group bg-zinc-900 rounded-xl p-6 border border-zinc-800 hover:border-amber-500/50 transition-all"
          >
            <span className="text-2xl">📦</span>
            <h3 className="text-lg font-medium mt-3 group-hover:text-amber-400 transition-colors">
              SDK Generator
            </h3>
            <p className="text-zinc-400 text-sm mt-2">
              Generate type-safe SDKs for any agent
            </p>
          </a>
          <a 
            href="/export" 
            className="group bg-zinc-900 rounded-xl p-6 border border-zinc-800 hover:border-amber-500/50 transition-all"
          >
            <span className="text-2xl">📤</span>
            <h3 className="text-lg font-medium mt-3 group-hover:text-amber-400 transition-colors">
              Collection Export
            </h3>
            <p className="text-zinc-400 text-sm mt-2">
              Export to Postman, Insomnia, OpenAPI
            </p>
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-7xl mx-auto px-6 pt-12">
        <h2 className="text-xl font-semibold mb-6">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h3 className="font-medium text-amber-400 mb-2">How do x402 payments work?</h3>
            <p className="text-zinc-400 text-sm">
              When you call an agent endpoint, it returns a 402 Payment Required response with payment details. 
              Your x402 client automatically handles the USDC micropayment, then retries the request.
            </p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h3 className="font-medium text-amber-400 mb-2">Do I need to add payment code?</h3>
            <p className="text-zinc-400 text-sm">
              The generated code shows the basic request. For payments, use the{' '}
              <a href="/sdk" className="text-amber-400 hover:underline">SDK Generator</a>{' '}
              which includes full x402 payment flow handling.
            </p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h3 className="font-medium text-amber-400 mb-2">Can I test without paying?</h3>
            <p className="text-zinc-400 text-sm">
              Yes! Use the{' '}
              <a href="/sandbox" className="text-amber-400 hover:underline">Sandbox Mode</a>{' '}
              for 5 free API calls per agent per day, no wallet required.
            </p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h3 className="font-medium text-amber-400 mb-2">What if an endpoint is missing?</h3>
            <p className="text-zinc-400 text-sm">
              The simulator shows common endpoints. For full documentation, visit each agent's detail page 
              or check the{' '}
              <a href="/agents" className="text-amber-400 hover:underline">Agents directory</a>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
