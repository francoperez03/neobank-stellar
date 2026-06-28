import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { AppIndexPage } from "@/pages/app";
import { UserOverrideProvider } from "@/hooks/use-user-override";
import type { UseUserResult } from "@/hooks/use-user";
import type { UseAllocationsResult } from "@/hooks/use-allocations";
import type { UseInvoicesResult } from "@/hooks/use-invoices";

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

  return (
    <UserOverrideProvider value={mockUser} allocations={mockAllocations} invoices={mockInvoices}>
      <div className="min-h-screen bg-bg text-ink">
        <Navbar />
        <AppIndexPage />
      </div>
    </UserOverrideProvider>
  );
}
