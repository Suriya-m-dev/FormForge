import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import bcrypt from "bcrypt";
import request from "supertest";
import type { Express } from "express";

import { User } from "../users/user.model.js";

describe("Submissions Integration Tests", () => {
  let app: Express;
  let agent: ReturnType<typeof request.agent>;
  let formId: string;
  let submissionId: string;

  const admin = {
    name: "Submission Test Admin",
    email: "submissions-admin@test.com",
    password: "TestPassword123!",
  };

  const initialFields = [
    {
      id: "field-name",
      key: "full_name",
      label: "Full Name",
      type: "TEXT",
      required: true,
      order: 0,
    },
    {
      id: "field-email",
      key: "email",
      label: "Email",
      type: "EMAIL",
      required: true,
      order: 1,
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
      order: 2,
    },
  ];

  const validSubmission = {
    full_name: "Suriya M",
    email: "suriya@example.com",
    department: "engineering",
  };

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

  const publishTestForm = async () => {
    await createTestForm();

    const response = await agent.patch(
      `/api/v1/forms/${formId}/publish`,
    );

    expect(response.status).toBe(200);

    return response;
  };

  const createTestSubmission = async () => {
    await publishTestForm();

    const response = await request(app)
      .post(`/api/v1/submissions/${formId}`)
      .send(validSubmission);

    expect(response.status).toBe(201);

    submissionId = response.body.data._id;

    return response;
  };

  describe("POST /api/v1/submissions/:formId", () => {
    it("should create a submission for a published form", async () => {
      await publishTestForm();

      const response = await request(app)
        .post(`/api/v1/submissions/${formId}`)
        .send(validSubmission);

      expect(response.status).toBe(201);

      expect(response.body.data).toMatchObject({
        formId,
        formVersion: 1,
        data: validSubmission,
      });

      expect(response.body.data._id).toBeDefined();
      expect(response.body.data.submittedAt).toBeDefined();
    });

    it("should allow public submission without authentication", async () => {
      await publishTestForm();

      const response = await request(app)
        .post(`/api/v1/submissions/${formId}`)
        .send(validSubmission);

      expect(response.status).toBe(201);
    });

    it("should reject submissions for draft forms", async () => {
      await createTestForm();

      const response = await request(app)
        .post(`/api/v1/submissions/${formId}`)
        .send(validSubmission);

      expect(response.status).toBe(404);
    });

    it("should reject submissions for archived forms", async () => {
      await publishTestForm();

      const archiveResponse = await agent.delete(
        `/api/v1/forms/${formId}`,
      );

      expect(archiveResponse.status).toBe(200);

      const response = await request(app)
        .post(`/api/v1/submissions/${formId}`)
        .send(validSubmission);

      expect(response.status).toBe(404);
    });

    it("should reject an invalid form ID", async () => {
      const response = await request(app)
        .post("/api/v1/submissions/invalid-id")
        .send(validSubmission);

      expect(response.status).toBe(400);
    });

    it("should reject a submission with missing required fields", async () => {
      await publishTestForm();

      const response = await request(app)
        .post(`/api/v1/submissions/${formId}`)
        .send({
          full_name: "Suriya M",
          department: "engineering",
        });

      expect(response.status).toBe(400);
    });

    it("should reject an invalid email address", async () => {
      await publishTestForm();

      const response = await request(app)
        .post(`/api/v1/submissions/${formId}`)
        .send({
          ...validSubmission,
          email: "invalid-email",
        });

      expect(response.status).toBe(400);
    });

    it("should reject an invalid select option", async () => {
      await publishTestForm();

      const response = await request(app)
        .post(`/api/v1/submissions/${formId}`)
        .send({
          ...validSubmission,
          department: "finance",
        });

      expect(response.status).toBe(400);
    });

    it("should reject unexpected submission fields", async () => {
      await publishTestForm();

      const response = await request(app)
        .post(`/api/v1/submissions/${formId}`)
        .send({
          ...validSubmission,
          isAdmin: true,
        });

      expect(response.status).toBe(400);
    });

    it("should reject a non-object submission body", async () => {
      await publishTestForm();

      const response = await request(app)
        .post(`/api/v1/submissions/${formId}`)
        .send(["invalid", "payload"]);

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/v1/submissions/:formId", () => {
    it("should return submissions with pagination", async () => {
      await createTestSubmission();

      const response = await agent.get(
        `/api/v1/submissions/${formId}?page=1&limit=10`,
      );

      expect(response.status).toBe(200);
      expect(response.body.data.submissions).toHaveLength(1);

      expect(response.body.data.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it("should reject access without authentication", async () => {
      await createTestSubmission();

      const response = await request(app).get(
        `/api/v1/submissions/${formId}`,
      );

      expect(response.status).toBe(401);
    });

    it("should reject invalid pagination parameters", async () => {
      await createTestSubmission();

      const response = await agent.get(
        `/api/v1/submissions/${formId}?page=1.5`,
      );

      expect(response.status).toBe(400);
    });

    it("should reject invalid form IDs", async () => {
      const response = await agent.get(
        "/api/v1/submissions/invalid-id",
      );

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/v1/submissions/:formId/:submissionId", () => {
    it("should return a submission by ID", async () => {
      await createTestSubmission();

      const response = await agent.get(
        `/api/v1/submissions/${formId}/${submissionId}`,
      );

      expect(response.status).toBe(200);

      expect(response.body.data).toMatchObject({
        _id: submissionId,
        formId,
        data: validSubmission,
      });
    });

    it("should reject access without authentication", async () => {
      await createTestSubmission();

      const response = await request(app).get(
        `/api/v1/submissions/${formId}/${submissionId}`,
      );

      expect(response.status).toBe(401);
    });

    it("should reject invalid submission IDs", async () => {
      await createTestSubmission();

      const response = await agent.get(
        `/api/v1/submissions/${formId}/invalid-id`,
      );

      expect(response.status).toBe(400);
    });

    it("should return 404 when the submission belongs to another form", async () => {
      await createTestSubmission();

      const secondFormResponse = await agent
        .post("/api/v1/forms")
        .send({
          name: "Another Form",
          fields: initialFields,
        });

      expect(secondFormResponse.status).toBe(201);

      const anotherFormId = secondFormResponse.body.data._id;

      const response = await agent.get(
        `/api/v1/submissions/${anotherFormId}/${submissionId}`,
      );

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/v1/submissions/:formId/:submissionId", () => {
    it("should delete a submission", async () => {
      await createTestSubmission();

      const response = await agent.delete(
        `/api/v1/submissions/${formId}/${submissionId}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(submissionId);

      const detailResponse = await agent.get(
        `/api/v1/submissions/${formId}/${submissionId}`,
      );

      expect(detailResponse.status).toBe(404);
    });

    it("should reject deletion without authentication", async () => {
      await createTestSubmission();

      const response = await request(app).delete(
        `/api/v1/submissions/${formId}/${submissionId}`,
      );

      expect(response.status).toBe(401);
    });

    it("should not delete a submission through another form ID", async () => {
      await createTestSubmission();

      const secondFormResponse = await agent
        .post("/api/v1/forms")
        .send({
          name: "Another Form",
          fields: initialFields,
        });

      expect(secondFormResponse.status).toBe(201);

      const anotherFormId = secondFormResponse.body.data._id;

      const response = await agent.delete(
        `/api/v1/submissions/${anotherFormId}/${submissionId}`,
      );

      expect(response.status).toBe(404);

      // Verify that the original submission still exists.
      const detailResponse = await agent.get(
        `/api/v1/submissions/${formId}/${submissionId}`,
      );

      expect(detailResponse.status).toBe(200);
    });
  });
});
