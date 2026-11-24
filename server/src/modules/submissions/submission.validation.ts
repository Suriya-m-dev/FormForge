import { AppError } from "../../shared/errors/AppError.js";
import type { IFormField, IPublishedSnapshot } from "../forms/form.types.js";

type SubmissionData = Record<string, unknown>;

const isEmpty = (value: unknown): boolean => {
  return value === undefined || value === null || value === "";
};

const validatePattern = (value: string, pattern?: string): boolean => {
  if (!pattern) return true;

  try {
    return new RegExp(pattern).test(value);
  } catch {
    throw new AppError("The form contains an invalid validation pattern", 500);
  }
};

const validateField = (field: IFormField, value: unknown): unknown => {
  const rules = field.validations;

  switch (field.type) {
    case "TEXT":
    case "TEXTAREA":
    case "EMAIL":
    case "PHONE": {
      if (typeof value !== "string") {
        throw new AppError(`${field.label} must be a text value`, 400);
      }

      const normalized = value.trim();

      if (field.type === "EMAIL" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
        throw new AppError(`${field.label} must be a valid email address`, 400);
      }

      if (field.type === "PHONE" && !/^(?=.*\d)\+?[0-9\s()-]{7,20}$/.test(normalized)) {
        throw new AppError(`${field.label} must be a valid phone number`, 400);
      }

      if (rules?.minLength !== undefined && normalized.length < rules.minLength) {
        throw new AppError(
          `${field.label} must contain at least ${rules.minLength} characters`,
          400,
        );
      }

      if (rules?.maxLength !== undefined && normalized.length > rules.maxLength) {
        throw new AppError(
          `${field.label} cannot exceed ${rules.maxLength} characters`,
          400,
        );
      }

      if (!validatePattern(normalized, rules?.pattern)) {
        throw new AppError(`${field.label} has an invalid format`, 400);
      }

      return normalized;
    }

    case "NUMBER": {
      const numericValue =
        typeof value === "number"
          ? value
          : typeof value === "string" && value.trim() !== ""
            ? Number(value)
            : NaN;

      if (!Number.isFinite(numericValue)) {
        throw new AppError(`${field.label} must be a valid number`, 400);
      }

      if (rules?.min !== undefined && numericValue < rules.min) {
        throw new AppError(`${field.label} must be at least ${rules.min}`, 400);
      }

      if (rules?.max !== undefined && numericValue > rules.max) {
        throw new AppError(`${field.label} cannot exceed ${rules.max}`, 400);
      }

      return numericValue;
    }

    case "DATE": {
      if (typeof value !== "string") {
        throw new AppError(`${field.label} must be a valid date`, 400);
      }

      const datePattern = /^\d{4}-\d{2}-\d{2}$/;

      if (!datePattern.test(value)) {
        throw new AppError(`${field.label} must use YYYY-MM-DD format`, 400);
      }

      const date = new Date(`${value}T00:00:00.000Z`);

      if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
        throw new AppError(`${field.label} must be a valid date`, 400);
      }

      return value;
    }

    case "SELECT":
    case "RADIO": {
      if (typeof value !== "string") {
        throw new AppError(`${field.label} must have a valid selection`, 400);
      }

      const allowedValues = (field.options ?? []).map((option) => option.value);

      if (!allowedValues.includes(value)) {
        throw new AppError(`${field.label} contains an invalid option`, 400);
      }

      return value;
    }

    case "CHECKBOX": {
      if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
        throw new AppError(`${field.label} must contain a list of selected options`, 400);
      }

      const allowedValues = new Set((field.options ?? []).map((option) => option.value));

      const hasInvalidOption = value.some((item) => !allowedValues.has(item));

      if (hasInvalidOption) {
        throw new AppError(`${field.label} contains an invalid option`, 400);
      }

      if (new Set(value).size !== value.length) {
        throw new AppError(`${field.label} contains duplicate selections`, 400);
      }

      return value;
    }

    default: {
      throw new AppError("Unsupported form field type", 400);
    }
  }
};

export const validateSubmissionData = (
  snapshot: IPublishedSnapshot,
  input: unknown,
): SubmissionData => {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new AppError("Submission data must be a valid object", 400);
  }

  const data = input as SubmissionData;
  const allowedKeys = new Set(snapshot.fields.map((field) => field.key));

  // Reject unexpected fields.
  for (const key of Object.keys(data)) {
    if (!allowedKeys.has(key)) {
      throw new AppError(`Unexpected field: ${key}`, 400);
    }
  }

  const validatedData: SubmissionData = {};

  for (const field of snapshot.fields) {
    const value = data[field.key];

    const empty =
      isEmpty(value) ||
      (typeof value === "string" && value.trim() === "") ||
      (field.type === "CHECKBOX" && Array.isArray(value) && value.length === 0);

    if (empty) {
      if (field.required) {
        throw new AppError(`${field.label} is required`, 400);
      }

      continue;
    }

    validatedData[field.key] = validateField(field, value);
  }

  return validatedData;
};
