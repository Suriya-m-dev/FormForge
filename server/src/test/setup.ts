import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { beforeAll, afterAll, beforeEach } from "vitest";

// Set required environment variables before importing the application.
process.env.NODE_ENV = "test";
process.env.PORT = "5001";
process.env.CLIENT_URL = "http://localhost:5173";
process.env.JWT_SECRET =
  "formforge-integration-test-jwt-secret-123456";
process.env.JWT_EXPIRES_IN = "1d";
process.env.COOKIE_SECRET =
  "formforge-integration-test-cookie-secret-123456";
process.env.LOG_LEVEL = "silent";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();

  process.env.MONGODB_URI = mongoServer.getUri();

  await mongoose.connect(mongoServer.getUri());
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;

  await Promise.all(
    Object.values(collections).map((collection) =>
      collection.deleteMany({}),
    ),
  );
});

afterAll(async () => {
  await mongoose.disconnect();

  if (mongoServer) {
    await mongoServer.stop();
  }
});
