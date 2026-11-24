import { Router } from "express";
import { publicFormController } from "./public-form.controller.js";

const router = Router();

// Public endpoint — no authentication required.
router.get("/:formId", publicFormController.getPublishedForm);

export default router;
