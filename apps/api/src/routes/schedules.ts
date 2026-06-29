import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../lib/db";
import { paymentSchedules } from "../db/schema";
import type { AppEnv } from "../types";

export const schedulesRoute = new Hono<AppEnv>();

const DECIMAL = /^\d+(\.\d+)?$/;
const STELLAR_ADDRESS = /^[GC][A-Z2-7]{55}$/;
// Floor so a demo schedule still fires on camera without hammering the chain.
const MIN_INTERVAL_SECONDS = 30;

// GET /api/schedules — the caller's recurring payment schedules.
schedulesRoute.get("/", async (c) => {
  const user = c.get("user");
  const rows = await db
    .select()
    .from(paymentSchedules)
    .where(eq(paymentSchedules.userId, user.id))
    .orderBy(desc(paymentSchedules.createdAt));
  return c.json(rows);
});

// POST /api/schedules { payeeName, counterparty, amount, intervalSeconds }
schedulesRoute.post("/", async (c) => {
  const user = c.get("user");
  type Body = {
    payeeName?: string;
    counterparty?: string;
    amount?: string;
    intervalSeconds?: number;
    startAt?: string;
  };
  const body = await c.req.json<Body>().catch(() => ({}) as Body);

  const payeeName = body.payeeName?.trim();
  if (!payeeName) throw new HTTPException(400, { message: "payeeName is required" });
  if (payeeName.length > 80) {
    throw new HTTPException(400, { message: "payeeName must be 80 characters or fewer" });
  }

  const counterparty = body.counterparty?.trim();
  if (!counterparty || !STELLAR_ADDRESS.test(counterparty)) {
    throw new HTTPException(400, { message: "counterparty must be a valid Stellar address" });
  }

  if (typeof body.amount !== "string" || !DECIMAL.test(body.amount) || Number(body.amount) <= 0) {
    throw new HTTPException(400, { message: "amount must be a positive decimal string" });
  }

  const intervalSeconds = Number(body.intervalSeconds);
  if (!Number.isInteger(intervalSeconds) || intervalSeconds < MIN_INTERVAL_SECONDS) {
    throw new HTTPException(400, {
      message: `intervalSeconds must be an integer >= ${MIN_INTERVAL_SECONDS}`,
    });
  }

  // First run: the chosen start, or one interval from now. A past start clamps
  // to now so it fires on the next tick (handy for the demo).
  let nextRunAt = new Date(Date.now() + intervalSeconds * 1000);
  if (body.startAt) {
    const start = new Date(body.startAt);
    if (Number.isNaN(start.getTime())) {
      throw new HTTPException(400, { message: "startAt must be a valid date" });
    }
    nextRunAt = start.getTime() < Date.now() ? new Date() : start;
  }
  const [row] = await db
    .insert(paymentSchedules)
    .values({ userId: user.id, payeeName, counterparty, amount: body.amount, intervalSeconds, nextRunAt })
    .returning();

  return c.json(row, 201);
});

// PATCH /api/schedules/:id { active } — pause / resume.
schedulesRoute.patch("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = await c.req.json<{ active?: boolean }>().catch(() => ({}) as { active?: boolean });
  if (typeof body.active !== "boolean") {
    throw new HTTPException(400, { message: "active (boolean) is required" });
  }
  const [row] = await db
    .update(paymentSchedules)
    .set({ active: body.active })
    .where(and(eq(paymentSchedules.id, id), eq(paymentSchedules.userId, user.id)))
    .returning();
  if (!row) throw new HTTPException(404, { message: "Schedule not found" });
  return c.json(row);
});

// DELETE /api/schedules/:id
schedulesRoute.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const [row] = await db
    .delete(paymentSchedules)
    .where(and(eq(paymentSchedules.id, id), eq(paymentSchedules.userId, user.id)))
    .returning();
  if (!row) throw new HTTPException(404, { message: "Schedule not found" });
  return c.json({ id: row.id });
});

// POST /api/schedules/:id/run — fire now (demo). Reuses the scheduler path by
// pulling nextRunAt forward, so there's no duplicate execution logic here.
schedulesRoute.post("/:id/run", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const [row] = await db
    .update(paymentSchedules)
    .set({ nextRunAt: new Date(), active: true })
    .where(and(eq(paymentSchedules.id, id), eq(paymentSchedules.userId, user.id)))
    .returning();
  if (!row) throw new HTTPException(404, { message: "Schedule not found" });
  return c.json(row);
});
