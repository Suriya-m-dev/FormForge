import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { ApiResponse } from "../../shared/responses/ApiResponse.js";
import { AppError } from "../../shared/errors/AppError.js";
import { submissionService } from "./submission.service.js";

const parseQueryInteger = (
  value: unknown,
  fieldName: string,
  defaultValue: number,
  max?: number,
): number => {
  if (value === undefined) {
    return defaultValue;
  }

  if (
    typeof value !== "string" ||
    !/^\d+$/.test(value)
  ) {
    throw new AppError(
      `${fieldName} must be a positive integer`,
      400,
    );
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new AppError(
      `${fieldName} must be a positive integer`,
      400,
    );
  }

  if (max !== undefined && parsed > max) {
    throw new AppError(
      `${fieldName} cannot exceed ${max}`,
      400,
    );
  }

  return parsed;
};

export const submissionController = {
  createSubmission: asyncHandler(async (req: Request, res: Response) => {
    const submission = await submissionService.createSubmission(
      req.params.formId as string,
      req.body,
    );

    res
      .status(201)
      .json(ApiResponse.success("Submission created successfully", submission));
  }),

  getSubmissions: asyncHandler(async (req: Request, res: Response) => {
    const page = parseQueryInteger(req.query.page, "page", 1);

    const limit = parseQueryInteger(req.query.limit, "limit", 10, 100);

    const result = await submissionService.getSubmissions(
      req.params.formId as string,
      req.user!.id,
      page,
      limit,
    );

    res.status(200).json(ApiResponse.success("Submissions fetched successfully", result));
  }),

  getSubmissionById: asyncHandler(async (req: Request, res: Response) => {
    const submission = await submissionService.getSubmissionById(
      req.params.formId as string,
      req.params.submissionId as string,
      req.user!.id,
    );

    res
      .status(200)
      .json(ApiResponse.success("Submission fetched successfully", submission));
  }),

  deleteSubmission: asyncHandler(async (req: Request, res: Response) => {
    const result = await submissionService.deleteSubmission(
      req.params.formId as string,
      req.params.submissionId as string,
      req.user!.id,
    );

    res.status(200).json(ApiResponse.success("Submission deleted successfully", result));
  }),
};
