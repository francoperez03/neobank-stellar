import { createContext, useContext, type ReactNode } from "react";
import type { UseUserResult } from "@/hooks/use-user";
import type { UseAllocationsResult } from "@/hooks/use-allocations";
import type { UseInvoicesResult } from "@/hooks/use-invoices";
import type { UseMovementsResult } from "@/hooks/use-movements";

/**
 * Optional overrides for `useUser` / `useAllocations` / `useInvoices`. In
 * production these contexts are never provided, so the hooks run their real
 * Crossmint/vault/API logic. The `/__preview` route supplies mocked values so
 * the dashboard can be reviewed fully populated without login, KYC, a funded
 * vault, or real invoices.
 */
const UserOverrideContext = createContext<UseUserResult | null>(null);
const AllocationsOverrideContext = createContext<UseAllocationsResult | null>(null);
const InvoicesOverrideContext = createContext<UseInvoicesResult | null>(null);
const MovementsOverrideContext = createContext<UseMovementsResult | null>(null);

export function useUserOverride(): UseUserResult | null {
  return useContext(UserOverrideContext);
}

export function useAllocationsOverride(): UseAllocationsResult | null {
  return useContext(AllocationsOverrideContext);
}

export function useInvoicesOverride(): UseInvoicesResult | null {
  return useContext(InvoicesOverrideContext);
}

export function useMovementsOverride(): UseMovementsResult | null {
  return useContext(MovementsOverrideContext);
}

export function UserOverrideProvider({
  value,
  allocations,
  invoices,
  movements,
  children,
}: {
  value: UseUserResult;
  allocations?: UseAllocationsResult;
  invoices?: UseInvoicesResult;
  movements?: UseMovementsResult;
  children: ReactNode;
}) {
  return (
    <UserOverrideContext.Provider value={value}>
      <AllocationsOverrideContext.Provider value={allocations ?? null}>
        <InvoicesOverrideContext.Provider value={invoices ?? null}>
          <MovementsOverrideContext.Provider value={movements ?? null}>
            {children}
          </MovementsOverrideContext.Provider>
        </InvoicesOverrideContext.Provider>
      </AllocationsOverrideContext.Provider>
    </UserOverrideContext.Provider>
  );
}
