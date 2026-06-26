export type KycFieldType = "string" | "date" | "boolean" | "select" | "file_upload";
export type KycFieldGroup = "personal" | "address" | "identification" | "documents" | "additional";

export interface KycField {
  name: string;
  label: string;
  type: KycFieldType;
  group: KycFieldGroup;
  required: boolean;
  options?: string[];
  placeholder?: string;
  pattern?: string;
  helpText?: string;
}

export interface CountryKycRequirements {
  countryCode: string;
  countryName: string;
  fields: KycField[];
}

const commonAddressFields: KycField[] = [
  { name: "country", label: "Country", type: "string", group: "address", required: true },
  { name: "city", label: "City", type: "string", group: "address", required: true },
  { name: "zipCode", label: "ZIP / Postal code", type: "string", group: "address", required: true },
  { name: "address", label: "Street address", type: "string", group: "address", required: true },
];

export const KYC_SCHEMA: Record<string, CountryKycRequirements> = {
  AR: {
    countryCode: "AR",
    countryName: "Argentina",
    fields: [
      { name: "firstName", label: "First name", type: "string", group: "personal", required: true },
      { name: "lastName", label: "Last name", type: "string", group: "personal", required: true },
      { name: "dateOfBirth", label: "Date of birth", type: "date", group: "personal", required: true },
      { name: "phoneNumber", label: "Phone number", type: "string", group: "personal", required: true, placeholder: "+54 9 11 ..." },
      { name: "email", label: "Email", type: "string", group: "personal", required: true },
      ...commonAddressFields,
      { name: "state", label: "State / Province", type: "string", group: "address", required: true },
      { name: "nationalIdFront", label: "ID front", type: "file_upload", group: "documents", required: true },
      { name: "nationalIdBack", label: "ID back", type: "file_upload", group: "documents", required: true },
      { name: "selfie", label: "Selfie", type: "file_upload", group: "documents", required: true },
      { name: "pep", label: "Politically exposed person (PEP)", type: "boolean", group: "additional", required: true, helpText: "A person who holds or has held a prominent public function" },
    ],
  },
  BR: {
    countryCode: "BR",
    countryName: "Brazil",
    fields: [
      { name: "cpf", label: "CPF", type: "string", group: "identification", required: true, placeholder: "00000000000", pattern: "^\\d{11}$", helpText: "11-digit CPF number (digits only)" },
    ],
  },
  MX: {
    countryCode: "MX",
    countryName: "Mexico",
    fields: [
      { name: "firstName", label: "First name", type: "string", group: "personal", required: true },
      { name: "lastName", label: "Last name", type: "string", group: "personal", required: true },
      { name: "dateOfBirth", label: "Date of birth", type: "date", group: "personal", required: true },
      { name: "phoneNumber", label: "Phone number", type: "string", group: "personal", required: true },
      { name: "email", label: "Email", type: "string", group: "personal", required: true },
      ...commonAddressFields,
      { name: "documentType", label: "Document type", type: "select", group: "identification", required: true, options: ["INE", "Resident Card", "Passport"] },
      { name: "nationalIdFront", label: "Document front", type: "file_upload", group: "documents", required: true },
      { name: "nationalIdBack", label: "Document back", type: "file_upload", group: "documents", required: true },
    ],
  },
  CO: {
    countryCode: "CO",
    countryName: "Colombia",
    fields: [
      { name: "firstName", label: "First name", type: "string", group: "personal", required: true },
      { name: "lastName", label: "Last name", type: "string", group: "personal", required: true },
      { name: "dateOfBirth", label: "Date of birth", type: "date", group: "personal", required: true },
      { name: "phoneNumber", label: "Phone number", type: "string", group: "personal", required: true },
      ...commonAddressFields,
      { name: "state", label: "State / Department", type: "string", group: "address", required: true },
      { name: "documentType", label: "Document type", type: "select", group: "identification", required: true, options: ["CC", "CE"] },
      { name: "dni", label: "Document number", type: "string", group: "identification", required: true, helpText: "CC: 10 digits — CE: 6–10 digits" },
    ],
  },
  US: {
    countryCode: "US",
    countryName: "United States",
    fields: [
      { name: "fullName", label: "Full name", type: "string", group: "personal", required: true },
      { name: "dateOfBirth", label: "Date of birth", type: "date", group: "personal", required: true },
      { name: "phoneNumber", label: "Phone number", type: "string", group: "personal", required: true },
      { name: "email", label: "Email", type: "string", group: "personal", required: true },
      { name: "country", label: "Country", type: "string", group: "address", required: true },
      { name: "address", label: "Street address", type: "string", group: "address", required: true },
      { name: "countryWhereIdIssued", label: "Country where ID was issued", type: "string", group: "address", required: true },
      { name: "documentType", label: "Document type", type: "select", group: "identification", required: true, options: ["DL", "ID Card", "Passport", "Resident Card"] },
      { name: "nationalIdFront", label: "Document front", type: "file_upload", group: "documents", required: true },
      { name: "nationalIdBack", label: "Document back", type: "file_upload", group: "documents", required: true },
      { name: "occupation", label: "Occupation", type: "string", group: "additional", required: true },
      { name: "sourceOfFunds", label: "Source of funds", type: "string", group: "additional", required: true },
      { name: "estimatedMonthlyVolume", label: "Estimated monthly volume (USD)", type: "string", group: "additional", required: true },
      { name: "accountPurpose", label: "Account purpose", type: "string", group: "additional", required: true },
    ],
  },
};

export const SUPPORTED_COUNTRIES = Object.values(KYC_SCHEMA).map((c) => ({
  code: c.countryCode,
  name: c.countryName,
}));
