import { Schema, model } from "mongoose";
import type { ISubmission } from "./submission.types.js";

const submissionSchema = new Schema<ISubmission>(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: "Form",
      required: true,
    },

    formVersion: {
      type: Number,
      required: true,
      min: 1,
    },

    formSnapshot: {
      type: Schema.Types.Mixed,
      required: true,
    },

    data: {
      type: Schema.Types.Mixed,
      required: true,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Efficiently retrieve submissions for one form, newest first.
submissionSchema.index({
  formId: 1,
  submittedAt: -1,
});

export const Submission = model<ISubmission>(
  "Submission",
  submissionSchema,
);
