import type { Request, Response } from "express";

import { env, JWT_EXPIRES_IN_MS } from "../../config/environment.js";
import { ApiResponse } from "../../shared/responses/ApiResponse.js";
import { authService } from "./auth.service.js";

export const AUTH_COOKIE_NAME = "formforge_token";

export const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export const authController = {
  login: async (req: Request, res: Response): Promise<void> => {
    const result = await authService.login(req.body);

    res.cookie(AUTH_COOKIE_NAME, result.token, {
      ...cookieOptions,
      maxAge: JWT_EXPIRES_IN_MS,
    });

    res.status(200).json(
      ApiResponse.success("Login successful", {
        user: result.user,
      }),
    );
  },

  me: async (req: Request, res: Response): Promise<void> => {
    const user = await authService.getCurrentUser(req.user!.id);

    res.status(200).json(ApiResponse.success("User retrieved successfully", { user }));
  },

  logout: async (_req: Request, res: Response): Promise<void> => {
    res.clearCookie(AUTH_COOKIE_NAME, cookieOptions);

    res.status(200).json(ApiResponse.success("Logout successful"));
  },
};
