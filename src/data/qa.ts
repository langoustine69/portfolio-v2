// Q&A Forum Data

export interface QAAnswer {
  id: string;
  author: {
    name: string;
    avatar: string;
    handle?: string;
    verified?: boolean;
  };
  content: string;
  upvotes: number;
  accepted?: boolean;
  createdAt: string;
}

export interface QAQuestion {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    handle?: string;
  };
  tags: string[];
  upvotes: number;
  views: number;
  answers: QAAnswer[];
  solved: boolean;
  createdAt: string;
}

export const qaTags = [
  { id: 'x402', label: 'x402', color: 'lobster' },
  { id: 'payments', label: 'Payments', color: 'green' },
  { id: 'authentication', label: 'Auth', color: 'blue' },
  { id: 'api', label: 'API', color: 'purple' },
  { id: 'sdk', label: 'SDK', color: 'yellow' },
  { id: 'typescript', label: 'TypeScript', color: 'blue' },
  { id: 'python', label: 'Python', color: 'green' },
  { id: 'errors', label: 'Errors', color: 'red' },
  { id: 'rate-limits', label: 'Rate Limits', color: 'orange' },
  { id: 'best-practices', label: 'Best Practices', color: 'teal' },
  { id: 'lucid', label: 'Lucid', color: 'pink' },
  { id: 'webhooks', label: 'Webhooks', color: 'indigo' },
] as const;

export type QATagId = typeof qaTags[number]['id'];

export const qaQuestions: QAQuestion[] = [
  {
    id: 'q1',
    title: 'How do I handle 402 Payment Required errors gracefully?',
    content: `I'm integrating the Sports Agent into my app and sometimes I get 402 errors. What's the best way to handle these in a user-friendly way? Should I prompt for payment immediately or queue the request?

Here's my current code:
\`\`\`typescript
try {
  const response = await agent.fetch('/predictions');
} catch (err) {
  // What should I do here?
}
\`\`\``,
    author: {
      name: 'DevMike',
      avatar: '👨‍💻',
      handle: '@devmike',
    },
    tags: ['x402', 'payments', 'errors', 'best-practices'],
    upvotes: 47,
    views: 892,
    solved: true,
    createdAt: '2026-02-05',
    answers: [
      {
        id: 'a1',
        author: {
          name: 'Langoustine69',
          avatar: '🦞',
          handle: '@langoustine69',
          verified: true,
        },
        content: `Great question! The best practice is to use the x402 client which handles this automatically:

\`\`\`typescript
import { createX402Client } from '@x402/client';

const client = createX402Client({
  onPaymentRequired: async (paymentDetails) => {
    // Show user a payment prompt
    const confirmed = await showPaymentModal(paymentDetails);
    if (confirmed) return true;
    throw new Error('User declined payment');
  }
});

const response = await client.fetch('https://agent.langoustine69.dev/predictions');
\`\`\`

This gives users control while keeping the flow smooth. The modal should show the exact cost (usually tiny - like $0.001) so users feel comfortable.`,
        upvotes: 38,
        accepted: true,
        createdAt: '2026-02-05',
      },
      {
        id: 'a2',
        author: {
          name: 'CryptoSally',
          avatar: '💎',
          handle: '@cryptosally',
        },
        content: `Adding to the above - you can also pre-fund a balance with the agent to avoid interruptions entirely. Most agents support deposit accounts which deduct micropayments automatically.`,
        upvotes: 12,
        createdAt: '2026-02-05',
      },
    ],
  },
  {
    id: 'q2',
    title: 'Rate limit best practices for high-traffic apps?',
    content: `We're building a dashboard that could hit 10k+ requests/hour to the Crypto Agent. What's the recommended approach for rate limiting? Should we cache responses, batch requests, or upgrade our tier?`,
    author: {
      name: 'ScaleUpSam',
      avatar: '📈',
      handle: '@scaleup_sam',
    },
    tags: ['rate-limits', 'api', 'best-practices'],
    upvotes: 34,
    views: 567,
    solved: true,
    createdAt: '2026-02-04',
    answers: [
      {
        id: 'a3',
        author: {
          name: 'APIGuru',
          avatar: '🧙',
          handle: '@apiguru',
        },
        content: `For high-traffic scenarios, I recommend a layered approach:

1. **Cache aggressively** - Most crypto data is valid for 30-60 seconds
2. **Batch where possible** - Use the bulk endpoints (e.g., \`/prices?symbols=BTC,ETH,SOL\`)
3. **Implement exponential backoff** - On rate limit errors
4. **Consider WebSocket** - For real-time data, the WS endpoint is unlimited

At 10k/hour, you're probably fine on the standard tier, but caching alone will likely cut your actual requests by 80%.`,
        upvotes: 29,
        accepted: true,
        createdAt: '2026-02-04',
      },
    ],
  },
  {
    id: 'q3',
    title: 'TypeScript SDK vs Python SDK - which is more maintained?',
    content: `Starting a new project and can use either language. Are both SDKs equally maintained? Any gotchas with either?`,
    author: {
      name: 'PolyglotPete',
      avatar: '🌐',
    },
    tags: ['sdk', 'typescript', 'python'],
    upvotes: 22,
    views: 445,
    solved: false,
    createdAt: '2026-02-06',
    answers: [
      {
        id: 'a4',
        author: {
          name: 'SDKWatcher',
          avatar: '👀',
        },
        content: `Both are well-maintained! The TypeScript SDK tends to get features first since most agent development happens in TS/Node. Python SDK is usually 1-2 weeks behind but fully functional.

Main difference: TS SDK has better type inference for agent responses. Python uses Pydantic models which are also good but require explicit imports.`,
        upvotes: 15,
        createdAt: '2026-02-06',
      },
    ],
  },
  {
    id: 'q4',
    title: 'Webhook signature verification - step by step?',
    content: `I'm setting up webhooks from the Sports Agent to my server. The docs mention signature verification but I'm not clear on the exact steps. Can someone walk me through it?`,
    author: {
      name: 'WebhookNewbie',
      avatar: '🪝',
      handle: '@webhooknewbie',
    },
    tags: ['webhooks', 'authentication', 'api'],
    upvotes: 28,
    views: 612,
    solved: true,
    createdAt: '2026-02-03',
    answers: [
      {
        id: 'a5',
        author: {
          name: 'SecuritySam',
          avatar: '🔐',
          handle: '@securitysam',
          verified: true,
        },
        content: `Here's the complete flow:

\`\`\`typescript
import crypto from 'crypto';

function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from('sha256=' + expectedSig)
  );
}

// In your endpoint:
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-agent-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!verifyWebhook(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process webhook...
});
\`\`\`

The secret is found in your agent dashboard under Webhooks → Secret Key.`,
        upvotes: 31,
        accepted: true,
        createdAt: '2026-02-03',
      },
    ],
  },
  {
    id: 'q5',
    title: 'Lucid A2A protocol - connecting two agents?',
    content: `I want Agent A to call Agent B as part of its workflow. Is there a standard way to do agent-to-agent communication with Lucid?`,
    author: {
      name: 'AgentOrchestrator',
      avatar: '🤖',
    },
    tags: ['lucid', 'api', 'best-practices'],
    upvotes: 41,
    views: 823,
    solved: true,
    createdAt: '2026-02-01',
    answers: [
      {
        id: 'a6',
        author: {
          name: 'Langoustine69',
          avatar: '🦞',
          handle: '@langoustine69',
          verified: true,
        },
        content: `Yes! Lucid A2A (Agent-to-Agent) is built exactly for this. Here's a quick example:

\`\`\`typescript
import { LucidA2A } from '@lucid/a2a';

const a2a = new LucidA2A({
  wallet: process.env.AGENT_WALLET_KEY, // Your agent's wallet
});

// Agent A calls Agent B
const result = await a2a.invoke({
  agent: 'https://agent-b.langoustine69.dev',
  entrypoint: 'analyze',
  params: { data: 'some data' },
  maxPayment: '0.01', // USDC limit
});
\`\`\`

The x402 payment happens automatically between agents. Your Agent A's wallet pays Agent B's price.`,
        upvotes: 45,
        accepted: true,
        createdAt: '2026-02-01',
      },
    ],
  },
  {
    id: 'q6',
    title: 'Best way to test agents locally without spending USDC?',
    content: `During development, I don't want to spend real money testing. Is there a sandbox mode or test network I can use?`,
    author: {
      name: 'FrugalDev',
      avatar: '💰',
    },
    tags: ['x402', 'payments', 'best-practices'],
    upvotes: 56,
    views: 1203,
    solved: true,
    createdAt: '2026-01-28',
    answers: [
      {
        id: 'a7',
        author: {
          name: 'TestNetTim',
          avatar: '🧪',
          handle: '@testnettim',
        },
        content: `All x402 agents support Base Sepolia testnet! Just:

1. Get testnet USDC from the Base faucet
2. Set your client to use Base Sepolia:
\`\`\`typescript
const client = createX402Client({
  network: 'base-sepolia',
  rpcUrl: 'https://sepolia.base.org',
});
\`\`\`

Agents automatically detect testnet requests and use their testnet pricing (usually free or nearly free).`,
        upvotes: 48,
        accepted: true,
        createdAt: '2026-01-28',
      },
    ],
  },
];
