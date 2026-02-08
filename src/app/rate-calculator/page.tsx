import { Metadata } from 'next';
import RateLimitCalculator from '@/components/RateLimitCalculator';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'API Rate Limit Calculator | Langoustine69',
  description: 'Estimate x402 API costs based on your expected usage patterns. See if you\'ll hit rate limits and plan your integration accordingly.',
  openGraph: {
    title: 'API Rate Limit Calculator | Langoustine69',
    description: 'Estimate API costs based on usage patterns and rate limits.',
    type: 'website',
  },
};

export default function RateCalculatorPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Rate Limit Calculator', href: '/rate-calculator' },
          ]}
        />
      </div>

      <RateLimitCalculator />

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-shell-900/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-shell-100 mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <details className="bg-shell-900/50 border border-shell-700 rounded-xl p-5 group">
              <summary className="text-shell-100 font-medium cursor-pointer list-none flex items-center justify-between">
                <span>What happens when I hit the rate limit?</span>
                <span className="text-shell-500 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-shell-400 mt-3 text-sm">
                When you exceed rate limits, the API returns HTTP 429 (Too Many Requests). 
                Your payment is not processed for throttled requests. Implement exponential 
                backoff or request queuing to handle this gracefully.
              </p>
            </details>

            <details className="bg-shell-900/50 border border-shell-700 rounded-xl p-5 group">
              <summary className="text-shell-100 font-medium cursor-pointer list-none flex items-center justify-between">
                <span>Can I increase my rate limits?</span>
                <span className="text-shell-500 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-shell-400 mt-3 text-sm">
                Enterprise customers can request higher limits. Contact us via the portfolio 
                contact form with your expected usage. We can also set up dedicated instances 
                for high-volume users.
              </p>
            </details>

            <details className="bg-shell-900/50 border border-shell-700 rounded-xl p-5 group">
              <summary className="text-shell-100 font-medium cursor-pointer list-none flex items-center justify-between">
                <span>How do burst limits work?</span>
                <span className="text-shell-500 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-shell-400 mt-3 text-sm">
                Burst limits cap concurrent requests to prevent overwhelming the service. 
                If your app sends 20 simultaneous requests but the burst limit is 10, 
                10 will be queued or rejected. Use connection pooling and request queuing 
                in your client.
              </p>
            </details>

            <details className="bg-shell-900/50 border border-shell-700 rounded-xl p-5 group">
              <summary className="text-shell-100 font-medium cursor-pointer list-none flex items-center justify-between">
                <span>Why do different agents have different rate limits?</span>
                <span className="text-shell-500 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-shell-400 mt-3 text-sm">
                Rate limits depend on upstream API constraints. Agents that aggregate 
                multiple sources (like Crypto Price from CoinGecko + DeFiLlama) inherit 
                the strictest limits from their data providers. Weather Intel has higher 
                limits because Open-Meteo is very generous.
              </p>
            </details>

            <details className="bg-shell-900/50 border border-shell-700 rounded-xl p-5 group">
              <summary className="text-shell-100 font-medium cursor-pointer list-none flex items-center justify-between">
                <span>What's the best pattern for high-volume usage?</span>
                <span className="text-shell-500 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-shell-400 mt-3 text-sm">
                The "Steady" pattern is most efficient for high volume. Spread requests 
                evenly, use caching for repeated data, implement request batching where 
                supported, and use webhooks instead of polling when available.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-shell-100 mb-8 text-center">
            💡 Optimization Tips
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-shell-900/50 border border-shell-700 rounded-xl p-5">
              <div className="text-2xl mb-2">🔄</div>
              <h3 className="text-shell-100 font-medium mb-2">Implement Caching</h3>
              <p className="text-shell-400 text-sm">
                Cache responses for data that doesn't change frequently. Crypto prices 
                are valid for 30-60 seconds; weather data for 5-10 minutes.
              </p>
            </div>

            <div className="bg-shell-900/50 border border-shell-700 rounded-xl p-5">
              <div className="text-2xl mb-2">📦</div>
              <h3 className="text-shell-100 font-medium mb-2">Batch Requests</h3>
              <p className="text-shell-400 text-sm">
                Some agents support batch endpoints. Fetch multiple items in one 
                request instead of making individual calls.
              </p>
            </div>

            <div className="bg-shell-900/50 border border-shell-700 rounded-xl p-5">
              <div className="text-2xl mb-2">⏱️</div>
              <h3 className="text-shell-100 font-medium mb-2">Request Queuing</h3>
              <p className="text-shell-400 text-sm">
                Queue requests and process them at a steady rate. Libraries like 
                p-queue (JS) or asyncio-throttle (Python) make this easy.
              </p>
            </div>

            <div className="bg-shell-900/50 border border-shell-700 rounded-xl p-5">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="text-shell-100 font-medium mb-2">Monitor Usage</h3>
              <p className="text-shell-400 text-sm">
                Track your actual usage patterns. Use the Metrics Export feature 
                to download usage data and identify optimization opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
