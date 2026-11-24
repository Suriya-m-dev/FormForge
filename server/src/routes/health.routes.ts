import { Router } from "express";
import { ApiResponse } from "../shared/responses/ApiResponse.js";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json(
    ApiResponse.success("FormForge API is healthy", {
      status: "OK",
      service: "FormForge API",
      timestamp: new Date().toISOString(),
    }),
  );
});

export default router;
