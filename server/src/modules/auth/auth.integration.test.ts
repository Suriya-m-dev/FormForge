import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import bcrypt from "bcrypt";
import request from "supertest";
import type { Express } from "express";

import { User } from "../users/user.model.js";

describe("Authentication Integration Tests", () => {
  let app: Express;
  let agent: ReturnType<typeof request.agent>;

  const testUser = {
    name: "Test Admin",
    email: "admin@test.com",
    password: "TestPassword123!",
  };

  beforeAll(async () => {
    // Import the application only after the test database is initialized.
    const appModule = await import("../../app.js");
    app = appModule.default;
  });

  beforeEach(async () => {
    // The global setup clears the database before this hook.
    const passwordHash = await bcrypt.hash(testUser.password, 12);

    await User.create({
      name: testUser.name,
      email: testUser.email,
      passwordHash,
      role: "ADMIN",
      isActive: true,
    });

    // A fresh agent prevents cookies leaking between tests.
    agent = request.agent(app);
  });

  describe("POST /api/v1/auth/login", () => {
    it("should login with valid credentials and set an HTTP-only cookie", async () => {
      const response = await agent
        .post("/api/v1/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(response.status).toBe(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          user: {
            name: testUser.name,
            email: testUser.email,
            role: "ADMIN",
          },
        },
      });

      const cookies = response.headers["set-cookie"];

      expect(cookies).toBeDefined();

      const cookieHeader = Array.isArray(cookies)
        ? cookies.join("; ")
        : cookies;

      expect(cookieHeader).toContain("formforge_token=");
      expect(cookieHeader).toContain("HttpOnly");
      expect(cookieHeader).toContain("SameSite=Lax");
    });

    it("should reject invalid passwords", async () => {
      const response = await agent
        .post("/api/v1/auth/login")
        .send({
          email: testUser.email,
          password: "WrongPassword123!",
        });

      expect(response.status).toBe(401);
    });

    it("should reject inactive accounts", async () => {
      await User.updateOne(
        { email: testUser.email },
        { $set: { isActive: false } },
      );

      const response = await agent
        .post("/api/v1/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(response.status).toBe(403);
    });
  });

  describe("GET /api/v1/auth/me", () => {
    it("should return the authenticated user's details", async () => {
      await agent.post("/api/v1/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      const response = await agent.get("/api/v1/auth/me");

      expect(response.status).toBe(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          user: {
            name: testUser.name,
            email: testUser.email,
            role: "ADMIN",
          },
        },
      });
    });

    it("should reject requests without authentication", async () => {
      const response = await agent.get("/api/v1/auth/me");

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    it("should clear the authentication cookie and reject subsequent access", async () => {
      await agent.post("/api/v1/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      const logoutResponse = await agent.post("/api/v1/auth/logout");

      expect(logoutResponse.status).toBe(200);

      const cookies = logoutResponse.headers["set-cookie"];

      expect(cookies).toBeDefined();

      const cookieHeader = Array.isArray(cookies)
        ? cookies.join("; ")
        : cookies;

      const clearedCookie = cookieHeader
        .split("; ")
        .find((cookie) => cookie.startsWith("formforge_token="));

      expect(clearedCookie).toBeDefined();

      const meResponse = await agent.get("/api/v1/auth/me");

      expect(meResponse.status).toBe(401);
    });
  });
});
