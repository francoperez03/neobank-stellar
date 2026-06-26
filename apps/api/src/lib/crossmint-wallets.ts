import { Keypair } from "@stellar/stellar-sdk";
import { env } from "../env";
import { logger } from "./logger";

/**
 * Server-side driver for the Crossmint wallets REST API (transactions + approvals).
 *
 * Flow for a Stellar smart-wallet contract call (deposit/withdraw on a DeFindex
 * vault): create the contract-call transaction → Crossmint returns it
 * `awaiting-approval` with a base64 message per pending signer → sign that message
 * with the server Stellar keypair → POST the signature to /approvals → poll until
 * the tx settles on-chain (`onChain.txId`). Fees are sponsored by Crossmint.
 *
 * PRECONDITION: STELLAR_SERVER_KEY must be a registered signer (admin or
 * delegated) on each user's Crossmint wallet; otherwise it cannot approve.
 */

export class CrossmintError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "CrossmintError";
  }
}

interface PendingApproval {
  signer: { type: string; address?: string; locator: string };
  message: string;
}

interface CrossmintTx {
  id: string;
  status: "awaiting-approval" | "pending" | "failed" | "success";
  onChain?: { txId?: string; explorerLink?: string };
  approvals?: { pending?: PendingApproval[] };
}

export interface ContractCall {
  /** The user's Crossmint Stellar wallet address (used as the wallet locator). */
  walletLocator: string;
  /** The contract to invoke (the DeFindex vault). */
  contractId: string;
  method: string;
  /** Named args; i128/Vec values passed as strings/arrays, addresses as strings. */
  args: Record<string, unknown>;
}

function serverApiKey(): string {
  const key = env.crossmint.serverApiKey;
  if (!key) throw new CrossmintError("CROSSMINT_SERVER_API_KEY is not configured", 503);
  return key;
}

function serverKeypair(): Keypair {
  const secret = env.crossmint.stellarServerKey;
  if (!secret) throw new CrossmintError("STELLAR_SERVER_KEY is not configured", 503);
  return Keypair.fromSecret(secret);
}

async function cm<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${env.crossmint.apiBaseUrl}${path}`, {
    method,
    headers: { "X-API-KEY": serverApiKey(), "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : undefined;
  } catch {
    parsed = text;
  }
  if (!res.ok) {
    logger.warn({ status: res.status, path, body: parsed }, "crossmint_api_error");
    const message =
      parsed && typeof parsed === "object" && "message" in parsed
        ? String((parsed as Record<string, unknown>).message)
        : `Crossmint API responded ${res.status}`;
    throw new CrossmintError(message, res.status, parsed);
  }
  return parsed as T;
}

/** Sign a base64 `awaiting-approval` message with the server keypair (base64 out). */
function signMessage(keypair: Keypair, messageBase64: string): string {
  return keypair.sign(Buffer.from(messageBase64, "base64")).toString("base64");
}

const POLL_ATTEMPTS = 30;
const POLL_INTERVAL_MS = 1000;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Create a Stellar contract-call transaction, approve it with the server signer,
 * and wait until it settles. Returns the on-chain transaction id.
 */
export async function executeContractCall(call: ContractCall): Promise<{ txId: string }> {
  const keypair = serverKeypair();
  const serverAddress = keypair.publicKey();
  const wallet = encodeURIComponent(call.walletLocator);

  const created = await cm<CrossmintTx>("POST", `/wallets/${wallet}/transactions`, {
    params: {
      transaction: {
        type: "contract-call",
        contractId: call.contractId,
        method: call.method,
        args: call.args,
      },
    },
  });

  if (created.status === "awaiting-approval") {
    const pending = created.approvals?.pending ?? [];
    // Approvals assigned to our server signer (address may be omitted by the API).
    const mine = pending.filter((p) => !p.signer.address || p.signer.address === serverAddress);
    if (mine.length === 0) {
      throw new CrossmintError(
        `Server signer ${serverAddress} is not an authorized signer on this wallet`,
        502,
        created,
      );
    }
    await cm("POST", `/wallets/${wallet}/transactions/${created.id}/approvals`, {
      approvals: mine.map((p) => ({
        signer: p.signer.locator,
        signature: signMessage(keypair, p.message),
      })),
    });
  }

  for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
    const tx = await cm<CrossmintTx>("GET", `/wallets/${wallet}/transactions/${created.id}`);
    if (tx.status === "success") {
      const txId = tx.onChain?.txId;
      if (!txId) throw new CrossmintError("Transaction settled without an onChain.txId", 502, tx);
      return { txId };
    }
    if (tx.status === "failed") {
      throw new CrossmintError("Transaction failed on-chain", 502, tx);
    }
    await sleep(POLL_INTERVAL_MS);
  }

  throw new CrossmintError("Timed out waiting for the transaction to settle", 504);
}
