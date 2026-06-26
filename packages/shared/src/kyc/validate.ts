import { z } from "zod";
import { KYC_SCHEMA } from "./schema";
import type { KycField } from "./schema";

export const KYC_STORAGE_KEY = "kyc_status";

export interface ValidationResult {
  valid: boolean;
  missing: string[];
  invalid: string[];
}

export function buildKycSchema(fields: KycField[]): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let schema: z.ZodTypeAny;

    if (field.type === "file_upload") {
      schema = z.object({ uploaded: z.literal(true) });
    } else if (field.type === "boolean") {
      schema = z.boolean();
    } else {
      let s = field.required ? z.string().min(1) : z.string();
      if (field.pattern) s = s.regex(new RegExp(field.pattern));
      schema = s;
    }

    if (!field.required) schema = schema.optional();

    shape[field.name] = schema;
  }

  return z.object(shape);
}

// Zod v4 uses "invalid_format" for regex/format errors, "invalid_enum_value" for bad enum values.
// Everything else (invalid_type, too_small, invalid_value) means the field is absent or structurally wrong → missing.
const FORMAT_ERROR_CODES = new Set<string>(["invalid_format", "invalid_enum_value"]);

function zodResultToValidationResult(
  result: { success: boolean; error?: z.ZodError },
): ValidationResult {
  if (result.success) return { valid: true, missing: [], invalid: [] };

  const missing: string[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();

  for (const issue of result.error!.issues) {
    const fieldName = String(issue.path[0]);
    if (seen.has(fieldName)) continue;
    seen.add(fieldName);
    if (FORMAT_ERROR_CODES.has(issue.code)) {
      invalid.push(fieldName);
    } else {
      missing.push(fieldName);
    }
  }

  return { valid: false, missing, invalid };
}

export function validateKycSubmission(
  countryCode: string,
  data: Record<string, unknown>,
): ValidationResult {
  const schema = KYC_SCHEMA[countryCode];

  if (!schema) {
    return { valid: false, missing: ["unsupported_country"], invalid: [] };
  }

  return zodResultToValidationResult(buildKycSchema(schema.fields).safeParse(data));
}
