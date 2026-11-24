import { describe, expect, it } from "vitest";

import { AppError } from "../../shared/errors/AppError.js";
import type { IFormField, IPublishedSnapshot } from "../forms/form.types.js";

import { validateSubmissionData } from "./submission.validation.js";

// ---------------------------------------------
// Test helpers
// ---------------------------------------------

const createField = (overrides: Partial<IFormField> = {}): IFormField => ({
  id: "field_fullName",
  key: "fullName",
  label: "Full Name",
  type: "TEXT",
  required: true,
  order: 1,
  ...overrides,
});

const createSnapshot = (fields: IFormField[]): IPublishedSnapshot => ({
  version: 1,
  name: "Test Form",
  fields,
  publishedAt: new Date("2026-11-24T00:00:00.000Z"),
});

const expectAppError = (
  callback: () => unknown,
  expectedMessage: string,
  expectedStatus = 400,
): void => {
  let thrownError: unknown;

  try {
    callback();
  } catch (error) {
    thrownError = error;
  }

  expect(thrownError).toBeInstanceOf(AppError);

  if (thrownError instanceof AppError) {
    expect(thrownError.statusCode).toBe(expectedStatus);
    expect(thrownError.message).toContain(expectedMessage);
  }
};

// ---------------------------------------------
// Submission validation tests
// ---------------------------------------------

describe("validateSubmissionData", () => {
  // -------------------------------------------
  // Valid submissions
  // -------------------------------------------

  describe("valid submissions", () => {
    it("should validate and trim text values", () => {
      const snapshot = createSnapshot([createField()]);

      const result = validateSubmissionData(snapshot, {
        fullName: "  Suriya M  ",
      });

      expect(result).toEqual({
        fullName: "Suriya M",
      });
    });

    it("should validate email values", () => {
      const snapshot = createSnapshot([
        createField({
          key: "email",
          label: "Email",
          type: "EMAIL",
        }),
      ]);

      const result = validateSubmissionData(snapshot, {
        email: "  suriya@example.com  ",
      });

      expect(result.email).toBe("suriya@example.com");
    });

    it("should validate phone values", () => {
      const snapshot = createSnapshot([
        createField({
          key: "phone",
          label: "Phone",
          type: "PHONE",
        }),
      ]);

      const result = validateSubmissionData(snapshot, {
        phone: "+91 98765 43210",
      });

      expect(result.phone).toBe("+91 98765 43210");
    });

    it("should convert numeric strings into numbers", () => {
      const snapshot = createSnapshot([
        createField({
          key: "age",
          label: "Age",
          type: "NUMBER",
        }),
      ]);

      const result = validateSubmissionData(snapshot, {
        age: "24",
      });

      expect(result.age).toBe(24);
    });

    it("should accept valid numeric values", () => {
      const snapshot = createSnapshot([
        createField({
          key: "age",
          label: "Age",
          type: "NUMBER",
        }),
      ]);

      const result = validateSubmissionData(snapshot, {
        age: 24,
      });

      expect(result.age).toBe(24);
    });

    it("should validate date values", () => {
      const snapshot = createSnapshot([
        createField({
          key: "dateOfBirth",
          label: "Date of Birth",
          type: "DATE",
        }),
      ]);

      const result = validateSubmissionData(snapshot, {
        dateOfBirth: "2002-05-15",
      });

      expect(result.dateOfBirth).toBe("2002-05-15");
    });

    it("should validate SELECT options", () => {
      const snapshot = createSnapshot([
        createField({
          key: "department",
          label: "Department",
          type: "SELECT",
          options: [
            { label: "Engineering", value: "engineering" },
            { label: "HR", value: "hr" },
          ],
        }),
      ]);

      const result = validateSubmissionData(snapshot, {
        department: "engineering",
      });

      expect(result.department).toBe("engineering");
    });

    it("should validate RADIO options", () => {
      const snapshot = createSnapshot([
        createField({
          key: "experience",
          label: "Experience",
          type: "RADIO",
          options: [
            { label: "Fresher", value: "fresher" },
            { label: "Experienced", value: "experienced" },
          ],
        }),
      ]);

      const result = validateSubmissionData(snapshot, {
        experience: "experienced",
      });

      expect(result.experience).toBe("experienced");
    });

    it("should validate CHECKBOX options", () => {
      const snapshot = createSnapshot([
        createField({
          key: "skills",
          label: "Skills",
          type: "CHECKBOX",
          required: false,
          options: [
            { label: "React", value: "react" },
            { label: "Node.js", value: "node" },
            { label: "MongoDB", value: "mongodb" },
          ],
        }),
      ]);

      const result = validateSubmissionData(snapshot, {
        skills: ["react", "node"],
      });

      expect(result.skills).toEqual(["react", "node"]);
    });

    it("should validate multiple fields together", () => {
      const snapshot = createSnapshot([
        createField(),
        createField({
          id: "field_email",
          key: "email",
          label: "Email",
          type: "EMAIL",
          order: 2,
        }),
        createField({
          id: "field_age",
          key: "age",
          label: "Age",
          type: "NUMBER",
          order: 3,
        }),
      ]);

      const result = validateSubmissionData(snapshot, {
        fullName: "Suriya",
        email: "suriya@example.com",
        age: "24",
      });

      expect(result).toEqual({
        fullName: "Suriya",
        email: "suriya@example.com",
        age: 24,
      });
    });
  });

  // -------------------------------------------
  // Invalid submission objects
  // -------------------------------------------

  describe("invalid submission objects", () => {
    it("should reject null input", () => {
      const snapshot = createSnapshot([createField()]);

      expectAppError(() => validateSubmissionData(snapshot, null), "valid object");
    });

    it("should reject array input", () => {
      const snapshot = createSnapshot([createField()]);

      expectAppError(() => validateSubmissionData(snapshot, []), "valid object");
    });

    it("should reject string input", () => {
      const snapshot = createSnapshot([createField()]);

      expectAppError(() => validateSubmissionData(snapshot, "invalid"), "valid object");
    });

    it("should reject unexpected properties", () => {
      const snapshot = createSnapshot([createField()]);

      expectAppError(
        () =>
          validateSubmissionData(snapshot, {
            fullName: "Suriya",
            isAdmin: true,
          }),
        "Unexpected field: isAdmin",
      );
    });
  });

  // -------------------------------------------
  // Required and optional fields
  // -------------------------------------------

  describe("required and optional fields", () => {
    it("should reject a missing required field", () => {
      const snapshot = createSnapshot([createField()]);

      expectAppError(() => validateSubmissionData(snapshot, {}), "Full Name is required");
    });

    it("should reject an empty required field", () => {
      const snapshot = createSnapshot([createField()]);

      expectAppError(
        () =>
          validateSubmissionData(snapshot, {
            fullName: "",
          }),
        "Full Name is required",
      );
    });

    it("should reject whitespace-only required values", () => {
      const snapshot = createSnapshot([createField()]);

      expectAppError(
        () =>
          validateSubmissionData(snapshot, {
            fullName: "   ",
          }),
        "Full Name is required",
      );
    });

    it("should allow missing optional fields", () => {
      const snapshot = createSnapshot([
        createField({
          required: false,
        }),
      ]);

      const result = validateSubmissionData(snapshot, {});

      expect(result).toEqual({});
    });

    it("should ignore empty optional fields", () => {
      const snapshot = createSnapshot([
        createField({
          required: false,
        }),
      ]);

      const result = validateSubmissionData(snapshot, {
        fullName: "",
      });

      expect(result).toEqual({});
    });

    it("should allow empty optional checkbox selections", () => {
      const snapshot = createSnapshot([
        createField({
          key: "skills",
          label: "Skills",
          type: "CHECKBOX",
          required: false,
          options: [{ label: "React", value: "react" }],
        }),
      ]);

      const result = validateSubmissionData(snapshot, {
        skills: [],
      });

      expect(result).toEqual({});
    });

    it("should reject an empty required checkbox selection", () => {
      const snapshot = createSnapshot([
        createField({
          key: "skills",
          label: "Skills",
          type: "CHECKBOX",
          required: true,
          options: [{ label: "React", value: "react" }],
        }),
      ]);

      expectAppError(
        () =>
          validateSubmissionData(snapshot, {
            skills: [],
          }),
        "Skills is required",
      );
    });
  });

  // -------------------------------------------
  // Text validation
  // -------------------------------------------

  describe("text validation", () => {
    it("should reject non-string text values", () => {
      const snapshot = createSnapshot([createField()]);

      expectAppError(
        () =>
          validateSubmissionData(snapshot, {
            fullName: 123,
          }),
        "must be a text value",
      );
    });

    it("should enforce minimum text length", () => {
      const snapshot = createSnapshot([
        createField({
          validations: {
            minLength: 3,
          },
        }),
      ]);

      expectAppError(
        () =>
          validateSubmissionData(snapshot, {
            fullName: "AB",
          }),
        "at least 3 characters",
      );
    });

    it("should enforce maximum text length", () => {
      const snapshot = createSnapshot([
        createField({
          validations: {
            maxLength: 5,
          },
        }),
      ]);

      expectAppError(
        () =>
          validateSubmissionData(snapshot, {
            fullName: "Suriya",
          }),
        "cannot exceed 5 characters",
      );
    });

    it("should reject invalid email addresses", () => {
      const snapshot = createSnapshot([
        createField({
          key: "email",
          label: "Email",
          type: "EMAIL",
        }),
      ]);

      expectAppError(
        () =>
          validateSubmissionData(snapshot, {
            email: "invalid-email",
          }),
        "valid email address",
      );
    });

    it("should reject invalid phone numbers", () => {
      const snapshot = createSnapshot([
        createField({
          key: "phone",
          label: "Phone",
          type: "PHONE",
        }),
      ]);

      expectAppError(
        () =>
          validateSubmissionData(snapshot, {
            phone: "abc123",
          }),
        "valid phone number",
      );
    });

    it("should reject phone values without digits", () => {
      const snapshot = createSnapshot([
        createField({
          key: "phone",
          label: "Phone",
          type: "PHONE",
        }),
      ]);

      expectAppError(
        () =>
          validateSubmissionData(snapshot, {
            phone: "--------",
          }),
        "valid phone number",
      );
    });

    it("should enforce custom regex patterns", () => {
      const snapshot = createSnapshot([
        createField({
          validations: {
            pattern: "^[A-Z]+$",
          },
        }),
      ]);

      expectAppError(
        () =>
          validateSubmissionData(snapshot, {
            fullName: "Suriya123",
          }),
        "invalid format",
      );
    });

    it("should reject invalid regex patterns in form configuration", () => {
      const snapshot = createSnapshot([
        createField({
          validations: {
            pattern: "[invalid",
          },
        }),
      ]);

      expectAppError(
        () =>
          validateSubmissionData(snapshot, {
            fullName: "Suriya",
          }),
        "invalid validation pattern",
        500,
      );
    });
  });

  // -------------------------------------------
  // Number validation
  // -------------------------------------------

  describe("number validation", () => {
    const snapshot = createSnapshot([
      createField({
        key: "age",
        label: "Age",
        type: "NUMBER",
        validations: {
          min: 18,
          max: 60,
        },
      }),
    ]);

    it("should reject non-numeric values", () => {
      expectAppError(
        () =>
          validateSubmissionData(snapshot, {
            age: "twenty",
          }),
        "valid number",
      );
    });

    it("should reject values below minimum", () => {
      expectAppError(
        () =>
          validateSubmissionData(snapshot, {
            age: 17,
          }),
        "at least 18",
      );
    });

    it("should reject values above maximum", () => {
      expectAppError(
        () =>
          validateSubmissionData(snapshot, {
            age: 61,
          }),
        "cannot exceed 60",
      );
    });

    it("should reject Infinity", () => {
      expectAppError(
        () =>
          validateSubmissionData(snapshot, {
            age: Infinity,
          }),
        "valid number",
      );
    });
  });

  // -------------------------------------------
  // Date validation
  // -------------------------------------------

  describe("date validation", () => {
    const snapshot = createSnapshot([
      createField({
        key: "dateOfBirth",
        label: "Date of Birth",
        type: "DATE",
      }),
    ]);

    it("should reject incorrect date formats", () => {
      expectAppError(
        () =>
          validateSubmissionData(snapshot, {
            dateOfBirth: "15-05-2002",
          }),
        "YYYY-MM-DD format",
      );
    });

    it("should reject impossible dates", () => {
      expectAppError(
        () =>
          validateSubmissionData(snapshot, {
            dateOfBirth: "2026-02-30",
          }),
        "valid date",
      );
    });
  });

  // -------------------------------------------
  // SELECT and RADIO validation
  // -------------------------------------------

  describe("selection validation", () => {
    const snapshot = createSnapshot([
      createField({
        key: "department",
        label: "Department",
        type: "SELECT",
        options: [
          { label: "Engineering", value: "engineering" },
          { label: "HR", value: "hr" },
        ],
      }),
    ]);

    it("should reject invalid SELECT options", () => {
      expectAppError(
        () =>
          validateSubmissionData(snapshot, {
            department: "finance",
          }),
        "invalid option",
      );
    });

    it("should reject non-string SELECT values", () => {
      expectAppError(
        () =>
          validateSubmissionData(snapshot, {
            department: 123,
          }),
        "valid selection",
      );
    });
  });

  // -------------------------------------------
  // CHECKBOX validation
  // -------------------------------------------

  describe("checkbox validation", () => {
    const snapshot = createSnapshot([
      createField({
        key: "skills",
        label: "Skills",
        type: "CHECKBOX",
        options: [
          { label: "React", value: "react" },
          { label: "Node.js", value: "node" },
        ],
      }),
    ]);

    it("should reject non-array checkbox values", () => {
      expectAppError(
        () =>
          validateSubmissionData(snapshot, {
            skills: "react",
          }),
        "list of selected options",
      );
    });

    it("should reject invalid checkbox options", () => {
      expectAppError(
        () =>
          validateSubmissionData(snapshot, {
            skills: ["react", "angular"],
          }),
        "invalid option",
      );
    });

    it("should reject duplicate checkbox values", () => {
      expectAppError(
        () =>
          validateSubmissionData(snapshot, {
            skills: ["react", "react"],
          }),
        "duplicate selections",
      );
    });

    it("should reject non-string checkbox items", () => {
      expectAppError(
        () =>
          validateSubmissionData(snapshot, {
            skills: ["react", 123],
          }),
        "list of selected options",
      );
    });
  });
});
