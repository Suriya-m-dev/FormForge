import { Router } from "express";
import { submissionController } from "./submission.controller.js";
import { authenticateMiddleware } from "../../middlewares/authenticate.middleware.js";
import { authorizeMiddleware } from "../../middlewares/authorize.middleware.js";
import { submissionRateLimiter } from "../../middlewares/rateLimit.middleware.js";

const router = Router();

// Public submission endpoint.
router.post(
  "/:formId",
  submissionRateLimiter,
  submissionController.createSubmission,
);

// Admin-only submission management.
router.use(authenticateMiddleware);
router.use(authorizeMiddleware("ADMIN"));

router.get(
  "/:formId",
  submissionController.getSubmissions,
);

router.get(
  "/:formId/:submissionId",
  submissionController.getSubmissionById,
);

router.delete(
  "/:formId/:submissionId",
  submissionController.deleteSubmission,
);

export default router;
