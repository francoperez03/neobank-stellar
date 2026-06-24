import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../types";
import { logger } from "../lib/logger";

export const requestLogger: MiddlewareHandler<AppEnv> = async (c, next) => {
  const requestId = crypto.randomUUID();
  c.set("requestId", requestId);
  const start = Date.now();

  await next();

  logger.info(
    {
      requestId,
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      durationMs: Date.now() - start,
    },
    "request_completed",
  );
};
