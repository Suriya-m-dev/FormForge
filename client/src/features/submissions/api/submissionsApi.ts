import { baseApi } from "../../../app/baseApi";

import type {
  SubmissionListParams,
  SubmissionListResponse,
  SubmissionDetailResponse,
  SubmissionDeleteResponse,
} from "../types/submission.types";

export const submissionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubmissions: builder.query<
      SubmissionListResponse,
      SubmissionListParams
    >({
      query: ({ formId, page = 1, limit = 10 }) => ({
        url: `/submissions/${formId}`,
        params: { page, limit },
      }),
      providesTags: (result, _error, { formId }) => [
        { type: "Submission", id: `LIST-${formId}` },
        ...(result?.data.submissions.map((submission) => ({
          type: "Submission" as const,
          id: submission._id,
        })) ?? []),
      ],
    }),

    getSubmissionById: builder.query<
      SubmissionDetailResponse,
      { formId: string; submissionId: string }
    >({
      query: ({ formId, submissionId }) =>
        `/submissions/${formId}/${submissionId}`,
      providesTags: (_result, _error, { submissionId }) => [
        { type: "Submission", id: submissionId },
      ],
    }),

    deleteSubmission: builder.mutation<
      SubmissionDeleteResponse,
      { formId: string; submissionId: string }
    >({
      query: ({ formId, submissionId }) => ({
        url: `/submissions/${formId}/${submissionId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { formId, submissionId }) => [
        { type: "Submission", id: submissionId },
        { type: "Submission", id: `LIST-${formId}` },
      ],
    }),
  }),
});

export const {
  useGetSubmissionsQuery,
  useGetSubmissionByIdQuery,
  useDeleteSubmissionMutation,
} = submissionsApi;