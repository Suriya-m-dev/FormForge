import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import bcrypt from "bcrypt";
import request from "supertest";
import type { Express } from "express";

import { User } from "../users/user.model.js";

describe("Forms Integration Tests", () => {
  let app: Express;
  let agent: ReturnType<typeof request.agent>;

  let formId: string;

  const admin = {
    name: "Form Test Admin",
    email: "forms-admin@test.com",
    password: "TestPassword123!",
  };

  const initialFields = [
    {
      id: "field-name",
      key: "full_name",
      label: "Full Name",
      type: "TEXT",
      placeholder: "Enter your full name",
      required: true,
      order: 0,
    },
    {
      id: "field-department",
      key: "department",
      label: "Department",
      type: "SELECT",
      required: true,
      options: [
        { label: "Engineering", value: "engineering" },
        { label: "Human Resources", value: "hr" },
      ],
      order: 1,
    },
  ];

  beforeAll(async () => {
    const appModule = await import("../../app.js");
    app = appModule.default;
  });

  beforeEach(async () => {
    const passwordHash = await bcrypt.hash(admin.password, 12);

    await User.create({
      name: admin.name,
      email: admin.email,
      passwordHash,
      role: "ADMIN",
      isActive: true,
    });

    agent = request.agent(app);

    const loginResponse = await agent
      .post("/api/v1/auth/login")
      .send({
        email: admin.email,
        password: admin.password,
      });

    expect(loginResponse.status).toBe(200);
  });

  const createTestForm = async () => {
    const response = await agent
      .post("/api/v1/forms")
      .send({
        name: "Employee Registration",
        description: "Employee registration form",
        fields: initialFields,
      });

    expect(response.status).toBe(201);

    formId = response.body.data._id;

    return response;
  };

  describe("POST /api/v1/forms", () => {
    it("should create a new draft form", async () => {
      const response = await createTestForm();

      expect(response.body.data).toMatchObject({
        name: "Employee Registration",
        description: "Employee registration form",
        status: "DRAFT",
        version: 0,
      });

      expect(response.body.data.fields).toHaveLength(2);
    });

    it("should reject form creation without authentication", async () => {
      const response = await request(app)
        .post("/api/v1/forms")
        .send({
          name: "Unauthorized Form",
          fields: initialFields,
        });

      expect(response.status).toBe(401);
    });

    it("should reject invalid form fields", async () => {
      const response = await agent
        .post("/api/v1/forms")
        .send({
          name: "Invalid Form",
          fields: [
            {
              id: "field-1",
              key: "invalid key",
              label: "Invalid Field",
              type: "TEXT",
              required: true,
              order: 0,
            },
          ],
        });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/v1/forms", () => {
    it("should return the admin's forms with pagination", async () => {
      await createTestForm();

      const response = await agent
        .get("/api/v1/forms?page=1&limit=10");

      expect(response.status).toBe(200);
      expect(response.body.data.forms).toHaveLength(1);

      expect(response.body.data.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it("should reject invalid pagination parameters", async () => {
      const response = await agent
        .get("/api/v1/forms?page=1.5");

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/v1/forms/:id", () => {
    it("should return a form by ID", async () => {
      await createTestForm();

      const response = await agent.get(
        `/api/v1/forms/${formId}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe(
        "Employee Registration",
      );
    });

    it("should reject invalid form IDs", async () => {
      const response = await agent.get(
        "/api/v1/forms/invalid-id",
      );

      expect(response.status).toBe(400);
    });
  });

  describe("PUT /api/v1/forms/:id", () => {
    it("should update form details", async () => {
      await createTestForm();

      const response = await agent
        .put(`/api/v1/forms/${formId}`)
        .send({
          name: "Updated Employee Registration",
        });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe(
        "Updated Employee Registration",
      );
    });

    it("should reject empty update requests", async () => {
      await createTestForm();

      const response = await agent
        .put(`/api/v1/forms/${formId}`)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe("PATCH /api/v1/forms/:id/publish", () => {
    it("should publish a form and create a snapshot", async () => {
      await createTestForm();

      const response = await agent.patch(
        `/api/v1/forms/${formId}/publish`,
      );

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe("PUBLISHED");
      expect(response.body.data.version).toBe(1);

      expect(response.body.data.publishedSnapshot).toBeDefined();

      expect(
        response.body.data.publishedSnapshot.fields,
      ).toHaveLength(2);
    });

    it("should reject publishing a form without fields", async () => {
      const createResponse = await agent
        .post("/api/v1/forms")
        .send({
          name: "Empty Form",
          fields: [],
        });

      expect(createResponse.status).toBe(201);

      const emptyFormId = createResponse.body.data._id;

      const response = await agent.patch(
        `/api/v1/forms/${emptyFormId}/publish`,
      );

      expect(response.status).toBe(400);
    });
  });

  describe("Public form access", () => {
    it("should allow public access to a published form without authentication", async () => {
      await createTestForm();

      await agent.patch(`/api/v1/forms/${formId}/publish`);

      const response = await request(app).get(
        `/api/v1/public/forms/${formId}`,
      );

      expect(response.status).toBe(200);

      expect(response.body.data).toMatchObject({
        name: "Employee Registration",
        version: 1,
      });

      expect(response.body.data.fields).toHaveLength(2);
    });

    it("should not expose draft forms publicly", async () => {
      await createTestForm();

      const response = await request(app).get(
        `/api/v1/public/forms/${formId}`,
      );

      expect(response.status).toBe(404);
    });

    it("should preserve the published snapshot after editing the form", async () => {
      await createTestForm();

      await agent.patch(`/api/v1/forms/${formId}/publish`);

      await agent
        .put(`/api/v1/forms/${formId}`)
        .send({
          name: "New Internal Form Name",
        });

      const response = await request(app).get(
        `/api/v1/public/forms/${formId}`,
      );

      expect(response.status).toBe(200);

      // Public users should still see the published version.
      expect(response.body.data.name).toBe(
        "Employee Registration",
      );
    });
  });

  describe("DELETE /api/v1/forms/:id", () => {
    it("should archive a form and block further public access", async () => {
      await createTestForm();

      await agent.patch(`/api/v1/forms/${formId}/publish`);

      const archiveResponse = await agent.delete(
        `/api/v1/forms/${formId}`,
      );

      expect(archiveResponse.status).toBe(200);
      expect(archiveResponse.body.data.status).toBe("ARCHIVED");

      const publicResponse = await request(app).get(
        `/api/v1/public/forms/${formId}`,
      );

      expect(publicResponse.status).toBe(404);
    });
  });
});
