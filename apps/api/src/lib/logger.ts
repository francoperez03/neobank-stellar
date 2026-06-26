import pino from "pino";
import { env } from "../env";

const { isProduction } = env;

export const logger = pino({
  level: env.logLevel,
  redact: {
    paths: ["*.password", "*.bankAccount"],
    censor: "[redacted]",
  },
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: { colorize: true },
      },
});
