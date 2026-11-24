import { baseApi } from "../../../app/baseApi";

import type {
  PublicFormResponse,
  SubmitFormRequest,
  SubmitFormResponse,
} from "../types/publicForm.types";

export const publicFormsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublicForm: builder.query<PublicFormResponse, string>({
      query: (formId) => `/public/forms/${formId}`,
    }),

    submitPublicForm: builder.mutation<
      SubmitFormResponse,
      { formId: string; values: SubmitFormRequest }
    >({
      query: ({ formId, values }) => ({
        url: `/submissions/${formId}`,
        method: "POST",
        body: values,
      }),
    }),
  }),
});

export const {
  useGetPublicFormQuery,
  useSubmitPublicFormMutation,
} = publicFormsApi;