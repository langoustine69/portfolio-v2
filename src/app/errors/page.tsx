import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'API Error Reference',
  description: 'Complete guide to x402 API error codes, causes, and solutions. Troubleshoot payment errors, rate limits, and common issues.',
  keywords: ['x402 errors', 'API error codes', 'troubleshooting', 'payment errors', 'rate limit'],
};

interface ErrorCode {
  code: string;
  httpStatus: number;
  title: string;
  description: string;
  causes: string[];
  solutions: string[];
  example?: string;
}

const errorCodes: ErrorCode[] = [
  {
    code: 'PAYMENT_REQUIRED',
    httpStatus: 402,
    title: 'Payment Required',
    description: 'The request requires payment via x402 protocol.',
    causes: [
      'No X-PAYMENT header provided',
      'Missing payment token',
      'First request to a paid endpoint',
    ],
    solutions: [
      'Include a valid X-PAYMENT header with your request',
      'Use a Lucid-compatible wallet to sign the payment',
      'Ensure your wallet has sufficient USDC on Base chain',
    ],
    example: `// Response includes payment details
{
  "error": "Payment Required",
  "x402": {
    "price": "0.001",
    "currency": "USDC",
    "network": "base",
    "payTo": "0x..."
  }
}`,
  },
  {
    code: 'INVALID_PAYMENT',
    httpStatus: 402,
    title: 'Invalid Payment',
    description: 'The payment signature or amount is invalid.',
    causes: [
      'Incorrect payment signature',
      'Payment amount too low',
      'Expired payment token',
      'Wrong destination address',
    ],
    solutions: [
      'Regenerate the payment signature',
      'Check that payment amount matches the required price',
      'Ensure the payment hasn\'t expired (tokens are time-limited)',
      'Verify you\'re paying to the correct agent address',
    ],
  },
  {
    code: 'INSUFFICIENT_FUNDS',
    httpStatus: 402,
    title: 'Insufficient Funds',
    description: 'Your wallet doesn\'t have enough USDC to complete the payment.',
    causes: [
      'Wallet balance below required amount',
      'Pending transactions reducing available balance',
    ],
    solutions: [
      'Add more USDC to your wallet on Base chain',
      'Wait for pending transactions to complete',
      'Bridge USDC from another chain using a bridge like Stargate',
    ],
  },
  {
    code: 'RATE_LIMIT_EXCEEDED',
    httpStatus: 429,
    title: 'Rate Limit Exceeded',
    description: 'Too many requests in a short time period.',
    causes: [
      'Exceeded requests per minute limit',
      'Burst traffic detected',
      'Shared IP with heavy usage',
    ],
    solutions: [
      'Implement exponential backoff in your client',
      'Cache responses where appropriate',
      'Check Retry-After header for wait time',
      'Contact support for higher rate limits',
    ],
    example: `// Response headers
Retry-After: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1707055200`,
  },
  {
    code: 'INVALID_REQUEST',
    httpStatus: 400,
    title: 'Invalid Request',
    description: 'The request format or parameters are invalid.',
    causes: [
      'Missing required parameters',
      'Invalid parameter format',
      'Malformed JSON body',
      'Unsupported content type',
    ],
    solutions: [
      'Check the API documentation for required parameters',
      'Validate JSON before sending',
      'Use Content-Type: application/json header',
      'Review the error message for specific field issues',
    ],
  },
  {
    code: 'NOT_FOUND',
    httpStatus: 404,
    title: 'Resource Not Found',
    description: 'The requested endpoint or resource doesn\'t exist.',
    causes: [
      'Incorrect endpoint URL',
      'Resource ID doesn\'t exist',
      'Agent has been deprecated',
    ],
    solutions: [
      'Verify the endpoint URL matches documentation',
      'Check if the resource ID is valid',
      'Review the status page for deprecated agents',
    ],
  },
  {
    code: 'SERVICE_UNAVAILABLE',
    httpStatus: 503,
    title: 'Service Unavailable',
    description: 'The agent is temporarily unavailable.',
    causes: [
      'Agent undergoing maintenance',
      'Upstream data source unavailable',
      'Infrastructure issues',
    ],
    solutions: [
      'Check the status page for ongoing incidents',
      'Retry after a few minutes',
      'Implement circuit breaker pattern in your code',
    ],
  },
  {
    code: 'TIMEOUT',
    httpStatus: 504,
    title: 'Gateway Timeout',
    description: 'The request took too long to process.',
    causes: [
      'Complex query requiring extensive computation',
      'Upstream service slow to respond',
      'Network latency issues',
    ],
    solutions: [
      'Simplify your query if possible',
      'Increase client timeout settings',
      'Consider breaking large requests into smaller ones',
    ],
  },
  {
    code: 'UPSTREAM_ERROR',
    httpStatus: 502,
    title: 'Upstream Error',
    description: 'Error from the data source the agent relies on.',
    causes: [
      'Third-party API down',
      'Data source rate limited',
      'Temporary network issues',
    ],
    solutions: [
      'Retry the request after a short delay',
      'Check if the specific data source has known issues',
      'Use cached data if available in your application',
    ],
  },
  {
    code: 'VALIDATION_ERROR',
    httpStatus: 422,
    title: 'Validation Error',
    description: 'The request data failed validation.',
    causes: [
      'Parameter out of allowed range',
      'Invalid date format',
      'Enum value not recognized',
    ],
    solutions: [
      'Review error details for specific field issues',
      'Use ISO 8601 format for dates (YYYY-MM-DD)',
      'Check documentation for allowed enum values',
    ],
    example: `{
  "error": "Validation Error",
  "details": [
    {
      "field": "date",
      "message": "Must be in YYYY-MM-DD format"
    }
  ]
}`,
  },
];

const ErrorCodeCard = ({ error }: { error: ErrorCode }) => (
  <div 
    id={error.code.toLowerCase().replace(/_/g, '-')} 
    className="bg-shell-900/50 border border-shell-800 rounded-xl p-6 scroll-mt-24"
  >
    <div className="flex items-center gap-3 mb-4">
      <span className={`px-3 py-1 rounded-full text-sm font-mono font-semibold
        ${error.httpStatus >= 500 ? 'bg-red-500/20 text-red-400' :
          error.httpStatus >= 400 ? 'bg-amber-500/20 text-amber-400' :
          'bg-blue-500/20 text-blue-400'}`}>
        {error.httpStatus}
      </span>
      <code className="text-lg font-semibold text-white">{error.code}</code>
    </div>
    
    <h3 className="text-xl font-semibold text-white mb-2">{error.title}</h3>
    <p className="text-shell-300 mb-4">{error.description}</p>
    
    <div className="grid md:grid-cols-2 gap-4 mb-4">
      <div>
        <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wide mb-2">
          Common Causes
        </h4>
        <ul className="space-y-1">
          {error.causes.map((cause, i) => (
            <li key={i} className="text-shell-300 text-sm flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              {cause}
            </li>
          ))}
        </ul>
      </div>
      
      <div>
        <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wide mb-2">
          Solutions
        </h4>
        <ul className="space-y-1">
          {error.solutions.map((solution, i) => (
            <li key={i} className="text-shell-300 text-sm flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              {solution}
            </li>
          ))}
        </ul>
      </div>
    </div>
    
    {error.example && (
      <div>
        <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wide mb-2">
          Example Response
        </h4>
        <pre className="bg-black/50 rounded-lg p-4 overflow-x-auto">
          <code className="text-sm text-shell-300">{error.example}</code>
        </pre>
      </div>
    )}
  </div>
);

export default function ErrorReferencePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-shell-950 to-shell-900">
      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-shell-800">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-coral-500/10 text-coral-400 rounded-full border border-coral-500/20">
            Developer Reference
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            API Error Reference
          </h1>
          <p className="text-xl text-shell-300 max-w-2xl mx-auto">
            Complete guide to error codes, their causes, and how to resolve them. 
            Debug faster and build more resilient integrations.
          </p>
        </div>
      </section>
      
      {/* Quick Jump */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-shell-800 bg-shell-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-sm font-semibold text-shell-400 uppercase tracking-wide mb-4">
            Jump to Error Code
          </h2>
          <div className="flex flex-wrap gap-2">
            {errorCodes.map((error) => (
              <a
                key={error.code}
                href={`#${error.code.toLowerCase().replace(/_/g, '-')}`}
                className={`px-3 py-1.5 rounded-lg text-sm font-mono transition-colors
                  ${error.httpStatus >= 500 
                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                    : error.httpStatus >= 400 
                    ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                    : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'}`}
              >
                {error.httpStatus} {error.code}
              </a>
            ))}
          </div>
        </div>
      </section>
      
      {/* Error Codes */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* x402 Payment Errors */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-coral-500/20 flex items-center justify-center text-coral-400">
                💳
              </span>
              Payment Errors (402)
            </h2>
            <div className="space-y-6">
              {errorCodes.filter(e => e.httpStatus === 402).map((error) => (
                <ErrorCodeCard key={error.code} error={error} />
              ))}
            </div>
          </div>
          
          {/* Client Errors */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                ⚠️
              </span>
              Client Errors (4xx)
            </h2>
            <div className="space-y-6">
              {errorCodes.filter(e => e.httpStatus >= 400 && e.httpStatus < 500 && e.httpStatus !== 402).map((error) => (
                <ErrorCodeCard key={error.code} error={error} />
              ))}
            </div>
          </div>
          
          {/* Server Errors */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400">
                🔥
              </span>
              Server Errors (5xx)
            </h2>
            <div className="space-y-6">
              {errorCodes.filter(e => e.httpStatus >= 500).map((error) => (
                <ErrorCodeCard key={error.code} error={error} />
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Best Practices */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-shell-900/50 border-t border-shell-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Error Handling Best Practices
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-shell-900 border border-shell-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-coral-400">1.</span> Exponential Backoff
              </h3>
              <p className="text-shell-300 text-sm mb-4">
                For rate limits and temporary errors, implement exponential backoff 
                with jitter to avoid thundering herd.
              </p>
              <pre className="bg-black/50 rounded-lg p-3 text-xs overflow-x-auto">
                <code className="text-shell-300">{`const delay = Math.min(
  baseDelay * 2 ** attempt + 
  Math.random() * 1000,
  maxDelay
);`}</code>
              </pre>
            </div>
            
            <div className="bg-shell-900 border border-shell-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-coral-400">2.</span> Circuit Breaker
              </h3>
              <p className="text-shell-300 text-sm mb-4">
                Stop making requests when an agent is down to avoid wasting 
                payments and reduce load on recovering services.
              </p>
              <pre className="bg-black/50 rounded-lg p-3 text-xs overflow-x-auto">
                <code className="text-shell-300">{`if (failureCount > threshold) {
  circuitOpen = true;
  setTimeout(halfOpen, 30000);
}`}</code>
              </pre>
            </div>
            
            <div className="bg-shell-900 border border-shell-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-coral-400">3.</span> Log Error Context
              </h3>
              <p className="text-shell-300 text-sm">
                Always log the full error response including request ID, timestamp, 
                and parameters. This helps debug issues faster.
              </p>
            </div>
            
            <div className="bg-shell-900 border border-shell-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-coral-400">4.</span> Handle x402 Gracefully
              </h3>
              <p className="text-shell-300 text-sm">
                Parse x402 response headers to extract payment details. Use a 
                Lucid-compatible library to automatically handle payment flow.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-shell-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-semibold text-white mb-4">
            Still having issues?
          </h2>
          <p className="text-shell-300 mb-6">
            Check our status page for ongoing incidents or reach out for support.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/status"
              className="px-6 py-3 bg-coral-500 text-white rounded-lg font-semibold hover:bg-coral-600 transition-colors"
            >
              Check Status
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 border border-shell-600 text-shell-200 rounded-lg font-semibold hover:bg-shell-800 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
