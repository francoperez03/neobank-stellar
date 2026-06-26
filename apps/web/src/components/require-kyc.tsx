import { type ReactNode, type ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "@/hooks/use-user";
import { FullScreenLoader } from "@/components/ui/full-screen-loader";

export function RequireKYC({ children }: { children: ReactNode }) {
  const { authStatus, isAuthLoading, isKycApproved } = useUser();

  if (isAuthLoading) {
    return <FullScreenLoader />;
  }

  if (authStatus !== "logged-in") {
    return <Navigate to="/app/auth" replace />;
  }

  if (!isKycApproved) {
    return <Navigate to="/app/onboarding" replace />;
  }

  return children as ReactElement;
}
