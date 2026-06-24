import { cors } from "hono/cors";
import { getConnInfo } from "hono/bun";
import { rateLimiter } from "hono-rate-limiter";
import { env } from "../env";

export const corsMiddleware = cors({
  origin: env.webOrigin,
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: ["Content-Type"],
});

// Tighter limit on routes that move money. Webhooks (Crossmint calling us,
// not a browser) are excluded — signature verification + dedup guard those.
//
// Keyed off the actual TCP peer address (hono/bun's getConnInfo), not the
// client-supplied X-Forwarded-For header — that header is fully attacker
// controlled with no proxy in front, so keying on it let any caller reset
// their own limit on every request. If a reverse proxy is introduced later,
// this will key on the proxy's address for every caller behind it; at that
// point switch to the proxy's own trusted-forwarded-IP mechanism instead of
// reading X-Forwarded-For directly.
export const moneyRouteRateLimiter = rateLimiter({
  windowMs: 60_000,
  limit: 20,
  keyGenerator: (c) => getConnInfo(c).remote.address ?? "unknown",
});
