import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { ApiResponse } from "../../shared/responses/ApiResponse.js";
import { formService } from "./form.service.js";

export const publicFormController = {
  getPublishedForm: asyncHandler(
    async (req: Request, res: Response) => {
      const form = await formService.getPublicForm(
        req.params.formId as string,
      );

      res.status(200).json(
        ApiResponse.success(
          "Published form fetched successfully",
          form,
        ),
      );
    },
  ),
};
