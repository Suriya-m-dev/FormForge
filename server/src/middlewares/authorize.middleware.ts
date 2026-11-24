import type { RequestHandler } from "express";
import { AppError } from "../shared/errors/AppError.js";
import type { UserRole } from "../modules/users/user.types.js";

export const authorize = (...allowedRoles: UserRole[]): RequestHandler => {
  return (req, _res, next) => {
    if (!req.user) {
      next(new AppError("Authentication required", 401));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError("You do not have permission to access this resource", 403));
      return;
    }

    next();
  };
};

export const authorizeMiddleware = authorize;
