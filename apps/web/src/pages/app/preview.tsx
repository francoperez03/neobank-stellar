import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { AppIndexPage } from "@/pages/app";
import { UserOverrideProvider } from "@/hooks/use-user-override";
import type { UseUserResult } from "@/hooks/use-user";
import type { UseAllocationsResult } from "@/hooks/use-allocations";
import type { UseInvoicesResult } from "@/hooks/use-invoices";
import type { UseMovementsResult } from "@/hooks/use-movements";
import type { UseSchedulesResult } from "@/hooks/use-schedules";

/**
 * Mocked dashboard preview at `/__preview` — renders the real /app screens
 * with fake wallet/balance data so the UI can be reviewed without login or
 * KYC. Wired only into the router; never reachable from the product flow.
 */
export function PreviewPage() {
  const [balance, setBalance] = useState<string | undefined>(undefined);
  const [isBalanceLoading, setIsBalanceLoading] = useState(true);
  const [isFunding, setIsFunding] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  // Simulate the real balance fetch so the loading state is visible on load.
  useEffect(() => {
    const t = setTimeout(() => {
      setBalance("12480.00");
      setIsBalanceLoading(false);
    }, 2200);
    return () => clearTimeout(t);
  }, []);

  const mockUser = useMemo<UseUserResult>(() => {
    const wallet = { address: "GMOCK7XAMPLE4STELLAR4ADDRESS4FOR4PREVIEW4ONLY4ABCD" };
    return {
      // Mocked Crossmint shapes — only the fields the dashboard reads matter.
      user: { email: "demo@photon.app" } as UseUserResult["user"],
      wallet: wallet as unknown as UseUserResult["wallet"],
      authStatus: "logged-in",
      walletStatus: "loaded" as UseUserResult["walletStatus"],
      isAuthenticated: true,
      isAuthLoading: false,
      isWalletLoading: false,
      isKycApproved: true,
      walletAddress: wallet.address,
      login: () => toast.message("Preview mode — login is mocked"),
      logout: async () => {
        toast.message("Preview mode — logout is mocked");
      },
      markKycApproved: () => {},
      balance,
      isBalanceLoading,
      refetchBalance: () => {
        setIsBalanceLoading(true);
        setTimeout(() => setIsBalanceLoading(false), 600);
      },
      fundWallet: () => {
        setIsFunding(true);
        setTimeout(() => {
          setBalance((b) => (Number(b ?? 0) + 10).toFixed(2));
          setIsFunding(false);
          toast.success("Test funds added");
        }, 700);
      },
      isFunding,
      transfer: async (recipient: string, amount: string) => {
        setIsTransferring(true);
        await new Promise((r) => setTimeout(r, 800));
        setBalance((b) => Math.max(0, Number(b ?? 0) - Number(amount)).toFixed(2));
        setIsTransferring(false);
        toast.success(`Sent ${amount} USDC to ${recipient.slice(0, 8)}…`);
        return { explorerLink: "https://stellar.expert/explorer/testnet" };
      },
      isTransferring,
    };
  }, [balance, isBalanceLoading, isFunding, isTransferring]);

  const mockAllocations = useMemo<UseAllocationsResult>(
    () => ({
      allocations: [
        { id: "operating", userId: "demo", name: "Operating reserve", amount: "3200.00", depositTx: null, createdAt: "" },
        { id: "tax", userId: "demo", name: "Tax provision", amount: "1450.00", depositTx: null, createdAt: "" },
        { id: "payroll", userId: "demo", name: "Payroll buffer", amount: "980.00", depositTx: null, createdAt: "" },
      ],
      isLoading: false,
      apyPct: 4.83,
      inTreasury: "5630.00",
      isVaultLoading: false,
      create: async ({ name, amount }) => {
        toast.success("Allocation created (preview)");
        return {
          allocation: { id: name, userId: "demo", name, amount, depositTx: null, createdAt: "" },
          txId: undefined,
        };
      },
      isCreating: false,
    }),
    [],
  );

  const mockInvoices = useMemo<UseInvoicesResult>(
    () => ({
      invoices: [
        { id: "1", title: "Hosting — June", amount: "120.50", method: "crypto", payTo: "GABC123", status: "pending", paymentTx: null, pdfName: "hosting-june", createdAt: "" },
        { id: "2", title: "Design contractor", amount: "1800.00", method: "wire", payTo: "IBAN ES…", status: "pending", paymentTx: null, pdfName: "design", createdAt: "" },
        { id: "3", title: "SaaS subscription", amount: "49.00", method: "crypto", payTo: "GXYZ789", status: "paid", paymentTx: "abc", pdfName: null, createdAt: "" },
      ],
      isLoading: false,
      createLink: async () => {
        toast.success("Link generated (preview)");
        return { id: "l1", userId: "demo", token: "previewtoken", label: null, createdAt: "" };
      },
      isCreatingLink: false,
      pay: async () => {
        toast.success("Invoice paid (preview)");
        return { txId: undefined };
      },
      payingId: null,
    }),
    [],
  );

  const mockMovements = useMemo<UseMovementsResult>(
    () => ({
      movements: [
        { id: "m1", type: "deposit", sign: "+", amount: "5000.00", counterparty: "GBINBOUND4PAYER4ADDRESS4EXAMPLE4ABCDEFGH", txId: "tx1", method: null, label: null, scheduleId: null, createdAt: "2026-06-24T10:15:00Z" },
        { id: "m2", type: "treasury_deposit", sign: "+", amount: "3200.00", counterparty: null, txId: "tx2", method: null, label: "Operating reserve", scheduleId: null, createdAt: "2026-06-23T16:40:00Z" },
        // Neutral: money relabelled between allocations — never +/-.
        { id: "m3", type: "treasury_transfer", sign: "0", amount: "800.00", counterparty: null, txId: null, method: null, label: "General → Tax provision", scheduleId: null, createdAt: "2026-06-22T09:05:00Z" },
        { id: "m4", type: "send", sign: "-", amount: "300.00", counterparty: "GCONTRACTOR4PAYOUT4ADDRESS4EXAMPLE4WXYZ12", txId: "tx3", method: null, label: null, scheduleId: null, createdAt: "2026-06-21T13:20:00Z" },
        // Recurring runs of the SaaS schedule (s2) — show in its detail.
        { id: "r1", type: "send", sign: "-", amount: "49.00", counterparty: "GXYZ789SAASVENDOR4ADDRESS4EXAMPLE4QRSTUVW", txId: "txr1", method: null, label: null, scheduleId: "s2", createdAt: "2026-06-23T11:00:00Z" },
        { id: "r2", type: "send", sign: "-", amount: "49.00", counterparty: "GXYZ789SAASVENDOR4ADDRESS4EXAMPLE4QRSTUVW", txId: "txr2", method: null, label: null, scheduleId: "s2", createdAt: "2026-06-22T11:00:00Z" },
        { id: "r3", type: "send", sign: "-", amount: "49.00", counterparty: "GXYZ789SAASVENDOR4ADDRESS4EXAMPLE4QRSTUVW", txId: null, method: null, label: null, scheduleId: "s2", createdAt: "2026-06-21T11:00:00Z" },
        { id: "m6", type: "deposit", sign: "+", amount: "1200.00", counterparty: "GBINBOUND4PAYER4ADDRESS4EXAMPLE4ABCDEFGH", txId: "tx5", method: null, label: null, scheduleId: null, createdAt: "2026-06-18T08:30:00Z" },
      ],
      isLoading: false,
      record: async () => {
        toast.success("Movement recorded (preview)");
      },
    }),
    [],
  );

  const mockSchedules = useMemo<UseSchedulesResult>(
    () => ({
      schedules: [
        { id: "s1", userId: "demo", payeeName: "Payroll — June", counterparty: "GCONTRACTOR4PAYOUT4ADDRESS4EXAMPLE4WXYZ12", amount: "4200.00", intervalSeconds: 2_592_000, nextRunAt: new Date(Date.now() + 86_400_000).toISOString(), active: true, lastRunAt: null, lastTxId: null, lastError: null, createdAt: "" },
        { id: "s2", userId: "demo", payeeName: "SaaS subscription", counterparty: "GXYZ789SAASVENDOR4ADDRESS4EXAMPLE4QRSTUVW", amount: "49.00", intervalSeconds: 60, nextRunAt: new Date(Date.now() + 45_000).toISOString(), active: true, lastRunAt: null, lastTxId: null, lastError: null, createdAt: "" },
        { id: "s3", userId: "demo", payeeName: "Office rent", counterparty: "GBINBOUND4PAYER4ADDRESS4EXAMPLE4ABCDEFGH", amount: "1500.00", intervalSeconds: 2_592_000, nextRunAt: new Date(Date.now() + 1_000_000).toISOString(), active: false, lastRunAt: null, lastTxId: null, lastError: null, createdAt: "" },
      ],
      isLoading: false,
      create: async (input) => {
        toast.success("Recurring payment scheduled (preview)");
        return { id: "new", userId: "demo", ...input, nextRunAt: new Date(Date.now() + input.intervalSeconds * 1000).toISOString(), active: true, lastRunAt: null, lastTxId: null, lastError: null, createdAt: "" };
      },
      remove: async () => {
        toast.success("Schedule removed (preview)");
      },
      setActive: async () => {
        toast.message("Preview mode — pause/resume is mocked");
      },
      runNow: async () => {
        toast.success("Running now (preview)");
      },
      isMutating: false,
    }),
    [],
  );

  return (
    <UserOverrideProvider
      value={mockUser}
      allocations={mockAllocations}
      invoices={mockInvoices}
      movements={mockMovements}
      schedules={mockSchedules}
    >
      <div className="min-h-screen bg-bg text-ink">
        <Navbar />
        <AppIndexPage />
      </div>
    </UserOverrideProvider>
  );
}
