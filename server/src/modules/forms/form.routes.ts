import { Router } from "express";

import { formController } from "./form.controller.js";
import {
  createFormSchema,
  updateFormSchema,
} from "./form.validation.js";

import { validateBody } from "../../middlewares/validate.middleware.js";
import { authenticateMiddleware } from "../../middlewares/authenticate.middleware.js";
import { authorizeMiddleware } from "../../middlewares/authorize.middleware.js";

const router = Router();

// All form management routes require an authenticated admin.
router.use(authenticateMiddleware);
router.use(authorizeMiddleware("ADMIN"));

// Create a form
router.post(
  "/",
  validateBody(createFormSchema.shape.body),
  formController.createForm,
);

// List forms
router.get("/", formController.getForms);

// Get a single form
router.get("/:id", formController.getFormById);

// Update a form
router.put(
  "/:id",
  validateBody(updateFormSchema.shape.body),
  formController.updateForm,
);

// Publish a form
router.patch("/:id/publish", formController.publishForm);

// Archive a form
router.delete("/:id", formController.archiveForm);

export default router;
