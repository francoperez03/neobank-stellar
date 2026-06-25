import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { corsMiddleware } from "./middleware/security";
import { requestLogger } from "./middleware/request-logger";
import { errorHandler } from "./middleware/error-handler";
import { health } from "./routes/health";
import type { AppEnv } from "./types";

const app = new Hono<AppEnv>();

app.use(requestLogger);
app.use(corsMiddleware);
app.use(secureHeaders());

app.onError(errorHandler);

app.route("/health", health);

export default app;
