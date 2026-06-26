import { describe, test, expect } from "bun:test";
import { validateKycSubmission } from "./validate";

describe("validateKycSubmission — Brazil (BR)", () => {
  test("passes with valid 11-digit CPF", () => {
    const r = validateKycSubmission("BR", { cpf: "12345678901" });
    expect(r.valid).toBe(true);
    expect(r.missing).toHaveLength(0);
    expect(r.invalid).toHaveLength(0);
  });

  test("fails when CPF is missing", () => {
    const r = validateKycSubmission("BR", {});
    expect(r.valid).toBe(false);
    expect(r.missing).toContain("cpf");
  });

  test("fails when CPF is too short", () => {
    const r = validateKycSubmission("BR", { cpf: "1234" });
    expect(r.valid).toBe(false);
    expect(r.invalid).toContain("cpf");
  });

  test("fails when CPF contains letters", () => {
    const r = validateKycSubmission("BR", { cpf: "1234567890a" });
    expect(r.valid).toBe(false);
    expect(r.invalid).toContain("cpf");
  });

  test("fails when CPF is empty string", () => {
    const r = validateKycSubmission("BR", { cpf: "" });
    expect(r.valid).toBe(false);
    expect(r.missing).toContain("cpf");
  });
});

const VALID_AR = {
  firstName: "Juan",
  lastName: "García",
  dateOfBirth: "1990-01-15",
  phoneNumber: "+5491123456789",
  email: "juan@example.com",
  country: "Argentina",
  countryCode: "AR",
  city: "Buenos Aires",
  zipCode: "1001",
  address: "Av. Corrientes 1234",
  state: "CABA",
  nationalIdFront: { uploaded: true, fileName: "front.jpg" },
  nationalIdBack: { uploaded: true, fileName: "back.jpg" },
  selfie: { uploaded: true, fileName: "selfie.jpg" },
  pep: false,
};

describe("validateKycSubmission — Argentina (AR)", () => {
  test("passes with all required fields", () => {
    const r = validateKycSubmission("AR", VALID_AR);
    expect(r.valid).toBe(true);
  });

  test("fails when firstName is missing", () => {
    const { firstName: _, ...rest } = VALID_AR;
    const r = validateKycSubmission("AR", rest);
    expect(r.valid).toBe(false);
    expect(r.missing).toContain("firstName");
  });

  test("fails when pep field is absent (not false, literally undefined)", () => {
    const { pep: _, ...rest } = VALID_AR;
    const r = validateKycSubmission("AR", rest);
    expect(r.valid).toBe(false);
    expect(r.missing).toContain("pep");
  });

  test("pep = false is valid (not treated as missing)", () => {
    const r = validateKycSubmission("AR", { ...VALID_AR, pep: false });
    expect(r.valid).toBe(true);
  });

  test("fails when nationalIdFront is not uploaded", () => {
    const r = validateKycSubmission("AR", { ...VALID_AR, nationalIdFront: { uploaded: false } });
    expect(r.valid).toBe(false);
    expect(r.missing).toContain("nationalIdFront");
  });

  test("fails when nationalIdFront is absent", () => {
    const { nationalIdFront: _, ...rest } = VALID_AR;
    const r = validateKycSubmission("AR", rest);
    expect(r.valid).toBe(false);
    expect(r.missing).toContain("nationalIdFront");
  });

  test("collects all missing fields at once", () => {
    const r = validateKycSubmission("AR", {});
    expect(r.missing.length).toBeGreaterThan(5);
    expect(r.missing).toContain("firstName");
    expect(r.missing).toContain("pep");
    expect(r.missing).toContain("nationalIdFront");
  });
});

describe("validateKycSubmission — unknown country", () => {
  test("returns invalid for unsupported country code", () => {
    const r = validateKycSubmission("XX", { anything: "value" });
    expect(r.valid).toBe(false);
    expect(r.missing).toContain("unsupported_country");
  });
});

describe("validateKycSubmission — Colombia (CO) select field", () => {
  const VALID_CO = {
    firstName: "Maria",
    lastName: "Lopez",
    dateOfBirth: "1995-06-20",
    phoneNumber: "+573001234567",
    country: "Colombia",
    city: "Bogotá",
    zipCode: "110111",
    address: "Calle 100 #15-23",
    state: "Cundinamarca",
    documentType: "CC",
    dni: "1234567890",
  };

  test("passes with all CO fields", () => {
    const r = validateKycSubmission("CO", VALID_CO);
    expect(r.valid).toBe(true);
  });

  test("fails when documentType missing", () => {
    const { documentType: _, ...rest } = VALID_CO;
    const r = validateKycSubmission("CO", rest);
    expect(r.valid).toBe(false);
    expect(r.missing).toContain("documentType");
  });

  test("fails when dni missing", () => {
    const { dni: _, ...rest } = VALID_CO;
    const r = validateKycSubmission("CO", rest);
    expect(r.valid).toBe(false);
    expect(r.missing).toContain("dni");
  });
});
