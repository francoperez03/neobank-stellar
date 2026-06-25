import pino from "pino";
import { env } from "../env";

const isProduction = env.crossmintEnv === "production";

export const logger = pino({
  level: env.logLevel,
  redact: {
    paths: [
      "CROSSMINT_SERVER_API_KEY",
      "CROSSMINT_WEBHOOK_SECRET",
      "*.crossmintServerApiKey",
      "*.crossmintWebhookSecret",
      "*.bankAccount",
      "*.password",
    ],
    censor: "[redacted]",
  },
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: { colorize: true },
      },
});
