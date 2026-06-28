import axios from "axios";
import type { createApiClient } from "@/lib/api-client";

export type ApiFetch = ReturnType<typeof createApiClient>;

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export type InvoiceMethod = "crypto" | "wire" | "sepa";
export type InvoiceStatus = "pending" | "paid";

export interface Invoice {
    id: string;
    title: string;
    amount: string;
    method: InvoiceMethod;
    payTo: string | null;
    status: InvoiceStatus;
    paymentTx: string | null;
    pdfName: string | null;
    createdAt: string;
}

export interface InvoiceLink {
    id: string;
    userId: string;
    token: string;
    label: string | null;
    createdAt: string;
}

// ── Authenticated (the company's view) ──

export function listInvoices(apiFetch: ApiFetch): Promise<Invoice[]> {
    return apiFetch<Invoice[]>("/api/invoices");
}

export function createInvoiceLink(apiFetch: ApiFetch, label?: string): Promise<InvoiceLink> {
    return apiFetch<InvoiceLink>("/api/invoices/links", { method: "POST", data: { label } });
}

export function listInvoiceLinks(apiFetch: ApiFetch): Promise<InvoiceLink[]> {
    return apiFetch<InvoiceLink[]>("/api/invoices/links");
}

export function markInvoicePaid(
    apiFetch: ApiFetch,
    id: string,
    paymentTx?: string,
): Promise<Invoice> {
    return apiFetch<Invoice>(`/api/invoices/${id}`, {
        method: "PATCH",
        data: { status: "paid", paymentTx },
    });
}

/** Absolute URL to view an invoice's stored PDF (opens with the auth header via the browser; for a quick demo, link directly). */
export function invoicePdfUrl(id: string): string {
    return `${API_BASE}/api/invoices/${id}/pdf`;
}

// ── Public intake (no auth — used by the /pay/:token page) ──

export interface PublicLinkInfo {
    token: string;
    label: string | null;
}

export async function getPublicLink(token: string): Promise<PublicLinkInfo> {
    const { data } = await axios.get<PublicLinkInfo>(
        `${API_BASE}/public/invoice-links/${token}`,
    );
    return data;
}

export async function submitPublicInvoice(
    token: string,
    input: { title: string; amount: string; method: InvoiceMethod; payTo: string; pdf?: File | null },
): Promise<void> {
    const form = new FormData();
    form.append("title", input.title);
    form.append("amount", input.amount);
    form.append("method", input.method);
    form.append("payTo", input.payTo);
    if (input.pdf) form.append("pdf", input.pdf);
    await axios.post(`${API_BASE}/public/invoice-links/${token}/submit`, form);
}
