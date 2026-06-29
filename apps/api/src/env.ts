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
    // Server-side wallet API (transactions + approvals). Distinct from the
    // browser VITE_ key; both are optional so the API boots without vault config.
    apiBaseUrl: process.env.CROSSMINT_API_BASE_URL ?? "https://staging.crossmint.com/api/2025-06-09",
    serverApiKey: process.env.CROSSMINT_SERVER_API_KEY,
    // Stellar secret (S...) of the server signer; must be a signer on each user's
    // Crossmint wallet for it to approve transactions on their behalf.
    stellarServerKey: process.env.STELLAR_SERVER_KEY,
  },
  defindex: {
    apiUrl: process.env.DEFINDEX_API_URL ?? "https://api.defindex.io",
    // Optional: vault routes return 503 until this is set, but the rest of the
    // API boots fine without it (the DeFindex key must never reach the browser).
    apiKey: process.env.DEFINDEX_API_KEY,
    network: process.env.DEFINDEX_NETWORK ?? "testnet",
    // Default: BlendUSDC vault on Stellar testnet (docs.defindex.io). Override per deploy.
    vaultAddress:
      process.env.DEFINDEX_VAULT_ADDRESS ??
      "CAQCFVLOBK5GIULPNZRGATJJMIZL5BSP7X5YJVMGCPTUEPFM4AVSRCJU",
  },
  stellar: {
    // SAC contract id of the payment asset (USDC/USDXM on testnet). Optional:
    // when unset, recurring payments record the movement without an on-chain tx
    // (see lib/payments.ts). Set USDC_SAC_ADDRESS to execute real transfers.
    usdcSacAddress: process.env.USDC_SAC_ADDRESS,
  },
  logLevel: process.env.LOG_LEVEL ?? "info",
  isProduction: process.env.NODE_ENV === "production",
} as const;
