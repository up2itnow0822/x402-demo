import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "x402 Demo — Test Agent Payments",
  description:
    "Live public endpoint for testing the HTTP 402 pay-to-complete flow. No real money required — perfect for integrating agentwallet-sdk or any x402-compatible agent.",
  openGraph: {
    title: "x402 Demo — Test Agent Payments",
    description:
      "Live endpoint for testing HTTP 402 agent payment flows. Free to test.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
