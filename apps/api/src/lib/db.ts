import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "../env";

const queryClient = postgres(env.db);

export const db = drizzle(queryClient);
