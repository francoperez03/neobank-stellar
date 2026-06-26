import { Hono } from "hono";
import type { AppEnv } from "../types";

export const me = new Hono<AppEnv>();

me.get("/", (c) => {
  const user = c.get("user");
  return c.json({
    id: user.id,
    crossmintUserId: user.crossmintUserId,
    email: user.email,
    kycStatus: user.kycStatus,
  });
});
