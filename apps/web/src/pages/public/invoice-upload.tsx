"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, FileText, Loader2, UploadCloud } from "lucide-react";
import { PhotonWordmark } from "@/components/brand/photon-mark";
import { DoubleBezel } from "@/components/ui/double-bezel";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Pill } from "@/components/ui/pill";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
    getPublicLink,
    submitPublicInvoice,
    type InvoiceMethod,
    type PublicLinkInfo,
} from "@/lib/invoices";

const METHODS: { id: InvoiceMethod; label: string }[] = [
    { id: "crypto", label: "Crypto" },
    { id: "wire", label: "Wire" },
    { id: "sepa", label: "SEPA" },
];

export function PublicInvoiceUpload() {
    const { token = "" } = useParams();
    const [link, setLink] = useState<PublicLinkInfo | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState<InvoiceMethod>("crypto");
    const [payTo, setPayTo] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);

    useEffect(() => {
        let active = true;
        getPublicLink(token)
            .then((info) => active && setLink(info))
            .catch(() => active && setLoadError("This invoice link is invalid or expired."))
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
    }, [token]);

    const amountNum = amount ? Number(amount) : 0;
    const canSubmit =
        title.trim().length > 0 && amountNum > 0 && payTo.trim().length > 0 && !submitting;

    const onFile = (f: File | null) => {
        if (!f) return setFile(null);
        if (f.type && f.type !== "application/pdf") {
            setFileError("Only PDF files are accepted.");
            return;
        }
        if (f.size > 5 * 1024 * 1024) {
            setFileError("PDF must be 5 MB or smaller.");
            return;
        }
        setFileError(null);
        setFile(f);
    };

    const submit = async () => {
        if (!canSubmit) return;
        setSubmitting(true);
        try {
            await submitPublicInvoice(token, {
                title: title.trim(),
                amount,
                method,
                payTo: payTo.trim(),
                pdf: file,
            });
            setSent(true);
        } catch {
            setFileError("Couldn't submit. Check the fields and try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const payToPlaceholder =
        method === "crypto" ? "Stellar address (G…)" : "Bank account / IBAN details";

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-5 py-12 text-ink">
            <div className="mb-6">
                <PhotonWordmark />
            </div>

            <div className="w-full max-w-lg">
                <DoubleBezel radius="1.5rem" className="p-6 sm:p-8">
                    {loading ? (
                        <div className="flex items-center justify-center gap-3 py-10 text-ink-muted">
                            <Loader2 className="size-5 animate-spin text-accent" /> Loading…
                        </div>
                    ) : loadError ? (
                        <div className="py-8 text-center">
                            <h1 className="font-display text-2xl font-medium text-ink">
                                Link unavailable
                            </h1>
                            <p className="mt-2 text-sm text-ink-muted">{loadError}</p>
                        </div>
                    ) : sent ? (
                        <div className="flex flex-col items-center py-6 text-center">
                            <span className="grid size-12 place-items-center rounded-full bg-accent/15 ring-1 ring-accent/30">
                                <CheckCircle2 className="size-6 text-accent" strokeWidth={2} />
                            </span>
                            <h1 className="mt-4 font-display text-2xl font-medium text-ink">
                                Invoice sent
                            </h1>
                            <p className="mt-1 text-sm text-ink-muted">
                                Thanks. The recipient will review and pay it.
                            </p>
                        </div>
                    ) : (
                        <>
                            <Eyebrow>Submit invoice</Eyebrow>
                            <h1 className="mt-3 font-display text-2xl font-medium tracking-tight text-ink">
                                {link?.label ? link.label : "Send your invoice"}
                            </h1>
                            <p className="mt-2 text-sm text-ink-muted">
                                Upload your invoice and payment details. No account needed.
                            </p>

                            <div className="mt-6 flex flex-col gap-4">
                                <Field label="Title">
                                    <Input
                                        className="mt-2 border-transparent bg-surface/50 ring-1 ring-hairline focus-visible:ring-accent/50"
                                        placeholder="e.g. Hosting — June"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        maxLength={120}
                                    />
                                </Field>

                                <Field label="Amount">
                                    <div className="relative mt-2">
                                        <Input
                                            type="number"
                                            inputMode="decimal"
                                            min="0"
                                            className="border-transparent bg-surface/50 pr-16 tabular-nums ring-1 ring-hairline focus-visible:ring-accent/50"
                                            placeholder="0.00"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                        />
                                        <span className="absolute inset-y-0 right-3 flex items-center font-mono text-xs text-ink-muted">
                                            USD
                                        </span>
                                    </div>
                                </Field>

                                <Field label="Payment method">
                                    <div className="mt-2 grid grid-cols-3 gap-2">
                                        {METHODS.map((m) => (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => setMethod(m.id)}
                                                className={cn(
                                                    "cursor-pointer rounded-lg py-2 text-sm font-medium ring-1 transition-all",
                                                    method === m.id
                                                        ? "bg-accent/15 text-accent ring-accent/50"
                                                        : "bg-surface/50 text-ink-muted ring-hairline hover:text-ink",
                                                )}
                                            >
                                                {m.label}
                                            </button>
                                        ))}
                                    </div>
                                </Field>

                                <Field
                                    label={method === "crypto" ? "Payout address" : "Bank details"}
                                >
                                    <Input
                                        className="mt-2 border-transparent bg-surface/50 font-mono text-sm ring-1 ring-hairline focus-visible:ring-accent/50"
                                        placeholder={payToPlaceholder}
                                        value={payTo}
                                        onChange={(e) => setPayTo(e.target.value)}
                                    />
                                </Field>

                                <div>
                                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
                                        Invoice PDF
                                    </span>
                                    <label
                                        className={cn(
                                            "mt-2 flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-hairline-strong p-6 text-center transition-colors hover:border-accent/40",
                                            file && "border-accent/40 bg-accent/5",
                                            fileError && "border-red-400/60",
                                        )}
                                    >
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            className="sr-only"
                                            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                                        />
                                        {file ? (
                                            <>
                                                <FileText className="size-6 text-accent" />
                                                <span className="text-sm font-medium text-ink">{file.name}</span>
                                                <span className="text-xs text-ink-muted">Tap to replace</span>
                                            </>
                                        ) : (
                                            <>
                                                <UploadCloud className="size-6 text-ink-muted" />
                                                <span className="text-sm font-medium text-ink">Upload PDF</span>
                                                <span className="text-xs text-ink-muted">PDF · max 5 MB</span>
                                            </>
                                        )}
                                    </label>
                                    {fileError && <p className="mt-1.5 text-xs text-red-400">{fileError}</p>}
                                </div>
                            </div>

                            <div className="mt-6">
                                <Pill variant="primary" onClick={submit} disabled={!canSubmit}>
                                    {submitting ? "Sending…" : "Send invoice"}
                                </Pill>
                            </div>
                        </>
                    )}
                </DoubleBezel>

                <p className="mt-5 text-center text-xs text-ink-muted">
                    Powered by PHOTON · Banking on Stellar
                </p>
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted">
                {label}
            </span>
            {children}
        </div>
    );
}
