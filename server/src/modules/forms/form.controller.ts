import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { ApiResponse } from "../../shared/responses/ApiResponse.js";
import { AppError } from "../../shared/errors/AppError.js";
import { formService } from "./form.service.js";
import type { FormStatus } from "./form.types.js";
import { FORM_STATUSES } from "./form.constants.js";

const parseQueryInteger = (
  value: unknown,
  fieldName: string,
  defaultValue: number,
  max?: number,
): number => {
  if (value === undefined) {
    return defaultValue;
  }

  if (typeof value !== "string" || !/^\d+$/.test(value)) {
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

export const formController = {
  createForm: asyncHandler(async (req: Request, res: Response) => {
    const form = await formService.createForm(
      req.user!.id,
      req.body,
    );

    res.status(201).json(
      ApiResponse.success("Form created successfully", form),
    );
  }),

  getForms: asyncHandler(async (req: Request, res: Response) => {
    const page = parseQueryInteger(req.query.page, "page", 1);

    const limit = parseQueryInteger(
      req.query.limit,
      "limit",
      10,
      100,
    );

    // Prevent unsafe pagination offsets.
    if (!Number.isSafeInteger((page - 1) * limit)) {
      throw new AppError("Pagination offset is too large", 400);
    }

    const rawStatus = req.query.status;

    if (
      rawStatus !== undefined &&
      (
        typeof rawStatus !== "string" ||
        !FORM_STATUSES.includes(rawStatus as FormStatus)
      )
    ) {
      throw new AppError("Invalid form status", 400);
    }

    const rawSearch = req.query.search;

    if (rawSearch !== undefined && typeof rawSearch !== "string") {
      throw new AppError("Search must be a string", 400);
    }

    const search = rawSearch?.trim();

    if (search && search.length > 100) {
      throw new AppError("Search cannot exceed 100 characters", 400);
    }

    const status = rawStatus as FormStatus | undefined;

    const result = await formService.getForms(req.user!.id, {
      page,
      limit,
      status,
      search,
    });

    res.status(200).json(
      ApiResponse.success("Forms fetched successfully", result),
    );
  }),

  getFormById: asyncHandler(async (req: Request, res: Response) => {
    const form = await formService.getFormById(
      req.params.id as string,
      req.user!.id,
    );

    res.status(200).json(
      ApiResponse.success("Form fetched successfully", form),
    );
  }),

  updateForm: asyncHandler(async (req: Request, res: Response) => {
    const form = await formService.updateForm(
      req.params.id as string,
      req.user!.id,
      req.body,
    );

    res.status(200).json(
      ApiResponse.success("Form updated successfully", form),
    );
  }),

  publishForm: asyncHandler(async (req: Request, res: Response) => {
    const form = await formService.publishForm(
      req.params.id as string,
      req.user!.id,
    );

    res.status(200).json(
      ApiResponse.success("Form published successfully", form),
    );
  }),

  archiveForm: asyncHandler(async (req: Request, res: Response) => {
    const form = await formService.archiveForm(
      req.params.id as string,
      req.user!.id,
    );

    res.status(200).json(
      ApiResponse.success("Form archived successfully", form),
    );
  }),
};
