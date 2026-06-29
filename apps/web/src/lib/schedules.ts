import type { ApiFetch } from "@/lib/allocations";

export interface Schedule {
    id: string;
    userId: string;
    payeeName: string;
    counterparty: string;
    amount: string;
    intervalSeconds: number;
    nextRunAt: string;
    active: boolean;
    lastRunAt: string | null;
    lastTxId: string | null;
    lastError: string | null;
    createdAt: string;
}

export interface NewScheduleInput {
    payeeName: string;
    counterparty: string;
    amount: string;
    intervalSeconds: number;
    /** ISO datetime of the first run. Omitted = one interval from now. */
    startAt?: string;
}

/** The caller's recurring payment schedules. */
export function listSchedules(apiFetch: ApiFetch): Promise<Schedule[]> {
    return apiFetch<Schedule[]>("/api/schedules");
}

export function createSchedule(apiFetch: ApiFetch, input: NewScheduleInput): Promise<Schedule> {
    return apiFetch<Schedule>("/api/schedules", { method: "POST", data: input });
}

export function deleteSchedule(apiFetch: ApiFetch, id: string): Promise<{ id: string }> {
    return apiFetch<{ id: string }>(`/api/schedules/${id}`, { method: "DELETE" });
}

/** Pause / resume a schedule. */
export function setScheduleActive(apiFetch: ApiFetch, id: string, active: boolean): Promise<Schedule> {
    return apiFetch<Schedule>(`/api/schedules/${id}`, { method: "PATCH", data: { active } });
}

/** Fire a schedule now (demo): pulls its next run forward. */
export function runScheduleNow(apiFetch: ApiFetch, id: string): Promise<Schedule> {
    return apiFetch<Schedule>(`/api/schedules/${id}/run`, { method: "POST" });
}
