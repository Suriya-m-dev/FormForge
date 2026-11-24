import type { Types } from "mongoose";

import type {
  FieldType,
  FormStatus,
} from "./form.constants.js";

export type { FieldType, FormStatus };

export interface IFieldOption {
  label: string;
  value: string;
}

export interface IFieldValidations {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
}

export interface IFormField {
  id: string;
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  defaultValue?: unknown;
  required: boolean;
  options?: IFieldOption[];
  validations?: IFieldValidations;
  order: number;
}

export interface IPublishedSnapshot {
  version: number;
  name: string;
  description?: string;
  fields: IFormField[];
  publishedAt: Date;
}

export interface IForm {
  name: string;
  description?: string;
  fields: IFormField[];
  status: FormStatus;
  version: number;
  publishedSnapshot?: IPublishedSnapshot;
  createdBy: Types.ObjectId;
}
