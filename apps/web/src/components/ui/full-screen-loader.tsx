import { motion } from "motion/react";
import { EASE_OUT } from "@/lib/motion";

export function FullScreenLoader() {
  return (
    <motion.div
      className="flex h-screen items-center justify-center bg-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: EASE_OUT }}
    >
      <motion.div
        className="text-muted-foreground text-sm"
        initial={{ opacity: 0.4 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
      >
        Loading…
      </motion.div>
    </motion.div>
  );
}
