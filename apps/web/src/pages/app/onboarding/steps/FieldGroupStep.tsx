import { useState } from "react";
import { StepShell } from "../components/step-shell";
import { KycFieldRenderer } from "../components/kyc-field-renderer";
import { Button } from "@/components/ui/button";
import { buildKycSchema, type KycField, type KycFieldGroup } from "@neobank-stellar/shared";

const GROUP_LABELS: Record<KycFieldGroup, { title: string; description: string }> = {
  personal: { title: "Personal information", description: "We need a few details to identify you." },
  address: { title: "Your address", description: "Please enter your current residential address." },
  identification: { title: "Identification", description: "Enter your government-issued ID details." },
  documents: { title: "Upload documents", description: "Take clear photos of your identity documents." },
  additional: { title: "Additional information", description: "A few more details required by regulations." },
};

interface FieldGroupStepProps {
  group: KycFieldGroup;
  fields: KycField[];
  kycData: Record<string, unknown>;
  progress: number;
  onBack: () => void;
  onNext: (data: Record<string, unknown>) => void;
}

export function FieldGroupStep({ group, fields, kycData, progress, onBack, onNext }: FieldGroupStepProps) {
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    for (const f of fields) {
      if (kycData[f.name] !== undefined) {
        initial[f.name] = kycData[f.name];
      } else if (f.type === "boolean") {
        initial[f.name] = false;
      }
    }
    return initial;
  });
  const [errors, setErrors] = useState<Set<string>>(new Set());

  const { title, description } = GROUP_LABELS[group];

  function handleNext() {
    const result = buildKycSchema(fields).safeParse(values);
    if (!result.success) {
      setErrors(new Set(result.error.issues.map((i) => String(i.path[0]))));
      return;
    }
    onNext(values);
  }

  return (
    <StepShell title={title} description={description} progress={progress} onBack={onBack}>
      <div className="flex flex-1 flex-col gap-5">
        {fields.map((field) => (
          <KycFieldRenderer
            key={field.name}
            field={field}
            value={values[field.name]}
            disabled={kycData[field.name] !== undefined}
            onChange={(v) => {
              setValues((prev) => ({ ...prev, [field.name]: v }));
              if (errors.has(field.name)) {
                setErrors((prev) => {
                  const next = new Set(prev);
                  next.delete(field.name);
                  return next;
                });
              }
            }}
            error={errors.has(field.name)}
          />
        ))}

        {errors.size > 0 && (
          <p className="text-destructive text-sm">Please fill in all required fields.</p>
        )}

        <Button onClick={handleNext} className="mt-auto w-full">
          Continue
        </Button>
      </div>
    </StepShell>
  );
}
