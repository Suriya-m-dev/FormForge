import type { ErrorRequestHandler } from "express";

import { ZodError } from "zod";
import { AppError } from "../shared/errors/AppError.js";
import { logger } from "../config/logger.js";
import { env } from "../config/environment.js";

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  let statusCode = 500;
  let message = "Internal server error";

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
  }

  logger.error(
    {
      err: error,
      statusCode,
    },
    "Request failed",
  );

  res.status(statusCode).json({
    success: false,
    message,
    ...(error instanceof ZodError && {
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    }),
    ...(env.NODE_ENV === "development" &&
      error instanceof Error && {
        stack: error.stack,
      }),
  });
};
