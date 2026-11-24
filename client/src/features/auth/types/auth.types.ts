export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: AuthUser;
}

export interface MeResponse {
  success: boolean;
  message: string;
  data: AuthUser;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
  data: null;
}