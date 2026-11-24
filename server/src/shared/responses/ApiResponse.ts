export interface ApiResponseData<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export class ApiResponse {
  static success<T>(
    message: string,
    data?: T,
    meta?: Record<string, unknown>,
  ): ApiResponseData<T> {
    return {
      success: true,
      message,
      ...(data !== undefined && { data }),
      ...(meta !== undefined && { meta }),
    };
  }
}
