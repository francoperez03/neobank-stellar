"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
    ArrowLeft,
    Check,
    Copy,
    ExternalLink,
    FileText,
    Link2,
    Loader2,
    Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useInvoices } from "@/hooks/use-invoices";
import { invoicePdfUrl, type Invoice } from "@/lib/invoices";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Pill } from "@/components/ui/pill";
import { IconBadge } from "@/components/ui/icon-badge";
import { EASE_OUT } from "@/lib/motion";

const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const METHOD_LABEL: Record<Invoice["method"], string> = {
    crypto: "Crypto",
    wire: "Wire",
    sepa: "SEPA",
};

type View = { kind: "list" } | { kind: "link" };

export function InvoicesPanel() {
    const reduced = useReducedMotion();
    const [view, setView] = useState<View>({ kind: "list" });

    const slide = (dir: 1 | -1) =>
        reduced
            ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
            : {
                  initial: { opacity: 0, x: dir * 32 },
                  animate: { opacity: 1, x: 0 },
                  exit: { opacity: 0, x: dir * -32 },
              };

    return (
        <div className="overflow-hidden">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    {view.kind === "link" ? (
                        <button
                            type="button"
                            onClick={() => setView({ kind: "list" })}
                            className="group inline-flex cursor-pointer items-center gap-1.5 text-sm text-ink-muted outline-none transition-colors hover:text-ink focus-visible:text-ink"
                        >
                            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                            Invoices
                        </button>
                    ) : (
                        <Eyebrow>Invoices</Eyebrow>
                    )}
                    <h2 className="mt-3 truncate font-display text-2xl font-medium tracking-tight text-ink">
                        {view.kind === "link" ? "Intake link" : "Bills to pay"}
                    </h2>
                </div>
            </div>

            <div className="relative mt-6">
                <AnimatePresence mode="wait" initial={false}>
                    {view.kind === "list" ? (
                        <motion.div key="list" {...slide(-1)} transition={{ duration: 0.32, ease: EASE_OUT }}>
                            <ListView onNewLink={() => setView({ kind: "link" })} />
                        </motion.div>
                    ) : (
                        <motion.div key="link" {...slide(1)} transition={{ duration: 0.32, ease: EASE_OUT }}>
                            <LinkView />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function ListView({ onNewLink }: { onNewLink: () => void }) {
    const { invoices, isLoading, pay, payingId } = useInvoices();
    const empty = !isLoading && invoices.length === 0;

    return (
        <div>
            <p className="mb-4 text-sm text-ink-muted">
                Share an intake link with suppliers. Their invoices land here to review and pay.
            </p>

            {isLoading ? (
                <div className="flex flex-col gap-2">
                    {[0, 1].map((i) => (
                        <div key={i} className="h-[72px] animate-pulse rounded-xl bg-surface/50" />
                    ))}
                </div>
            ) : empty ? (
                <div className="rounded-xl border border-dashed border-hairline-strong px-6 py-10 text-center">
                    <IconBadge icon={FileText} tone="lavender" className="mx-auto" />
                    <p className="mt-4 text-sm font-medium text-ink">No invoices yet</p>
                    <p className="mt-1 text-sm text-ink-muted">
                        Create an intake link and share it with a supplier.
                    </p>
                </div>
            ) : (
                <ul className="flex flex-col gap-2">
                    {invoices.map((invoice) => (
                        <InvoiceRow
                            key={invoice.id}
                            invoice={invoice}
                            paying={payingId === invoice.id}
                            onPay={() => pay(invoice)}
                        />
                    ))}
                </ul>
            )}

            <div className="mt-6">
                <Pill variant="primary" onClick={onNewLink}>
                    <Plus /> New invoice link
                </Pill>
            </div>
        </div>
    );
}

function InvoiceRow({
    invoice,
    paying,
    onPay,
}: {
    invoice: Invoice;
    paying: boolean;
    onPay: () => void;
}) {
    const paid = invoice.status === "paid";
    return (
        <li className="flex items-center gap-3 rounded-xl bg-surface/50 p-3.5 ring-1 ring-hairline">
            <IconBadge icon={FileText} tone={paid ? "muted" : "lavender"} />
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{invoice.title}</p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-muted">
                    <span className="rounded bg-surface px-1.5 py-0.5 ring-1 ring-hairline">
                        {METHOD_LABEL[invoice.method]}
                    </span>
                    {invoice.pdfName && (
                        <a
                            href={invoicePdfUrl(invoice.id)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-accent-2 hover:text-accent"
                        >
                            <ExternalLink className="size-3" /> PDF
                        </a>
                    )}
                </div>
            </div>
            {/* Amount + action grouped so they read together, not flung apart. */}
            <div className="flex shrink-0 items-center gap-3">
                <span className="font-display text-base text-ink tabular-nums">
                    ${fmt(Number(invoice.amount))}
                </span>
                {paid ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent ring-1 ring-accent/25">
                        <Check className="size-3.5" /> Paid
                    </span>
                ) : (
                    <Pill variant="primary" onClick={onPay} disabled={paying} className="px-4 py-1.5 text-xs">
                        {paying ? "Paying…" : "Pay"}
                    </Pill>
                )}
            </div>
        </li>
    );
}

function LinkView() {
    const { createLink, isCreatingLink } = useInvoices();
    const [url, setUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const generate = async () => {
        try {
            const link = await createLink();
            setUrl(`${window.location.origin}/pay/${link.token}`);
        } catch {
            // surfaced via toast
        }
    };

    const copy = async () => {
        if (!url) return;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success("Link copied");
            setTimeout(() => setCopied(false), 1600);
        } catch {
            toast.error("Couldn't copy link");
        }
    };

    return (
        <div>
            <p className="text-sm text-ink-muted">
                Generate a link and send it to a supplier. They upload their invoice without
                needing an account; it shows up in your list to pay.
            </p>

            {!url ? (
                <div className="mt-6">
                    <Pill variant="primary" onClick={generate} disabled={isCreatingLink}>
                        {isCreatingLink ? (
                            <>
                                <Loader2 className="animate-spin" /> Generating…
                            </>
                        ) : (
                            <>
                                <Link2 /> Generate link
                            </>
                        )}
                    </Pill>
                </div>
            ) : (
                <div className="mt-6 rounded-xl bg-surface/40 p-4 ring-1 ring-hairline">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
                        Share this link
                    </p>
                    <p className="mt-2 break-all font-mono text-sm text-ink">{url}</p>
                    <button
                        type="button"
                        onClick={copy}
                        className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-surface/60 px-4 py-2 text-sm font-medium text-ink ring-1 ring-hairline-strong outline-none transition-all duration-200 hover:bg-surface hover:ring-accent/50 focus-visible:ring-2 focus-visible:ring-accent/60"
                    >
                        {copied ? (
                            <>
                                <Check className="size-4 text-accent" /> Copied
                            </>
                        ) : (
                            <>
                                <Copy className="size-4" /> Copy link
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
