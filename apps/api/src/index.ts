import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { corsMiddleware } from "./middleware/security";
import { requestLogger } from "./middleware/request-logger";
import { errorHandler } from "./middleware/error-handler";
import { authMiddleware } from "./middleware/auth";
import { health } from "./routes/health";
import { me } from "./routes/me";
import { kyc } from "./routes/kyc";
import type { AppEnv } from "./types";

const app = new Hono<AppEnv>();

app.use(requestLogger);
app.use(corsMiddleware);
app.use(secureHeaders());

app.onError(errorHandler);

app.route("/health", health);

app.use("/api/*", authMiddleware);
app.route("/api/me", me);
app.route("/api/kyc", kyc);

export default app;
