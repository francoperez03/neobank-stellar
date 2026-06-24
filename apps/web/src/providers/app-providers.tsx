import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CorossmintCustomProvider } from "./corssmintCustomProvider";
import { Toaster } from "@/components/ui/sonner";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <CorossmintCustomProvider>
        {children}
        <Toaster />
      </CorossmintCustomProvider>
    </QueryClientProvider>
  )
}
