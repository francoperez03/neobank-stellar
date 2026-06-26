/**
 * x402 ("Payment Required") protocol helpers.
 *
 * When a resource is gated behind a per-request payment, the server answers an
 * HTTP 402 with a JSON challenge listing the accepted payment terms. On Stellar
 * the payment is settled in a SEP-41 token (e.g. USDC) on `stellar:testnet` or
 * `stellar:pubnet`. These helpers decode that challenge (raw JSON or base64) and
 * format amounts expressed in the asset's minimal unit.
 */

export interface X402Resource {
  url: string;
  description?: string;
  mimeType?: string;
}

export interface X402Requirement {
  scheme: string;
  network: string;
  amount: string;
  asset: string;
  payTo: string;
  maxTimeoutSeconds?: number;
  extra?: Record<string, unknown> & { areFeesSponsored?: boolean };
}

export interface X402Challenge {
  x402Version: number;
  error?: string;
  resource?: X402Resource;
  accepts: X402Requirement[];
}

/** USDC on Stellar uses 7 decimals; the x402 `amount` is in the minimal unit. */
export const STELLAR_ASSET_DECIMALS = 7;

function isX402Challenge(value: unknown): value is X402Challenge {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.x402Version === "number" && Array.isArray(v.accepts);
}

function decodeBase64(input: string): string | null {
  try {
    // Browser / service worker
    if (typeof atob === "function") {
      const binary = atob(input);
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    }
    // Node fallback (tests)
    const g = globalThis as { Buffer?: { from(s: string, e: string): { toString(e: string): string } } };
    if (g.Buffer) return g.Buffer.from(input, "base64").toString("utf-8");
  } catch {
    return null;
  }
  return null;
}

/**
 * Parse an x402 challenge from a raw JSON string, a base64-encoded JSON string,
 * or an already-parsed object. Returns null if the input is not a valid challenge.
 */
export function parseX402Payload(input: string | object): X402Challenge | null {
  if (typeof input === "object") {
    return isX402Challenge(input) ? input : null;
  }

  const trimmed = input.trim();
  if (!trimmed) return null;

  // Try direct JSON first.
  try {
    const parsed = JSON.parse(trimmed);
    if (isX402Challenge(parsed)) return parsed;
  } catch {
    // not raw JSON — fall through to base64
  }

  // Try base64 -> JSON.
  const decoded = decodeBase64(trimmed);
  if (decoded) {
    try {
      const parsed = JSON.parse(decoded);
      if (isX402Challenge(parsed)) return parsed;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Format an amount given in an asset's minimal unit into a human string.
 * e.g. formatAmount("10000") === "0.001" (7 decimals).
 * Trailing zeros are trimmed; integers keep no decimal point.
 */
export function formatAmount(amount: string, decimals = STELLAR_ASSET_DECIMALS): string {
  if (!/^\d+$/.test(amount)) return amount;
  if (decimals <= 0) return amount;

  const padded = amount.padStart(decimals + 1, "0");
  const whole = padded.slice(0, padded.length - decimals);
  const frac = padded.slice(padded.length - decimals).replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : whole;
}

/** Shorten a long Stellar address/contract id for display: GBS3…33XB */
export function truncateId(id: string, head = 4, tail = 4): string {
  if (id.length <= head + tail + 1) return id;
  return `${id.slice(0, head)}…${id.slice(-tail)}`;
}
