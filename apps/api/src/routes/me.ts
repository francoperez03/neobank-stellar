import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { users } from "../db/schema";
import { ensureServerSigner } from "../lib/crossmint-wallets";
import { logger } from "../lib/logger";
import type { AppEnv } from "../types";

export const me = new Hono<AppEnv>();

// Stellar account (G...) or contract/smart-wallet (C...) address: base32, 56 chars.
const STELLAR_ADDRESS = /^[GC][A-Z2-7]{55}$/;

me.get("/", (c) => {
  const user = c.get("user");
  return c.json({
    id: user.id,
    crossmintUserId: user.crossmintUserId,
    email: user.email,
    stellarAddress: user.stellarAddress,
    kycStatus: user.kycStatus,
  });
});

// The Crossmint Stellar wallet is created client-side; the web app registers its
// address here once the wallet is ready so vault routes can use it as the
// deposit/withdraw caller without trusting an address sent on every request.
me.post("/wallet", async (c) => {
  const user = c.get("user");
  const body = await c.req.json<{ address?: string }>().catch(() => ({}) as { address?: string });
  const address = body.address?.trim();
  if (!address || !STELLAR_ADDRESS.test(address)) {
    throw new HTTPException(400, { message: "Invalid Stellar address" });
  }
  await db
    .update(users)
    .set({ stellarAddress: address, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  // Register the server key as a delegated signer so vault routes can sign for
  // this wallet. Best-effort: saving the address must not fail if this does.
  let serverSignerRegistered = false;
  try {
    await ensureServerSigner(address);
    serverSignerRegistered = true;
  } catch (err) {
    logger.warn({ err, walletLocator: address }, "server_signer_registration_failed");
  }

  return c.json({ stellarAddress: address, serverSignerRegistered });
});
