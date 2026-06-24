import type { ReactNode } from "react";
import { CorossmintCustomProvider } from "./corssmintCustomProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <CorossmintCustomProvider>
      {children}
    </CorossmintCustomProvider>
  )
}
