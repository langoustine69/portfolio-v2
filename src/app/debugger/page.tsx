import { Metadata } from 'next';
import { RequestDebugger } from '@/components/RequestDebugger';

export const metadata: Metadata = {
  title: 'API Request Debugger | Langoustine69',
  description: 'Debug failing x402 API requests instantly. Paste your request/response and get intelligent diagnosis with solutions.',
  keywords: ['API debugger', 'x402 troubleshooting', 'request debugger', 'error diagnosis', 'API debugging tool'],
};

export default function DebuggerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-shell-950 to-shell-900">
      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-shell-800">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-coral-500/10 text-coral-400 rounded-full border border-coral-500/20">
            Developer Tool
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            API Request Debugger
          </h1>
          <p className="text-xl text-shell-300 max-w-2xl mx-auto">
            Paste your failing request or response and get instant diagnosis with 
            actionable solutions. Debug faster, ship sooner.
          </p>
        </div>
      </section>

      {/* Debugger Tool */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <RequestDebugger />
        </div>
      </section>

      {/* Common Issues Quick Reference */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-shell-900/50 border-t border-shell-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Quick Diagnosis Guide
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-shell-900 border border-shell-800 rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-xl mb-3">
                💳
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">402 Errors</h3>
              <p className="text-shell-400 text-sm">
                Missing or invalid payment header. Check your X-PAYMENT header 
                and ensure wallet has USDC on Base.
              </p>
            </div>
            
            <div className="bg-shell-900 border border-shell-800 rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-xl mb-3">
                ⏱️
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">429 Rate Limits</h3>
              <p className="text-shell-400 text-sm">
                Too many requests. Implement exponential backoff and check 
                Retry-After header for wait time.
              </p>
            </div>
            
            <div className="bg-shell-900 border border-shell-800 rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-xl mb-3">
                🔧
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">5xx Errors</h3>
              <p className="text-shell-400 text-sm">
                Server-side issue. Check status page, retry with backoff, 
                or use circuit breaker pattern.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-shell-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">
            Debugging Tips
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 bg-shell-900/50 border border-shell-800 rounded-lg p-4">
              <span className="text-coral-400 text-lg">1</span>
              <div>
                <p className="text-white font-medium">Include Headers</p>
                <p className="text-shell-400 text-sm">
                  Paste the full response including headers for better diagnosis
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 bg-shell-900/50 border border-shell-800 rounded-lg p-4">
              <span className="text-coral-400 text-lg">2</span>
              <div>
                <p className="text-white font-medium">Redact Secrets</p>
                <p className="text-shell-400 text-sm">
                  Remove API keys and payment signatures before pasting
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 bg-shell-900/50 border border-shell-800 rounded-lg p-4">
              <span className="text-coral-400 text-lg">3</span>
              <div>
                <p className="text-white font-medium">Try Sandbox First</p>
                <p className="text-shell-400 text-sm">
                  Use our sandbox mode to test without spending real tokens
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 bg-shell-900/50 border border-shell-800 rounded-lg p-4">
              <span className="text-coral-400 text-lg">4</span>
              <div>
                <p className="text-white font-medium">Check Status Page</p>
                <p className="text-shell-400 text-sm">
                  Some errors are due to ongoing incidents - check status first
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
