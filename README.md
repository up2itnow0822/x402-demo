# x402 Demo — Test Agent Payments

> **Patent Pending — AI Agent Economy**

A live public endpoint implementing the **HTTP 402 pay-to-complete** flow. Test your agent payment integration without real money.

🌐 **Live URL:** https://x402-demo.vercel.app

## Endpoints

| Endpoint | Cost | Returns |
|---|---|---|
| `GET /api/market-data` | 0.001 USDC | Live BTC/ETH/SOL prices from CoinGecko |
| `GET /api/sentiment` | 0.005 USDC | AI sentiment analysis from live price action |
| `GET /` | Free | Landing page + curl examples |

## Quick Start

**Step 1 — Hit the endpoint (get a 402):**
```bash
curl -i https://x402-demo.vercel.app/api/market-data
```

**Step 2 — Check the 402 headers for payment instructions.**

**Step 3 — Retry with proof:**
```bash
curl https://x402-demo.vercel.app/api/market-data \
  -H "X-Payment-Proof: a3f8c2d1e4b5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1"
```

## Demo Mode

In demo mode, any 64-character hex string is accepted as payment proof. No real USDC is charged.

In production, `X-Payment-Proof` must be a real Base network transaction hash verified on-chain.

## SDK Integration

```bash
npm install agentwallet-sdk
```

```typescript
import { AgentWallet } from 'agentwallet-sdk';

const wallet = new AgentWallet({
  privateKey: process.env.AGENT_PRIVATE_KEY,
  network: 'base',
});

// Auto-handles 402: detects → pays → retries
const data = await wallet.fetch('https://x402-demo.vercel.app/api/market-data');
console.log(data.markets.BTC.price_usd);
```

## Local Development

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Related

- [agentwallet-sdk](https://github.com/up2itnow0822/agent-wallet-sdk) — Agent wallet with x402 support
- [agentpay-mcp](https://github.com/up2itnow0822/agentpay-mcp) — MCP server for agent payments

---

*Patent Pending — AI Agent Economy © 2026*
