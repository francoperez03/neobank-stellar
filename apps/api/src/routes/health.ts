import { Hono } from "hono";
import { sql } from "drizzle-orm";
import { db } from "../lib/db";
import { logger } from "../lib/logger";
import type { AppEnv } from "../types";

const health = new Hono<AppEnv>();

health.get("/", async (c) => {
  try {
    await db.execute(sql`select 1`);
    return c.json({ ok: true, db: "up" });
  } catch (error) {
    logger.error({ error }, "DB health check failed");
    return c.json({ ok: false, db: "down" }, 503);
  }
});

export { health };