import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { AppIndexPage } from "@/pages/app";
import { UserOverrideProvider } from "@/hooks/use-user-override";
import type { UseUserResult } from "@/hooks/use-user";

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

  return (
    <UserOverrideProvider value={mockUser}>
      <div className="min-h-screen bg-bg text-ink">
        <Navbar />
        <AppIndexPage />
      </div>
    </UserOverrideProvider>
  );
}
