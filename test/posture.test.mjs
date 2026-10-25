// Security posture guard: the demo must never advertise Base mainnet or the
// Base-mainnet USDC token contract as a payment recipient.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const USDC_BASE_MAINNET = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";
const files = [
  "src/lib/x402.ts",
  "src/app/api/market-data/route.ts",
  "src/app/api/sentiment/route.ts",
  "src/app/page.tsx",
  "README.md",
];
const read = (f) => readFileSync(new URL(`../${f}`, import.meta.url), "utf8");

test("no file references the Base mainnet USDC contract (case-insensitive)", () => {
  for (const f of files) assert.ok(!read(f).toLowerCase().includes(USDC_BASE_MAINNET), f);
});

test("DEMO_RECIPIENT is the testnet burn placeholder, not USDC", () => {
  const m = read("src/lib/x402.ts").match(/DEMO_RECIPIENT\s*=\s*["'](0x[0-9a-fA-F]{40})["']/);
  assert.ok(m, "DEMO_RECIPIENT constant not found");
  assert.notEqual(m[1].toLowerCase(), USDC_BASE_MAINNET);
  assert.equal(m[1].toLowerCase(), "0x000000000000000000000000000000000000dead");
});

test("no network is ever 'base' (mainnet); API routes use base-sepolia", () => {
  for (const f of files) {
    const s = read(f);
    assert.ok(!/network\s*:\s*["']base["']/.test(s), `${f} sets network 'base'`);
    assert.ok(!/"network"\s*:\s*"base"/.test(s), `${f} shows network "base"`);
    assert.ok(!/X-Payment-Network:\s*base\s*$/m.test(s), `${f} shows X-Payment-Network: base`);
    assert.ok(!/badge[^>]*>\s*Base\s*</.test(s), `${f} shows a bare mainnet "Base" badge`);
  }
  for (const f of ["src/app/api/market-data/route.ts", "src/app/api/sentiment/route.ts"]) assert.match(read(f), /network:\s*"base-sepolia"/);
});

test("402 response carries testnet/demo flags in body and headers", () => {
  const s = read("src/lib/x402.ts");
  assert.match(s, /"X-Payment-Testnet":\s*"true"/);
  assert.match(s, /"X-Payment-Demo":\s*"true"/);
  assert.match(s, /testnet:\s*true/);
  assert.match(s, /demo:\s*true/);
});
