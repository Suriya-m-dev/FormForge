import type { FormField, ApiResponse } from "./form.types";

export interface PublicForm {
  name: string;
  description: string;
  version: number;
  fields: FormField[];
  publishedAt: string;
}

export type PublicFormResponse = ApiResponse<PublicForm>;

export interface SubmitFormRequest {
  [key: string]: string | number | string[] | undefined;
}

export interface SubmitFormResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    formId: string;
    version: number;
    submittedAt: string;
  };
}