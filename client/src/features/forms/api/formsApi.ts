import { baseApi } from "../../../app/baseApi";

import type {
  ApiResponse,
  CreateFormRequest,
  Form,
  FormListData,
  FormListParams,
  UpdateFormRequest,
} from "../types/form.types";

export const formsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getForms: builder.query<ApiResponse<FormListData>, FormListParams>({
      query: (params) => ({
        url: "/forms",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.forms.map((form) => ({
                type: "Form" as const,
                id: form._id,
              })),
              { type: "Form" as const, id: "LIST" },
            ]
          : [{ type: "Form" as const, id: "LIST" }],
    }),

    getFormById: builder.query<ApiResponse<Form>, string>({
      query: (id) => `/forms/${id}`,
      providesTags: (_result, _error, id) => [
        { type: "Form", id },
      ],
    }),

    createForm: builder.mutation<ApiResponse<Form>, CreateFormRequest>({
      query: (body) => ({
        url: "/forms",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Form", id: "LIST" }],
    }),

    updateForm: builder.mutation<
      ApiResponse<Form>,
      { id: string; body: UpdateFormRequest }
    >({
      query: ({ id, body }) => ({
        url: `/forms/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Form", id },
        { type: "Form", id: "LIST" },
      ],
    }),

    publishForm: builder.mutation<ApiResponse<Form>, string>({
      query: (id) => ({
        url: `/forms/${id}/publish`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Form", id },
        { type: "Form", id: "LIST" },
      ],
    }),

    archiveForm: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/forms/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Form", id },
        { type: "Form", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetFormsQuery,
  useGetFormByIdQuery,
  useCreateFormMutation,
  useUpdateFormMutation,
  usePublishFormMutation,
  useArchiveFormMutation,
} = formsApi;