'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BellAlertIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChartBarIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  CodeBracketIcon,
  CheckCircleIcon,
  DocumentDuplicateIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import CodeBlock from '@/components/CodeBlock'
import Link from 'next/link'

interface AlertType {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  severity: 'info' | 'warning' | 'critical'
  example: string
}

interface Channel {
  id: string
  name: string
  icon: string
  color: string
  webhookUrl: string
  setup: string[]
}

const alertTypes: AlertType[] = [
  {
    id: 'budget',
    name: 'Budget Threshold',
    description: 'Get notified when spending approaches or exceeds your budget limit',
    icon: CurrencyDollarIcon,
    severity: 'warning',
    example: 'Alert: Daily spend ($4.52) exceeded 80% of $5.00 budget',
  },
  {
    id: 'downtime',
    name: 'Agent Downtime',
    description: 'Immediate notification when an agent becomes unavailable',
    icon: ExclamationTriangleIcon,
    severity: 'critical',
    example: 'CRITICAL: crypto-sentiment agent is DOWN (502 Bad Gateway)',
  },
  {
    id: 'latency',
    name: 'High Latency',
    description: 'Alert when response times exceed acceptable thresholds',
    icon: ClockIcon,
    severity: 'warning',
    example: 'Warning: nft-valuator P95 latency (2.4s) exceeds 1s threshold',
  },
  {
    id: 'rate-limit',
    name: 'Rate Limit Warning',
    description: 'Get warned before hitting rate limits to prevent service disruption',
    icon: ChartBarIcon,
    severity: 'info',
    example: 'Info: 85% of hourly rate limit consumed (850/1000 requests)',
  },
  {
    id: 'payment-failure',
    name: 'Payment Failure',
    description: 'Alert on x402 payment issues or insufficient USDC balance',
    icon: CurrencyDollarIcon,
    severity: 'critical',
    example: 'CRITICAL: Payment failed - wallet balance below minimum ($0.05)',
  },
  {
    id: 'usage-spike',
    name: 'Usage Anomaly',
    description: 'Detect unusual usage patterns that may indicate issues or abuse',
    icon: ArrowPathIcon,
    severity: 'warning',
    example: 'Warning: Usage spike detected - 340% above normal hourly average',
  },
]

const channels: Channel[] = [
  {
    id: 'slack',
    name: 'Slack',
    icon: '💬',
    color: 'bg-[#4A154B]',
    webhookUrl: 'https://hooks.slack.com/services/T00/B00/XXX',
    setup: [
      'Go to Slack App Directory → Custom Integrations → Incoming Webhooks',
      'Click "Add to Slack" and select your channel',
      'Copy the Webhook URL provided',
      'Paste the URL in your x402 dashboard settings',
    ],
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: '🎮',
    color: 'bg-[#5865F2]',
    webhookUrl: 'https://discord.com/api/webhooks/123/abc',
    setup: [
      'Go to Server Settings → Integrations → Webhooks',
      'Click "New Webhook" and configure name/avatar',
      'Copy the Webhook URL',
      'Add /slack to the end for Slack-compatible format',
    ],
  },
  {
    id: 'email',
    name: 'Email',
    icon: '📧',
    color: 'bg-gray-600',
    webhookUrl: 'alerts@yourdomain.com',
    setup: [
      'Verify your email address in dashboard settings',
      'Configure which alert types trigger emails',
      'Set digest frequency (instant, hourly, daily)',
      'Add additional recipients if needed',
    ],
  },
  {
    id: 'pagerduty',
    name: 'PagerDuty',
    icon: '🚨',
    color: 'bg-[#06AC38]',
    webhookUrl: 'https://events.pagerduty.com/v2/enqueue',
    setup: [
      'Create a new Service in PagerDuty',
      'Add an "Events API v2" integration',
      'Copy the Integration Key',
      'Configure routing rules for different severities',
    ],
  },
  {
    id: 'webhook',
    name: 'Custom Webhook',
    icon: '🔗',
    color: 'bg-gray-800',
    webhookUrl: 'https://api.yourdomain.com/webhooks/x402',
    setup: [
      'Create an HTTPS endpoint on your server',
      'Handle POST requests with JSON body',
      'Return 200 OK to acknowledge receipt',
      'Implement retry logic for failures',
    ],
  },
]

const webhookPayloadExample = `{
  "event": "alert.triggered",
  "timestamp": "2026-02-08T16:01:00Z",
  "alert": {
    "id": "alt_abc123",
    "type": "budget_threshold",
    "severity": "warning",
    "title": "Budget threshold exceeded",
    "message": "Daily spend ($4.52) exceeded 80% of $5.00 budget",
    "agent": "crypto-sentiment",
    "value": 4.52,
    "threshold": 4.00
  },
  "context": {
    "period": "daily",
    "budget": 5.00,
    "spent": 4.52,
    "remaining": 0.48,
    "calls_today": 4520
  }
}`

const configExample = `import { X402Alerts } from 'x402-sdk';

const alerts = new X402Alerts({
  // Notification channels
  channels: [
    {
      type: 'slack',
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      minSeverity: 'warning', // warning, critical only
    },
    {
      type: 'pagerduty',
      integrationKey: process.env.PAGERDUTY_KEY,
      minSeverity: 'critical', // critical only
    },
    {
      type: 'email',
      addresses: ['team@company.com'],
      digest: 'hourly', // instant, hourly, daily
    },
  ],

  // Alert rules
  rules: [
    {
      type: 'budget_threshold',
      thresholds: [
        { percent: 50, severity: 'info' },
        { percent: 80, severity: 'warning' },
        { percent: 100, severity: 'critical' },
      ],
      budget: {
        daily: 10.00,  // $10/day
        monthly: 250.00, // $250/month
      },
    },
    {
      type: 'latency',
      p95Threshold: 1000, // 1 second
      severity: 'warning',
      agents: ['crypto-sentiment', 'nft-valuator'],
    },
    {
      type: 'downtime',
      checkInterval: 60, // seconds
      severity: 'critical',
    },
    {
      type: 'rate_limit',
      warnAtPercent: 80,
      severity: 'warning',
    },
  ],
});

// Start monitoring
alerts.start();

// Or manually check
const status = await alerts.check();
console.log(status.alerts); // Any triggered alerts`

const uptimeCheckExample = `// Health check endpoint for uptime monitoring
// Add to your monitoring service (UptimeRobot, Pingdom, etc.)

const AGENTS_TO_MONITOR = [
  'https://api.langoustine69.dev/v1/crypto-sentiment/health',
  'https://api.langoustine69.dev/v1/nft-valuator/health',
  'https://api.langoustine69.dev/v1/defi-yield/health',
];

async function checkAgentHealth() {
  const results = await Promise.all(
    AGENTS_TO_MONITOR.map(async (url) => {
      const start = Date.now();
      try {
        const res = await fetch(url, { 
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        });
        return {
          url,
          status: res.ok ? 'up' : 'degraded',
          latency: Date.now() - start,
          statusCode: res.status,
        };
      } catch (error) {
        return {
          url,
          status: 'down',
          latency: Date.now() - start,
          error: error.message,
        };
      }
    })
  );

  // Alert on any failures
  const failed = results.filter(r => r.status !== 'up');
  if (failed.length > 0) {
    await sendAlert({
      type: 'downtime',
      severity: 'critical',
      agents: failed,
    });
  }

  return results;
}

// Run every minute
setInterval(checkAgentHealth, 60000);`

const budgetAlertExample = `// Track spending and alert on thresholds
import { X402Client } from 'x402-sdk';

class BudgetMonitor {
  private dailySpend = 0;
  private dailyBudget: number;
  private alertedThresholds = new Set<number>();

  constructor(dailyBudget: number) {
    this.dailyBudget = dailyBudget;
    // Reset at midnight UTC
    this.scheduleReset();
  }

  async trackPayment(amount: number) {
    this.dailySpend += amount;
    
    const percentUsed = (this.dailySpend / this.dailyBudget) * 100;
    
    // Check thresholds
    const thresholds = [50, 80, 100, 150];
    for (const threshold of thresholds) {
      if (percentUsed >= threshold && !this.alertedThresholds.has(threshold)) {
        this.alertedThresholds.add(threshold);
        await this.sendBudgetAlert(threshold, percentUsed);
      }
    }
  }

  private async sendBudgetAlert(threshold: number, current: number) {
    const severity = threshold >= 100 ? 'critical' : 
                     threshold >= 80 ? 'warning' : 'info';
    
    await fetch(process.env.WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: \`💰 Budget Alert (\${severity.toUpperCase()})\\n\` +
              \`Daily spend: $\${this.dailySpend.toFixed(2)} / $\${this.dailyBudget.toFixed(2)}\\n\` +
              \`Usage: \${current.toFixed(1)}% (threshold: \${threshold}%)\`,
      }),
    });
  }

  private scheduleReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCHours(0, 0, 0, 0);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    
    setTimeout(() => {
      this.dailySpend = 0;
      this.alertedThresholds.clear();
      this.scheduleReset();
    }, tomorrow.getTime() - now.getTime());
  }
}`

export default function AlertsPage() {
  const [activeChannel, setActiveChannel] = useState<string>('slack')
  const [activeAlert, setActiveAlert] = useState<string>('budget')
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const severityColors = {
    info: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300',
    critical: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300',
  }

  return (
    <div className="min-h-screen bg-brutal-white dark:bg-shell-950">
      {/* Hero */}
      <section className="bg-brutal-yellow dark:bg-shell-900 border-b-4 border-black dark:border-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <BellAlertIcon className="w-12 h-12 text-lobster-500" />
              <h1 className="text-4xl sm:text-5xl font-black uppercase text-black dark:text-white">
                Alerts & Monitoring
              </h1>
            </div>
            <p className="mt-4 text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Never be caught off guard. Set up real-time alerts for budget thresholds, 
              downtime, latency spikes, and more.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Alert Types */}
        <section className="mb-16">
          <h2 className="text-2xl font-black uppercase text-black dark:text-white mb-6 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-6 h-6 text-lobster-500" />
            Alert Types
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alertTypes.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setActiveAlert(alert.id)}
                className={`p-4 border-4 cursor-pointer transition-all ${
                  activeAlert === alert.id
                    ? 'border-lobster-500 bg-lobster-50 dark:bg-lobster-900/20'
                    : 'border-black dark:border-white bg-white dark:bg-shell-900 hover:border-lobster-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <alert.icon className="w-6 h-6 text-lobster-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-black dark:text-white">{alert.name}</h3>
                      <span className={`px-2 py-0.5 text-xs font-bold uppercase border ${severityColors[alert.severity]}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {alert.description}
                    </p>
                    <code className="block text-xs bg-gray-100 dark:bg-shell-800 p-2 font-mono truncate">
                      {alert.example}
                    </code>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Notification Channels */}
        <section className="mb-16">
          <h2 className="text-2xl font-black uppercase text-black dark:text-white mb-6 flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-lobster-500" />
            Notification Channels
          </h2>

          <div className="flex flex-wrap gap-2 mb-6">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setActiveChannel(channel.id)}
                className={`px-4 py-2 font-bold uppercase text-sm border-4 transition-all ${
                  activeChannel === channel.id
                    ? 'border-lobster-500 bg-lobster-500 text-white'
                    : 'border-black dark:border-white bg-white dark:bg-shell-900 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-shell-800'
                }`}
              >
                <span className="mr-2">{channel.icon}</span>
                {channel.name}
              </button>
            ))}
          </div>

          {channels.filter(c => c.id === activeChannel).map((channel) => (
            <motion.div
              key={channel.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-4 border-black dark:border-white bg-white dark:bg-shell-900 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className={`w-12 h-12 rounded-lg ${channel.color} flex items-center justify-center text-2xl`}>
                  {channel.icon}
                </span>
                <div>
                  <h3 className="font-bold text-xl text-black dark:text-white">{channel.name}</h3>
                  <p className="text-sm text-gray-500 font-mono">{channel.webhookUrl}</p>
                </div>
              </div>

              <h4 className="font-bold text-black dark:text-white mb-3">Setup Steps:</h4>
              <ol className="space-y-2">
                {channel.setup.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-lobster-500 text-white font-bold flex items-center justify-center text-sm flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{step}</span>
                  </li>
                ))}
              </ol>
            </motion.div>
          ))}
        </section>

        {/* Webhook Payload */}
        <section className="mb-16">
          <h2 className="text-2xl font-black uppercase text-black dark:text-white mb-6 flex items-center gap-2">
            <CodeBracketIcon className="w-6 h-6 text-lobster-500" />
            Webhook Payload Format
          </h2>

          <div className="border-4 border-black dark:border-white bg-white dark:bg-shell-900 p-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              All alerts are delivered as JSON POST requests. Here's the payload structure:
            </p>
            <CodeBlock code={webhookPayloadExample} language="json" />
          </div>
        </section>

        {/* Code Examples */}
        <section className="mb-16">
          <h2 className="text-2xl font-black uppercase text-black dark:text-white mb-6 flex items-center gap-2">
            <Cog6ToothIcon className="w-6 h-6 text-lobster-500" />
            Implementation Examples
          </h2>

          <div className="space-y-6">
            {/* Full Config Example */}
            <div className="border-4 border-black dark:border-white bg-white dark:bg-shell-900 p-6">
              <h3 className="font-bold text-lg text-black dark:text-white mb-4 flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-lobster-500" />
                Complete Alert Configuration
              </h3>
              <CodeBlock code={configExample} language="typescript" />
            </div>

            {/* Uptime Check Example */}
            <div className="border-4 border-black dark:border-white bg-white dark:bg-shell-900 p-6">
              <h3 className="font-bold text-lg text-black dark:text-white mb-4 flex items-center gap-2">
                <ArrowPathIcon className="w-5 h-5 text-lobster-500" />
                DIY Uptime Monitoring
              </h3>
              <CodeBlock code={uptimeCheckExample} language="typescript" />
            </div>

            {/* Budget Monitor Example */}
            <div className="border-4 border-black dark:border-white bg-white dark:bg-shell-900 p-6">
              <h3 className="font-bold text-lg text-black dark:text-white mb-4 flex items-center gap-2">
                <CurrencyDollarIcon className="w-5 h-5 text-lobster-500" />
                Budget Monitoring Class
              </h3>
              <CodeBlock code={budgetAlertExample} language="typescript" />
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="mb-16">
          <h2 className="text-2xl font-black uppercase text-black dark:text-white mb-6 flex items-center gap-2">
            <CheckCircleIcon className="w-6 h-6 text-lobster-500" />
            Best Practices
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                title: 'Layer Your Channels',
                description: 'Use email for daily digests, Slack for warnings, and PagerDuty for critical alerts. Match urgency to channel.',
              },
              {
                title: 'Set Sane Thresholds',
                description: 'Start conservative (e.g., 80% budget warning) and adjust based on actual usage patterns.',
              },
              {
                title: 'Avoid Alert Fatigue',
                description: 'Too many alerts = ignored alerts. Group similar events and set appropriate severity levels.',
              },
              {
                title: 'Include Context',
                description: 'Every alert should have enough context to understand the issue without digging through logs.',
              },
              {
                title: 'Test Your Alerts',
                description: 'Verify your webhook endpoints receive alerts correctly before relying on them in production.',
              },
              {
                title: 'Document Runbooks',
                description: 'Each alert type should link to a runbook explaining how to diagnose and resolve the issue.',
              },
            ].map((practice, idx) => (
              <div key={idx} className="border-4 border-black dark:border-white bg-white dark:bg-shell-900 p-4">
                <h3 className="font-bold text-black dark:text-white mb-2">{practice.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{practice.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="bg-lobster-500 border-4 border-black dark:border-white p-8">
            <h2 className="text-2xl font-black uppercase text-white mb-4">
              Ready to Set Up Monitoring?
            </h2>
            <p className="text-lobster-100 mb-6 max-w-lg mx-auto">
              Check out the spending dashboard to track your current usage, 
              or explore the sandbox to test agents before going to production.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/spending"
                className="px-6 py-3 bg-white text-black font-bold uppercase border-4 border-black hover:bg-gray-100 transition-colors"
              >
                💰 View Spending
              </Link>
              <Link
                href="/sandbox"
                className="px-6 py-3 bg-black text-white font-bold uppercase border-4 border-white hover:bg-gray-900 transition-colors"
              >
                🧪 Try Sandbox
              </Link>
              <Link
                href="/status"
                className="px-6 py-3 bg-brutal-yellow text-black font-bold uppercase border-4 border-black hover:bg-yellow-400 transition-colors"
              >
                📊 System Status
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-black uppercase text-black dark:text-white mb-6">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {[
              {
                q: 'How quickly are alerts delivered?',
                a: 'Critical alerts (downtime, payment failures) are sent immediately. Budget and latency warnings are checked every minute. Email digests are batched per your configured frequency.',
              },
              {
                q: 'Can I customize alert messages?',
                a: 'Yes! With custom webhooks you control the payload format. For Slack/Discord, you can set custom templates in your dashboard settings.',
              },
              {
                q: 'What happens if my webhook endpoint is down?',
                a: 'We retry failed deliveries with exponential backoff (1s, 5s, 30s, 5m). After 5 failures, the alert is marked as undeliverable. Configure a backup channel to avoid missing critical alerts.',
              },
              {
                q: 'Are there rate limits on alerts?',
                a: 'Yes, to prevent spam: max 60 alerts per hour per channel. Similar alerts within 5 minutes are de-duplicated and grouped.',
              },
              {
                q: 'Can I alert on specific agents only?',
                a: 'Absolutely. Each alert rule can specify which agents to monitor. Use this to set different thresholds for different agents based on criticality.',
              },
            ].map((faq, idx) => (
              <details key={idx} className="border-4 border-black dark:border-white bg-white dark:bg-shell-900 group">
                <summary className="p-4 font-bold text-black dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-shell-800 list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-lobster-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-4 pb-4 text-gray-600 dark:text-gray-400 border-t-2 border-gray-200 dark:border-gray-700 pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
