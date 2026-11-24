import { Types } from "mongoose";
import { AppError } from "../../shared/errors/AppError.js";
import { formRepository } from "./form.repository.js";
import type { IForm, FormStatus } from "./form.types.js";

interface CreateFormInput {
  name: string;
  description?: string;
  fields: IForm["fields"];
}

interface UpdateFormInput {
  name?: string;
  description?: string;
  fields?: IForm["fields"];
}

interface ListFormsInput {
  page: number;
  limit: number;
  status?: FormStatus;
  search?: string;
}

const ensureValidId = (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid form ID", 400);
  }
};

const getOwnedForm = async (id: string, userId: string) => {
  ensureValidId(id);

  const form = await formRepository.findById(id);

  if (!form) {
    throw new AppError("Form not found", 404);
  }

  if (form.createdBy.toString() !== userId) {
    throw new AppError("You are not allowed to access this form", 403);
  }

  return form;
};

export const formService = {
  async createForm(userId: string, input: CreateFormInput) {
    return formRepository.create({
      ...input,
      status: "DRAFT",
      version: 0,
      createdBy: new Types.ObjectId(userId),
    });
  },

  async getForms(userId: string, params: ListFormsInput) {
    return formRepository.findAll(userId, params);
  },

  async getFormById(id: string, userId: string) {
    return getOwnedForm(id, userId);
  },

  async updateForm(
    id: string,
    userId: string,
    input: UpdateFormInput,
  ) {
    const form = await getOwnedForm(id, userId);

    if (form.status === "ARCHIVED") {
      throw new AppError("Archived forms cannot be edited", 400);
    }

    const updatedForm = await formRepository.updateById(id, input);

    if (!updatedForm) {
      throw new AppError("Unable to update form", 500);
    }

    return updatedForm;
  },

  async publishForm(id: string, userId: string) {
    const form = await getOwnedForm(id, userId);

    if (form.status === "ARCHIVED") {
      throw new AppError("Archived forms cannot be published", 400);
    }

    if (form.fields.length === 0) {
      throw new AppError(
        "Add at least one field before publishing",
        400,
      );
    }

    const nextVersion = form.version + 1;
    const currentForm = form.toObject();

    const publishedSnapshot = {
      version: nextVersion,
      name: currentForm.name,
      description: currentForm.description,
      fields: currentForm.fields,
      publishedAt: new Date(),
    };

    const publishedForm = await formRepository.updateById(id, {
      status: "PUBLISHED",
      version: nextVersion,
      publishedSnapshot,
    });

    if (!publishedForm) {
      throw new AppError("Unable to publish form", 500);
    }

    return publishedForm;
  },

  async archiveForm(id: string, userId: string) {
    const form = await getOwnedForm(id, userId);

    if (form.status === "ARCHIVED") {
      throw new AppError("Form is already archived", 400);
    }

    const archivedForm = await formRepository.updateById(id, {
      status: "ARCHIVED",
    });

    if (!archivedForm) {
      throw new AppError("Unable to archive form", 500);
    }

    return archivedForm;
  },

  async getPublicForm(id: string) {
    ensureValidId(id);

    const form = await formRepository.findPublishedById(id);

    if (!form || !form.publishedSnapshot) {
      throw new AppError("Published form not found", 404);
    }

    return form.publishedSnapshot;
  },
};
