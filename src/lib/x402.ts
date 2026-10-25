/**
 * x402 Payment Protocol helpers
 * Implements the HTTP 402 Payment Required pattern for agent-to-API payments.
 *
 * Patent Pending — AI Agent Economy
 */

// TESTNET-ONLY PLACEHOLDER: the well-known 0x...dEaD burn address. This is NOT a
// real wallet, NOT a token contract, and no funds should ever be sent to it.
// This demo runs on Base Sepolia testnet only; it does not accept mainnet payments.
export const DEMO_RECIPIENT = "0x000000000000000000000000000000000000dEaD";
export const DEMO_NETWORK = "base-sepolia";

export interface PaymentRequirement {
  amount: string;
  currency: string;
  network: string;
  recipient: string;
  description: string;
}

export interface X402Headers {
  "X-Payment": string;
  "X-Payment-Version": string;
  "X-Payment-Network": string;
  "X-Payment-Recipient": string;
  "X-Payment-Amount": string;
  "X-Payment-Currency": string;
  "X-Payment-Description": string;
  "X-Payment-Testnet": string;
  "X-Payment-Demo": string;
}

/**
 * Build the x402 payment requirement headers for a 402 response.
 */
export function buildPaymentHeaders(req: PaymentRequirement): X402Headers {
  return {
    "X-Payment": JSON.stringify(req),
    "X-Payment-Version": "1.0",
    "X-Payment-Network": req.network,
    "X-Payment-Recipient": req.recipient,
    "X-Payment-Amount": req.amount,
    "X-Payment-Currency": req.currency,
    "X-Payment-Description": req.description,
    "X-Payment-Testnet": "true",
    "X-Payment-Demo": "true",
  };
}

/**
 * Validate a payment proof header.
 * In demo mode: accept any 64-character hex string.
 * Future work (not implemented): verify an on-chain transaction signature.
 */
export function validatePaymentProof(proof: string | null): {
  valid: boolean;
  reason?: string;
} {
  if (!proof) {
    return { valid: false, reason: "Missing X-Payment-Proof header" };
  }

  // Demo mode: accept any 64-char hex string (0x-prefixed or bare)
  const bare = proof.startsWith("0x") ? proof.slice(2) : proof;
  const isValidHex = /^[0-9a-fA-F]{64}$/.test(bare);

  if (!isValidHex) {
    return {
      valid: false,
      reason:
        "Invalid proof format. Expected 64-character hex string (with or without 0x prefix).",
    };
  }

  return { valid: true };
}

export function buildPaymentRequiredResponse(req: PaymentRequirement): {
  status: 402;
  headers: Record<string, string>;
  body: object;
} {
  return {
    status: 402,
    headers: {
      ...buildPaymentHeaders(req),
      "Content-Type": "application/json",
    },
    body: {
      error: "payment_required",
      message: "This endpoint requires x402 payment. Include X-Payment-Proof header with a 64-character hex string (testnet demo mode only; no on-chain verification).",
      amount: req.amount,
      currency: req.currency,
      network: req.network,
      recipient: req.recipient,
      description: req.description,
      testnet: true,
      demo: true,
      how_to_pay: {
        demo: "Add header: X-Payment-Proof: <any 64-char hex string>",
        sdk: "npm install agentwallet-sdk",
        docs: "https://github.com/up2itnow0822/agent-wallet-sdk",
      },
    },
  };
}
