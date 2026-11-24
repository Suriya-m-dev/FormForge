import { Types } from "mongoose";
import { AppError } from "../../shared/errors/AppError.js";
import { formRepository } from "../forms/form.repository.js";
import { submissionRepository } from "./submission.repository.js";
import { validateSubmissionData } from "./submission.validation.js";

const ensureValidId = (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid ID", 400);
  }
};

const ensureFormOwnership = async (formId: string, userId: string) => {
  ensureValidId(formId);

  const form = await formRepository.findById(formId);

  if (!form) {
    throw new AppError("Form not found", 404);
  }

  if (form.createdBy.toString() !== userId) {
    throw new AppError("You are not allowed to access this form's submissions", 403);
  }

  return form;
};

export const submissionService = {
  async createSubmission(formId: string, input: unknown) {
    ensureValidId(formId);

    const form = await formRepository.findPublishedById(formId);

    if (!form || !form.publishedSnapshot) {
      throw new AppError("Published form not found", 404);
    }

    const snapshot = form.publishedSnapshot;

    const validatedData = validateSubmissionData(snapshot, input);

    return submissionRepository.create({
      formId: form._id,
      formVersion: snapshot.version,
      formSnapshot: snapshot,
      data: validatedData,
      submittedAt: new Date(),
    });
  },

  async getSubmissions(formId: string, userId: string, page: number, limit: number) {
    await ensureFormOwnership(formId, userId);

    return submissionRepository.findAll(formId, page, limit);
  },

  async getSubmissionById(formId: string, submissionId: string, userId: string) {
    // First verify that the admin owns the requested form.
    await ensureFormOwnership(formId, userId);

    ensureValidId(submissionId);

    const submission = await submissionRepository.findById(submissionId);

    if (!submission || submission.formId.toString() !== formId) {
      throw new AppError("Submission not found", 404);
    }

    return submission;
  },

  async deleteSubmission(formId: string, submissionId: string, userId: string) {
    // First verify that the admin owns the requested form.
    await ensureFormOwnership(formId, userId);

    ensureValidId(submissionId);

    const submission = await submissionRepository.findById(submissionId);

    if (!submission || submission.formId.toString() !== formId) {
      throw new AppError("Submission not found", 404);
    }

    await submissionRepository.deleteById(submissionId);

    return {
      id: submissionId,
    };
  },
};
