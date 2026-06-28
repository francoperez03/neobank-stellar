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
