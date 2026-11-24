import { Router } from "express";

import healthRoutes from "./health.routes.js";
import authRoutes from "../modules/auth/auth.routes.js";
import formRoutes from "../modules/forms/form.routes.js";
import publicFormRoutes from "../modules/forms/public-form.routes.js";
import submissionRoutes from "../modules/submissions/submission.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/forms", formRoutes);
router.use("/public/forms", publicFormRoutes);
router.use("/submissions", submissionRoutes);

export default router;
