import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { db } from "../lib/db";
import { users } from "../db/schema";
import { verifyCrossmintJwt } from "../lib/crossmint-auth";
import type { AppEnv } from "../types";

export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Missing Bearer token" });
  }

  const token = authHeader.slice(7);
  let claims;
  try {
    claims = await verifyCrossmintJwt(token);
  } catch {
    throw new HTTPException(401, { message: "Invalid token" });
  }

  const result = await db
    .insert(users)
    .values({ crossmintUserId: claims.sub, email: claims.email })
    .onConflictDoUpdate({
      target: users.crossmintUserId,
      set: { email: claims.email, updatedAt: new Date() },
    })
    .returning();

  const user = result[0];
  if (!user) throw new HTTPException(500, { message: "Failed to resolve user" });

  c.set("user", user);
  await next();
});
