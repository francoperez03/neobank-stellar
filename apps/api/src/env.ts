function required(name: string, hint?: string): string {
  const value = process.env[name];
  if (!value) {
    const base = `Missing required environment variable: ${name}`;
    throw new Error(hint ? `${base}\n  Hint: ${hint}` : base);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  // apps/web's vite.config.ts pins the dev server to :3000, not Vite's
  // default :5173 — this default must match or CORS silently breaks.
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
  db: {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? "neobank",
    password: required("DB_PASSWORD", "Add DB_PASSWORD=neobank to apps/api/.env for local dev"),
    database: process.env.DB_NAME ?? "neobank_stellar",
  },
  crossmint: {
    jwksUri: process.env.CROSSMINT_JWKS_URI ?? "https://staging.crossmint.com/.well-known/jwks.json",
    projectId: required("CROSSMINT_PROJECT_ID", "Add CROSSMINT_PROJECT_ID to apps/api/.env"),
  },
  logLevel: process.env.LOG_LEVEL ?? "info",
  isProduction: process.env.NODE_ENV === "production",
} as const;
