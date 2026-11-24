import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  credentials: "include",
});

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["Auth", "Form", "Submission"],
  endpoints: () => ({}),
});