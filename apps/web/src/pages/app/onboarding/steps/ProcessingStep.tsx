import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { validateKycSubmission } from "@neobank-stellar/shared";
import { useUser } from "@/hooks/use-user";

interface ProcessingStepProps {
  countryCode: string;
  kycData: Record<string, unknown>;
  onApproved: () => void;
  onError: (msg: string) => void;
}

export function ProcessingStep({ countryCode, kycData, onApproved, onError }: ProcessingStepProps) {
  const { markKycApproved } = useUser();

  const kycDataRef = useRef(kycData);
  const countryCodeRef = useRef(countryCode);
  const onApprovedRef = useRef(onApproved);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    const result = validateKycSubmission(countryCodeRef.current, kycDataRef.current);

    if (!result.valid) {
      const parts: string[] = [];
      if (result.missing.length) parts.push(`Missing: ${result.missing.join(", ")}`);
      if (result.invalid.length) parts.push(`Invalid: ${result.invalid.join(", ")}`);
      onErrorRef.current(parts.join(" · "));
      return;
    }

    const timer = setTimeout(() => {
      markKycApproved();
      onApprovedRef.current();
    }, 3000);

    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        className="border-primary/20 border-t-primary h-14 w-14 rounded-full border-4"
      />
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Verifying your identity</h2>
        <p className="text-muted-foreground text-sm">This usually takes just a moment…</p>
      </div>
    </div>
  );
}
