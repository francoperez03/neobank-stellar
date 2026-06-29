import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { corsMiddleware } from "./middleware/security";
import { requestLogger } from "./middleware/request-logger";
import { errorHandler } from "./middleware/error-handler";
import { authMiddleware } from "./middleware/auth";
import { health } from "./routes/health";
import { me } from "./routes/me";
import { kyc } from "./routes/kyc";
import { vault } from "./routes/vault";
import { allocationsRoute } from "./routes/allocations";
import { invoicesRoute } from "./routes/invoices";
import { movementsRoute } from "./routes/movements";
import { publicInvoicesRoute } from "./routes/public-invoices";
import type { AppEnv } from "./types";

const app = new Hono<AppEnv>();

app.use(requestLogger);
app.use(corsMiddleware);
app.use(secureHeaders());

app.onError(errorHandler);

app.route("/health", health);

// Public invoice intake — NO auth (supplier uploads via link token).
app.route("/public", publicInvoicesRoute);

app.use("/api/*", authMiddleware);
app.route("/api/me", me);
app.route("/api/kyc", kyc);
app.route("/api/vault", vault);
app.route("/api/allocations", allocationsRoute);
app.route("/api/invoices", invoicesRoute);
app.route("/api/movements", movementsRoute);

export default app;
