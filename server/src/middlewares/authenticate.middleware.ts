import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/environment.js";
import { AppError } from "../shared/errors/AppError.js";
import { USER_ROLES } from "../modules/users/user.types.js";

import type { JwtPayload } from "../modules/auth/auth.types.js";

const AUTH_COOKIE_NAME = "formforge_token";

export const authenticateMiddleware: RequestHandler = (
  req,
  _res,
  next,
) => {
  try {
    const token = req.cookies?.[AUTH_COOKIE_NAME];

    if (!token || typeof token !== "string") {
      throw new AppError("Authentication required", 401);
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (
      typeof decoded === "string" ||
      typeof decoded.sub !== "string" ||
      typeof decoded.role !== "string" ||
      !USER_ROLES.includes(decoded.role as (typeof USER_ROLES)[number])
    ) {
      throw new AppError("Invalid authentication token", 401);
    }

    const payload = decoded as jwt.JwtPayload & JwtPayload;

    req.user = {
      id: payload.sub,
      name: "",
      email: "",
      role: payload.role,
    };

    next();
  } catch {
    next(new AppError("Invalid or expired authentication token", 401));
  }
};