"use client";

import { useMemo } from "react";
import { useReducedMotion } from "motion/react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ReferenceDot,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

interface SavingsProjectionChartProps {
    /** Current principal, in USDC. */
    principal: number;
    /** Annual yield (%), compounded daily. */
    apy: number;
    /** Projection horizon in days (default 365). */
    days?: number;
}

const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtCompact = (n: number) =>
    n.toLocaleString("en-US", { maximumFractionDigits: 0 });

interface Point {
    day: number;
    value: number;
    gain: number;
}

function ProjectionTooltip({
    active,
    payload,
}: {
    active?: boolean;
    payload?: Array<{ payload: Point }>;
}) {
    const p = payload?.[0]?.payload;
    if (!active || !p) return null;
    const months = Math.round((p.day / 365) * 12);
    return (
        <div className="rounded-lg bg-surface px-3 py-2 text-xs ring-1 ring-hairline-strong shadow-lg">
            <p className="font-mono uppercase tracking-[0.18em] text-ink-muted">
                {p.day === 0 ? "Today" : `Day ${p.day} · ${months}mo`}
            </p>
            <p className="mt-1 font-display text-base text-ink tabular-nums">${fmt(p.value)}</p>
            {p.gain > 0 && <p className="text-accent tabular-nums">+${fmt(p.gain)} interest</p>}
        </div>
    );
}

export function SavingsProjectionChart({ principal, apy, days = 365 }: SavingsProjectionChartProps) {
    const reduced = useReducedMotion();

    const data = useMemo<Point[]>(() => {
        // Daily compounding: value = principal * (1 + apy/365)^d
        const dailyRate = apy / 100 / 365;
        return Array.from({ length: days + 1 }, (_, d) => {
            const value = principal * Math.pow(1 + dailyRate, d);
            return {
                day: d,
                value: Number(value.toFixed(2)),
                gain: Number((value - principal).toFixed(2)),
            };
        });
    }, [principal, apy, days]);

    const final = data[data.length - 1] ?? { day: days, value: principal, gain: 0 };

    // Milestone markers — sparse dots so a 365-point line stays clean.
    const milestones = useMemo(() => {
        const marks = [Math.round(days / 4), Math.round(days / 2), days];
        return marks
            .map((d) => data[d])
            .filter((p): p is Point => Boolean(p));
    }, [data, days]);

    return (
        <div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
                    Projected · {apy.toFixed(1)}% APY · compounded daily
                </p>
                <p className="text-sm text-ink-muted">
                    In 1 year{" "}
                    <span className="font-display text-base font-medium text-ink tabular-nums">
                        ${fmt(final.value)}
                    </span>
                    <span className="ml-1.5 text-accent tabular-nums">+${fmt(final.gain)}</span>
                </p>
            </div>

            <div className="mt-4 h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -8 }}>
                        <defs>
                            <linearGradient id="savingsFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#fdda24" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#fdda24" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis
                            dataKey="day"
                            type="number"
                            domain={[0, days]}
                            ticks={[0, days / 4, days / 2, (days * 3) / 4, days]}
                            tickFormatter={(d) => (d === 0 ? "Now" : `${Math.round((d / 365) * 12)}mo`)}
                            tick={{ fill: "#9a9da6", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tickFormatter={(v) => `$${fmtCompact(v)}`}
                            tick={{ fill: "#9a9da6", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            width={56}
                            domain={["dataMin", "dataMax"]}
                        />
                        <Tooltip
                            content={<ProjectionTooltip />}
                            cursor={{ stroke: "rgba(253,218,36,0.4)", strokeWidth: 1 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#fdda24"
                            strokeWidth={2}
                            // Dashed line signals this is a projection, not realised history.
                            strokeDasharray="5 4"
                            fill="url(#savingsFill)"
                            dot={false}
                            activeDot={{ r: 5, fill: "#fdda24", stroke: "#0f0f0f", strokeWidth: 2 }}
                            isAnimationActive={!reduced}
                        />
                        {milestones.map((m) => (
                            <ReferenceDot
                                key={m.day}
                                x={m.day}
                                y={m.value}
                                r={3}
                                fill="#fdda24"
                                stroke="#0f0f0f"
                                strokeWidth={1.5}
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
