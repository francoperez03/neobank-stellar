import { useMemo, useRef } from "react";
import { useCrossmintAuth } from "@crossmint/client-sdk-react-ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createApiClient } from "@/lib/api-client";
import {
    listSchedules,
    createSchedule,
    deleteSchedule,
    setScheduleActive,
    runScheduleNow,
    type Schedule,
    type NewScheduleInput,
} from "@/lib/schedules";
import { useSchedulesOverride } from "@/hooks/use-user-override";

export interface UseSchedulesResult {
    schedules: Schedule[];
    isLoading: boolean;
    create: (input: NewScheduleInput) => Promise<Schedule>;
    remove: (id: string) => Promise<void>;
    setActive: (id: string, active: boolean) => Promise<void>;
    runNow: (id: string) => Promise<void>;
    isMutating: boolean;
}

const schedulesKey = ["schedules"] as const;

export function useSchedules(): UseSchedulesResult {
    const override = useSchedulesOverride();
    const real = useSchedulesReal();
    return override ?? real;
}

function useSchedulesReal(): UseSchedulesResult {
    const { jwt } = useCrossmintAuth();
    const queryClient = useQueryClient();

    const jwtRef = useRef(jwt);
    jwtRef.current = jwt;
    const apiFetch = useMemo(() => createApiClient(() => jwtRef.current), []);

    const listQuery = useQuery({
        queryKey: schedulesKey,
        queryFn: () => listSchedules(apiFetch),
        enabled: !!jwt,
        // Refetch so the next-run countdown and last-run status stay fresh.
        refetchInterval: 5_000,
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: schedulesKey });

    const createMutation = useMutation({
        mutationFn: (input: NewScheduleInput) => createSchedule(apiFetch, input),
        onSuccess: () => {
            invalidate();
            toast.success("Recurring payment scheduled");
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Could not create schedule"),
    });
    const removeMutation = useMutation({
        mutationFn: (id: string) => deleteSchedule(apiFetch, id),
        onSuccess: invalidate,
        onError: () => toast.error("Could not delete schedule"),
    });
    const activeMutation = useMutation({
        mutationFn: ({ id, active }: { id: string; active: boolean }) =>
            setScheduleActive(apiFetch, id, active),
        onSuccess: invalidate,
        onError: () => toast.error("Could not update schedule"),
    });
    const runMutation = useMutation({
        mutationFn: (id: string) => runScheduleNow(apiFetch, id),
        onSuccess: () => {
            invalidate();
            toast.success("Running now…");
        },
        onError: () => toast.error("Could not run schedule"),
    });

    return {
        schedules: listQuery.data ?? [],
        isLoading: listQuery.isLoading,
        create: (input) => createMutation.mutateAsync(input),
        remove: async (id) => {
            await removeMutation.mutateAsync(id);
        },
        setActive: async (id, active) => {
            await activeMutation.mutateAsync({ id, active });
        },
        runNow: async (id) => {
            await runMutation.mutateAsync(id);
        },
        isMutating:
            createMutation.isPending ||
            removeMutation.isPending ||
            activeMutation.isPending ||
            runMutation.isPending,
    };
}
