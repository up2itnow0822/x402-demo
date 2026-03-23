const BASE_URL = "https://x402-demo-pi.vercel.app";

export default function Home() {
  return (
    <main>
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="site-header">
        <div className="container header-inner">
          <span className="mono muted">
            HTTP/1.1 <span className="color-yellow">402 Payment Required</span>
          </span>
          <div className="header-links">
            <span className="badge badge-yellow">Demo Mode</span>
            <a
              href="https://github.com/up2itnow0822/agent-wallet-sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="muted small"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </header>

      <div className="container">
        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="hero">
          <h1 className="hero-title">
            x402 Demo
            <br />
            <span className="color-blue">Test Agent Payments</span>
          </h1>
          <p className="hero-desc">
            A live public endpoint implementing the{" "}
            <strong>HTTP 402 pay-to-complete</strong> flow. Test your agent
            payment integration without real money. Accepts any 64-character hex
            string as a demo payment proof.
          </p>
          <div className="badge-row">
            <span className="badge badge-blue">Base Network</span>
            <span className="badge badge-blue">USDC</span>
            <span className="badge badge-green">Testnet / Demo</span>
            <span className="badge badge-yellow">Patent Pending</span>
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────── */}
        <section className="section">
          <h2 className="section-title">How x402 Works — 3 Steps</h2>

          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3 className="step-heading">Agent requests the resource</h3>
              <p className="muted mb-sm">
                The agent calls any paid API endpoint. No payment headers yet.
              </p>
              <pre>{`curl -i ${BASE_URL}/api/market-data`}</pre>
            </div>
          </div>

          <div className="connector-line" />

          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3 className="step-heading">
                Server returns 402 with payment instructions
              </h3>
              <p className="muted mb-sm">
                The response includes <code>X-Payment</code> headers telling the
                agent exactly how much to pay, in what currency, on which
                network, and to which address.
              </p>
              <pre>{`HTTP/1.1 402 Payment Required
X-Payment: {"amount":"0.001","currency":"USDC","network":"base","recipient":"0x833...","description":"Real-time BTC/ETH market data"}
X-Payment-Version: 1.0
X-Payment-Network: base
X-Payment-Recipient: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
X-Payment-Amount: 0.001
X-Payment-Currency: USDC
Content-Type: application/json

{
  "error": "payment_required",
  "amount": "0.001",
  "currency": "USDC",
  "how_to_pay": {
    "demo": "Add header: X-Payment-Proof: <64-char hex>",
    "sdk": "npm install agentwallet-sdk"
  }
}`}</pre>
            </div>
          </div>

          <div className="connector-line" />

          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3 className="step-heading">Agent pays and retries with proof</h3>
              <p className="muted mb-sm">
                The agent submits payment on-chain, then retries with{" "}
                <code>X-Payment-Proof</code> containing the transaction hash.
                Server verifies and returns the data.
              </p>
              <pre>{`curl -i ${BASE_URL}/api/market-data \\
  -H "X-Payment-Proof: a3f8c2d1e4b5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1"`}</pre>
            </div>
          </div>
        </section>

        {/* ── Live Endpoints ────────────────────────────────────── */}
        <section className="section">
          <h2 className="section-title">Live Endpoints</h2>

          {/* Market Data */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="endpoint-tag">GET /api/market-data</div>
                <h3 className="card-title">Real-Time Market Data</h3>
              </div>
              <div className="badge-row">
                <span className="badge badge-yellow">0.001 USDC</span>
                <span className="badge badge-blue">Base</span>
              </div>
            </div>
            <p className="muted small mb-sm">
              Returns live BTC, ETH, and SOL prices from CoinGecko — price, 24h
              change, market cap, and volume. Data refreshed every 60 seconds.
            </p>
            <p className="label-muted">Without payment → 402:</p>
            <pre className="mb-sm">{`curl -i ${BASE_URL}/api/market-data`}</pre>
            <p className="label-muted">With demo payment proof → 200 + data:</p>
            <pre>{`curl ${BASE_URL}/api/market-data \\
  -H "X-Payment-Proof: a3f8c2d1e4b5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1"

# Response:
{
  "success": true,
  "demo_mode": true,
  "markets": {
    "BTC": { "price_usd": 67420.15, "change_24h_pct": 2.34, ... },
    "ETH": { "price_usd": 3521.08, "change_24h_pct": 1.87, ... },
    "SOL": { "price_usd": 142.33, "change_24h_pct": -0.52, ... }
  }
}`}</pre>
          </div>

          {/* Sentiment */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="endpoint-tag">GET /api/sentiment</div>
                <h3 className="card-title">AI Sentiment Analysis</h3>
              </div>
              <div className="badge-row">
                <span className="badge badge-yellow">0.005 USDC</span>
                <span className="badge badge-blue">Base</span>
              </div>
            </div>
            <p className="muted small mb-sm">
              Computes real-time market sentiment from live BTC/ETH price action
              and volume. Returns sentiment label, confidence score, and
              per-asset signal breakdown.
            </p>
            <p className="label-muted">With demo payment proof → 200 + analysis:</p>
            <pre>{`curl ${BASE_URL}/api/sentiment \\
  -H "X-Payment-Proof: a3f8c2d1e4b5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1"

# Response:
{
  "success": true,
  "analysis": {
    "market_sentiment": {
      "label": "Bullish",
      "score": 67,
      "confidence": 0.82,
      "summary": "Crypto market is showing bullish sentiment..."
    },
    "assets": {
      "BTC": { "sentiment": "Bullish", "score": 70, "signals": [...] },
      "ETH": { "sentiment": "Bullish", "score": 60, "signals": [...] }
    }
  }
}`}</pre>
          </div>
        </section>

        {/* ── SDK Integration ───────────────────────────────────── */}
        <section className="section">
          <h2 className="section-title">SDK Integration</h2>
          <p className="muted mb-sm">
            Use{" "}
            <a
              href="https://github.com/up2itnow0822/agent-wallet-sdk"
              target="_blank"
              rel="noopener noreferrer"
            >
              agentwallet-sdk
            </a>{" "}
            to handle x402 flows automatically — payment detection, signing, and
            retry are built in.
          </p>
          <pre className="mb-sm">{`npm install agentwallet-sdk`}</pre>
          <pre>{`import { AgentWallet } from 'agentwallet-sdk';

const wallet = new AgentWallet({
  privateKey: process.env.AGENT_PRIVATE_KEY,
  network: 'base',
});

// The SDK auto-detects 402, pays, and retries
const data = await wallet.fetch('${BASE_URL}/api/market-data');

console.log(data.markets.BTC.price_usd); // e.g. 67420.15`}</pre>
          <p className="label-muted mt-sm">
            The SDK handles: 402 detection → payment instruction parsing → USDC
            transfer on Base → proof header injection → automatic retry.
          </p>
        </section>

        {/* ── Demo Rules ────────────────────────────────────────── */}
        <section className="section">
          <h2 className="section-title">Demo Mode Rules</h2>
          <div className="card">
            <ul className="rule-list">
              <li>
                <strong>Accepted payment proof:</strong> Any 64-character hex
                string (with or without <code>0x</code> prefix)
              </li>
              <li>
                <strong>No real money charged:</strong> This is testnet/demo
                mode — all proofs are accepted without on-chain verification
              </li>
              <li>
                <strong>Market data is live:</strong> Prices come from CoinGecko
                free API, updated every 60s
              </li>
              <li>
                <strong>Production mode:</strong> In production,{" "}
                <code>X-Payment-Proof</code> must be a real Base network
                transaction hash verified on-chain
              </li>
            </ul>
          </div>
        </section>

        {/* ── Links ─────────────────────────────────────────────── */}
        <section className="section">
          <h2 className="section-title">Resources</h2>
          <div className="link-grid">
            {[
              {
                label: "agentwallet-sdk",
                url: "https://github.com/up2itnow0822/agent-wallet-sdk",
                desc: "Agent wallet with x402 support",
              },
              {
                label: "agentpay-mcp",
                url: "https://github.com/up2itnow0822/agentpay-mcp",
                desc: "MCP server for agent payments",
              },
              {
                label: "x402-demo (this repo)",
                url: "https://github.com/up2itnow0822/x402-demo",
                desc: "Source for this demo",
              },
              {
                label: "AI Agent Economy",
                url: "https://github.com/up2itnow0822",
                desc: "All repos and projects",
              },
            ].map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="link-card"
              >
                <div className="link-card-title">{link.label} ↗</div>
                <div className="link-card-desc">{link.desc}</div>
              </a>
            ))}
          </div>
        </section>
      </div>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="site-footer">
        <div className="container footer-inner">
          <span>x402 Demo — AI Agent Economy</span>
          <span>Patent Pending — AI Agent Economy © 2026</span>
        </div>
      </footer>
    </main>
  );
}
