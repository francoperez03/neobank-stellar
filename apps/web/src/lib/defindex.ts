import { StellarWallet, type Wallet, type Chain } from "@crossmint/client-sdk-react-ui";
import type { createApiClient } from "@/lib/api-client";

/**
 * Frontend utils for the DeFindex vault.
 *
 * - deposit / withdraw are built as Soroban contract-calls and signed + submitted
 *   in the browser by the user's Crossmint wallet (no server key, no DeFindex key
 *   on the client).
 * - getApy / getBalance read through our backend (`/api/vault*`), which keeps the
 *   DeFindex API key server-side.
 *
 * Vault method signatures (DeFindex docs):
 *   deposit(amounts_desired: Vec<i128>, amounts_min: Vec<i128>, from: Address, invest: bool)
 *   withdraw(withdraw_shares: i128, min_amounts_out: Vec<i128>, from: Address)
 */

/** Vaults use 7 decimals (the XLM/USDC SAC convention). */
export const VAULT_DECIMALS = 7;

/** The apiFetch returned by createApiClient (carries the user's JWT). */
export type ApiFetch = ReturnType<typeof createApiClient>;
/** A Crossmint wallet as returned by useWallet(). */
export type CrossmintWallet = Wallet<Chain>;

export interface VaultInfo {
  vault: string;
  network: string;
  apy: number;
}

export interface DepositParams {
  /** Human decimal amount, e.g. "12.5". */
  amount: string;
  /** Slippage tolerance in basis points for amounts_min (default 50 = 0.5%). */
  slippageBps?: number;
}

export interface WithdrawParams {
  /** Vault shares to burn, as a human decimal. The vault withdraws by shares. */
  shares: string;
}

/** "12.5" -> 125000000n (7 decimals). Throws on malformed input. */
export function toSmallestUnit(amount: string): bigint {
  if (!/^\d+(\.\d+)?$/.test(amount)) {
    throw new Error("amount must be a positive decimal string");
  }
  const [whole = "0", frac = ""] = amount.split(".");
  const fracPadded = (frac + "0".repeat(VAULT_DECIMALS)).slice(0, VAULT_DECIMALS);
  const value = BigInt(whole) * 10n ** BigInt(VAULT_DECIMALS) + BigInt(fracPadded || "0");
  if (value <= 0n) throw new Error("amount must be greater than zero");
  return value;
}

/** 125000000 -> "12.5". */
export function fromSmallestUnit(raw: bigint | string): string {
  const value = BigInt(raw);
  const base = 10n ** BigInt(VAULT_DECIMALS);
  const whole = value / base;
  const frac = (value % base).toString().padStart(VAULT_DECIMALS, "0").replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : whole.toString();
}

// ── Reads (via our backend — the DeFindex API key stays server-side) ──

/** Vault address + network + current APY. */
export function getVaultInfo(apiFetch: ApiFetch): Promise<VaultInfo> {
  return apiFetch<VaultInfo>("/api/vault");
}

/** Current vault APY (fraction, e.g. 0.05 = 5%). Considers the vault fee. */
export async function getApy(apiFetch: ApiFetch): Promise<number> {
  const { apy } = await apiFetch<{ apy: number }>("/api/vault");
  return apy;
}

/** The caller's underlying (asset-denominated) balance in the vault, smallest units. */
export async function getBalance(apiFetch: ApiFetch): Promise<bigint> {
  const { underlyingBalance } = await apiFetch<{ underlyingBalance: string }>(
    "/api/vault/position",
  );
  return BigInt(underlyingBalance);
}

// ── Writes (built, signed, and submitted in the browser by the user's wallet) ──

/**
 * Deposit into the vault. The wallet itself is the `from` (the funds come from the
 * user's smart wallet) and it signs the call.
 */
export function deposit(wallet: CrossmintWallet, vaultAddress: string, params: DepositParams) {
  const units = toSmallestUnit(params.amount);
  const slippageBps = BigInt(params.slippageBps ?? 50);
  const amountsMin = units - (units * slippageBps) / 10000n;
  return StellarWallet.from(wallet).sendTransaction({
    contractId: vaultAddress,
    method: "deposit",
    args: {
      amounts_desired: [units.toString()],
      amounts_min: [amountsMin.toString()],
      from: wallet.address,
      invest: true,
    },
  });
}

/**
 * Withdraw from the vault by burning shares.
 *
 * min_amounts_out is "0" (accept any output) — tighten with a quote before mainnet.
 * To withdraw a specific underlying amount instead, convert to shares first:
 *   shares = total_supply * amount / total_managed_funds
 * (read `total_supply` and `fetch_total_managed_funds` from the vault).
 */
export function withdraw(wallet: CrossmintWallet, vaultAddress: string, params: WithdrawParams) {
  const shares = toSmallestUnit(params.shares);
  return StellarWallet.from(wallet).sendTransaction({
    contractId: vaultAddress,
    method: "withdraw",
    args: {
      withdraw_shares: shares.toString(),
      min_amounts_out: ["0"],
      from: wallet.address,
    },
  });
}
