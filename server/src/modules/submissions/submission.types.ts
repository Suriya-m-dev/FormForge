import type { Types } from "mongoose";
import type { IPublishedSnapshot } from "../forms/form.types.js";

export interface ISubmission {
  formId: Types.ObjectId;
  formVersion: number;
  formSnapshot: IPublishedSnapshot;
  data: Record<string, unknown>;
  submittedAt: Date;
}
