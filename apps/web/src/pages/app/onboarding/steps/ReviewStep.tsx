import { StepShell } from "../components/step-shell";
import { Button } from "@/components/ui/button";
import { KYC_SCHEMA } from "@neobank-stellar/shared";

interface ReviewStepProps {
  countryCode: string;
  kycData: Record<string, unknown>;
  progress: number;
  onBack: () => void;
  onNext: () => void;
}

function displayValue(value: unknown): string {
  if (value === undefined || value === null) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object" && (value as Record<string, unknown>).uploaded) {
    return (value as Record<string, unknown>).fileName as string ?? "Uploaded";
  }
  return String(value);
}

export function ReviewStep({ countryCode, kycData, progress, onBack, onNext }: ReviewStepProps) {
  const schema = KYC_SCHEMA[countryCode];
  const fields = schema?.fields ?? [];

  return (
    <StepShell
      title="Review your information"
      description="Make sure everything looks correct before we submit your verification."
      progress={progress}
      onBack={onBack}
    >
      <div className="flex flex-1 flex-col gap-6">
        <div className="divide-border divide-y rounded-lg border">
          {fields.map((field) => (
            <div key={field.name} className="flex items-start justify-between px-4 py-3">
              <span className="text-muted-foreground text-sm">{field.label}</span>
              <span className="ml-4 max-w-[55%] break-words text-right text-sm font-medium">
                {displayValue(kycData[field.name])}
              </span>
            </div>
          ))}
        </div>

        <p className="text-muted-foreground text-xs">
          By continuing, you confirm that all information provided is accurate and complete.
        </p>

        <Button onClick={onNext} className="mt-auto w-full" size="lg">
          Submit verification
        </Button>
      </div>
    </StepShell>
  );
}
