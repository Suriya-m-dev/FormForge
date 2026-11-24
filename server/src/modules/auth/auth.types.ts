import type { UserRole } from "../users/user.types.js";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface JwtPayload {
  sub: string;
  role: UserRole;
}