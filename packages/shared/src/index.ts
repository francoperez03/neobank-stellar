export * from "./x402";

export const APP_NAME = "Neobank Stellar";

export type {
  KycField,
  KycFieldType,
  KycFieldGroup,
  CountryKycRequirements,
} from "./kyc/schema";
export { KYC_SCHEMA, SUPPORTED_COUNTRIES } from "./kyc/schema";
export type { ValidationResult } from "./kyc/validate";
export { validateKycSubmission, buildKycSchema, KYC_STORAGE_KEY } from "./kyc/validate";
