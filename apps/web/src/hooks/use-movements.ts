import { useMemo, useRef } from "react";
import { useCrossmintAuth } from "@crossmint/client-sdk-react-ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createApiClient } from "@/lib/api-client";
import { listMovements, recordTransfer, type Movement, type TransferInput } from "@/lib/movements";
import { useMovementsOverride } from "@/hooks/use-user-override";

export interface UseMovementsResult {
    movements: Movement[];
    isLoading: boolean;
    /** Persist a wallet transfer (send/deposit) so it appears in the history. */
    record: (input: TransferInput) => Promise<void>;
}

const movementsKey = ["movements"] as const;

export function useMovements(): UseMovementsResult {
    const override = useMovementsOverride();
    const real = useMovementsReal();
    return override ?? real;
}

function useMovementsReal(): UseMovementsResult {
    const { jwt } = useCrossmintAuth();
    const queryClient = useQueryClient();

    const jwtRef = useRef(jwt);
    jwtRef.current = jwt;
    const apiFetch = useMemo(() => createApiClient(() => jwtRef.current), []);

    const listQuery = useQuery({
        queryKey: movementsKey,
        queryFn: () => listMovements(apiFetch),
        enabled: !!jwt,
    });

    const recordMutation = useMutation({
        mutationFn: (input: TransferInput) => recordTransfer(apiFetch, input),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: movementsKey }),
    });

    return {
        movements: listQuery.data ?? [],
        isLoading: listQuery.isLoading,
        record: async (input) => {
            await recordMutation.mutateAsync(input);
        },
    };
}
