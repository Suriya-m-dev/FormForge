import "dotenv/config";

import bcrypt from "bcrypt";

import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { logger } from "../config/logger.js";
import { User } from "../modules/users/user.model.js";

const seedAdmin = async (): Promise<void> => {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD are required in .env",
    );
  }

  if (password.length < 12) {
    throw new Error("Admin password must contain at least 12 characters");
  }

  await connectDatabase();

  const existingAdmin = await User.findOne({ email });

  if (existingAdmin) {
    logger.info("Admin account already exists. No changes made.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await User.create({
    name,
    email,
    passwordHash,
    role: "ADMIN",
    isActive: true,
  });

  logger.info({ email }, "Initial admin account created successfully");
};

try {
  await seedAdmin();
} catch (error) {
  logger.error({ err: error }, "Admin seeding failed");
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}