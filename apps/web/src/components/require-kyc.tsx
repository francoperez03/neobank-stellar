import { type ReactNode, type ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useUser } from "@/hooks/use-user";
import { FullScreenLoader } from "@/components/ui/full-screen-loader";
import { EASE_OUT } from "@/lib/motion";

export function RequireKYC({ children }: { children: ReactNode }) {
  const { authStatus, isAuthLoading, isKycApproved } = useUser();

  if (authStatus !== "logged-in" && !isAuthLoading) {
    return <Navigate to="/app/auth" replace />;
  }

  if (authStatus === "logged-in" && !isKycApproved) {
    return <Navigate to="/app/onboarding" replace />;
  }

  // Crossfade the loader out and the dashboard up-and-in once auth resolves,
  // so /app never snaps from "Loading…" straight to the rendered overview.
  return (
    <AnimatePresence mode="wait">
      {isAuthLoading ? (
        <FullScreenLoader key="loader" />
      ) : (
        <motion.div
          key="content"
          className="min-h-screen bg-bg text-ink"
          initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  ) as ReactElement;
}
