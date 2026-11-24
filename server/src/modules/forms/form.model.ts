import mongoose, {
  Schema,
  type Model,
} from "mongoose";

import type {
  IFieldOption,
  IFieldValidations,
  IForm,
  IFormField,
  IPublishedSnapshot,
} from "./form.types.js";

import {
  FIELD_TYPES,
  FORM_STATUSES,
} from "./form.constants.js";

const optionSchema = new Schema<IFieldOption>(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },

    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const validationsSchema = new Schema<IFieldValidations>(
  {
    minLength: Number,
    maxLength: Number,
    min: Number,
    max: Number,
    pattern: String,
  },
  { _id: false },
);

const fieldSchema = new Schema<IFormField>(
  {
    id: {
      type: String,
      required: true,
    },

    key: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    label: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: FIELD_TYPES,
      required: true,
    },

    placeholder: {
      type: String,
      trim: true,
    },

    defaultValue: {
      type: Schema.Types.Mixed,
    },

    required: {
      type: Boolean,
      default: false,
    },

    options: {
      type: [optionSchema],
      default: undefined,
    },

    validations: {
      type: validationsSchema,
      default: undefined,
    },

    order: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const publishedSnapshotSchema = new Schema<IPublishedSnapshot>(
  {
    version: {
      type: Number,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    description: String,

    fields: {
      type: [fieldSchema],
      required: true,
    },

    publishedAt: {
      type: Date,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const formSchema = new Schema<IForm>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    fields: {
      type: [fieldSchema],
      default: [],
    },

    status: {
      type: String,
      enum: FORM_STATUSES,
      default: "DRAFT",
      required: true,
    },

    version: {
      type: Number,
      default: 0,
      min: 0,
    },

    publishedSnapshot: {
      type: publishedSnapshotSchema,
      default: undefined,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Index for admin form listing.
formSchema.index({ status: 1, createdAt: -1 });

// Index for finding forms owned by a particular admin.
formSchema.index({ createdBy: 1, createdAt: -1 });

export const Form: Model<IForm> =
  mongoose.models.Form ||
  mongoose.model<IForm>("Form", formSchema);
