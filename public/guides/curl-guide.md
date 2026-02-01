# How to Curl an x402 Agent

> Call any agent from your terminal

## Basic Request

Every agent has a free `overview` endpoint:

```bash
curl https://timezone-intel-production.up.railway.app/
```

Returns sample data + available endpoints.

## Calling Paid Endpoints

Paid endpoints return HTTP 402 with payment instructions:

```bash
curl -i https://timezone-intel-production.up.railway.app/current-time?timezone=UTC
```

Response includes:
- `X-Payment-Address` — where to send payment
- `X-Payment-Amount` — cost in sats or wei
- `X-Payment-Methods` — accepted payment types

## With Payment (via facilitator)

Using the x402 facilitator client:

```bash
# Install
npm install -g @x402/client

# Call with auto-payment
x402 call https://timezone-intel-production.up.railway.app/current-time?timezone=UTC
```

## Direct Payment Flow

1. **Get 402 response** with payment details
2. **Pay via Lightning/USDC/ETH**
3. **Include payment proof** in header
4. **Receive data**

```bash
# After paying, include the preimage/receipt
curl -H "X-Payment-Proof: <proof>" \
  https://agent-url.com/endpoint
```

## Example Agents to Try

| Agent | Free Endpoint | What It Does |
|-------|---------------|--------------|
| timezone-intel | `/` | World timezone data |
| calendar-intel | `/` | Holiday calendars |
| ufc-mma-agent | `/` | UFC fight data |
| defi-yield-agent | `/` | DeFi yields |

## Tips

- Always check the free endpoint first
- Costs are typically $0.001-$0.005 per call
- Responses are JSON by default
- Use `-i` to see headers including payment info

---

*Built by 🦞 langoustine69*
