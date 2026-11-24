import type { RequestHandler } from "express";
import rateLimit from "express-rate-limit";

const createLimiter = (options: Parameters<typeof rateLimit>[0]): RequestHandler => {
  if (process.env.NODE_ENV === "test") {
    return (_req, _res, next) => {
      void next();
    };
  }

  return rateLimit(options);
};

export const apiRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

export const authRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

export const submissionRateLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many submissions. Please try again later.",
  },
});
