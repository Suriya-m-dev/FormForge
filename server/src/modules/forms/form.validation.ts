import { z } from "zod";

import { FIELD_TYPES, OPTION_FIELD_TYPES } from "./form.constants.js";

const fieldOptionSchema = z
  .object({
    label: z.string().trim().min(1).max(100),
    value: z.string().trim().min(1).max(100),
  })
  .strict();

const fieldValidationsSchema = z
  .object({
    minLength: z.number().int().min(0).optional(),
    maxLength: z.number().int().min(0).optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().max(500).optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.minLength === undefined ||
      value.maxLength === undefined ||
      value.minLength <= value.maxLength,
    {
      message: "minLength cannot exceed maxLength",
      path: ["minLength"],
    },
  )
  .refine(
    (value) =>
      value.min === undefined || value.max === undefined || value.min <= value.max,
    {
      message: "min cannot exceed max",
      path: ["min"],
    },
  );

export const formFieldSchema = z
  .object({
    id: z.string().trim().min(1).max(100),

    key: z
      .string()
      .trim()
      .toLowerCase()
      .regex(
        /^[a-z][a-z0-9_]*$/,
        "Field key must start with a letter and contain only letters, numbers or underscores",
      ),

    label: z.string().trim().min(1).max(120),

    type: z.enum(FIELD_TYPES),

    placeholder: z.string().max(200).optional(),

    defaultValue: z.unknown().optional(),

    required: z.boolean().default(false),

    options: z.array(fieldOptionSchema).optional(),

    validations: fieldValidationsSchema.optional(),

    order: z.number().int().min(0),
  })
  .strict()
  .superRefine((field, context) => {
    const needsOptions = OPTION_FIELD_TYPES.includes(field.type);

    if (needsOptions && (!field.options || field.options.length === 0)) {
      context.addIssue({
        code: "custom",
        message: "Options are required for SELECT, RADIO and CHECKBOX fields",
        path: ["options"],
      });
    }

    if (!needsOptions && field.options && field.options.length > 0) {
      context.addIssue({
        code: "custom",
        message: "Options are only supported for SELECT, RADIO and CHECKBOX fields",
        path: ["options"],
      });
    }

    if (field.options) {
      const optionValues = field.options.map((option) => option.value);

      if (new Set(optionValues).size !== optionValues.length) {
        context.addIssue({
          code: "custom",
          message: "Option values must be unique",
          path: ["options"],
        });
      }
    }
  });

const fieldsSchema = z
  .array(formFieldSchema)
  .max(100, "A form cannot contain more than 100 fields")
  .superRefine((fields, context) => {
    const keys = fields.map((field) => field.key);
    const ids = fields.map((field) => field.id);

    if (new Set(keys).size !== keys.length) {
      context.addIssue({
        code: "custom",
        message: "Field keys must be unique within a form",
        path: [],
      });
    }

    if (new Set(ids).size !== ids.length) {
      context.addIssue({
        code: "custom",
        message: "Field IDs must be unique within a form",
        path: [],
      });
    }
  });

export const createFormSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(120),

      description: z.string().trim().max(1000).optional(),

      fields: fieldsSchema.default([]),
    })
    .strict(),
});

export const updateFormSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(120).optional(),

      description: z.string().trim().max(1000).optional(),

      fields: fieldsSchema.optional(),
    })
    .strict()
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field must be provided for an update",
    }),
});

export type CreateFormInput = z.infer<typeof createFormSchema>["body"];

export type UpdateFormInput = z.infer<typeof updateFormSchema>["body"];
