'use client';

import { useState } from 'react';
import Link from 'next/link';

interface DiagnosisResult {
  severity: 'error' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  solutions: string[];
  docs?: string;
}

interface ParsedRequest {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: unknown;
  statusCode?: number;
  responseBody?: unknown;
  responseHeaders?: Record<string, string>;
  error?: string;
}

export function RequestDebugger() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<DiagnosisResult[]>([]);
  const [parsed, setParsed] = useState<ParsedRequest | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const parseInput = (text: string): ParsedRequest => {
    const result: ParsedRequest = {};
    const lines = text.split('\n').map(l => l.trim());
    
    // Try to detect cURL command
    if (text.toLowerCase().includes('curl ')) {
      const urlMatch = text.match(/curl\s+(?:['"](https?:\/\/[^'"]+)['"]|(https?:\/\/\S+))/i);
      if (urlMatch) {
        result.url = urlMatch[1] || urlMatch[2];
      }
      
      const methodMatch = text.match(/-X\s+(\w+)/i);
      result.method = methodMatch ? methodMatch[1].toUpperCase() : 'GET';
      
      // Extract headers
      result.headers = {};
      const headerMatches = text.matchAll(/-H\s+['"]([^:]+):\s*([^'"]+)['"]/gi);
      for (const match of headerMatches) {
        result.headers[match[1].toLowerCase()] = match[2];
      }
      
      // Extract body
      const bodyMatch = text.match(/-d\s+['"]([^'"]+)['"]/i);
      if (bodyMatch) {
        try {
          result.body = JSON.parse(bodyMatch[1]);
        } catch {
          result.body = bodyMatch[1];
        }
      }
    }
    
    // Try to detect HTTP response
    const statusMatch = text.match(/HTTP\/[\d.]+\s+(\d{3})/i);
    if (statusMatch) {
      result.statusCode = parseInt(statusMatch[1]);
    }
    
    // Try to detect status code from JSON error response
    const jsonStatusMatch = text.match(/"status":\s*(\d{3})/);
    if (jsonStatusMatch && !result.statusCode) {
      result.statusCode = parseInt(jsonStatusMatch[1]);
    }
    
    // Direct status code mention
    const directStatus = text.match(/(?:status|code|error)[:\s]*(\d{3})\b/i);
    if (directStatus && !result.statusCode) {
      result.statusCode = parseInt(directStatus[1]);
    }
    
    // Try to parse JSON blocks
    const jsonBlocks = text.match(/\{[\s\S]*?\}/g);
    if (jsonBlocks) {
      for (const block of jsonBlocks) {
        try {
          const parsed = JSON.parse(block);
          if (parsed.error || parsed.message || parsed.x402) {
            result.responseBody = parsed;
            if (parsed.status) {
              result.statusCode = parsed.status;
            }
          }
        } catch {
          // Not valid JSON
        }
      }
    }
    
    // Detect common error patterns
    const errorPatterns = [
      /payment required/i,
      /rate limit/i,
      /unauthorized/i,
      /forbidden/i,
      /not found/i,
      /bad request/i,
      /internal server error/i,
      /service unavailable/i,
      /timeout/i,
      /ECONNREFUSED/i,
      /ETIMEDOUT/i,
      /ENOTFOUND/i,
    ];
    
    for (const pattern of errorPatterns) {
      if (pattern.test(text)) {
        result.error = text.match(pattern)?.[0];
        break;
      }
    }
    
    // Detect x402 specific patterns
    if (text.includes('x402') || text.includes('X-PAYMENT')) {
      result.responseHeaders = result.responseHeaders || {};
      const paymentMatch = text.match(/X-PAYMENT[:\s]+([^\n]+)/i);
      if (paymentMatch) {
        result.responseHeaders['x-payment'] = paymentMatch[1];
      }
    }
    
    return result;
  };

  const diagnose = (parsed: ParsedRequest): DiagnosisResult[] => {
    const results: DiagnosisResult[] = [];
    
    // Status code based diagnosis
    if (parsed.statusCode) {
      const code = parsed.statusCode;
      
      if (code === 402) {
        results.push({
          severity: 'error',
          title: 'Payment Required (402)',
          description: 'The request requires payment via x402 protocol. The server is waiting for a valid payment header.',
          solutions: [
            'Include X-PAYMENT header with a valid payment signature',
            'Ensure your wallet has sufficient USDC on Base chain',
            'Use a Lucid-compatible SDK that handles x402 automatically',
            'Check if the payment amount in your request matches the required price',
          ],
          docs: '/errors#payment-required',
        });
        
        // Check for specific x402 issues
        const respBody = parsed.responseBody as Record<string, unknown>;
        if (respBody?.x402) {
          results.push({
            severity: 'info',
            title: 'Payment Details Found',
            description: `The response includes x402 payment details. Price: ${(respBody.x402 as Record<string, unknown>)?.price || 'unknown'} USDC`,
            solutions: [
              'Use the payment details to construct your X-PAYMENT header',
              'Sign the payment with your wallet private key',
              'Retry the request with the payment header included',
            ],
          });
        }
      }
      
      if (code === 429) {
        results.push({
          severity: 'error',
          title: 'Rate Limit Exceeded (429)',
          description: 'Too many requests have been made in a short time period.',
          solutions: [
            'Check the Retry-After header for wait time',
            'Implement exponential backoff with jitter',
            'Cache responses to reduce request frequency',
            'Consider upgrading your rate limit tier',
          ],
          docs: '/errors#rate-limit-exceeded',
        });
      }
      
      if (code === 400) {
        results.push({
          severity: 'error',
          title: 'Bad Request (400)',
          description: 'The request format or parameters are invalid.',
          solutions: [
            'Check that all required parameters are provided',
            'Verify JSON body is well-formed',
            'Ensure Content-Type header is application/json',
            'Review parameter types match the API spec',
          ],
          docs: '/errors#invalid-request',
        });
      }
      
      if (code === 401) {
        results.push({
          severity: 'error',
          title: 'Unauthorized (401)',
          description: 'Authentication is required but was not provided or is invalid.',
          solutions: [
            'Include a valid Authorization header',
            'Check that your API key is correct and not expired',
            'Ensure the key has permissions for this endpoint',
          ],
        });
      }
      
      if (code === 403) {
        results.push({
          severity: 'error',
          title: 'Forbidden (403)',
          description: 'You do not have permission to access this resource.',
          solutions: [
            'Verify your account has access to this agent',
            'Check if the agent is available in your region',
            'Contact support if you believe this is an error',
          ],
        });
      }
      
      if (code === 404) {
        results.push({
          severity: 'error',
          title: 'Not Found (404)',
          description: 'The requested endpoint or resource does not exist.',
          solutions: [
            'Verify the endpoint URL is correct',
            'Check if the agent ID exists',
            'Review the API documentation for correct paths',
            'The agent may have been deprecated - check status page',
          ],
          docs: '/errors#not-found',
        });
      }
      
      if (code === 422) {
        results.push({
          severity: 'error',
          title: 'Validation Error (422)',
          description: 'The request data failed validation.',
          solutions: [
            'Check the error details for specific field issues',
            'Use ISO 8601 format for dates (YYYY-MM-DD)',
            'Verify enum values match allowed options',
            'Check number ranges and string lengths',
          ],
          docs: '/errors#validation-error',
        });
      }
      
      if (code >= 500 && code < 600) {
        results.push({
          severity: 'error',
          title: `Server Error (${code})`,
          description: 'The server encountered an error processing your request.',
          solutions: [
            'Check the status page for ongoing incidents',
            'Retry the request after a short delay',
            'Implement circuit breaker pattern in your code',
            'If persistent, report the issue with request ID',
          ],
          docs: '/status',
        });
      }
      
      if (code === 200 || code === 201) {
        results.push({
          severity: 'success',
          title: 'Request Successful',
          description: 'The request completed successfully. If you\'re still having issues, the problem may be with response parsing.',
          solutions: [
            'Check your response parsing logic',
            'Verify you\'re reading the correct fields from the response',
            'Ensure your code handles the response structure correctly',
          ],
        });
      }
    }
    
    // Header-based diagnosis
    if (parsed.headers) {
      if (!parsed.headers['content-type']?.includes('application/json') && parsed.body) {
        results.push({
          severity: 'warning',
          title: 'Missing Content-Type Header',
          description: 'Request has a body but Content-Type may not be set to application/json.',
          solutions: [
            'Add header: Content-Type: application/json',
            'Ensure your HTTP client sets this automatically when sending JSON',
          ],
        });
      }
      
      if (parsed.headers['x-payment']) {
        results.push({
          severity: 'info',
          title: 'X-PAYMENT Header Detected',
          description: 'Your request includes a payment header. If you\'re still getting 402, the payment may be invalid.',
          solutions: [
            'Verify the payment signature is correct',
            'Check that the payment hasn\'t expired',
            'Ensure the payment amount matches the required price',
            'Confirm you\'re paying to the correct recipient address',
          ],
        });
      }
    }
    
    // Error message based diagnosis
    if (parsed.error) {
      const errorLower = parsed.error.toLowerCase();
      
      if (errorLower.includes('econnrefused')) {
        results.push({
          severity: 'error',
          title: 'Connection Refused',
          description: 'Could not connect to the server.',
          solutions: [
            'Check if the URL is correct',
            'Verify the agent service is running',
            'Check your network connectivity',
            'If using a proxy, verify it\'s configured correctly',
          ],
        });
      }
      
      if (errorLower.includes('etimedout') || errorLower.includes('timeout')) {
        results.push({
          severity: 'error',
          title: 'Request Timeout',
          description: 'The request took too long to complete.',
          solutions: [
            'Increase your client timeout setting',
            'Check for network latency issues',
            'The server may be under heavy load - retry later',
            'Consider breaking large requests into smaller ones',
          ],
          docs: '/errors#timeout',
        });
      }
      
      if (errorLower.includes('enotfound')) {
        results.push({
          severity: 'error',
          title: 'DNS Resolution Failed',
          description: 'Could not resolve the hostname.',
          solutions: [
            'Check for typos in the URL',
            'Verify your DNS settings',
            'Try using a different DNS resolver (8.8.8.8)',
          ],
        });
      }
    }
    
    // Generic checks
    if (parsed.url && !parsed.url.startsWith('https://')) {
      results.push({
        severity: 'warning',
        title: 'Not Using HTTPS',
        description: 'The request URL does not use HTTPS.',
        solutions: [
          'Always use HTTPS for API requests',
          'x402 payments require HTTPS for security',
          'Update your URL to use https://',
        ],
      });
    }
    
    if (results.length === 0) {
      results.push({
        severity: 'info',
        title: 'No Issues Detected',
        description: 'Could not automatically detect issues from the provided input.',
        solutions: [
          'Try pasting the complete error message or response',
          'Include HTTP status code if known',
          'Include response headers if available',
          'Check our error reference for manual lookup',
        ],
        docs: '/errors',
      });
    }
    
    return results;
  };

  const handleAnalyze = () => {
    if (!input.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate brief processing time for UX
    setTimeout(() => {
      const parsedData = parseInput(input);
      setParsed(parsedData);
      const diagnosisResults = diagnose(parsedData);
      setResults(diagnosisResults);
      setIsAnalyzing(false);
    }, 300);
  };

  const handleClear = () => {
    setInput('');
    setResults([]);
    setParsed(null);
  };

  const sampleInputs = [
    {
      label: '402 Payment Required',
      value: `HTTP/1.1 402 Payment Required
Content-Type: application/json

{
  "error": "Payment Required",
  "x402": {
    "price": "0.001",
    "currency": "USDC",
    "network": "base",
    "payTo": "0x742d35Cc6634C0532925a3b844Bc9e7595f..."
  }
}`,
    },
    {
      label: '429 Rate Limited',
      value: `HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1707055200

{"error": "Rate limit exceeded", "message": "Too many requests"}`,
    },
    {
      label: 'Connection Error',
      value: `Error: connect ECONNREFUSED 127.0.0.1:3000
    at TCPConnectWrap.afterConnect [as oncomplete]`,
    },
  ];

  const severityStyles = {
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    success: 'bg-green-500/10 border-green-500/30 text-green-400',
  };

  const severityIcons = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    success: '✓',
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Panel */}
      <div>
        <div className="bg-shell-900 border border-shell-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-shell-800 flex items-center justify-between">
            <h3 className="font-semibold text-white">Input</h3>
            <div className="flex gap-2">
              {sampleInputs.map((sample, i) => (
                <button
                  key={i}
                  onClick={() => setInput(sample.value)}
                  className="px-2 py-1 text-xs bg-shell-800 text-shell-300 rounded hover:bg-shell-700 transition-colors"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Paste your failing request or error response here...

Examples:
• cURL command with response
• HTTP response with status code
• Error message from your logs
• JSON error response

The debugger will analyze and diagnose the issue.`}
            className="w-full h-80 p-4 bg-transparent text-shell-200 font-mono text-sm resize-none focus:outline-none placeholder:text-shell-600"
          />
          
          <div className="px-4 py-3 border-t border-shell-800 flex gap-3">
            <button
              onClick={handleAnalyze}
              disabled={!input.trim() || isAnalyzing}
              className="flex-1 px-4 py-2 bg-coral-500 text-white rounded-lg font-semibold hover:bg-coral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <span className="animate-spin">⟳</span>
                  Analyzing...
                </>
              ) : (
                <>
                  🔍 Analyze Request
                </>
              )}
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 border border-shell-600 text-shell-300 rounded-lg hover:bg-shell-800 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
        
        {/* Parsed Data */}
        {parsed && (Object.keys(parsed).length > 0) && (
          <div className="mt-4 bg-shell-900/50 border border-shell-800 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-shell-400 uppercase tracking-wide mb-3">
              Detected Information
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {parsed.method && (
                <div>
                  <span className="text-shell-500">Method:</span>
                  <span className="ml-2 text-white font-mono">{parsed.method}</span>
                </div>
              )}
              {parsed.statusCode && (
                <div>
                  <span className="text-shell-500">Status:</span>
                  <span className={`ml-2 font-mono font-semibold ${
                    parsed.statusCode >= 500 ? 'text-red-400' :
                    parsed.statusCode >= 400 ? 'text-amber-400' :
                    parsed.statusCode >= 200 ? 'text-green-400' : 'text-white'
                  }`}>
                    {parsed.statusCode}
                  </span>
                </div>
              )}
              {parsed.url && (
                <div className="col-span-2">
                  <span className="text-shell-500">URL:</span>
                  <span className="ml-2 text-blue-400 font-mono text-xs break-all">{parsed.url}</span>
                </div>
              )}
              {parsed.error && (
                <div className="col-span-2">
                  <span className="text-shell-500">Error:</span>
                  <span className="ml-2 text-red-400 font-mono text-xs">{parsed.error}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results Panel */}
      <div>
        <div className="bg-shell-900 border border-shell-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-shell-800">
            <h3 className="font-semibold text-white">Diagnosis Results</h3>
          </div>
          
          <div className="p-4 min-h-80">
            {results.length === 0 ? (
              <div className="h-full flex items-center justify-center text-shell-500 text-center">
                <div>
                  <span className="text-4xl block mb-4">🔬</span>
                  <p>Paste a request or error and click Analyze</p>
                  <p className="text-sm mt-2">The debugger will identify issues and suggest solutions</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result, i) => (
                  <div
                    key={i}
                    className={`border rounded-lg p-4 ${severityStyles[result.severity]}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{severityIcons[result.severity]}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">{result.title}</h4>
                        <p className="text-shell-300 text-sm mb-3">{result.description}</p>
                        
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold text-shell-400 uppercase tracking-wide">Solutions:</p>
                          {result.solutions.map((solution, j) => (
                            <div key={j} className="flex items-start gap-2 text-sm text-shell-300">
                              <span className="text-green-400 mt-0.5">→</span>
                              <span>{solution}</span>
                            </div>
                          ))}
                        </div>
                        
                        {result.docs && (
                          <Link
                            href={result.docs}
                            className="inline-flex items-center gap-1.5 mt-3 text-sm text-coral-400 hover:text-coral-300 transition-colors"
                          >
                            📖 View Documentation
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Additional Resources */}
        {results.length > 0 && (
          <div className="mt-4 bg-shell-900/50 border border-shell-800 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-shell-400 uppercase tracking-wide mb-3">
              Related Resources
            </h4>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/errors"
                className="px-3 py-1.5 bg-shell-800 text-shell-300 rounded-lg text-sm hover:bg-shell-700 transition-colors"
              >
                Error Reference
              </Link>
              <Link
                href="/status"
                className="px-3 py-1.5 bg-shell-800 text-shell-300 rounded-lg text-sm hover:bg-shell-700 transition-colors"
              >
                Status Page
              </Link>
              <Link
                href="/sandbox"
                className="px-3 py-1.5 bg-shell-800 text-shell-300 rounded-lg text-sm hover:bg-shell-700 transition-colors"
              >
                Sandbox Mode
              </Link>
              <Link
                href="/preflight"
                className="px-3 py-1.5 bg-shell-800 text-shell-300 rounded-lg text-sm hover:bg-shell-700 transition-colors"
              >
                Preflight Check
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
