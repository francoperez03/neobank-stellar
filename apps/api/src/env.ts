function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  crossmintEnv: process.env.CROSSMINT_ENV === "production" ? "production" : "staging",
  port: Number(process.env.PORT ?? 4000),
  // apps/web's vite.config.ts pins the dev server to :3000, not Vite's
  // default :5173 — this default must match or CORS silently breaks.
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
  dbPath: process.env.DB_PATH ?? "./photon.db",
  logLevel: process.env.LOG_LEVEL ?? "info",
  crossmintServerApiKey: required("CROSSMINT_SERVER_API_KEY"),
  crossmintWebhookSecret: required("CROSSMINT_WEBHOOK_SECRET"),
} as const;
