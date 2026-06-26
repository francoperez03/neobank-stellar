import { useMemo, useRef } from "react";
import { useCrossmintAuth, useWallet } from "@crossmint/client-sdk-react-ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createApiClient } from "@/lib/api-client";

interface VaultInfo {
  vault: string;
  network: string;
  apy: number;
}

interface VaultPosition {
  vault: string;
  underlyingBalance: string; // smallest unit, 7 decimals
}

interface TxResponse {
  vault: string;
  txId: string;
}

export interface UseVaultResult {
  apy?: number;
  isInfoLoading: boolean;
  position?: string;
  isPositionLoading: boolean;
  refetchPosition: () => void;
  deposit: (amount: string) => Promise<TxResponse>;
  isDepositing: boolean;
  withdraw: (amount: string) => Promise<TxResponse>;
  isWithdrawing: boolean;
}

const DECIMALS = 7;

/** Format a smallest-unit string into a human decimal: "125000000" -> "12.5". */
function fromSmallestUnit(raw?: string): string | undefined {
  if (raw == null) return undefined;
  try {
    const value = BigInt(raw);
    const base = 10n ** BigInt(DECIMALS);
    const whole = value / base;
    const frac = (value % base).toString().padStart(DECIMALS, "0").replace(/0+$/, "");
    return frac ? `${whole}.${frac}` : whole.toString();
  } catch {
    return raw;
  }
}

const vaultInfoKey = ["vault-info"] as const;
const vaultPositionKey = (address?: string) => ["vault-position", address] as const;

export function useVault(): UseVaultResult {
  const { jwt } = useCrossmintAuth();
  const { wallet } = useWallet();
  const queryClient = useQueryClient();
  const walletAddress = wallet?.address;

  const jwtRef = useRef(jwt);
  jwtRef.current = jwt;

  const apiFetch = useMemo(() => createApiClient(() => jwtRef.current), []);

  const infoQuery = useQuery({
    queryKey: vaultInfoKey,
    queryFn: () => apiFetch<VaultInfo>("/api/vault"),
    enabled: !!jwt,
    staleTime: 60_000,
  });

  const positionQuery = useQuery({
    queryKey: vaultPositionKey(walletAddress),
    queryFn: () => apiFetch<VaultPosition>("/api/vault/position"),
    enabled: !!jwt && !!walletAddress,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: vaultPositionKey(walletAddress) });
    // The wallet's spendable balance changed too — refresh BalanceCard's view.
    queryClient.invalidateQueries({ queryKey: ["wallet-balances"] });
  };

  // Signing is server-side now: apps/api creates the contract-call, signs it with
  // the server key, submits the approval, and returns the settled txId. The client
  // just POSTs the amount and waits.
  const runVaultTx = (endpoint: "deposit" | "withdraw", amount: string) =>
    apiFetch<TxResponse>(`/api/vault/${endpoint}`, { method: "POST", data: { amount } });

  const depositMutation = useMutation({
    mutationFn: (amount: string) => runVaultTx("deposit", amount),
    onSuccess: () => {
      invalidate();
      toast.success("Deposited to vault");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Deposit failed"),
  });

  const withdrawMutation = useMutation({
    mutationFn: (amount: string) => runVaultTx("withdraw", amount),
    onSuccess: () => {
      invalidate();
      toast.success("Withdrawn from vault");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Withdraw failed"),
  });

  return {
    apy: infoQuery.data?.apy,
    isInfoLoading: infoQuery.isLoading,
    position: fromSmallestUnit(positionQuery.data?.underlyingBalance),
    isPositionLoading: positionQuery.isFetching,
    refetchPosition: () => positionQuery.refetch(),
    deposit: (amount) => depositMutation.mutateAsync(amount),
    isDepositing: depositMutation.isPending,
    withdraw: (amount) => withdrawMutation.mutateAsync(amount),
    isWithdrawing: withdrawMutation.isPending,
  };
}
