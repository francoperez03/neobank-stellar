import { useState } from "react";
import { StepShell } from "../components/step-shell";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SUPPORTED_COUNTRIES } from "@neobank-stellar/shared";

interface CountryStepProps {
  initialValue?: string;
  progress: number;
  onBack: () => void;
  onNext: (countryCode: string) => void;
}

export function CountryStep({ initialValue, progress, onBack, onNext }: CountryStepProps) {
  const [selected, setSelected] = useState(initialValue ?? "");

  return (
    <StepShell
      title="Where do you live?"
      description="Your country of residence determines the documents we'll need to verify your identity."
      progress={progress}
      onBack={onBack}
    >
      <div className="flex flex-1 flex-col gap-6">
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger>
            <SelectValue placeholder="Select your country" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={() => onNext(selected)}
          disabled={!selected}
          className="mt-auto w-full"
        >
          Continue
        </Button>
      </div>
    </StepShell>
  );
}
