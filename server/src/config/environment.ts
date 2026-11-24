import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  PORT: z.coerce.number().int().positive().default(5000),

  CLIENT_URL: z.string().url(),

  MONGODB_URI: z.string().min(1, "MongoDB URI is required"),

  JWT_SECRET: z.string().min(32, "JWT secret must be at least 32 characters"),

  JWT_EXPIRES_IN: z
    .string()
    .regex(/^[1-9]\d*(s|m|h|d)$/, "JWT_EXPIRES_IN must use s, m, h, or d (example: 1d)")
    .default("1d"),

  COOKIE_SECRET: z.string().min(32, "Cookie secret must be at least 32 characters"),

  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("debug"),
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  console.error(
    "Invalid environment configuration:",
    z.treeifyError(parsedEnvironment.error),
  );

  process.exit(1);
}

export const env = Object.freeze(parsedEnvironment.data);

const durationUnits = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
} as const;

export const JWT_EXPIRES_IN_MS = (() => {
  const match = /^([1-9]\d*)(s|m|h|d)$/.exec(env.JWT_EXPIRES_IN);

  if (!match) {
    throw new Error("Invalid JWT_EXPIRES_IN configuration");
  }

  const amount = Number(match[1]);
  const unit = match[2] as keyof typeof durationUnits;
  const milliseconds = amount * durationUnits[unit];

  if (!Number.isSafeInteger(milliseconds)) {
    throw new Error("JWT_EXPIRES_IN is too large");
  }

  return milliseconds;
})();
