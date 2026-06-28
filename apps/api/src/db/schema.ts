import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id:              uuid("id").primaryKey().defaultRandom(),
  crossmintUserId: text("crossmint_user_id").unique().notNull(),
  email:           text("email"),
  stellarAddress:  text("stellar_address"),
  kycStatus:       text("kyc_status").default("pending").notNull(),
  createdAt:       timestamp("created_at").defaultNow().notNull(),
  updatedAt:       timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Treasury allocations: a per-user accounting split over the single on-chain
// DeFindex vault. The vault position is the source of truth for the money;
// allocations only label how a company earmarks it (Operating reserve, etc.).
export const allocations = pgTable("allocations", {
  id:        uuid("id").primaryKey().defaultRandom(),
  userId:    uuid("user_id").references(() => users.id).notNull(),
  name:      text("name").notNull(),
  amount:    text("amount").notNull(),    // human decimal, e.g. "1000.00"
  depositTx: text("deposit_tx"),          // on-chain deposit txId that funded it
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Allocation = typeof allocations.$inferSelect;
export type NewAllocation = typeof allocations.$inferInsert;

// Invoice intake link: a company generates a token and shares /pay/:token with
// a supplier, who uploads their invoice against it without logging in.
export const invoiceLinks = pgTable("invoice_links", {
  id:        uuid("id").primaryKey().defaultRandom(),
  userId:    uuid("user_id").references(() => users.id).notNull(), // the company
  token:     text("token").unique().notNull(),                     // goes in /pay/:token
  label:     text("label"),                                        // optional, e.g. "Q3 vendors"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type InvoiceLink = typeof invoiceLinks.$inferSelect;
export type NewInvoiceLink = typeof invoiceLinks.$inferInsert;

// An invoice a supplier submitted against a link. The PDF is stored inline as
// base64 (demo storage — move to object storage for production).
export const invoices = pgTable("invoices", {
  id:        uuid("id").primaryKey().defaultRandom(),
  userId:    uuid("user_id").references(() => users.id).notNull(), // company that owns the link
  linkId:    uuid("link_id").references(() => invoiceLinks.id),
  title:     text("title").notNull(),
  amount:    text("amount").notNull(),                             // decimal string
  method:    text("method").notNull(),                            // 'crypto' | 'wire' | 'sepa'
  payTo:     text("pay_to"),                                       // crypto: Stellar address; fiat: bank details
  status:    text("status").default("pending").notNull(),         // 'pending' | 'paid'
  paymentTx: text("payment_tx"),                                   // txId when paid in crypto
  pdf:       text("pdf"),                                          // base64 of the uploaded PDF
  pdfName:   text("pdf_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
