import { env } from "../env";
import { logger } from "./logger";

/**
 * Read-only client for the DeFindex hosted REST API (https://api.defindex.io).
 *
 * The DeFindex key must never reach the browser, so these reads live in apps/api.
 * Deposits/withdrawals are NOT built here — they're created as Crossmint Stellar
 * contract-calls and signed server-side (see lib/crossmint-wallets.ts). DeFindex
 * is used only for APY and the user's vault balance.
 *
 * The authoritative reference is https://api.defindex.io/docs; HTTP details are
 * centralized here so a path/field correction is a one-line change.
 */

export class DefindexError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "DefindexError";
  }
}

type Json = Record<string, unknown>;

function requireApiKey(): string {
  const key = env.defindex.apiKey;
  if (!key) throw new DefindexError("DEFINDEX_API_KEY is not configured", 503);
  return key;
}

async function call<T>(
  method: "GET" | "POST",
  path: string,
  query: Json = {},
): Promise<T> {
  const url = new URL(`${env.defindex.apiUrl}${path}`);
  url.searchParams.set("network", env.defindex.network);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }

  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${requireApiKey()}`, "Content-Type": "application/json" },
  });

  const text = await res.text();
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : undefined;
  } catch {
    parsed = text;
  }
  if (!res.ok) {
    logger.warn({ status: res.status, path, body: parsed }, "defindex_api_error");
    const message =
      parsed && typeof parsed === "object" && "error" in parsed
        ? String((parsed as Json).error)
        : `DeFindex API responded ${res.status}`;
    throw new DefindexError(message, res.status, parsed);
  }
  return parsed as T;
}

function vaultPath(vault: string, endpoint: string): string {
  return `/vault/${vault}/${endpoint}`;
}

export const defindex = {
  vaultAddress: () => env.defindex.vaultAddress,

  /** The caller's underlying (asset-denominated) balance held in the vault. */
  async getBalance(vault: string, from: string): Promise<string> {
    const res = await call<Json>("GET", vaultPath(vault, "balance"), { from });
    const raw = res.underlyingBalance ?? res.balance;
    const value = Array.isArray(raw) ? raw[0] : raw;
    return value != null ? String(value) : "0";
  },

  async getApy(vault: string): Promise<number> {
    const res = await call<Json>("GET", vaultPath(vault, "apy"));
    return typeof res.apy === "number" ? res.apy : Number(res.apy ?? 0);
  },
};
