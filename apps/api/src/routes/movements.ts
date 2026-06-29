import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { desc, eq } from "drizzle-orm";
import { db } from "../lib/db";
import { allocations, invoices, transfers } from "../db/schema";
import type { AppEnv } from "../types";

export const movementsRoute = new Hono<AppEnv>();

const DECIMAL = /^\d+(\.\d+)?$/;

// A unified movement row, derived from the tables that already own each kind of
// money flow. Signs: '+' inflow, '-' outflow, '0' neutral (treasury↔treasury).
type MovementType = "deposit" | "send" | "treasury_deposit" | "pay" | "treasury_transfer";

interface Movement {
  id: string;
  type: MovementType;
  sign: "+" | "-" | "0";
  amount: string;
  counterparty: string | null;
  txId: string | null;
  method: string | null;
  label: string | null;
  scheduleId: string | null;
  createdAt: string;
}

// GET /api/movements — the caller's movement history, aggregated across
// allocations (treasury deposits), paid invoices (pay outflows) and transfers
// (sends / deposits received), newest first.
// ponytail: aggregated on read from the source tables — no separate ledger to
// keep in sync. Fine at demo volume; index/materialise if history grows large.
movementsRoute.get("/", async (c) => {
  const user = c.get("user");

  const [allocRows, invoiceRows, transferRows] = await Promise.all([
    db.select().from(allocations).where(eq(allocations.userId, user.id)),
    db.select().from(invoices).where(eq(invoices.userId, user.id)),
    db.select().from(transfers).where(eq(transfers.userId, user.id)),
  ]);

  const movements: Movement[] = [
    ...allocRows.map((a): Movement => ({
      id: `alloc:${a.id}`,
      type: "treasury_deposit",
      sign: "+",
      amount: a.amount,
      counterparty: null,
      txId: a.depositTx,
      method: null,
      label: a.name,
      scheduleId: null,
      createdAt: a.createdAt.toISOString(),
    })),
    ...invoiceRows
      .filter((inv) => inv.status === "paid")
      .map((inv): Movement => ({
        id: `inv:${inv.id}`,
        type: "pay",
        sign: "-",
        amount: inv.amount,
        counterparty: inv.payTo,
        txId: inv.paymentTx,
        method: inv.method,
        label: inv.title,
        scheduleId: null,
        createdAt: inv.createdAt.toISOString(),
      })),
    ...transferRows.map((t): Movement => ({
      id: `xfer:${t.id}`,
      type: t.direction === "in" ? "deposit" : "send",
      sign: t.direction === "in" ? "+" : "-",
      amount: t.amount,
      counterparty: t.counterparty,
      txId: t.txId,
      method: null,
      label: null,
      scheduleId: t.scheduleId,
      createdAt: t.createdAt.toISOString(),
    })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return c.json(movements);
});

// POST /api/movements { direction, counterparty, amount, txId? } — record a
// wallet transfer (called after a send confirms on-chain).
movementsRoute.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req
    .json<{ direction?: string; counterparty?: string; amount?: string; txId?: string }>()
    .catch(() => ({}) as Record<string, string>);

  const direction = body.direction === "in" ? "in" : "out";
  const counterparty = body.counterparty?.trim();
  if (!counterparty) {
    throw new HTTPException(400, { message: "counterparty is required" });
  }
  if (typeof body.amount !== "string" || !DECIMAL.test(body.amount) || Number(body.amount) <= 0) {
    throw new HTTPException(400, { message: "amount must be a positive decimal string" });
  }

  const [row] = await db
    .insert(transfers)
    .values({
      userId: user.id,
      direction,
      counterparty,
      amount: body.amount,
      txId: body.txId?.trim() || null,
    })
    .returning();

  return c.json(row, 201);
});
