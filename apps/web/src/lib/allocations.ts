import type { createApiClient } from "@/lib/api-client";

export type ApiFetch = ReturnType<typeof createApiClient>;

export interface Allocation {
    id: string;
    userId: string;
    name: string;
    amount: string;
    depositTx: string | null;
    createdAt: string;
}

/** The caller's treasury allocations (DB accounting split over the vault). */
export function listAllocations(apiFetch: ApiFetch): Promise<Allocation[]> {
    return apiFetch<Allocation[]>("/api/allocations");
}

/** Record a new allocation after its on-chain deposit confirmed. */
export function createAllocation(
    apiFetch: ApiFetch,
    params: { name: string; amount: string; txId?: string },
): Promise<Allocation> {
    return apiFetch<Allocation>("/api/allocations", {
        method: "POST",
        data: params,
    });
}

/** Remove an allocation record (on-chain withdraw is a separate vault call). */
export function deleteAllocation(apiFetch: ApiFetch, id: string): Promise<{ id: string }> {
    return apiFetch<{ id: string }>(`/api/allocations/${id}`, { method: "DELETE" });
}
