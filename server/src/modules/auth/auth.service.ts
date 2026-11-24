import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";

import { env } from "../../config/environment.js";
import { AppError } from "../../shared/errors/AppError.js";
import { userRepository } from "../users/user.repository.js";

import type { AuthUser, JwtPayload } from "./auth.types.js";
import type { LoginInput } from "./auth.validation.js";

// const SALT_ROUNDS = 12;

const createToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });
};

const toAuthUser = (user: {
  id: string;
  name: string;
  email: string;
  role: AuthUser["role"];
}): AuthUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const authService = {
  async login(input: LoginInput) {
    const email = input.email.toLowerCase();

    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    if (!user.isActive) {
      throw new AppError("Your account is inactive", 403);
    }

    const passwordMatches = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new AppError("Invalid email or password", 401);
    }

    const authUser = toAuthUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const token = createToken({
      sub: authUser.id,
      role: authUser.role,
    });

    return {
      user: authUser,
      token,
    };
  },

  async getCurrentUser(userId: string) {
    const user = await userRepository.findById(userId);

    if (!user || !user.isActive) {
      throw new AppError("User not found or inactive", 401);
    }

    return toAuthUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  },
};