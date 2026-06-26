import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { PhotonMark } from "@/components/brand/photon-mark";

interface WelcomeStepProps {
  onNext: () => void;
}

const BENEFITS = [
  { label: "5 minutes", desc: "That's all it takes" },
  { label: "Secure", desc: "Your data is encrypted and protected" },
  { label: "Required by law", desc: "KYC compliance keeps everyone safe" },
];

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-8 max-w-sm"
      >
        <PhotonMark className="h-14 w-14" />

        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">Welcome to PHOTON</h1>
          <p className="text-muted-foreground">
            Let's get your account set up. We need to verify your identity before you can start
            sending and receiving payments.
          </p>
        </div>

        <div className="w-full space-y-3 text-left">
          {BENEFITS.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                ✓
              </div>
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-muted-foreground text-xs">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={onNext} className="w-full" size="lg">
          Get started
        </Button>
      </motion.div>
    </div>
  );
}
