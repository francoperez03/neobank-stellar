import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { StepShell } from "../components/step-shell";
import { Button } from "@/components/ui/button";
import { CameraIcon, CheckCircleIcon } from "lucide-react";

interface SelfieStepProps {
  progress: number;
  onBack: () => void;
  onNext: (data: Record<string, unknown>) => void;
}

export function SelfieStep({ progress, onBack, onNext }: SelfieStepProps) {
  const [state, setState] = useState<"idle" | "capturing" | "done">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  function handleCapture() {
    setState("capturing");
    timerRef.current = setTimeout(() => setState("done"), 2000);
  }

  return (
    <StepShell
      title="Take a selfie"
      description="We need to confirm that the document belongs to you. Look directly at the camera."
      progress={progress}
      onBack={onBack}
    >
      <div className="flex flex-1 flex-col items-center gap-8">
        <div className="border-input bg-muted/30 flex h-56 w-56 items-center justify-center overflow-hidden rounded-full border-2">
          <AnimatePresence mode="wait">
            {state === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-2 text-center"
              >
                <CameraIcon className="text-muted-foreground h-14 w-14" />
                <span className="text-muted-foreground text-xs">Camera preview</span>
              </motion.div>
            )}
            {state === "capturing" && (
              <motion.div
                key="capturing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-2"
              >
                <CameraIcon className="text-primary h-14 w-14" />
                <span className="text-primary text-xs font-medium">Capturing…</span>
              </motion.div>
            )}
            {state === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-2"
              >
                <CheckCircleIcon className="text-primary h-14 w-14" />
                <span className="text-primary text-xs font-medium">Captured</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-auto w-full space-y-3">
          {state !== "done" ? (
            <Button
              onClick={handleCapture}
              disabled={state === "capturing"}
              className="w-full"
              size="lg"
            >
              {state === "capturing" ? "Capturing…" : "Take selfie"}
            </Button>
          ) : (
            <>
              <Button
                onClick={() =>
                  onNext({ selfie: { uploaded: true, fileName: "selfie.jpg" } })
                }
                className="w-full"
                size="lg"
              >
                Looks good — continue
              </Button>
              <Button
                variant="outline"
                onClick={() => setState("idle")}
                className="w-full"
              >
                Retake
              </Button>
            </>
          )}
        </div>
      </div>
    </StepShell>
  );
}
