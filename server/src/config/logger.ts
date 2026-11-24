import pino from "pino";
import { env } from "./environment.js";

export const logger = pino({
  level: env.LOG_LEVEL,

  transport:
    env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,

  redact: {
    paths: [
      "password",
      "passwordHash",
      "token",
      "authorization",
      "cookie",
      "headers.authorization",
      "headers.cookie",
    ],
    censor: "[REDACTED]",
  },
});
