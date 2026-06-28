import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../lib/db";
import { allocations } from "../db/schema";
import type { AppEnv } from "../types";

export const allocationsRoute = new Hono<AppEnv>();

const DECIMAL = /^\d+(\.\d+)?$/;

// GET /api/allocations — the caller's treasury allocations (DB accounting split).
allocationsRoute.get("/", async (c) => {
  const user = c.get("user");
  const rows = await db
    .select()
    .from(allocations)
    .where(eq(allocations.userId, user.id))
    .orderBy(desc(allocations.createdAt));
  return c.json(rows);
});

// POST /api/allocations { name, amount, txId? } — record an allocation.
// The on-chain deposit already happened (front called /api/vault/deposit);
// this only persists the name/amount split and the funding tx.
allocationsRoute.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req
    .json<{ name?: string; amount?: string; txId?: string }>()
    .catch(() => ({}) as { name?: string; amount?: string; txId?: string });

  const name = body.name?.trim();
  if (!name) {
    throw new HTTPException(400, { message: "name is required" });
  }
  if (name.length > 80) {
    throw new HTTPException(400, { message: "name must be 80 characters or fewer" });
  }
  if (typeof body.amount !== "string" || !DECIMAL.test(body.amount) || Number(body.amount) <= 0) {
    throw new HTTPException(400, { message: "amount must be a positive decimal string" });
  }

  const [row] = await db
    .insert(allocations)
    .values({
      userId: user.id,
      name,
      amount: body.amount,
      depositTx: body.txId?.trim() || null,
    })
    .returning();

  return c.json(row, 201);
});

// DELETE /api/allocations/:id — remove an allocation record (the on-chain
// withdraw is a separate call to /api/vault/withdraw).
allocationsRoute.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const [row] = await db
    .delete(allocations)
    .where(and(eq(allocations.id, id), eq(allocations.userId, user.id)))
    .returning();
  if (!row) {
    throw new HTTPException(404, { message: "Allocation not found" });
  }
  return c.json({ id: row.id });
});
