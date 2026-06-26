import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { users } from "../db/schema";
import type { AppEnv } from "../types";

export const kyc = new Hono<AppEnv>();

kyc.post("/approve", async (c) => {
  const user = c.get("user");
  await db
    .update(users)
    .set({ kycStatus: "approved", updatedAt: new Date() })
    .where(eq(users.id, user.id));
  return c.json({ kycStatus: "approved" });
});
