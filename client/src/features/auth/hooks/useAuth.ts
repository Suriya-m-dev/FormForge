import { useGetMeQuery } from "../api/authApi";

export const useAuth = () => {
  const { data, isLoading, isError } = useGetMeQuery();

  return {
    user: data?.data ?? null,
    isLoading,
    isAuthenticated: Boolean(data?.data),
    isError,
  };
};