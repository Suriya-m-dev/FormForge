export type FormStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type FormFieldType =
  | "TEXT"
  | "EMAIL"
  | "NUMBER"
  | "PHONE"
  | "TEXTAREA"
  | "DATE"
  | "SELECT"
  | "RADIO"
  | "CHECKBOX";

export interface FormFieldValidations {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
}

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  key: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  defaultValue?: unknown;
  required: boolean;
  options?: FormFieldOption[];
  order: number;
  validations?: FormFieldValidations;
}

export interface Form {
  _id: string;
  name: string;
  description?: string;
  fields: FormField[];
  status: FormStatus;
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFormRequest {
  name: string;
  description?: string;
  fields: FormField[];
}

export interface UpdateFormRequest {
  name?: string;
  description?: string;
  fields?: FormField[];
}

export interface FormListParams {
  page?: number;
  limit?: number;
  status?: FormStatus;
  search?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface FormListData {
  forms: Form[];
  pagination: Pagination;
}