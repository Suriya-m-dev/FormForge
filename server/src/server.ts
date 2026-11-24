import "dotenv/config";

import type { Server } from "node:http";

import app from "./app.js";
import { env } from "./config/environment.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { logger } from "./config/logger.js";

let httpServer: Server | undefined;

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    httpServer = app.listen(env.PORT, () => {
      logger.info(`FormForge API running on http://localhost:${env.PORT}`);

      logger.info(`Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    logger.fatal({ err: error }, "Server startup failed");
    process.exit(1);
  }
};

const shutdown = async (signal: string): Promise<void> => {
  logger.info({ signal }, "Graceful shutdown started");

  try {
    if (httpServer) {
      await new Promise<void>((resolve, reject) => {
        httpServer?.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    }

    await disconnectDatabase();

    logger.info("Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, "Shutdown failed");
    process.exit(1);
  }
};

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

void startServer();
