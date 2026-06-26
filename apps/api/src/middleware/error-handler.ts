import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AppEnv } from "../types";
import { logger } from "../lib/logger";

export const errorHandler: ErrorHandler<AppEnv> = (err, c) => {
  if (err instanceof HTTPException) {
    const status = err.status;
    // 4xx are expected operational errors — log at warn, not error
    if (status >= 400 && status < 500) {
      logger.warn(
        { requestId: c.get("requestId"), method: c.req.method, path: c.req.path, status, message: err.message },
        "http_error",
      );
      return c.json({ error: err.message }, status);
    }
  }

  logger.error(
    { err, requestId: c.get("requestId"), method: c.req.method, path: c.req.path },
    "unhandled_error",
  );
  return c.json({ error: "Internal server error" }, 500);
};
