import { useMemo, useRef } from "react";
import { useCrossmintAuth, useWallet } from "@crossmint/client-sdk-react-ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createApiClient } from "@/lib/api-client";
import { listAllocations, createAllocation, type Allocation } from "@/lib/allocations";
import { useVault } from "@/hooks/use-vault";
import { useAllocationsOverride } from "@/hooks/use-user-override";

export interface NewAllocationResult {
    allocation: Allocation;
    txId?: string;
}

export interface UseAllocationsResult {
    allocations: Allocation[];
    isLoading: boolean;
    /** Real vault APY as a percentage (e.g. 4.83), or undefined while loading. */
    apyPct?: number;
    /** Real underlying position held in the vault (human decimal), or undefined. */
    inTreasury?: string;
    isVaultLoading: boolean;
    /** Deposit on-chain, then record the named allocation. */
    create: (input: { name: string; amount: string }) => Promise<NewAllocationResult>;
    isCreating: boolean;
}

const allocationsKey = ["allocations"] as const;

export function useAllocations(): UseAllocationsResult {
    const override = useAllocationsOverride();
    const real = useAllocationsReal();
    return override ?? real;
}

function useAllocationsReal(): UseAllocationsResult {
    const { jwt } = useCrossmintAuth();
    const { wallet } = useWallet();
    const queryClient = useQueryClient();
    const vault = useVault();

    const jwtRef = useRef(jwt);
    jwtRef.current = jwt;
    const apiFetch = useMemo(() => createApiClient(() => jwtRef.current), []);

    const listQuery = useQuery({
        queryKey: allocationsKey,
        queryFn: () => listAllocations(apiFetch),
        enabled: !!jwt,
    });

    const createMutation = useMutation({
        mutationFn: async ({ name, amount }: { name: string; amount: string }) => {
            if (!wallet) throw new Error("Wallet not ready");
            // Step 1 — the irreversible move: deposit on-chain. Wait for the txId.
            const res = (await vault.deposit(amount)) as { txId?: string } | undefined;
            const txId = res?.txId;
            // Step 2 — persist the named split only after the deposit confirmed.
            const allocation = await createAllocation(apiFetch, { name, amount, txId });
            return { allocation, txId };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: allocationsKey });
            queryClient.invalidateQueries({ queryKey: ["vault-position"] });
            queryClient.invalidateQueries({ queryKey: ["wallet-balances"] });
            toast.success("Allocation created");
        },
        onError: (e) =>
            toast.error(e instanceof Error ? e.message : "Could not create allocation"),
    });

    return {
        allocations: listQuery.data ?? [],
        isLoading: listQuery.isLoading,
        apyPct: vault.apy != null ? vault.apy * 100 : undefined,
        inTreasury: vault.position,
        isVaultLoading: vault.isInfoLoading || vault.isPositionLoading,
        create: (input) => createMutation.mutateAsync(input),
        isCreating: createMutation.isPending,
    };
}
