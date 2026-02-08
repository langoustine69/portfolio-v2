'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';

interface SecurityTopic {
  id: string;
  title: string;
  icon: string;
  severity: 'critical' | 'high' | 'medium';
  description: string;
  practices: SecurityPractice[];
}

interface SecurityPractice {
  title: string;
  description: string;
  doExample?: string;
  dontExample?: string;
  codeExample?: {
    language: string;
    code: string;
  };
}

const securityTopics: SecurityTopic[] = [
  {
    id: 'api-keys',
    title: 'API Key Security',
    icon: '🔑',
    severity: 'critical',
    description: 'Protect your API keys from exposure and unauthorized access.',
    practices: [
      {
        title: 'Never expose keys in client-side code',
        description: 'API keys should only be used in server-side code. Never include them in frontend JavaScript, mobile apps, or public repositories.',
        doExample: 'Store keys in environment variables (SERVER_API_KEY)',
        dontExample: 'Hardcode keys in JavaScript: const KEY = "sk_live_..."',
        codeExample: {
          language: 'typescript',
          code: `// ✅ Server-side API route (Next.js)
export async function POST(req: Request) {
  const apiKey = process.env.X402_API_KEY; // Server-only
  
  const response = await fetch('https://agent.lucid.id/api', {
    headers: { 'Authorization': \`Bearer \${apiKey}\` }
  });
  
  return Response.json(await response.json());
}`
        }
      },
      {
        title: 'Rotate keys regularly',
        description: 'Rotate API keys every 90 days minimum. Immediately rotate if you suspect compromise.',
        doExample: 'Set calendar reminders for key rotation',
        dontExample: 'Use the same key for years without rotation',
      },
      {
        title: 'Use separate keys per environment',
        description: 'Use different API keys for development, staging, and production environments.',
        doExample: 'X402_API_KEY_DEV, X402_API_KEY_PROD',
        dontExample: 'Same key across all environments',
      },
      {
        title: 'Implement key scoping',
        description: 'When available, scope keys to specific agents or IP ranges to limit blast radius.',
        codeExample: {
          language: 'json',
          code: `{
  "key": "sk_prod_abc123",
  "scope": {
    "agents": ["crypto-price-agent", "weather-agent"],
    "ipAllowlist": ["203.0.113.0/24"],
    "rateLimit": 1000
  }
}`
        }
      }
    ]
  },
  {
    id: 'authentication',
    title: 'Authentication & Authorization',
    icon: '🛡️',
    severity: 'critical',
    description: 'Secure access to your API endpoints and validate all requests.',
    practices: [
      {
        title: 'Validate Bearer tokens server-side',
        description: 'Always validate authentication tokens on the server. Never trust client-side validation alone.',
        codeExample: {
          language: 'typescript',
          code: `// Middleware to validate API requests
export function validateRequest(req: Request) {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }
  
  const token = authHeader.slice(7);
  
  // Validate token format and signature
  if (!isValidToken(token)) {
    throw new Error('Invalid token');
  }
  
  return decodeToken(token);
}`
        }
      },
      {
        title: 'Implement request signing',
        description: 'For high-security operations, sign requests with HMAC-SHA256 to prevent tampering.',
        codeExample: {
          language: 'typescript',
          code: `import crypto from 'crypto';

function signRequest(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

// Include signature in request
const signature = signRequest(JSON.stringify(body), API_SECRET);
headers['X-Signature'] = signature;
headers['X-Timestamp'] = Date.now().toString();`
        }
      },
      {
        title: 'Use short-lived tokens',
        description: 'Access tokens should expire within 1 hour. Use refresh tokens for long-lived sessions.',
        doExample: 'JWT with 15-60 minute expiry',
        dontExample: 'Tokens that never expire',
      }
    ]
  },
  {
    id: 'webhooks',
    title: 'Webhook Security',
    icon: '🔔',
    severity: 'high',
    description: 'Verify webhook payloads to prevent spoofing and replay attacks.',
    practices: [
      {
        title: 'Verify webhook signatures',
        description: 'Always validate the signature header before processing webhook payloads.',
        codeExample: {
          language: 'typescript',
          code: `import crypto from 'crypto';

function verifyWebhook(
  payload: string, 
  signature: string, 
  secret: string
): boolean {
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  // Use timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSig)
  );
}

// In your webhook handler
export async function POST(req: Request) {
  const signature = req.headers.get('x-webhook-signature');
  const body = await req.text();
  
  if (!verifyWebhook(body, signature!, WEBHOOK_SECRET)) {
    return new Response('Invalid signature', { status: 401 });
  }
  
  // Safe to process
  const data = JSON.parse(body);
}`
        }
      },
      {
        title: 'Prevent replay attacks',
        description: 'Check timestamps and store processed event IDs to prevent replay attacks.',
        codeExample: {
          language: 'typescript',
          code: `const REPLAY_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const processedEvents = new Set<string>();

function isValidWebhook(eventId: string, timestamp: number): boolean {
  // Check timestamp freshness
  const now = Date.now();
  if (Math.abs(now - timestamp) > REPLAY_WINDOW_MS) {
    return false; // Too old or future-dated
  }
  
  // Check for replay
  if (processedEvents.has(eventId)) {
    return false; // Already processed
  }
  
  processedEvents.add(eventId);
  return true;
}`
        }
      },
      {
        title: 'Use HTTPS-only webhook URLs',
        description: 'Never accept webhook payloads over unencrypted HTTP connections.',
        doExample: 'https://api.myapp.com/webhooks/x402',
        dontExample: 'http://api.myapp.com/webhooks/x402',
      }
    ]
  },
  {
    id: 'cors',
    title: 'CORS Configuration',
    icon: '🌐',
    severity: 'high',
    description: 'Properly configure Cross-Origin Resource Sharing to prevent unauthorized access.',
    practices: [
      {
        title: 'Whitelist specific origins',
        description: 'Never use wildcard (*) origins in production. Explicitly list allowed domains.',
        codeExample: {
          language: 'typescript',
          code: `// next.config.js or middleware
const allowedOrigins = [
  'https://myapp.com',
  'https://admin.myapp.com',
  process.env.NODE_ENV === 'development' && 'http://localhost:3000',
].filter(Boolean);

export function middleware(req: NextRequest) {
  const origin = req.headers.get('origin');
  
  if (origin && !allowedOrigins.includes(origin)) {
    return new Response('CORS error', { status: 403 });
  }
  
  const response = NextResponse.next();
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  return response;
}`
        },
        doExample: "Access-Control-Allow-Origin: https://myapp.com",
        dontExample: "Access-Control-Allow-Origin: *"
      },
      {
        title: 'Restrict allowed methods and headers',
        description: 'Only allow the HTTP methods and headers your API actually needs.',
        codeExample: {
          language: 'typescript',
          code: `// Restrictive CORS headers
response.headers.set('Access-Control-Allow-Methods', 'GET, POST');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
response.headers.set('Access-Control-Max-Age', '86400'); // Cache preflight 24h`
        }
      }
    ]
  },
  {
    id: 'rate-limiting',
    title: 'Rate Limiting & Throttling',
    icon: '⏱️',
    severity: 'high',
    description: 'Protect your integration from abuse and control costs.',
    practices: [
      {
        title: 'Implement client-side rate limiting',
        description: 'Add rate limiting in your code to avoid hitting API limits and incurring excess charges.',
        codeExample: {
          language: 'typescript',
          code: `import Bottleneck from 'bottleneck';

// Create a limiter: max 10 requests per second
const limiter = new Bottleneck({
  maxConcurrent: 5,
  minTime: 100, // 100ms between requests
});

// Wrap your API calls
async function callAgent(params: AgentParams) {
  return limiter.schedule(() => 
    fetch('https://agent.lucid.id/api', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  );
}`
        }
      },
      {
        title: 'Handle 429 responses gracefully',
        description: 'Implement exponential backoff when you receive rate limit responses.',
        codeExample: {
          language: 'typescript',
          code: `async function fetchWithRetry(
  url: string, 
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options);
    
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const delay = retryAfter 
        ? parseInt(retryAfter) * 1000 
        : Math.pow(2, i) * 1000;
      
      console.log(\`Rate limited, retrying in \${delay}ms\`);
      await new Promise(r => setTimeout(r, delay));
      continue;
    }
    
    return response;
  }
  
  throw new Error('Max retries exceeded');
}`
        }
      },
      {
        title: 'Set spending alerts',
        description: 'Configure budget alerts to prevent runaway costs from bugs or attacks.',
        doExample: 'Alert at 50%, 80%, 100% of monthly budget',
        dontExample: 'No spending limits or alerts',
      }
    ]
  },
  {
    id: 'error-handling',
    title: 'Secure Error Handling',
    icon: '🚨',
    severity: 'medium',
    description: 'Handle errors without exposing sensitive information.',
    practices: [
      {
        title: 'Never expose internal errors to clients',
        description: 'Log detailed errors server-side but return generic messages to clients.',
        codeExample: {
          language: 'typescript',
          code: `export async function POST(req: Request) {
  try {
    const result = await processRequest(req);
    return Response.json(result);
  } catch (error) {
    // Log full error internally
    console.error('Request failed:', {
      error: error.message,
      stack: error.stack,
      requestId: req.headers.get('x-request-id'),
    });
    
    // Return generic error to client
    return Response.json(
      { 
        error: 'An error occurred processing your request',
        requestId: req.headers.get('x-request-id'),
      },
      { status: 500 }
    );
  }
}`
        },
        doExample: '{ "error": "Request failed", "requestId": "abc123" }',
        dontExample: '{ "error": "ECONNREFUSED 10.0.0.5:5432 - password auth failed for user postgres" }'
      },
      {
        title: 'Sanitize error messages',
        description: 'Strip stack traces, file paths, and database errors before logging externally.',
        codeExample: {
          language: 'typescript',
          code: `function sanitizeError(error: Error): object {
  return {
    message: error.message.replace(/\\/[^\\s]+/g, '[PATH]'),
    type: error.name,
    // Never include: stack, cause, or raw SQL
  };
}`
        }
      }
    ]
  },
  {
    id: 'data-protection',
    title: 'Data Protection',
    icon: '🔒',
    severity: 'critical',
    description: 'Protect sensitive data in transit and at rest.',
    practices: [
      {
        title: 'Always use HTTPS/TLS',
        description: 'All API communication must use TLS 1.2 or higher. Never send data over plain HTTP.',
        doExample: 'Enforce HTTPS with HSTS header',
        dontExample: 'Allow HTTP fallback for "compatibility"',
        codeExample: {
          language: 'typescript',
          code: `// Enforce HTTPS in Next.js middleware
export function middleware(req: NextRequest) {
  if (req.headers.get('x-forwarded-proto') !== 'https') {
    return NextResponse.redirect(
      \`https://\${req.headers.get('host')}\${req.nextUrl.pathname}\`,
      301
    );
  }
  
  const response = NextResponse.next();
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
  return response;
}`
        }
      },
      {
        title: 'Minimize data collection',
        description: "Only request and store the data you actually need. Don't log sensitive fields.",
        doExample: 'Request only required fields from agents',
        dontExample: 'Store full API responses including sensitive data',
      },
      {
        title: 'Encrypt sensitive data at rest',
        description: 'If you store API responses, encrypt sensitive fields using strong encryption.',
        codeExample: {
          language: 'typescript',
          code: `import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-gcm', 
    Buffer.from(ENCRYPTION_KEY, 'hex'), 
    iv
  );
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();
  
  return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
}`
        }
      }
    ]
  },
  {
    id: 'audit-logging',
    title: 'Audit Logging',
    icon: '📋',
    severity: 'medium',
    description: 'Track all API access for security monitoring and compliance.',
    practices: [
      {
        title: 'Log all API requests',
        description: 'Maintain comprehensive logs of API access for security analysis and debugging.',
        codeExample: {
          language: 'typescript',
          code: `interface AuditLog {
  timestamp: string;
  requestId: string;
  userId: string;
  action: string;
  agentId: string;
  ip: string;
  userAgent: string;
  statusCode: number;
  duration: number;
  cost?: number;
}

async function logApiAccess(log: AuditLog) {
  await db.auditLogs.insert({
    ...log,
    timestamp: new Date().toISOString(),
  });
  
  // Also send to SIEM for real-time monitoring
  await sendToSIEM(log);
}`
        }
      },
      {
        title: 'Monitor for anomalies',
        description: 'Set up alerts for unusual patterns like sudden usage spikes or access from new locations.',
        doExample: 'Alert on 10x normal request volume',
        dontExample: 'Only check logs after an incident',
      },
      {
        title: 'Retain logs appropriately',
        description: 'Keep audit logs for at least 90 days. Comply with your industry retention requirements.',
        doExample: '90 days hot storage, 1 year cold archive',
        dontExample: 'Delete logs after 7 days',
      }
    ]
  }
];

const severityConfig = {
  critical: {
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    label: 'Critical',
  },
  high: {
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    label: 'High',
  },
  medium: {
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    label: 'Medium',
  },
};

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative mt-3">
      <div className="flex items-center justify-between bg-zinc-900 rounded-t-lg px-4 py-2 border border-b-0 border-zinc-700">
        <span className="text-xs text-zinc-400 font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="text-xs text-zinc-400 hover:text-white transition-colors"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre className="bg-zinc-950 rounded-b-lg p-4 overflow-x-auto border border-t-0 border-zinc-700">
        <code className="text-sm text-zinc-300 font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}

function SecurityCard({ topic, isExpanded, onToggle }: { 
  topic: SecurityTopic; 
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const severity = severityConfig[topic.severity];

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${severity.border} ${severity.bg}`}>
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className="text-3xl">{topic.icon}</span>
          <div className="text-left">
            <h3 className="text-xl font-semibold text-white">{topic.title}</h3>
            <p className="text-zinc-400 text-sm mt-1">{topic.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded text-xs font-medium ${severity.bg} ${severity.color}`}>
            {severity.label}
          </span>
          <span className={`text-zinc-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-6">
          {topic.practices.map((practice, idx) => (
            <div key={idx} className="bg-black/30 rounded-lg p-5">
              <h4 className="font-semibold text-white mb-2">{practice.title}</h4>
              <p className="text-zinc-400 text-sm">{practice.description}</p>

              {(practice.doExample || practice.dontExample) && (
                <div className="mt-4 grid md:grid-cols-2 gap-3">
                  {practice.doExample && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                      <span className="text-green-400 text-xs font-semibold">✓ DO</span>
                      <p className="text-zinc-300 text-sm mt-1">{practice.doExample}</p>
                    </div>
                  )}
                  {practice.dontExample && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                      <span className="text-red-400 text-xs font-semibold">✗ DON&apos;T</span>
                      <p className="text-zinc-300 text-sm mt-1">{practice.dontExample}</p>
                    </div>
                  )}
                </div>
              )}

              {practice.codeExample && (
                <CodeBlock 
                  language={practice.codeExample.language} 
                  code={practice.codeExample.code} 
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SecurityChecklist() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const checklistItems = [
    { id: '1', text: 'API keys stored in environment variables only', severity: 'critical' as const },
    { id: '2', text: 'Keys rotated within last 90 days', severity: 'high' as const },
    { id: '3', text: 'Separate keys for dev/staging/production', severity: 'high' as const },
    { id: '4', text: 'Webhook signatures verified before processing', severity: 'critical' as const },
    { id: '5', text: 'HTTPS enforced with HSTS header', severity: 'critical' as const },
    { id: '6', text: 'CORS configured with specific origins (no wildcards)', severity: 'high' as const },
    { id: '7', text: 'Rate limiting implemented client-side', severity: 'medium' as const },
    { id: '8', text: 'Spending alerts configured', severity: 'medium' as const },
    { id: '9', text: 'Internal errors not exposed to clients', severity: 'high' as const },
    { id: '10', text: 'Audit logging enabled for all API access', severity: 'medium' as const },
    { id: '11', text: 'Sensitive data encrypted at rest', severity: 'high' as const },
    { id: '12', text: 'Replay attack prevention for webhooks', severity: 'medium' as const },
  ];

  const toggleItem = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  const progress = Math.round((checkedItems.size / checklistItems.length) * 100);

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Security Checklist</h3>
        <div className="flex items-center gap-3">
          <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-zinc-400 text-sm font-mono">{progress}%</span>
        </div>
      </div>

      <div className="space-y-3">
        {checklistItems.map(item => {
          const severity = severityConfig[item.severity];
          return (
            <label
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
                ${checkedItems.has(item.id) ? 'bg-green-500/10' : 'bg-zinc-800/50 hover:bg-zinc-800'}`}
            >
              <input
                type="checkbox"
                checked={checkedItems.has(item.id)}
                onChange={() => toggleItem(item.id)}
                className="w-5 h-5 rounded border-zinc-600 bg-zinc-900 text-green-500 focus:ring-green-500"
              />
              <span className={`text-sm ${checkedItems.has(item.id) ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>
                {item.text}
              </span>
              <span className={`ml-auto px-2 py-0.5 rounded text-xs ${severity.bg} ${severity.color}`}>
                {severity.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default function SecurityPage() {
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set(['api-keys']));
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const toggleTopic = (id: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedTopics(newExpanded);
  };

  const filteredTopics = useMemo(() => {
    if (filterSeverity === 'all') return securityTopics;
    return securityTopics.filter(t => t.severity === filterSeverity);
  }, [filterSeverity]);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Security Best Practices', href: '/security' },
          ]}
        />

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            🔒 Security Guide
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Security Best Practices
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Comprehensive security guidelines for integrating with x402 agents. 
            Protect your API keys, secure your webhooks, and harden your production deployment.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {securityTopics.map(topic => (
            <button
              key={topic.id}
              onClick={() => {
                setExpandedTopics(new Set([topic.id]));
                document.getElementById(topic.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-3 py-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg text-sm text-zinc-300 transition-colors"
            >
              <span>{topic.icon}</span>
              <span>{topic.title}</span>
            </button>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-zinc-400 text-sm">{filteredTopics.length} topics</span>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-sm">Filter:</span>
            {['all', 'critical', 'high', 'medium'].map(severity => (
              <button
                key={severity}
                onClick={() => setFilterSeverity(severity)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  filterSeverity === severity
                    ? 'bg-zinc-700 text-white'
                    : 'bg-zinc-800/50 text-zinc-400 hover:text-white'
                }`}
              >
                {severity === 'all' ? 'All' : severityConfig[severity as keyof typeof severityConfig].label}
              </button>
            ))}
          </div>
        </div>

        {/* Security Topics */}
        <div className="space-y-4 mb-12">
          {filteredTopics.map(topic => (
            <div key={topic.id} id={topic.id}>
              <SecurityCard
                topic={topic}
                isExpanded={expandedTopics.has(topic.id)}
                onToggle={() => toggleTopic(topic.id)}
              />
            </div>
          ))}
        </div>

        {/* Checklist */}
        <SecurityChecklist />

        {/* Related Links */}
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          <Link
            href="/checklist"
            className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
          >
            <div className="text-2xl mb-3">✅</div>
            <h3 className="font-semibold text-white mb-1">Production Checklist</h3>
            <p className="text-zinc-400 text-sm">Full deployment checklist</p>
          </Link>
          <Link
            href="/preflight"
            className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
          >
            <div className="text-2xl mb-3">🔍</div>
            <h3 className="font-semibold text-white mb-1">Preflight Check</h3>
            <p className="text-zinc-400 text-sm">Verify your environment</p>
          </Link>
          <Link
            href="/alerts"
            className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
          >
            <div className="text-2xl mb-3">🚨</div>
            <h3 className="font-semibold text-white mb-1">Alerts Setup</h3>
            <p className="text-zinc-400 text-sm">Configure monitoring</p>
          </Link>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center p-8 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-2xl border border-red-500/20">
          <h2 className="text-2xl font-bold text-white mb-3">Found a Security Issue?</h2>
          <p className="text-zinc-400 mb-6">
            Report vulnerabilities responsibly. We take security seriously.
          </p>
          <a
            href="mailto:security@lucid.id"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
          >
            📧 Report to security@lucid.id
          </a>
        </div>
      </div>
    </div>
  );
}
