import { Hono } from "hono";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { defindex, DefindexError } from "../lib/defindex";
import { executeContractCall, CrossmintError, serverSignerAddress } from "../lib/crossmint-wallets";
import { env } from "../env";
import type { AppEnv } from "../types";

export const vault = new Hono<AppEnv>();

// DeFindex testnet vaults use 7 decimals (the XLM/USDC SAC convention).
const DECIMALS = 7n;
// Default deposit slippage tolerance for the amounts_min floor.
const DEFAULT_SLIPPAGE_BPS = 50n;

function requireStellarAddress(c: Context<AppEnv>): string {
  const address = c.get("user").stellarAddress;
  if (!address) {
    throw new HTTPException(409, {
      message: "No Stellar wallet registered. Call POST /api/me/wallet first.",
    });
  }
  return address;
}

/** Convert a human decimal amount (e.g. "12.5") into the asset's smallest unit. */
function toSmallestUnit(amount: unknown): bigint {
  if (typeof amount !== "string" || !/^\d+(\.\d+)?$/.test(amount)) {
    throw new HTTPException(400, { message: "amount must be a positive decimal string" });
  }
  const [whole = "0", frac = ""] = amount.split(".");
  const fracPadded = (frac + "0".repeat(Number(DECIMALS))).slice(0, Number(DECIMALS));
  const value = BigInt(whole) * 10n ** DECIMALS + BigInt(fracPadded || "0");
  if (value <= 0n) throw new HTTPException(400, { message: "amount must be greater than zero" });
  return value;
}

/** Map upstream DeFindex/Crossmint failures onto sensible HTTP responses. */
function toHttp(e: unknown): never {
  if (e instanceof DefindexError || e instanceof CrossmintError) {
    if (e.status === 503) throw new HTTPException(503, { message: e.message });
    if (e.status === 400) throw new HTTPException(400, { message: e.message });
    if (e.status === 404) throw new HTTPException(404, { message: e.message });
    if (e.status === 504) throw new HTTPException(504, { message: e.message });
    // Upstream 5xx, or a 401/403 meaning *our* server key is bad — surface as 502.
    throw new HTTPException(502, { message: e.message });
  }
  throw e;
}

// GET /api/vault — vault metadata + current APY
vault.get("/", async (c) => {
  const address = defindex.vaultAddress();
  try {
    const apy = await defindex.getApy(address);
    return c.json({ vault: address, network: env.defindex.network, apy });
  } catch (e) {
    toHttp(e);
  }
});

// GET /api/vault/signer — the server signer address (to verify it's authorized on the wallet)
vault.get("/signer", (c) => {
  try {
    return c.json({ signerAddress: serverSignerAddress() });
  } catch (e) {
    toHttp(e);
  }
});

// GET /api/vault/position — the caller's underlying balance held in the vault
vault.get("/position", async (c) => {
  const address = defindex.vaultAddress();
  const from = requireStellarAddress(c);
  try {
    const underlyingBalance = await defindex.getBalance(address, from);
    return c.json({ vault: address, underlyingBalance });
  } catch (e) {
    toHttp(e);
  }
});

// POST /api/vault/deposit { amount } — deposit into the vault (server-signed)
vault.post("/deposit", async (c) => {
  const vaultAddress = defindex.vaultAddress();
  const from = requireStellarAddress(c);
  const body = await c.req
    .json<{ amount?: string; slippageBps?: number }>()
    .catch(() => ({}) as { amount?: string; slippageBps?: number });

  const amount = toSmallestUnit(body.amount);
  const slippageBps = BigInt(body.slippageBps ?? Number(DEFAULT_SLIPPAGE_BPS));
  const amountMin = amount - (amount * slippageBps) / 10000n;

  try {
    // DeFindex vault: deposit(amounts_desired, amounts_min, from, invest)
    const { txId } = await executeContractCall({
      walletLocator: from,
      contractId: vaultAddress,
      method: "deposit",
      args: {
        amounts_desired: [amount.toString()],
        amounts_min: [amountMin.toString()],
        from,
        invest: true,
      },
    });
    return c.json({ vault: vaultAddress, txId });
  } catch (e) {
    toHttp(e);
  }
});

// POST /api/vault/withdraw { amount } — withdraw vault shares (server-signed).
// NOTE: the vault's withdraw takes share units, so `amount` here is shares.
vault.post("/withdraw", async (c) => {
  const vaultAddress = defindex.vaultAddress();
  const from = requireStellarAddress(c);
  const body = await c.req
    .json<{ amount?: string }>()
    .catch(() => ({}) as { amount?: string });

  const shares = toSmallestUnit(body.amount);

  try {
    // DeFindex vault: withdraw(withdraw_shares, min_amounts_out, from).
    // min_amounts_out "0" accepts any output — tighten with a quote before mainnet.
    const { txId } = await executeContractCall({
      walletLocator: from,
      contractId: vaultAddress,
      method: "withdraw",
      args: {
        withdraw_shares: shares.toString(),
        min_amounts_out: ["0"],
        from,
      },
    });
    return c.json({ vault: vaultAddress, txId });
  } catch (e) {
    toHttp(e);
  }
});
