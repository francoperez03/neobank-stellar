import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { and, desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db } from "../lib/db";
import { invoiceLinks, invoices } from "../db/schema";
import type { AppEnv } from "../types";

export const invoicesRoute = new Hono<AppEnv>();

// ── Invoice intake links (a company creates them, shares /pay/:token) ──

// POST /api/invoice-links { label? } — create a shareable intake link.
invoicesRoute.post("/links", async (c) => {
  const user = c.get("user");
  const body = await c.req.json<{ label?: string }>().catch(() => ({}) as { label?: string });
  const token = randomUUID().replace(/-/g, "");
  const [row] = await db
    .insert(invoiceLinks)
    .values({ userId: user.id, token, label: body.label?.trim() || null })
    .returning();
  return c.json(row, 201);
});

// GET /api/invoice-links — the company's intake links.
invoicesRoute.get("/links", async (c) => {
  const user = c.get("user");
  const rows = await db
    .select()
    .from(invoiceLinks)
    .where(eq(invoiceLinks.userId, user.id))
    .orderBy(desc(invoiceLinks.createdAt));
  return c.json(rows);
});

// ── Invoices (received via links) ──

// GET /api/invoices — the company's invoices (metadata only, no PDF bytes).
invoicesRoute.get("/", async (c) => {
  const user = c.get("user");
  const rows = await db
    .select({
      id: invoices.id,
      title: invoices.title,
      amount: invoices.amount,
      method: invoices.method,
      payTo: invoices.payTo,
      status: invoices.status,
      paymentTx: invoices.paymentTx,
      pdfName: invoices.pdfName,
      createdAt: invoices.createdAt,
    })
    .from(invoices)
    .where(eq(invoices.userId, user.id))
    .orderBy(desc(invoices.createdAt));
  return c.json(rows);
});

// GET /api/invoices/:id/pdf — stream the stored PDF back as a file.
invoicesRoute.get("/:id/pdf", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const [row] = await db
    .select({ pdf: invoices.pdf, pdfName: invoices.pdfName })
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.userId, user.id)));
  if (!row?.pdf) {
    throw new HTTPException(404, { message: "PDF not found" });
  }
  const bytes = Buffer.from(row.pdf, "base64");
  c.header("Content-Type", "application/pdf");
  c.header("Content-Disposition", `inline; filename="${row.pdfName ?? "invoice"}.pdf"`);
  return c.body(bytes);
});

// PATCH /api/invoices/:id { status, paymentTx? } — mark an invoice paid.
invoicesRoute.patch("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = await c.req
    .json<{ status?: string; paymentTx?: string }>()
    .catch(() => ({}) as { status?: string; paymentTx?: string });

  if (body.status && body.status !== "paid" && body.status !== "pending") {
    throw new HTTPException(400, { message: "status must be 'paid' or 'pending'" });
  }

  const [row] = await db
    .update(invoices)
    .set({
      status: body.status ?? "paid",
      paymentTx: body.paymentTx?.trim() || null,
    })
    .where(and(eq(invoices.id, id), eq(invoices.userId, user.id)))
    .returning();

  if (!row) throw new HTTPException(404, { message: "Invoice not found" });
  return c.json(row);
});
