import type { FormField } from "../../forms/types/form.types";

export interface Submission {
  _id: string;
  formId: string;
  formVersion: number;
  data: Record<string, string | number | string[]>;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionFormSnapshot {
  version: number;
  name: string;
  description: string;
  fields: FormField[];
  publishedAt: string;
}

export interface SubmissionDetail extends Submission {
  formSnapshot: SubmissionFormSnapshot;
}

export interface SubmissionPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SubmissionListData {
  submissions: Submission[];
  pagination: SubmissionPagination;
}

export interface SubmissionListResponse {
  success: boolean;
  message: string;
  data: SubmissionListData;
}

export interface SubmissionDetailResponse {
  success: boolean;
  message: string;
  data: SubmissionDetail;
}

export interface SubmissionDeleteResponse {
  success: boolean;
  message: string;
  data: unknown;
}

export interface SubmissionListParams {
  formId: string;
  page?: number;
  limit?: number;
}