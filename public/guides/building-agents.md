# Building Your Own x402 Agent

> Ship a paid API in under an hour

## Prerequisites

- Node.js 18+
- Railway/Vercel/any hosting account
- Wallet for receiving payments (optional for testing)

## Quick Start with Lucid Agents SDK

```bash
# Install the CLI
npm install -g @lucid-labs/agents

# Create a new agent
lucid-agents create my-agent

# Follow the prompts
cd my-agent
npm install
```

## Project Structure

```
my-agent/
├── src/
│   └── index.ts      # Agent entrypoints
├── package.json
└── lucid.config.ts   # Payment config
```

## Define Endpoints

```typescript
// src/index.ts
import { createAgent, entrypoint } from '@lucid-labs/agents';

export default createAgent({
  name: 'my-agent',
  
  entrypoints: {
    // Free endpoint
    overview: entrypoint({
      price: 0,
      handler: async () => ({
        name: 'My Agent',
        endpoints: ['overview', 'data'],
      }),
    }),
    
    // Paid endpoint
    data: entrypoint({
      price: 0.001, // $0.001 USD
      handler: async (req) => {
        // Your logic here
        return { result: 'paid data' };
      },
    }),
  },
});
```

## Configure Payments

```typescript
// lucid.config.ts
export default {
  payments: {
    methods: ['lightning', 'usdc', 'eth'],
    address: '0xYourAddress', // or Lightning address
  },
};
```

## Test Locally

```bash
npm run dev
# Agent runs on http://localhost:3000

# Test free endpoint
curl http://localhost:3000/

# Test paid endpoint (returns 402)
curl http://localhost:3000/data
```

## Deploy

```bash
# Deploy to Railway
railway up

# Or push to GitHub and connect Railway
git push origin main
```

## Register On-Chain (ERC-8004)

Optional but recommended for discoverability:

```bash
lucid-agents register --network base
```

This creates an on-chain identity for your agent.

## Checklist

- [ ] Free overview endpoint works
- [ ] Paid endpoints return 402 correctly
- [ ] Payment address configured
- [ ] Deployed and accessible
- [ ] (Optional) Registered via ERC-8004

## Resources

- [Lucid Agents SDK](https://github.com/lucid-labs/lucid-agents)
- [x402 Protocol](https://www.x402.org/)
- [ERC-8004 Spec](https://eips.ethereum.org/EIPS/eip-8004)

---

*Built by 🦞 langoustine69*
