import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ApprovedStep() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <CheckCircleIcon className="text-primary h-20 w-20" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3 max-w-sm"
      >
        <h1 className="text-2xl font-semibold">You're verified!</h1>
        <p className="text-muted-foreground">
          Your identity has been confirmed. Your PHOTON account is ready to use.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-sm"
      >
        <Button onClick={() => navigate("/app", { replace: true })} className="w-full" size="lg">
          Go to PHOTON
        </Button>
      </motion.div>
    </div>
  );
}
