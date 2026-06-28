import { useMemo, useRef } from "react";
import { useCrossmintAuth } from "@crossmint/client-sdk-react-ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createApiClient } from "@/lib/api-client";
import {
    listInvoices,
    createInvoiceLink,
    markInvoicePaid,
    type Invoice,
    type InvoiceLink,
} from "@/lib/invoices";
import { useUser } from "@/hooks/use-user";
import { useInvoicesOverride } from "@/hooks/use-user-override";

export interface UseInvoicesResult {
    invoices: Invoice[];
    isLoading: boolean;
    createLink: (label?: string) => Promise<InvoiceLink>;
    isCreatingLink: boolean;
    /** Pay an invoice: crypto = real send + mark paid; wire/sepa = mark paid only. */
    pay: (invoice: Invoice) => Promise<{ txId?: string }>;
    payingId: string | null;
}

const invoicesKey = ["invoices"] as const;

export function useInvoices(): UseInvoicesResult {
    const override = useInvoicesOverride();
    const real = useInvoicesReal();
    return override ?? real;
}

function useInvoicesReal(): UseInvoicesResult {
    const { jwt } = useCrossmintAuth();
    const { transfer } = useUser();
    const queryClient = useQueryClient();

    const jwtRef = useRef(jwt);
    jwtRef.current = jwt;
    const apiFetch = useMemo(() => createApiClient(() => jwtRef.current), []);

    const listQuery = useQuery({
        queryKey: invoicesKey,
        queryFn: () => listInvoices(apiFetch),
        enabled: !!jwt,
    });

    const linkMutation = useMutation({
        mutationFn: (label?: string) => createInvoiceLink(apiFetch, label),
        onError: (e) =>
            toast.error(e instanceof Error ? e.message : "Could not create link"),
    });

    const payMutation = useMutation({
        mutationFn: async (invoice: Invoice) => {
            let txId: string | undefined;
            if (invoice.method === "crypto") {
                if (!invoice.payTo) throw new Error("Invoice has no payout address");
                // Real on-chain send, then record it. On-chain is the source of truth.
                const res = await transfer(invoice.payTo, invoice.amount);
                // The explorer link carries the tx hash — keep it as the payment ref.
                txId = res?.explorerLink?.split("/").pop() || res?.explorerLink;
            }
            await markInvoicePaid(apiFetch, invoice.id, txId);
            return { txId };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: invoicesKey });
            queryClient.invalidateQueries({ queryKey: ["wallet-balances"] });
            toast.success("Invoice paid");
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Payment failed"),
    });

    return {
        invoices: listQuery.data ?? [],
        isLoading: listQuery.isLoading,
        createLink: (label) => linkMutation.mutateAsync(label),
        isCreatingLink: linkMutation.isPending,
        pay: (invoice) => payMutation.mutateAsync(invoice),
        payingId: payMutation.isPending ? (payMutation.variables?.id ?? null) : null,
    };
}
