import { describe, expect, it } from "vitest";

import {
  createFormSchema,
  updateFormSchema,
  formFieldSchema,
} from "./form.validation.js";

import type { FieldType } from "./form.constants.js";

const createField = (overrides: Record<string, unknown> = {}) => ({
  id: "field-1",
  key: "full_name",
  label: "Full Name",
  type: "TEXT" as FieldType,
  required: true,
  order: 0,
  ...overrides,
});

const createOptionField = (
  type: "SELECT" | "RADIO" | "CHECKBOX",
  overrides: Record<string, unknown> = {},
) =>
  createField({
    type,
    options: [
      { label: "Option A", value: "option_a" },
      { label: "Option B", value: "option_b" },
    ],
    ...overrides,
  });

describe("formFieldSchema", () => {
  describe("valid fields", () => {
    it("should accept a valid TEXT field", () => {
      const result = formFieldSchema.safeParse(createField());

      expect(result.success).toBe(true);
    });

    it("should accept all supported field types", () => {
      const types: FieldType[] = ["TEXT", "EMAIL", "NUMBER", "PHONE", "TEXTAREA", "DATE"];

      for (const type of types) {
        const result = formFieldSchema.safeParse(createField({ type }));

        expect(result.success).toBe(true);
      }
    });

    it("should accept valid SELECT, RADIO and CHECKBOX fields", () => {
      const types = ["SELECT", "RADIO", "CHECKBOX"] as const;

      for (const type of types) {
        const result = formFieldSchema.safeParse(createOptionField(type));

        expect(result.success).toBe(true);
      }
    });

    it("should default required to false when omitted", () => {
      const { required: _required, ...field } = createField();

      const result = formFieldSchema.safeParse(field);

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.required).toBe(false);
      }
    });

    it("should trim and lowercase field keys", () => {
      const result = formFieldSchema.safeParse(createField({ key: "  Full_Name  " }));

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.key).toBe("full_name");
      }
    });

    it("should accept optional placeholder and defaultValue", () => {
      const result = formFieldSchema.safeParse(
        createField({
          placeholder: "Enter your name",
          defaultValue: "Suriya",
        }),
      );

      expect(result.success).toBe(true);
    });

    it("should accept valid field validations", () => {
      const result = formFieldSchema.safeParse(
        createField({
          validations: {
            minLength: 2,
            maxLength: 100,
            pattern: "^[a-zA-Z ]+$",
          },
        }),
      );

      expect(result.success).toBe(true);
    });
  });

  describe("field property validation", () => {
    it("should reject an empty field ID", () => {
      const result = formFieldSchema.safeParse(createField({ id: " " }));

      expect(result.success).toBe(false);
    });

    it("should reject an empty field label", () => {
      const result = formFieldSchema.safeParse(createField({ label: " " }));

      expect(result.success).toBe(false);
    });

    it("should reject an invalid field key", () => {
      const invalidKeys = ["123name", "_name", "full-name", "full name", "name@field"];

      for (const key of invalidKeys) {
        const result = formFieldSchema.safeParse(createField({ key }));

        expect(result.success).toBe(false);
      }
    });

    it("should reject unsupported field types", () => {
      const result = formFieldSchema.safeParse(createField({ type: "FILE" }));

      expect(result.success).toBe(false);
    });

    it("should reject negative field order", () => {
      const result = formFieldSchema.safeParse(createField({ order: -1 }));

      expect(result.success).toBe(false);
    });

    it("should reject non-integer field order", () => {
      const result = formFieldSchema.safeParse(createField({ order: 1.5 }));

      expect(result.success).toBe(false);
    });

    it("should reject unknown field properties", () => {
      const result = formFieldSchema.safeParse(createField({ unexpected: "value" }));

      expect(result.success).toBe(false);
    });
  });

  describe("field options", () => {
    it("should reject SELECT fields without options", () => {
      const result = formFieldSchema.safeParse(createField({ type: "SELECT" }));

      expect(result.success).toBe(false);
    });

    it("should reject RADIO fields without options", () => {
      const result = formFieldSchema.safeParse(createField({ type: "RADIO" }));

      expect(result.success).toBe(false);
    });

    it("should reject CHECKBOX fields without options", () => {
      const result = formFieldSchema.safeParse(createField({ type: "CHECKBOX" }));

      expect(result.success).toBe(false);
    });

    it("should reject empty option arrays", () => {
      const result = formFieldSchema.safeParse(
        createField({
          type: "SELECT",
          options: [],
        }),
      );

      expect(result.success).toBe(false);
    });

    it("should reject options on TEXT fields", () => {
      const result = formFieldSchema.safeParse(
        createField({
          options: [{ label: "Option A", value: "option_a" }],
        }),
      );

      expect(result.success).toBe(false);
    });

    it("should reject duplicate option values", () => {
      const result = formFieldSchema.safeParse(
        createField({
          type: "SELECT",
          options: [
            { label: "Option A", value: "same" },
            { label: "Option B", value: "same" },
          ],
        }),
      );

      expect(result.success).toBe(false);
    });

    it("should detect duplicate option values after trimming", () => {
      const result = formFieldSchema.safeParse(
        createField({
          type: "SELECT",
          options: [
            { label: "Option A", value: "same" },
            { label: "Option B", value: " same " },
          ],
        }),
      );

      expect(result.success).toBe(false);
    });

    it("should reject empty option labels and values", () => {
      const result = formFieldSchema.safeParse(
        createField({
          type: "SELECT",
          options: [{ label: " ", value: "option_a" }],
        }),
      );

      expect(result.success).toBe(false);
    });

    it("should reject unknown option properties", () => {
      const result = formFieldSchema.safeParse(
        createField({
          type: "SELECT",
          options: [
            {
              label: "Option A",
              value: "option_a",
              extra: true,
            },
          ],
        }),
      );

      expect(result.success).toBe(false);
    });
  });

  describe("field validations", () => {
    it("should reject minLength greater than maxLength", () => {
      const result = formFieldSchema.safeParse(
        createField({
          validations: {
            minLength: 20,
            maxLength: 10,
          },
        }),
      );

      expect(result.success).toBe(false);
    });

    it("should reject min greater than max", () => {
      const result = formFieldSchema.safeParse(
        createField({
          validations: {
            min: 100,
            max: 10,
          },
        }),
      );

      expect(result.success).toBe(false);
    });

    it("should reject negative minLength", () => {
      const result = formFieldSchema.safeParse(
        createField({
          validations: {
            minLength: -1,
          },
        }),
      );

      expect(result.success).toBe(false);
    });

    it("should reject non-integer maxLength", () => {
      const result = formFieldSchema.safeParse(
        createField({
          validations: {
            maxLength: 10.5,
          },
        }),
      );

      expect(result.success).toBe(false);
    });

    it("should reject patterns longer than 500 characters", () => {
      const result = formFieldSchema.safeParse(
        createField({
          validations: {
            pattern: "a".repeat(501),
          },
        }),
      );

      expect(result.success).toBe(false);
    });

    it("should reject unknown validation properties", () => {
      const result = formFieldSchema.safeParse(
        createField({
          validations: {
            minLength: 1,
            unknownRule: true,
          },
        }),
      );

      expect(result.success).toBe(false);
    });
  });
});

describe("createFormSchema", () => {
  it("should accept a valid form", () => {
    const result = createFormSchema.safeParse({
      body: {
        name: "Employee Registration",
        description: "Employee details form",
        fields: [createField()],
      },
    });

    expect(result.success).toBe(true);
  });

  it("should default fields to an empty array", () => {
    const result = createFormSchema.safeParse({
      body: {
        name: "Employee Registration",
      },
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.body.fields).toEqual([]);
    }
  });

  it("should trim the form name", () => {
    const result = createFormSchema.safeParse({
      body: {
        name: "  Employee Registration  ",
      },
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.body.name).toBe("Employee Registration");
    }
  });

  it("should reject form names shorter than 2 characters", () => {
    const result = createFormSchema.safeParse({
      body: {
        name: "A",
      },
    });

    expect(result.success).toBe(false);
  });

  it("should reject form names longer than 120 characters", () => {
    const result = createFormSchema.safeParse({
      body: {
        name: "A".repeat(121),
      },
    });

    expect(result.success).toBe(false);
  });

  it("should reject descriptions longer than 1000 characters", () => {
    const result = createFormSchema.safeParse({
      body: {
        name: "Valid Form",
        description: "A".repeat(1001),
      },
    });

    expect(result.success).toBe(false);
  });

  it("should reject more than 100 fields", () => {
    const fields = Array.from({ length: 101 }, (_, index) =>
      createField({
        id: `field-${index}`,
        key: `field_${index}`,
        order: index,
      }),
    );

    const result = createFormSchema.safeParse({
      body: {
        name: "Large Form",
        fields,
      },
    });

    expect(result.success).toBe(false);
  });

  it("should reject duplicate field IDs", () => {
    const result = createFormSchema.safeParse({
      body: {
        name: "Duplicate IDs",
        fields: [
          createField({ id: "same-id", key: "first_name" }),
          createField({ id: "same-id", key: "last_name" }),
        ],
      },
    });

    expect(result.success).toBe(false);
  });

  it("should reject duplicate field keys", () => {
    const result = createFormSchema.safeParse({
      body: {
        name: "Duplicate Keys",
        fields: [
          createField({ id: "field-1", key: "email" }),
          createField({ id: "field-2", key: "email" }),
        ],
      },
    });

    expect(result.success).toBe(false);
  });

  it("should reject duplicate keys after normalization", () => {
    const result = createFormSchema.safeParse({
      body: {
        name: "Normalized Keys",
        fields: [
          createField({ id: "field-1", key: "Email" }),
          createField({ id: "field-2", key: " email " }),
        ],
      },
    });

    expect(result.success).toBe(false);
  });

  it("should reject unknown form properties", () => {
    const result = createFormSchema.safeParse({
      body: {
        name: "Valid Form",
        unexpected: true,
      },
    });

    expect(result.success).toBe(false);
  });
});

describe("updateFormSchema", () => {
  it("should accept a name-only update", () => {
    const result = updateFormSchema.safeParse({
      body: {
        name: "Updated Form",
      },
    });

    expect(result.success).toBe(true);
  });

  it("should accept a description-only update", () => {
    const result = updateFormSchema.safeParse({
      body: {
        description: "Updated description",
      },
    });

    expect(result.success).toBe(true);
  });

  it("should accept a fields-only update", () => {
    const result = updateFormSchema.safeParse({
      body: {
        fields: [createField()],
      },
    });

    expect(result.success).toBe(true);
  });

  it("should reject an empty update body", () => {
    const result = updateFormSchema.safeParse({
      body: {},
    });

    expect(result.success).toBe(false);
  });

  it("should reject invalid fields in an update", () => {
    const result = updateFormSchema.safeParse({
      body: {
        fields: [createField({ key: "123invalid" })],
      },
    });

    expect(result.success).toBe(false);
  });

  it("should reject unknown update properties", () => {
    const result = updateFormSchema.safeParse({
      body: {
        name: "Updated Form",
        status: "PUBLISHED",
      },
    });

    expect(result.success).toBe(false);
  });
});
