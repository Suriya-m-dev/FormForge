import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { pinoHttp } from "pino-http";
import { env } from "./config/environment.js";
import { logger } from "./config/logger.js";

import { apiRateLimiter } from "./middlewares/rateLimit.middleware.js";
import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

import apiRoutes from "./routes/index.js";

const app = express();

app.disable("x-powered-by");

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts:
      env.NODE_ENV === "production"
        ? { maxAge: 15552000, includeSubDomains: true }
        : false,
  }),
);

// Request logging
app.use(pinoHttp({ logger }));

// CORS
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

// Request parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Cookie parsing
app.use(cookieParser(env.COOKIE_SECRET));

// General API rate limiting
app.use("/api", apiRateLimiter);

// Versioned routes
app.use("/api/v1", apiRoutes);

// Error handling (must remain after routes)
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
