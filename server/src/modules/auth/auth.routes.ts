import { Router } from "express";

import { authController } from "./auth.controller.js";
import { loginSchema } from "./auth.validation.js";

import { validateBody } from "../../middlewares/validate.middleware.js";
import { authenticateMiddleware } from "../../middlewares/authenticate.middleware.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";

import { authRateLimiter } from "../../middlewares/rateLimit.middleware.js";

const router = Router();

router.post(
  "/login",
  authRateLimiter,
  validateBody(loginSchema.shape.body),
  asyncHandler(authController.login),
);

router.get("/me", authenticateMiddleware, asyncHandler(authController.me));

router.post("/logout", asyncHandler(authController.logout));

export default router;
