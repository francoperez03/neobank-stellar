import type { ErrorHandler } from "hono";
import type { AppEnv } from "../types";
import { logger } from "../lib/logger";

export const errorHandler: ErrorHandler<AppEnv> = (err, c) => {
  logger.error(
    { err, requestId: c.get("requestId"), method: c.req.method, path: c.req.path },
    "unhandled_error",
  );
  // Never leak internal error details (stack traces, Crossmint response
  // bodies, etc.) back to the client.
  return c.json({ error: "Internal server error" }, 500);
};
