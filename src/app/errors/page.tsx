'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Breadcrumbs from '@/components/Breadcrumbs'
import CodeBlock from '@/components/CodeBlock'
import {
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  ShieldExclamationIcon,
  CurrencyDollarIcon,
  ServerIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  ChevronDownIcon,
  LightBulbIcon,
  CodeBracketIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline'

interface ErrorCode {
  code: string | number
  name: string
  category: 'client' | 'payment' | 'server' | 'rate-limit' | 'auth' | 'validation'
  severity: 'info' | 'warning' | 'error' | 'critical'
  description: string
  causes: string[]
  solutions: string[]
  example?: {
    request?: string
    response: string
  }
  retryable: boolean
  retryAfter?: string
  relatedCodes?: (string | number)[]
  docsLink?: string
}

const errorCodes: ErrorCode[] = [
  // HTTP Client Errors (4xx)
  {
    code: 400,
    name: 'Bad Request',
    category: 'validation',
    severity: 'warning',
    description: 'The request was malformed or contained invalid parameters.',
    causes: [
      'Invalid JSON syntax in request body',
      'Missing required parameters',
      'Invalid parameter types (e.g., string instead of number)',
      'Parameter values outside allowed range',
    ],
    solutions: [
      'Validate JSON syntax before sending',
      'Check API documentation for required fields',
      'Use proper data types for each parameter',
      'Validate parameter values client-side before sending',
    ],
    example: {
      request: `POST /v1/crypto-price\nContent-Type: application/json\n\n{"symbol": ""}  // Empty symbol not allowed`,
      response: `{
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "Symbol cannot be empty",
    "field": "symbol",
    "expected": "string (3-10 chars)"
  }
}`,
    },
    retryable: false,
    relatedCodes: [422],
  },
  {
    code: 401,
    name: 'Unauthorized',
    category: 'auth',
    severity: 'error',
    description: 'Authentication credentials are missing, invalid, or expired.',
    causes: [
      'Missing Authorization header',
      'Invalid API key format',
      'Expired API key',
      'API key revoked or deleted',
    ],
    solutions: [
      'Include Authorization header with valid API key',
      'Check API key format: Bearer <api_key>',
      'Regenerate API key if expired',
      'Verify API key in dashboard settings',
    ],
    example: {
      request: `GET /v1/agents/weather-intel\n# Missing Authorization header`,
      response: `{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid API key",
    "hint": "Include 'Authorization: Bearer <api_key>' header"
  }
}`,
    },
    retryable: false,
    relatedCodes: [403],
    docsLink: '/guides#authentication',
  },
  {
    code: 402,
    name: 'Payment Required',
    category: 'payment',
    severity: 'warning',
    description: 'x402 payment is required to complete this request. Your wallet needs to sign and submit a payment.',
    causes: [
      'First request to a paid agent (expected behavior)',
      'Previous payment expired or failed',
      'Insufficient USDC balance in wallet',
      'Wrong network (not Base)',
    ],
    solutions: [
      'Extract payment details from response header',
      'Sign and submit payment using x402 SDK',
      'Ensure wallet has sufficient USDC on Base',
      'Retry request with X-Payment header after payment',
    ],
    example: {
      request: `GET /v1/crypto-sentiment?symbol=ETH`,
      response: `HTTP/1.1 402 Payment Required
X-Payment: eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9...
X-Payment-Amount: 0.001
X-Payment-Network: base
X-Payment-Token: USDC

{
  "error": {
    "code": "PAYMENT_REQUIRED",
    "message": "Payment of $0.001 USDC required",
    "paymentDetails": {
      "amount": "0.001",
      "token": "USDC",
      "network": "base",
      "recipient": "0x1234...5678"
    }
  }
}`,
    },
    retryable: true,
    retryAfter: 'After payment submitted',
    relatedCodes: ['PAYMENT_FAILED', 'INSUFFICIENT_BALANCE'],
    docsLink: '/x402-flow',
  },
  {
    code: 403,
    name: 'Forbidden',
    category: 'auth',
    severity: 'error',
    description: 'You do not have permission to access this resource, even with valid authentication.',
    causes: [
      'API key lacks required scope/permissions',
      'IP address not whitelisted',
      'Agent restricted to specific plans',
      'Geographic restrictions',
    ],
    solutions: [
      'Check API key permissions in dashboard',
      'Add your IP to allowed list if required',
      'Upgrade plan if agent requires higher tier',
      'Contact support if restriction seems incorrect',
    ],
    example: {
      response: `{
  "error": {
    "code": "FORBIDDEN",
    "message": "API key does not have access to this agent",
    "requiredScope": "premium:read",
    "currentScopes": ["basic:read"]
  }
}`,
    },
    retryable: false,
    relatedCodes: [401],
  },
  {
    code: 404,
    name: 'Not Found',
    category: 'client',
    severity: 'warning',
    description: 'The requested resource or agent does not exist.',
    causes: [
      'Typo in agent ID or endpoint path',
      'Agent has been deprecated or removed',
      'Using wrong API version',
      'Resource ID does not exist',
    ],
    solutions: [
      'Verify agent ID matches exactly (case-sensitive)',
      'Check /agents page for available agents',
      'Use correct API version in path (/v1/...)',
      'Verify resource exists before requesting',
    ],
    example: {
      request: `GET /v1/crpto-price  # Typo: 'crpto' instead of 'crypto'`,
      response: `{
  "error": {
    "code": "NOT_FOUND",
    "message": "Agent 'crpto-price' not found",
    "suggestion": "Did you mean 'crypto-price'?"
  }
}`,
    },
    retryable: false,
    relatedCodes: [410],
    docsLink: '/agents',
  },
  {
    code: 408,
    name: 'Request Timeout',
    category: 'server',
    severity: 'warning',
    description: 'The server timed out waiting for the request to complete.',
    causes: [
      'Client took too long to send complete request',
      'Network latency or instability',
      'Large request payload taking too long to transmit',
    ],
    solutions: [
      'Check network connection stability',
      'Reduce request payload size if possible',
      'Increase client-side timeout settings',
      'Retry with exponential backoff',
    ],
    retryable: true,
    retryAfter: 'Immediately',
    relatedCodes: [504],
  },
  {
    code: 410,
    name: 'Gone',
    category: 'client',
    severity: 'error',
    description: 'The agent or endpoint has been permanently removed and will not return.',
    causes: [
      'Agent deprecated and removed from service',
      'API version sunset',
      'Feature permanently discontinued',
    ],
    solutions: [
      'Check changelog for migration path',
      'Find replacement agent in /agents',
      'Update integration to use successor agent',
      'Contact support if no alternative exists',
    ],
    example: {
      response: `{
  "error": {
    "code": "GONE",
    "message": "Agent 'legacy-weather' has been retired",
    "successor": "weather-intel-agent",
    "migrationGuide": "/guides/migrate-legacy-weather"
  }
}`,
    },
    retryable: false,
    relatedCodes: [404],
    docsLink: '/changelog',
  },
  {
    code: 422,
    name: 'Unprocessable Entity',
    category: 'validation',
    severity: 'warning',
    description: 'The request was well-formed but contained semantic errors.',
    causes: [
      'Valid JSON but invalid business logic',
      'Cross-field validation failures',
      'Values that conflict with each other',
      'Data that violates business rules',
    ],
    solutions: [
      'Check field interdependencies',
      'Validate business logic client-side',
      'Review documentation for valid value combinations',
    ],
    example: {
      request: `POST /v1/defi-swap\n{\n  "fromToken": "ETH",\n  "toToken": "ETH",  // Same token\n  "amount": "1.0"\n}`,
      response: `{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Cannot swap token to itself",
    "fields": {
      "fromToken": "ETH",
      "toToken": "ETH (must be different)"
    }
  }
}`,
    },
    retryable: false,
    relatedCodes: [400],
  },
  {
    code: 429,
    name: 'Too Many Requests',
    category: 'rate-limit',
    severity: 'warning',
    description: 'You have exceeded the rate limit for this endpoint.',
    causes: [
      'Too many requests in short time window',
      'Burst limit exceeded',
      'Per-agent rate limit hit',
      'Account-wide rate limit exceeded',
    ],
    solutions: [
      'Check Retry-After header for wait time',
      'Implement exponential backoff',
      'Cache responses when possible',
      'Request rate limit increase if needed',
    ],
    example: {
      response: `HTTP/1.1 429 Too Many Requests
Retry-After: 30
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1707408000

{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded",
    "limit": 100,
    "window": "1 minute",
    "retryAfter": 30
  }
}`,
    },
    retryable: true,
    retryAfter: 'After Retry-After seconds',
    docsLink: '/rate-calculator',
  },

  // Server Errors (5xx)
  {
    code: 500,
    name: 'Internal Server Error',
    category: 'server',
    severity: 'critical',
    description: 'An unexpected error occurred on the server.',
    causes: [
      'Unexpected server-side exception',
      'Database connection failure',
      'Unhandled edge case in agent logic',
      'Dependency service failure',
    ],
    solutions: [
      'Retry with exponential backoff',
      'Check /status for system-wide issues',
      'Report to support with request ID',
      'Try again in a few minutes',
    ],
    example: {
      response: `{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred",
    "requestId": "req_abc123xyz",
    "support": "Include this request ID when contacting support"
  }
}`,
    },
    retryable: true,
    retryAfter: '1-5 seconds',
    docsLink: '/status',
  },
  {
    code: 502,
    name: 'Bad Gateway',
    category: 'server',
    severity: 'critical',
    description: 'The server received an invalid response from an upstream service.',
    causes: [
      'Agent backend is down or unresponsive',
      'Upstream API returned invalid response',
      'Network issues between services',
      'Deployment in progress',
    ],
    solutions: [
      'Wait and retry in 30 seconds',
      'Check /status for agent health',
      'Try alternative agent if available',
      'Report if persists beyond 5 minutes',
    ],
    retryable: true,
    retryAfter: '30 seconds',
    relatedCodes: [503, 504],
    docsLink: '/status',
  },
  {
    code: 503,
    name: 'Service Unavailable',
    category: 'server',
    severity: 'critical',
    description: 'The server is temporarily unable to handle the request.',
    causes: [
      'Agent under maintenance',
      'Server overloaded',
      'Scheduled downtime',
      'Auto-scaling in progress',
    ],
    solutions: [
      'Check Retry-After header',
      'Check /status for maintenance notices',
      'Queue requests for later retry',
      'Use fallback/cache if available',
    ],
    example: {
      response: `HTTP/1.1 503 Service Unavailable
Retry-After: 120

{
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Agent under maintenance",
    "maintenance": {
      "start": "2026-02-08T10:00:00Z",
      "estimatedEnd": "2026-02-08T10:30:00Z",
      "reason": "Database migration"
    }
  }
}`,
    },
    retryable: true,
    retryAfter: 'Retry-After header',
    relatedCodes: [502, 504],
    docsLink: '/status',
  },
  {
    code: 504,
    name: 'Gateway Timeout',
    category: 'server',
    severity: 'error',
    description: 'The server did not receive a timely response from an upstream service.',
    causes: [
      'Agent processing took too long',
      'Upstream API is slow',
      'Complex query timing out',
      'Network latency issues',
    ],
    solutions: [
      'Retry with same request',
      'Consider breaking into smaller requests',
      'Check if agent is processing heavy load',
      'Increase timeout if configurable',
    ],
    retryable: true,
    retryAfter: 'Immediately',
    relatedCodes: [408, 502, 503],
  },

  // x402-specific Error Codes
  {
    code: 'PAYMENT_FAILED',
    name: 'Payment Failed',
    category: 'payment',
    severity: 'error',
    description: 'The x402 payment transaction failed or was rejected.',
    causes: [
      'Insufficient USDC balance',
      'Transaction rejected by network',
      'Invalid payment signature',
      'Payment amount mismatch',
    ],
    solutions: [
      'Check wallet balance on Base network',
      'Ensure payment amount matches required amount exactly',
      'Verify wallet is connected to Base network',
      'Re-request 402 to get fresh payment details',
    ],
    example: {
      response: `{
  "error": {
    "code": "PAYMENT_FAILED",
    "message": "Payment transaction failed",
    "reason": "Insufficient USDC balance",
    "required": "0.01",
    "available": "0.005",
    "network": "base"
  }
}`,
    },
    retryable: true,
    retryAfter: 'After funding wallet',
    relatedCodes: [402, 'INSUFFICIENT_BALANCE'],
    docsLink: '/x402-flow',
  },
  {
    code: 'INSUFFICIENT_BALANCE',
    name: 'Insufficient Balance',
    category: 'payment',
    severity: 'error',
    description: 'Your wallet does not have enough USDC to complete the payment.',
    causes: [
      'Wallet USDC balance too low',
      'Balance insufficient for amount + gas',
      'Funds on wrong network',
    ],
    solutions: [
      'Bridge USDC to Base network',
      'Top up wallet with sufficient USDC',
      'Check balance includes gas fees buffer',
    ],
    example: {
      response: `{
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Not enough USDC",
    "required": "0.05",
    "available": "0.02",
    "shortfall": "0.03",
    "bridgeUrl": "https://bridge.base.org"
  }
}`,
    },
    retryable: true,
    retryAfter: 'After funding wallet',
    relatedCodes: [402, 'PAYMENT_FAILED'],
  },
  {
    code: 'PAYMENT_EXPIRED',
    name: 'Payment Expired',
    category: 'payment',
    severity: 'warning',
    description: 'The payment request has expired. A fresh 402 response is needed.',
    causes: [
      'Too long between 402 response and payment submission',
      'Payment nonce already used',
      'Server-side payment session expired',
    ],
    solutions: [
      'Make a new request to get fresh 402 response',
      'Complete payment within 5 minutes of receiving 402',
      'Automate payment flow to reduce latency',
    ],
    example: {
      response: `{
  "error": {
    "code": "PAYMENT_EXPIRED",
    "message": "Payment request expired",
    "issuedAt": "2026-02-08T09:50:00Z",
    "expiredAt": "2026-02-08T09:55:00Z",
    "ttlSeconds": 300
  }
}`,
    },
    retryable: true,
    retryAfter: 'Re-request endpoint for fresh 402',
    relatedCodes: [402],
    docsLink: '/x402-flow',
  },
  {
    code: 'INVALID_SIGNATURE',
    name: 'Invalid Signature',
    category: 'auth',
    severity: 'error',
    description: 'The cryptographic signature in the request is invalid.',
    causes: [
      'Signature created with wrong private key',
      'Message was modified after signing',
      'Wrong signing algorithm used',
      'Encoding issues with signature',
    ],
    solutions: [
      'Verify using correct private key matching registered wallet',
      'Sign exact message without modification',
      'Use EIP-712 typed signing for x402',
      'Check signature encoding (hex vs base64)',
    ],
    retryable: false,
    relatedCodes: [401],
  },
  {
    code: 'AGENT_OFFLINE',
    name: 'Agent Offline',
    category: 'server',
    severity: 'critical',
    description: 'The specific agent is currently offline and cannot process requests.',
    causes: [
      'Agent maintenance in progress',
      'Agent backend service crashed',
      'Agent paused by operator',
      'Infrastructure issue affecting agent',
    ],
    solutions: [
      'Check /status for agent-specific status',
      'Wait for agent to come back online',
      'Use alternative agent if available',
      'Subscribe to status updates',
    ],
    example: {
      response: `{
  "error": {
    "code": "AGENT_OFFLINE",
    "message": "crypto-sentiment agent is currently offline",
    "statusUrl": "/status#crypto-sentiment",
    "lastOnline": "2026-02-08T09:45:00Z",
    "estimatedRecovery": "unknown"
  }
}`,
    },
    retryable: true,
    retryAfter: 'Check status page',
    relatedCodes: [503],
    docsLink: '/status',
  },
  {
    code: 'QUOTA_EXCEEDED',
    name: 'Quota Exceeded',
    category: 'rate-limit',
    severity: 'warning',
    description: 'You have exceeded your usage quota for the current billing period.',
    causes: [
      'Daily/monthly request limit reached',
      'Spending cap hit',
      'Free tier limit exceeded',
    ],
    solutions: [
      'Upgrade to higher tier for more quota',
      'Wait for quota reset (check reset time)',
      'Increase spending cap in settings',
      'Optimize to reduce request count',
    ],
    example: {
      response: `{
  "error": {
    "code": "QUOTA_EXCEEDED",
    "message": "Monthly quota exceeded",
    "limit": 10000,
    "used": 10000,
    "resetAt": "2026-03-01T00:00:00Z",
    "upgradeUrl": "/pricing"
  }
}`,
    },
    retryable: false,
    retryAfter: 'After quota reset or upgrade',
    relatedCodes: [429],
  },
]

const categoryConfig: Record<string, { icon: typeof ExclamationTriangleIcon; color: string; label: string }> = {
  client: { icon: XCircleIcon, color: 'text-orange-400 bg-orange-400/10', label: 'Client Error' },
  payment: { icon: CurrencyDollarIcon, color: 'text-purple-400 bg-purple-400/10', label: 'Payment' },
  server: { icon: ServerIcon, color: 'text-red-400 bg-red-400/10', label: 'Server Error' },
  'rate-limit': { icon: ClockIcon, color: 'text-yellow-400 bg-yellow-400/10', label: 'Rate Limit' },
  auth: { icon: ShieldExclamationIcon, color: 'text-blue-400 bg-blue-400/10', label: 'Authentication' },
  validation: { icon: ExclamationTriangleIcon, color: 'text-amber-400 bg-amber-400/10', label: 'Validation' },
}

const severityConfig: Record<string, { color: string; label: string }> = {
  info: { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', label: 'Info' },
  warning: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', label: 'Warning' },
  error: { color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', label: 'Error' },
  critical: { color: 'bg-red-500/20 text-red-300 border-red-500/30', label: 'Critical' },
}

function ErrorCodeCard({ error, isExpanded, onToggle }: { 
  error: ErrorCode; 
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const category = categoryConfig[error.category]
  const severity = severityConfig[error.severity]
  const CategoryIcon = category.icon

  return (
    <motion.div
      layout
      className={`border-4 border-black dark:border-white bg-white dark:bg-shell-900 overflow-hidden transition-all ${
        isExpanded ? 'ring-2 ring-lobster-500' : ''
      }`}
      style={{ boxShadow: isExpanded ? '6px 6px 0px 0px #e11d48' : '4px 4px 0px 0px #000' }}
    >
      {/* Header - Always Visible */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-shell-800 transition-colors text-left"
      >
        {/* Code Badge */}
        <div className={`flex-shrink-0 w-20 h-12 flex items-center justify-center rounded-lg ${category.color}`}>
          <span className="text-xl font-black font-mono">{error.code}</span>
        </div>

        {/* Title & Meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-lg text-black dark:text-white">{error.name}</h3>
            <span className={`px-2 py-0.5 text-xs font-bold uppercase border rounded-sm ${severity.color}`}>
              {severity.label}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{error.description}</p>
          
          <div className="flex items-center gap-4 mt-2 text-xs">
            <span className="flex items-center gap-1 text-gray-500 dark:text-gray-500">
              <CategoryIcon className="w-3.5 h-3.5" />
              {category.label}
            </span>
            {error.retryable ? (
              <span className="flex items-center gap-1 text-green-500">
                <ArrowPathIcon className="w-3.5 h-3.5" />
                Retryable
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-400">
                <XCircleIcon className="w-3.5 h-3.5" />
                Not retryable
              </span>
            )}
          </div>
        </div>

        {/* Expand Icon */}
        <ChevronDownIcon 
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t-2 border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 space-y-4">
              {/* Causes */}
              <div>
                <h4 className="font-bold text-sm text-red-600 dark:text-red-400 mb-2 flex items-center gap-1.5">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  Common Causes
                </h4>
                <ul className="space-y-1.5">
                  {error.causes.map((cause, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-red-400 mt-1">•</span>
                      {cause}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Solutions */}
              <div>
                <h4 className="font-bold text-sm text-green-600 dark:text-green-400 mb-2 flex items-center gap-1.5">
                  <CheckCircleIcon className="w-4 h-4" />
                  How to Fix
                </h4>
                <ul className="space-y-1.5">
                  {error.solutions.map((solution, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-400 mt-1">{i + 1}.</span>
                      {solution}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Example */}
              {error.example && (
                <div>
                  <h4 className="font-bold text-sm text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1.5">
                    <CodeBracketIcon className="w-4 h-4" />
                    Example
                  </h4>
                  {error.example.request && (
                    <div className="mb-2">
                      <span className="text-xs text-gray-500 mb-1 block">Request:</span>
                      <pre className="bg-gray-100 dark:bg-shell-800 p-2 rounded text-xs font-mono overflow-x-auto text-gray-700 dark:text-gray-300">
                        {error.example.request}
                      </pre>
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-gray-500 mb-1 block">Response:</span>
                    <pre className="bg-gray-100 dark:bg-shell-800 p-2 rounded text-xs font-mono overflow-x-auto text-gray-700 dark:text-gray-300">
                      {error.example.response}
                    </pre>
                  </div>
                </div>
              )}

              {/* Retry Info */}
              {error.retryable && error.retryAfter && (
                <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 p-3 rounded">
                  <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                    <ArrowPathIcon className="w-4 h-4" />
                    <span><strong>Retry after:</strong> {error.retryAfter}</span>
                  </div>
                </div>
              )}

              {/* Related Codes */}
              {error.relatedCodes && error.relatedCodes.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Related:</span>
                  {error.relatedCodes.map((code) => (
                    <span
                      key={code}
                      className="px-2 py-0.5 bg-gray-100 dark:bg-shell-800 rounded font-mono text-xs"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              )}

              {/* Docs Link */}
              {error.docsLink && (
                <Link
                  href={error.docsLink}
                  className="inline-flex items-center gap-1.5 text-sm text-lobster-500 hover:text-lobster-400 font-medium"
                >
                  <BookOpenIcon className="w-4 h-4" />
                  Read documentation →
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function ErrorsPage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedCode, setExpandedCode] = useState<string | number | null>(null)
  const [showRetryableOnly, setShowRetryableOnly] = useState(false)

  const filteredErrors = useMemo(() => {
    return errorCodes.filter((error) => {
      // Search filter
      const searchLower = search.toLowerCase()
      const matchesSearch =
        !search ||
        String(error.code).toLowerCase().includes(searchLower) ||
        error.name.toLowerCase().includes(searchLower) ||
        error.description.toLowerCase().includes(searchLower)

      // Category filter
      const matchesCategory = selectedCategory === 'all' || error.category === selectedCategory

      // Retryable filter
      const matchesRetryable = !showRetryableOnly || error.retryable

      return matchesSearch && matchesCategory && matchesRetryable
    })
  }, [search, selectedCategory, showRetryableOnly])

  const categories = ['all', ...Object.keys(categoryConfig)]

  // Quick lookup section
  const quickLookup = [
    { code: 402, label: 'Payment Required', desc: 'x402 flow needed' },
    { code: 429, label: 'Rate Limited', desc: 'Too many requests' },
    { code: 500, label: 'Server Error', desc: 'Unexpected error' },
    { code: 401, label: 'Unauthorized', desc: 'Auth failed' },
  ]

  return (
    <main className="min-h-screen bg-brutal-yellow dark:bg-shell-950 text-black dark:text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Error Reference', href: '/errors' },
          ]}
        />

        {/* Hero */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border-4 border-red-500 text-red-600 dark:text-red-400 text-sm mb-6 font-bold uppercase"
            style={{ boxShadow: '4px 4px 0px 0px #ef4444' }}
          >
            <ExclamationTriangleIcon className="w-5 h-5" />
            Troubleshooting Guide
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black uppercase mb-4"
          >
            Error Code Reference
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Comprehensive guide to HTTP and x402 error codes. 
            Find causes, solutions, and code examples.
          </motion.p>
        </div>

        {/* Quick Lookup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
        >
          {quickLookup.map((item) => (
            <button
              key={item.code}
              onClick={() => {
                setSearch(String(item.code))
                setExpandedCode(item.code)
              }}
              className="p-3 bg-white dark:bg-shell-900 border-4 border-black dark:border-white hover:border-lobster-500 transition-all text-left"
              style={{ boxShadow: '3px 3px 0px 0px #000' }}
            >
              <div className="text-2xl font-black font-mono text-lobster-500">{item.code}</div>
              <div className="text-sm font-bold text-black dark:text-white">{item.label}</div>
              <div className="text-xs text-gray-500">{item.desc}</div>
            </button>
          ))}
        </motion.div>

        {/* Filters */}
        <div className="bg-white dark:bg-shell-900 border-4 border-black dark:border-white p-4 mb-8" style={{ boxShadow: '4px 4px 0px 0px #000' }}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by code, name, or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-shell-800 border-2 border-black dark:border-gray-600 focus:border-lobster-500 outline-none font-medium"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-2 text-sm font-bold uppercase border-2 transition-all ${
                    selectedCategory === cat
                      ? 'bg-lobster-500 text-white border-black dark:border-white'
                      : 'bg-gray-100 dark:bg-shell-800 border-black dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-shell-700'
                  }`}
                >
                  {cat === 'all' ? 'All' : categoryConfig[cat]?.label || cat}
                </button>
              ))}
            </div>

            {/* Retryable Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showRetryableOnly}
                onChange={(e) => setShowRetryableOnly(e.target.checked)}
                className="w-4 h-4 accent-lobster-500"
              />
              <span className="text-sm font-bold text-gray-600 dark:text-gray-400">Retryable only</span>
            </label>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-500 mb-4">
          Showing {filteredErrors.length} of {errorCodes.length} error codes
        </div>

        {/* Error Code List */}
        <div className="space-y-4">
          {filteredErrors.map((error) => (
            <ErrorCodeCard
              key={error.code}
              error={error}
              isExpanded={expandedCode === error.code}
              onToggle={() => setExpandedCode(expandedCode === error.code ? null : error.code)}
            />
          ))}
        </div>

        {filteredErrors.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-shell-900 border-4 border-black dark:border-white">
            <InformationCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">No error codes match your search.</p>
            <button
              onClick={() => {
                setSearch('')
                setSelectedCategory('all')
                setShowRetryableOnly(false)
              }}
              className="text-lobster-500 hover:text-lobster-400 font-bold mt-2"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Best Practices Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
            <LightBulbIcon className="w-6 h-6 text-yellow-500" />
            Error Handling Best Practices
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-shell-900 border-4 border-black dark:border-white p-5" style={{ boxShadow: '4px 4px 0px 0px #000' }}>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <ArrowPathIcon className="w-5 h-5 text-green-500" />
                Implement Retry Logic
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Use exponential backoff for retryable errors. Start at 1s, double each time, cap at 30s.
              </p>
              <pre className="bg-gray-100 dark:bg-shell-800 p-3 rounded text-xs font-mono overflow-x-auto">
{`async function withRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (!isRetryable(e) || i === maxRetries - 1) throw e;
      await sleep(Math.min(1000 * Math.pow(2, i), 30000));
    }
  }
}`}
              </pre>
            </div>

            <div className="bg-white dark:bg-shell-900 border-4 border-black dark:border-white p-5" style={{ boxShadow: '4px 4px 0px 0px #000' }}>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-yellow-500" />
                Respect Rate Limits
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Always check Retry-After headers and implement client-side rate limiting.
              </p>
              <pre className="bg-gray-100 dark:bg-shell-800 p-3 rounded text-xs font-mono overflow-x-auto">
{`if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  await sleep(parseInt(retryAfter) * 1000);
  return retry(request);
}`}
              </pre>
            </div>

            <div className="bg-white dark:bg-shell-900 border-4 border-black dark:border-white p-5" style={{ boxShadow: '4px 4px 0px 0px #000' }}>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <CurrencyDollarIcon className="w-5 h-5 text-purple-500" />
                Handle x402 Gracefully
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                402 responses are expected. Extract payment details and automate the flow.
              </p>
              <pre className="bg-gray-100 dark:bg-shell-800 p-3 rounded text-xs font-mono overflow-x-auto">
{`if (response.status === 402) {
  const payment = response.headers.get('X-Payment');
  await submitPayment(payment);
  return retry(request, { 'X-Payment': receipt });
}`}
              </pre>
            </div>

            <div className="bg-white dark:bg-shell-900 border-4 border-black dark:border-white p-5" style={{ boxShadow: '4px 4px 0px 0px #000' }}>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <DocumentDuplicateIcon className="w-5 h-5 text-blue-500" />
                Log Request IDs
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Always capture the request ID from error responses for debugging and support.
              </p>
              <pre className="bg-gray-100 dark:bg-shell-800 p-3 rounded text-xs font-mono overflow-x-auto">
{`catch (error) {
  console.error('Request failed', {
    requestId: error.response?.data?.requestId,
    code: error.response?.data?.error?.code,
    message: error.message
  });
}`}
              </pre>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 text-center">
          <div className="bg-lobster-500 border-4 border-black dark:border-white p-8" style={{ boxShadow: '6px 6px 0px 0px #000' }}>
            <h2 className="text-2xl font-black uppercase text-white mb-4">
              Still Stuck?
            </h2>
            <p className="text-lobster-100 mb-6 max-w-lg mx-auto">
              Check system status, browse the Q&A forum, or use the API debugger 
              to diagnose your specific issue.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/status"
                className="px-6 py-3 bg-white text-black font-bold uppercase border-4 border-black hover:bg-gray-100 transition-colors"
              >
                📊 System Status
              </Link>
              <Link
                href="/debugger"
                className="px-6 py-3 bg-black text-white font-bold uppercase border-4 border-white hover:bg-gray-900 transition-colors"
              >
                🔧 API Debugger
              </Link>
              <Link
                href="/qa"
                className="px-6 py-3 bg-brutal-yellow text-black font-bold uppercase border-4 border-black hover:bg-yellow-400 transition-colors"
              >
                💬 Q&A Forum
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
