import { NextRequest, NextResponse } from "next/server";
import {
  validatePaymentProof,
  buildPaymentRequiredResponse,
  DEMO_RECIPIENT,
} from "@/lib/x402";

const PAYMENT_REQUIREMENT = {
  amount: "0.001",
  currency: "USDC",
  network: "base",
  recipient: DEMO_RECIPIENT,
  description: "Real-time BTC/ETH market data",
};

export async function GET(req: NextRequest) {
  const proof = req.headers.get("x-payment-proof");
  const validation = validatePaymentProof(proof);

  if (!validation.valid) {
    const { status, headers, body } =
      buildPaymentRequiredResponse(PAYMENT_REQUIREMENT);
    return NextResponse.json(body, { status, headers });
  }

  // Payment verified — fetch real market data from CoinGecko (free tier, no key needed)
  let marketData: Record<string, unknown> = {};
  let dataSource = "coingecko";
  let fetchError: string | null = null;

  try {
    const cgRes = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true",
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 60 }, // cache 60s on edge
      }
    );

    if (!cgRes.ok) {
      throw new Error(`CoinGecko returned ${cgRes.status}`);
    }

    const raw = await cgRes.json();

    marketData = {
      BTC: {
        symbol: "BTC",
        name: "Bitcoin",
        price_usd: raw.bitcoin?.usd ?? null,
        change_24h_pct: raw.bitcoin?.usd_24h_change ?? null,
        market_cap_usd: raw.bitcoin?.usd_market_cap ?? null,
        volume_24h_usd: raw.bitcoin?.usd_24h_vol ?? null,
      },
      ETH: {
        symbol: "ETH",
        name: "Ethereum",
        price_usd: raw.ethereum?.usd ?? null,
        change_24h_pct: raw.ethereum?.usd_24h_change ?? null,
        market_cap_usd: raw.ethereum?.usd_market_cap ?? null,
        volume_24h_usd: raw.ethereum?.usd_24h_vol ?? null,
      },
      SOL: {
        symbol: "SOL",
        name: "Solana",
        price_usd: raw.solana?.usd ?? null,
        change_24h_pct: raw.solana?.usd_24h_change ?? null,
        market_cap_usd: raw.solana?.usd_market_cap ?? null,
        volume_24h_usd: raw.solana?.usd_24h_vol ?? null,
      },
    };
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Unknown fetch error";
    dataSource = "fallback";
    // Provide clearly-labeled fallback data rather than failing
    marketData = {
      BTC: { symbol: "BTC", name: "Bitcoin", note: "Live fetch failed; retry" },
      ETH: { symbol: "ETH", name: "Ethereum", note: "Live fetch failed; retry" },
      SOL: { symbol: "SOL", name: "Solana", note: "Live fetch failed; retry" },
    };
  }

  return NextResponse.json(
    {
      success: true,
      demo_mode: true,
      demo_note:
        "Payment accepted in demo/testnet mode. No real USDC was charged. In production, X-Payment-Proof must be a verified on-chain transaction hash.",
      payment_proof_received: proof
        ? `${proof.slice(0, 10)}...${proof.slice(-6)}`
        : null,
      data_source: dataSource,
      fetch_error: fetchError,
      timestamp: new Date().toISOString(),
      markets: marketData,
    },
    {
      status: 200,
      headers: {
        "X-Payment-Verified": "true",
        "X-Payment-Mode": "demo",
        "Content-Type": "application/json",
      },
    }
  );
}
