import { cors } from "hono/cors";
import { env } from "../env";

export const corsMiddleware = cors({
  origin: env.webOrigin,
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type"],
});
