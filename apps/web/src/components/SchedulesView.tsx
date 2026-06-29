"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
    ArrowLeft,
    ChevronRight,
    ExternalLink,
    Pause,
    Play,
    Plus,
    Repeat,
    Trash2,
    X,
} from "lucide-react";
import { useSchedules } from "@/hooks/use-schedules";
import { useMovements } from "@/hooks/use-movements";
import type { Schedule, NewScheduleInput } from "@/lib/schedules";
import { Pill } from "@/components/ui/pill";
import { Input } from "@/components/ui/input";
import { Eyebrow } from "@/components/ui/eyebrow";
import { EASE_OUT } from "@/lib/motion";
import { cn, truncateAddress } from "@/lib/utils";

const CADENCES: { label: string; seconds: number; demo?: boolean }[] = [
    { label: "Every minute", seconds: 60, demo: true },
    { label: "Hourly", seconds: 3600 },
    { label: "Daily", seconds: 86_400 },
    { label: "Weekly", seconds: 604_800 },
    { label: "Monthly", seconds: 2_592_000 },
];

const STELLAR_ADDRESS = /^[GC][A-Z2-7]{55}$/;
const SHIFT = 64;
const slideVariants = {
    enter: (d: number) => ({ x: d * SHIFT, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: -d * SHIFT, opacity: 0 }),
};

const fmtAmount = (n: string) =>
    Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function cadenceLabel(seconds: number): string {
    return CADENCES.find((c) => c.seconds === seconds)?.label ?? `Every ${seconds}s`;
}

function countdown(nextRunAt: string, now: number): string {
    const diff = Math.round((new Date(nextRunAt).getTime() - now) / 1000);
    if (diff <= 0) return "due now";
    if (diff < 60) return `in ${diff}s`;
    if (diff < 3600) return `in ${Math.round(diff / 60)}m`;
    if (diff < 86_400) return `in ${Math.round(diff / 3600)}h`;
    return `in ${Math.round(diff / 86_400)}d`;
}

function fmtDateTime(iso: string): string {
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
        ? "—"
        : d.toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          });
}

export function SchedulesView() {
    const { schedules, isLoading, create, remove, setActive, runNow, isMutating } = useSchedules();
    const [showForm, setShowForm] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [dir, setDir] = useState(1);
    const reduced = useReducedMotion();

    // Live ticking clock so the countdowns move every second.
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, []);

    const selected = schedules.find((s) => s.id === selectedId) ?? null;
    const open = (id: string) => {
        setDir(1);
        setSelectedId(id);
    };
    const back = () => {
        setDir(-1);
        setSelectedId(null);
    };

    const transition = reduced ? { duration: 0.18 } : { duration: 0.32, ease: EASE_OUT };
    const variants = reduced
        ? { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } }
        : slideVariants;

    return (
        <div className="overflow-hidden">
            <AnimatePresence mode="wait" custom={dir} initial={false}>
                {selected ? (
                    <motion.div
                        key="detail"
                        custom={dir}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={transition}
                    >
                        <ScheduleDetail
                            schedule={selected}
                            now={now}
                            busy={isMutating}
                            onBack={back}
                            onToggle={() => setActive(selected.id, !selected.active)}
                            onRun={() => runNow(selected.id)}
                            onRemove={async () => {
                                await remove(selected.id);
                                back();
                            }}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        custom={dir}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={transition}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <Eyebrow>Recurring</Eyebrow>
                                <h2 className="mt-3 font-display text-2xl font-medium tracking-tight text-ink">
                                    Recurring payments
                                </h2>
                                <p className="mt-2 text-sm text-ink-muted">
                                    Payroll, subscriptions, retainers. Set it once and PHOTON pays on schedule.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowForm((s) => !s)}
                                className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-surface/60 px-4 py-2 text-sm font-medium text-ink ring-1 ring-hairline-strong outline-none transition-all hover:bg-surface hover:ring-accent/50 focus-visible:ring-2 focus-visible:ring-accent/60"
                            >
                                {showForm ? <X className="size-4" /> : <Plus className="size-4" />}
                                {showForm ? "Close" : "New"}
                            </button>
                        </div>

                        {showForm && (
                            <ScheduleForm
                                busy={isMutating}
                                onCreate={async (input) => {
                                    await create(input);
                                    setShowForm(false);
                                }}
                            />
                        )}

                        <div className="mt-8">
                            {isLoading ? (
                                <p className="py-12 text-center text-sm text-ink-muted">Loading…</p>
                            ) : schedules.length === 0 ? (
                                <p className="py-12 text-center text-sm text-ink-muted">
                                    No recurring payments yet. Hit <span className="text-ink">New</span> to add one.
                                </p>
                            ) : (
                                <ul className="divide-y divide-hairline">
                                    {schedules.map((s) => (
                                        <ScheduleRow
                                            key={s.id}
                                            schedule={s}
                                            now={now}
                                            busy={isMutating}
                                            onOpen={() => open(s.id)}
                                            onToggle={() => setActive(s.id, !s.active)}
                                        />
                                    ))}
                                </ul>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ScheduleRow({
    schedule: s,
    now,
    busy,
    onOpen,
    onToggle,
}: {
    schedule: Schedule;
    now: number;
    busy: boolean;
    onOpen: () => void;
    onToggle: () => void;
}) {
    return (
        <li>
            <button
                type="button"
                onClick={onOpen}
                aria-label={`${s.payeeName} — view detail`}
                className="group flex w-full cursor-pointer items-center gap-4 rounded-xl px-2 py-3.5 text-left outline-none transition-colors hover:bg-surface/40 focus-visible:ring-2 focus-visible:ring-accent/50"
            >
                <span
                    className={cn(
                        "inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface/60 ring-1 ring-hairline",
                        s.active ? "text-accent" : "text-ink-muted",
                    )}
                >
                    <Repeat className="size-4" strokeWidth={1.8} />
                </span>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{s.payeeName}</p>
                    <p className="mt-0.5 truncate font-mono text-xs text-ink-muted">
                        {cadenceLabel(s.intervalSeconds)} · {truncateAddress(s.counterparty)}
                        {s.active ? (
                            <span className="text-accent-2"> · next {countdown(s.nextRunAt, now)}</span>
                        ) : (
                            <span> · paused</span>
                        )}
                    </p>
                </div>

                <p className="shrink-0 text-sm font-medium text-ink tabular-nums">
                    −{fmtAmount(s.amount)}
                    <span className="ml-1 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-ink-muted">
                        USDC
                    </span>
                </p>

                {/* Single pause/resume toggle — doesn't open the detail. */}
                <span
                    role="button"
                    tabIndex={0}
                    aria-label={s.active ? "Pause" : "Resume"}
                    title={s.active ? "Pause" : "Resume"}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!busy) onToggle();
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!busy) onToggle();
                        }
                    }}
                    className={cn(
                        "grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg outline-none transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-accent/60",
                        s.active ? "text-ink-muted hover:text-ink" : "text-accent",
                    )}
                >
                    {s.active ? (
                        <Pause className="size-4" strokeWidth={1.8} />
                    ) : (
                        <Play className="size-4" strokeWidth={1.8} />
                    )}
                </span>

                <ChevronRight
                    className="size-4 shrink-0 text-ink-muted/60 transition-transform group-hover:translate-x-0.5 group-hover:text-ink-muted"
                    strokeWidth={1.8}
                />
            </button>
        </li>
    );
}

function ScheduleDetail({
    schedule: s,
    now,
    busy,
    onBack,
    onToggle,
    onRun,
    onRemove,
}: {
    schedule: Schedule;
    now: number;
    busy: boolean;
    onBack: () => void;
    onToggle: () => void;
    onRun: () => void;
    onRemove: () => void;
}) {
    const { movements } = useMovements();
    // All payments this schedule has made (tagged with its id in the ledger).
    const runs = useMemo(
        () => movements.filter((m) => m.scheduleId === s.id),
        [movements, s.id],
    );

    return (
        <div>
            <button
                type="button"
                onClick={onBack}
                className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-ink-muted outline-none transition-colors hover:text-ink focus-visible:text-ink"
            >
                <ArrowLeft className="size-4" strokeWidth={1.8} />
                Back to recurring
            </button>

            <div className="mt-6 flex items-center gap-4">
                <span
                    className={cn(
                        "inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-surface/60 ring-1 ring-hairline",
                        s.active ? "text-accent" : "text-ink-muted",
                    )}
                >
                    <Repeat className="size-5" strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                    <Eyebrow>{cadenceLabel(s.intervalSeconds)}</Eyebrow>
                    <h2 className="mt-1 truncate font-display text-2xl font-medium tracking-tight text-ink">
                        {s.payeeName}
                    </h2>
                </div>
                <p className="ml-auto shrink-0 text-right font-display text-2xl font-medium tracking-tight text-ink tabular-nums">
                    −{fmtAmount(s.amount)}
                    <span className="ml-1 font-sans text-sm font-normal text-ink-muted">USDC</span>
                </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                <ActionPill onClick={onRun} disabled={busy} icon={<Play className="size-4" />}>
                    Run now
                </ActionPill>
                <ActionPill
                    onClick={onToggle}
                    disabled={busy}
                    icon={s.active ? <Pause className="size-4" /> : <Play className="size-4" />}
                >
                    {s.active ? "Pause" : "Resume"}
                </ActionPill>
                <ActionPill onClick={onRemove} disabled={busy} danger icon={<Trash2 className="size-4" />}>
                    Delete
                </ActionPill>
            </div>

            <dl className="mt-8 divide-y divide-hairline">
                <Field term="Payee" desc={s.payeeName} />
                <Field term="Address" desc={<span className="font-mono">{truncateAddress(s.counterparty, 8, 6)}</span>} />
                <Field term="Cadence" desc={cadenceLabel(s.intervalSeconds)} />
                <Field
                    term="Status"
                    desc={
                        s.active ? (
                            <span className="text-accent-2">Active · next {countdown(s.nextRunAt, now)}</span>
                        ) : (
                            <span className="text-ink-muted">Paused</span>
                        )
                    }
                />
                {s.lastRunAt && <Field term="Last run" desc={fmtDateTime(s.lastRunAt)} />}
            </dl>

            <div className="mt-8">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
                    Payments made
                </span>
                {runs.length === 0 ? (
                    <p className="mt-3 text-sm text-ink-muted">No payments yet. The next run is {countdown(s.nextRunAt, now)}.</p>
                ) : (
                    <ul className="mt-3 divide-y divide-hairline">
                        {runs.map((r) => {
                            const explorer = r.txId
                                ? `https://stellar.expert/explorer/testnet/tx/${r.txId}`
                                : null;
                            return (
                                <li key={r.id} className="flex items-center justify-between gap-4 py-3">
                                    <div className="min-w-0">
                                        <p className="text-sm text-ink">{fmtDateTime(r.createdAt)}</p>
                                        <p className="mt-0.5 font-mono text-xs text-ink-muted">
                                            {r.txId ? (
                                                explorer && (
                                                    <a
                                                        href={explorer}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 text-accent hover:underline"
                                                    >
                                                        {truncateAddress(r.txId, 6, 6)}
                                                        <ExternalLink className="size-3" />
                                                    </a>
                                                )
                                            ) : (
                                                "simulated"
                                            )}
                                        </p>
                                    </div>
                                    <p className="shrink-0 text-sm font-medium text-ink tabular-nums">
                                        −{fmtAmount(r.amount)}
                                    </p>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}

function ActionPill({
    onClick,
    disabled,
    danger,
    icon,
    children,
}: {
    onClick: () => void;
    disabled?: boolean;
    danger?: boolean;
    icon: ReactNode;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-surface/60 px-4 py-2 text-sm font-medium text-ink ring-1 ring-hairline-strong outline-none transition-all hover:bg-surface hover:ring-accent/50 focus-visible:ring-2 focus-visible:ring-accent/60 disabled:pointer-events-none disabled:opacity-40",
                danger && "hover:text-red-400 hover:ring-red-400/40",
            )}
        >
            {icon}
            {children}
        </button>
    );
}

function pad(n: number): string {
    return String(n).padStart(2, "0");
}
function toLocalInput(d: Date): string {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function ScheduleForm({
    busy,
    onCreate,
}: {
    busy: boolean;
    onCreate: (input: NewScheduleInput) => void;
}) {
    const [payeeName, setPayeeName] = useState("");
    const [counterparty, setCounterparty] = useState("");
    const [amount, setAmount] = useState("");
    const [intervalSeconds, setIntervalSeconds] = useState<number>(60);
    const [startLocal, setStartLocal] = useState<string>(() => toLocalInput(new Date()));

    const addrOk = STELLAR_ADDRESS.test(counterparty.trim());
    const amountNum = amount ? Number(amount) : 0;
    const canSubmit = payeeName.trim().length > 0 && addrOk && amountNum > 0 && !busy;

    return (
        <div className="mt-6 rounded-xl bg-surface/40 p-5 ring-1 ring-hairline">
            <div className="grid gap-4 sm:grid-cols-2">
                <Label label="Payee">
                    <Input
                        className="h-11 border-transparent bg-surface/50 text-sm ring-1 ring-hairline focus-visible:ring-accent/50"
                        placeholder="Payroll — June"
                        value={payeeName}
                        onChange={(e) => setPayeeName(e.target.value)}
                    />
                </Label>
                <Label label="Amount">
                    <div className="relative">
                        <Input
                            type="number"
                            inputMode="decimal"
                            min="0"
                            className="h-11 border-transparent bg-surface/50 pr-16 tabular-nums ring-1 ring-hairline focus-visible:ring-accent/50"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                        <span className="absolute inset-y-0 right-3 flex items-center font-mono text-xs text-ink-muted">
                            USDC
                        </span>
                    </div>
                </Label>
            </div>

            <div className="mt-4">
                <Label label="Payee address">
                    <Input
                        className="h-11 border-transparent bg-surface/50 font-mono text-sm ring-1 ring-hairline focus-visible:ring-accent/50"
                        placeholder="G… Stellar address"
                        value={counterparty}
                        onChange={(e) => setCounterparty(e.target.value)}
                        autoComplete="off"
                        spellCheck={false}
                    />
                </Label>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Label label="Cadence">
                    <div className="flex flex-wrap gap-2">
                        {CADENCES.map((c) => {
                            const active = intervalSeconds === c.seconds;
                            return (
                                <button
                                    key={c.seconds}
                                    type="button"
                                    onClick={() => setIntervalSeconds(c.seconds)}
                                    className={cn(
                                        "cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium ring-1 outline-none transition-all focus-visible:ring-2 focus-visible:ring-accent/60",
                                        active
                                            ? "bg-accent/15 text-ink ring-accent/40"
                                            : "bg-surface/60 text-ink-muted ring-hairline hover:text-ink",
                                    )}
                                >
                                    {c.label}
                                    {c.demo && <span className="ml-1 text-accent-2">demo</span>}
                                </button>
                            );
                        })}
                    </div>
                </Label>
                <Label label="Starts">
                    <Input
                        type="datetime-local"
                        className="h-11 border-transparent bg-surface/50 text-sm ring-1 ring-hairline focus-visible:ring-accent/50 [color-scheme:dark]"
                        value={startLocal}
                        onChange={(e) => setStartLocal(e.target.value)}
                    />
                </Label>
            </div>

            {/* Preview — always show what the rule will do. */}
            <p className="mt-5 text-sm text-ink-muted">
                {amountNum > 0 && addrOk ? (
                    <>
                        <span className="text-ink">{cadenceLabel(intervalSeconds)}</span>,{" "}
                        <span className="text-ink tabular-nums">${fmtAmount(amount)}</span> to{" "}
                        <span className="font-mono text-ink">{truncateAddress(counterparty.trim())}</span>, starting{" "}
                        <span className="text-ink">{fmtDateTime(new Date(startLocal).toISOString())}</span>.
                    </>
                ) : (
                    "Fill payee, amount and a valid address to preview the rule."
                )}
            </p>

            <div className="mt-5">
                <Pill
                    variant="primary"
                    disabled={!canSubmit}
                    onClick={() =>
                        onCreate({
                            payeeName: payeeName.trim(),
                            counterparty: counterparty.trim(),
                            amount,
                            intervalSeconds,
                            startAt: startLocal ? new Date(startLocal).toISOString() : undefined,
                        })
                    }
                >
                    {busy ? "Scheduling…" : "Schedule payment"}
                    {!busy && <Repeat />}
                </Pill>
            </div>
        </div>
    );
}

function Field({ term, desc }: { term: string; desc: ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-6 py-3.5">
            <dt className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">{term}</dt>
            <dd className="min-w-0 break-words text-right text-sm text-ink">{desc}</dd>
        </div>
    );
}

function Label({ label, children }: { label: string; children: ReactNode }) {
    return (
        <label className="block">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">{label}</span>
            <div className="mt-2">{children}</div>
        </label>
    );
}
