import { HTTPException } from "hono/http-exception";

// DeFindex testnet vaults and the USDC/XLM SAC use 7 decimals.
export const SAC_DECIMALS = 7n;

/** Convert a human decimal amount (e.g. "12.5") into the asset's smallest unit. */
export function toSmallestUnit(amount: unknown, decimals = SAC_DECIMALS): bigint {
  if (typeof amount !== "string" || !/^\d+(\.\d+)?$/.test(amount)) {
    throw new HTTPException(400, { message: "amount must be a positive decimal string" });
  }
  const [whole = "0", frac = ""] = amount.split(".");
  const fracPadded = (frac + "0".repeat(Number(decimals))).slice(0, Number(decimals));
  const value = BigInt(whole) * 10n ** decimals + BigInt(fracPadded || "0");
  if (value <= 0n) throw new HTTPException(400, { message: "amount must be greater than zero" });
  return value;
}
