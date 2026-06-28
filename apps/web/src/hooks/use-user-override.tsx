import { createContext, useContext, type ReactNode } from "react";
import type { UseUserResult } from "@/hooks/use-user";

/**
 * Optional override for `useUser`. In production this context is never
 * provided, so `useUser` runs its real Crossmint/React-Query logic. The
 * `/__preview` route wraps the dashboard in a provider that supplies a mocked
 * value, letting us see the UI fully populated without login or KYC.
 */
const UserOverrideContext = createContext<UseUserResult | null>(null);

export function useUserOverride(): UseUserResult | null {
  return useContext(UserOverrideContext);
}

export function UserOverrideProvider({
  value,
  children,
}: {
  value: UseUserResult;
  children: ReactNode;
}) {
  return (
    <UserOverrideContext.Provider value={value}>
      {children}
    </UserOverrideContext.Provider>
  );
}
