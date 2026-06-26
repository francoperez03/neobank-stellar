import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadIcon, CheckCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KycField } from "@neobank-stellar/shared";

interface KycFieldRendererProps {
  field: KycField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: boolean;
  disabled?: boolean;
}

interface FileUploadMeta {
  uploaded: boolean;
  fileName?: string;
}

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];

const INPUT_TYPE_MAP: Record<string, string> = { email: "email", phoneNumber: "tel" };

export function KycFieldRenderer({ field, value, onChange, error, disabled }: KycFieldRendererProps) {
  const [fileError, setFileError] = useState<string | null>(null);

  const baseInputClass = cn(
    error && "border-destructive focus-visible:ring-destructive",
    disabled && "cursor-not-allowed opacity-60",
  );

  if (field.type === "file_upload") {
    const meta = value as FileUploadMeta | undefined;
    const uploaded = meta?.uploaded === true;

    return (
      <div className="space-y-1">
        <label className="text-sm font-medium">{field.label}</label>
        {field.helpText && (
          <p className="text-muted-foreground text-xs">{field.helpText}</p>
        )}
        <label
          className={cn(
            "border-input flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors",
            uploaded
              ? "border-primary/40 bg-primary/5"
              : "hover:border-primary/40 hover:bg-accent",
            (error || fileError) && "border-destructive",
          )}
        >
          <input
            type="file"
            className="sr-only"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (!ALLOWED_MIME_TYPES.includes(file.type)) {
                setFileError("Only JPG, PNG, or PDF files are accepted.");
                e.target.value = "";
                return;
              }
              setFileError(null);
              onChange({ uploaded: true, fileName: file.name, size: file.size });
            }}
          />
          {uploaded ? (
            <>
              <CheckCircleIcon className="text-primary h-6 w-6" />
              <span className="text-sm font-medium">{meta?.fileName}</span>
              <span className="text-muted-foreground text-xs">Tap to replace</span>
            </>
          ) : (
            <>
              <UploadIcon className="text-muted-foreground h-6 w-6" />
              <span className="text-sm font-medium">Upload {field.label}</span>
              <span className="text-muted-foreground text-xs">JPG, PNG or PDF · max 5 MB</span>
            </>
          )}
        </label>
        {fileError && <p className="text-destructive text-xs">{fileError}</p>}
      </div>
    );
  }

  if (field.type === "boolean") {
    return (
      <div
        className={cn(
          "border-input flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors",
          error && "border-destructive",
        )}
      >
        <div>
          <p className="text-sm font-medium">{field.label}</p>
          {field.helpText && (
            <p className="text-muted-foreground mt-0.5 text-xs">{field.helpText}</p>
          )}
        </div>
        <Switch
          checked={value === true}
          onCheckedChange={onChange}
        />
      </div>
    );
  }

  if (field.type === "select" && field.options) {
    return (
      <div className="space-y-1">
        <label className="text-sm font-medium">{field.label}</label>
        <Select
          value={typeof value === "string" ? value : undefined}
          onValueChange={onChange as (v: string) => void}
        >
          <SelectTrigger className={baseInputClass}>
            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {field.helpText && (
          <p className="text-muted-foreground text-xs">{field.helpText}</p>
        )}
      </div>
    );
  }

  if (field.type === "date") {
    return (
      <div className="space-y-1">
        <label className="text-sm font-medium">{field.label}</label>
        <Input
          type="date"
          className={baseInputClass}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          max={new Date().toISOString().split("T")[0]}
          disabled={disabled}
        />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{field.label}</label>
      <Input
        type={INPUT_TYPE_MAP[field.name] ?? "text"}
        className={baseInputClass}
        placeholder={field.placeholder ?? field.label}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
      {field.helpText && (
        <p className="text-muted-foreground text-xs">{field.helpText}</p>
      )}
    </div>
  );
}
