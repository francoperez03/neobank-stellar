import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { invoiceLinks, invoices } from "../db/schema";
import type { AppEnv } from "../types";

// Public invoice intake — NO auth. Mounted outside the /api/* guard so a
// supplier can submit an invoice with only the link token.
export const publicInvoicesRoute = new Hono<AppEnv>();

const DECIMAL = /^\d+(\.\d+)?$/;
const METHODS = new Set(["crypto", "wire", "sepa"]);
const MAX_PDF_BYTES = 5 * 1024 * 1024; // 5MB

async function resolveLink(token: string) {
  const [link] = await db
    .select()
    .from(invoiceLinks)
    .where(eq(invoiceLinks.token, token));
  if (!link) throw new HTTPException(404, { message: "This invoice link is invalid or expired." });
  return link;
}

// GET /public/invoice-links/:token — minimal metadata so the upload page can render.
publicInvoicesRoute.get("/invoice-links/:token", async (c) => {
  const link = await resolveLink(c.req.param("token"));
  return c.json({ token: link.token, label: link.label });
});

// POST /public/invoice-links/:token/submit — a supplier uploads an invoice (multipart).
publicInvoicesRoute.post("/invoice-links/:token/submit", async (c) => {
  const link = await resolveLink(c.req.param("token"));

  const form = await c.req.parseBody().catch(() => {
    throw new HTTPException(400, { message: "Expected multipart form data" });
  });

  const title = typeof form.title === "string" ? form.title.trim() : "";
  const amount = typeof form.amount === "string" ? form.amount.trim() : "";
  const method = typeof form.method === "string" ? form.method.trim() : "";
  const payTo = typeof form.payTo === "string" ? form.payTo.trim() : "";
  const file = form.pdf;

  if (!title) throw new HTTPException(400, { message: "title is required" });
  if (!DECIMAL.test(amount) || Number(amount) <= 0) {
    throw new HTTPException(400, { message: "amount must be a positive decimal" });
  }
  if (!METHODS.has(method)) {
    throw new HTTPException(400, { message: "method must be crypto, wire or sepa" });
  }
  if (!payTo) {
    throw new HTTPException(400, { message: "payTo is required" });
  }

  let pdf: string | null = null;
  let pdfName: string | null = null;
  if (file instanceof File) {
    if (file.type && file.type !== "application/pdf") {
      throw new HTTPException(400, { message: "file must be a PDF" });
    }
    const buf = Buffer.from(await file.arrayBuffer());
    if (buf.byteLength > MAX_PDF_BYTES) {
      throw new HTTPException(413, { message: "PDF must be 5MB or smaller" });
    }
    pdf = buf.toString("base64");
    pdfName = file.name.replace(/\.pdf$/i, "");
  }

  await db.insert(invoices).values({
    userId: link.userId,
    linkId: link.id,
    title,
    amount,
    method,
    payTo,
    pdf,
    pdfName,
  });

  return c.json({ ok: true });
});
