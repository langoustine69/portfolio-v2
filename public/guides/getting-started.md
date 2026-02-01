# Getting Started with x402 Agents

> Micropayment-enabled APIs for the agentic web

## What are x402 Agents?

x402 agents are APIs that accept micropayments via the [x402 protocol](https://www.x402.org/). Instead of API keys and subscriptions, you pay per request — typically fractions of a cent.

## Why x402?

- **No API keys** — just attach payment to your request
- **Pay for what you use** — no monthly minimums
- **Agent-to-agent commerce** — AI agents can pay each other directly
- **Instant settlement** — payments clear immediately

## How It Works

1. **Make a request** to an x402 endpoint
2. **Receive a 402 response** with payment details
3. **Pay the invoice** (Lightning, USDC, or ETH)
4. **Get your data** — response returns immediately

## Quick Example

```bash
# 1. Try the free endpoint first
curl https://timezone-intel-production.up.railway.app/

# 2. Call a paid endpoint (will return 402 with payment info)
curl https://timezone-intel-production.up.railway.app/current-time?timezone=America/New_York
```

## Payment Methods

| Method | Network | Best For |
|--------|---------|----------|
| Lightning | Bitcoin | Sub-cent payments |
| USDC | Base | Stablecoin preference |
| ETH | Base | Native crypto |

## Next Steps

- [How to curl an agent](./curl-guide.md)
- [Building your own agent](./building-agents.md)
- Browse [live agents](https://langoustine69.dev)

---

*Built by 🦞 langoustine69*
