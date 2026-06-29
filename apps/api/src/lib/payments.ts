import { executeContractCall } from "./crossmint-wallets";
import { toSmallestUnit } from "./stellar-units";
import { env } from "../env";
import { logger } from "./logger";

export interface PaymentResult {
  /** On-chain tx id when the transfer settled, or null when simulated. */
  txId: string | null;
  /** True when no real on-chain transfer happened (no SAC id / call failed). */
  simulated: boolean;
}

/**
 * The single execution seam for outgoing payments (used by the recurring
 * scheduler, and reusable for one-off sends). Hybrid by design:
 *
 *   - If `USDC_SAC_ADDRESS` is set, do a real server-signed SAC `transfer`
 *     (from -> to, i128 amount in 7-decimal stroops) via the same Crossmint
 *     approval path the vault already uses.
 *   - ponytail: if the SAC id is unset OR the contract-call fails, fall back to
 *     a simulated result so the schedule still records the movement and the demo
 *     keeps moving. Upgrade path: set USDC_SAC_ADDRESS, nothing else changes.
 */
export async function executePayment(params: {
  from: string;
  to: string;
  amount: string;
}): Promise<PaymentResult> {
  const sac = env.stellar.usdcSacAddress;
  if (!sac) {
    logger.warn({ to: params.to, amount: params.amount }, "payment_simulated_no_sac");
    return { txId: null, simulated: true };
  }
  try {
    const { txId } = await executeContractCall({
      walletLocator: params.from,
      contractId: sac,
      method: "transfer",
      args: {
        from: params.from,
        to: params.to,
        amount: toSmallestUnit(params.amount).toString(),
      },
    });
    return { txId, simulated: false };
  } catch (err) {
    // The transfer didn't settle. Record the movement anyway (simulated) so the
    // schedule doesn't get stuck; the error is surfaced via the caller's log.
    logger.warn({ err, to: params.to, amount: params.amount }, "payment_execution_failed");
    return { txId: null, simulated: true };
  }
}
