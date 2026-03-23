import { NextRequest, NextResponse } from "next/server";
import {
  validatePaymentProof,
  buildPaymentRequiredResponse,
  DEMO_RECIPIENT,
} from "@/lib/x402";

const PAYMENT_REQUIREMENT = {
  amount: "0.005",
  currency: "USDC",
  network: "base",
  recipient: DEMO_RECIPIENT,
  description: "AI crypto market sentiment analysis",
};

/**
 * Compute a deterministic-ish sentiment score from live price data.
 * Uses 24h price change and volume as signal inputs.
 */
function computeSentiment(change24h: number, volume: number): {
  label: string;
  score: number;
  confidence: number;
  signals: string[];
} {
  const signals: string[] = [];
  let score = 50; // neutral baseline

  // Price momentum signal
  if (change24h > 5) {
    score += 20;
    signals.push(`Strong upward momentum (+${change24h.toFixed(2)}% 24h)`);
  } else if (change24h > 1) {
    score += 10;
    signals.push(`Mild upward momentum (+${change24h.toFixed(2)}% 24h)`);
  } else if (change24h < -5) {
    score -= 20;
    signals.push(`Strong downward pressure (${change24h.toFixed(2)}% 24h)`);
  } else if (change24h < -1) {
    score -= 10;
    signals.push(`Mild downward pressure (${change24h.toFixed(2)}% 24h)`);
  } else {
    signals.push(`Sideways price action (${change24h.toFixed(2)}% 24h)`);
  }

  // Volume signal (high volume = conviction)
  if (volume > 30_000_000_000) {
    score += 5;
    signals.push("High volume confirms trend");
  } else if (volume < 5_000_000_000) {
    score -= 5;
    signals.push("Low volume — weak conviction");
  } else {
    signals.push("Normal volume range");
  }

  score = Math.max(0, Math.min(100, score));
  const confidence = Math.min(0.95, 0.5 + Math.abs(change24h) / 20);

  let label: string;
  if (score >= 75) label = "Very Bullish";
  else if (score >= 60) label = "Bullish";
  else if (score >= 45) label = "Neutral";
  else if (score >= 30) label = "Bearish";
  else label = "Very Bearish";

  return { label, score, confidence, signals };
}

export async function GET(req: NextRequest) {
  const proof = req.headers.get("x-payment-proof");
  const validation = validatePaymentProof(proof);

  if (!validation.valid) {
    const { status, headers, body } =
      buildPaymentRequiredResponse(PAYMENT_REQUIREMENT);
    return NextResponse.json(body, { status, headers });
  }

  // Fetch live market data to compute real sentiment
  let sentimentResult: Record<string, unknown> = {};
  let fetchError: string | null = null;

  try {
    const cgRes = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true",
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 120 },
      }
    );

    if (!cgRes.ok) throw new Error(`CoinGecko ${cgRes.status}`);
    const raw = await cgRes.json();

    const btcChange = raw.bitcoin?.usd_24h_change ?? 0;
    const btcVol = raw.bitcoin?.usd_24h_vol ?? 0;
    const ethChange = raw.ethereum?.usd_24h_change ?? 0;
    const ethVol = raw.ethereum?.usd_24h_vol ?? 0;

    const btcSentiment = computeSentiment(btcChange, btcVol);
    const ethSentiment = computeSentiment(ethChange, ethVol);

    // Composite market score (BTC weighted 70%, ETH 30%)
    const compositeScore =
      btcSentiment.score * 0.7 + ethSentiment.score * 0.3;
    const compositeSentiment = computeSentiment(
      btcChange * 0.7 + ethChange * 0.3,
      btcVol
    );

    sentimentResult = {
      market_sentiment: {
        label: compositeSentiment.label,
        score: Math.round(compositeScore),
        confidence: Math.round(compositeSentiment.confidence * 100) / 100,
        summary: `Crypto market is showing ${compositeSentiment.label.toLowerCase()} sentiment based on 24h price action and volume analysis.`,
      },
      assets: {
        BTC: {
          sentiment: btcSentiment.label,
          score: btcSentiment.score,
          confidence: Math.round(btcSentiment.confidence * 100) / 100,
          signals: btcSentiment.signals,
          price_usd: raw.bitcoin?.usd,
          change_24h_pct: btcChange,
        },
        ETH: {
          sentiment: ethSentiment.label,
          score: ethSentiment.score,
          confidence: Math.round(ethSentiment.confidence * 100) / 100,
          signals: ethSentiment.signals,
          price_usd: raw.ethereum?.usd,
          change_24h_pct: ethChange,
        },
      },
      methodology: "Price momentum + volume conviction signals. Weights: BTC 70%, ETH 30%. Model: rule-based v1.0 — production version uses ML ensemble.",
    };
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Unknown error";
    sentimentResult = {
      market_sentiment: {
        label: "Unavailable",
        score: null,
        note: "Live data fetch failed. Retry in 30s.",
      },
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
      fetch_error: fetchError,
      timestamp: new Date().toISOString(),
      analysis: sentimentResult,
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
