import type { ApiFetch } from "@/lib/allocations";

// ponytail: 'treasury_transfer' (allocation↔allocation) is a display-only type —
// neutral, never +/-. No action produces it yet, so it only shows up in the
// preview mock. Wire a real source if a rebalance action is added later.
export type MovementType =
    | "deposit"
    | "send"
    | "treasury_deposit"
    | "pay"
    | "treasury_transfer";

export type MovementSign = "+" | "-" | "0";

export interface Movement {
    id: string;
    type: MovementType;
    sign: MovementSign;
    amount: string;
    counterparty: string | null;
    txId: string | null;
    method: string | null;
    label: string | null;
    createdAt: string;
}

export interface TransferInput {
    direction: "in" | "out";
    counterparty: string;
    amount: string;
    txId?: string;
}

/** The caller's movement history, newest first (aggregated server-side). */
export function listMovements(apiFetch: ApiFetch): Promise<Movement[]> {
    return apiFetch<Movement[]>("/api/movements");
}

/** Record a wallet transfer (call after a send confirms on-chain). */
export function recordTransfer(apiFetch: ApiFetch, input: TransferInput): Promise<unknown> {
    return apiFetch("/api/movements", { method: "POST", data: input });
}
