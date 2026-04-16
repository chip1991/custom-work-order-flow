import { createServer } from "node:http";
import { createApp } from "./app";
import { prisma } from "./db";
import { env } from "./env";
import { logger } from "./logger";
import { startRunWorker } from "./engine/worker";

const app = createApp();
const server = createServer(app);

server.listen(env.port, () => {
  logger.info({ port: env.port }, "api_listening");
});

if (env.runWorkerInProcess) {
  startRunWorker({
    prisma,
    logger,
    pollIntervalMs: env.workerPollIntervalMs,
    concurrency: env.workerConcurrency
  });
}

function shutdown(signal: string) {
  logger.info({ signal }, "shutdown_start");
  server.close((err) => {
    if (err) {
      logger.error({ err }, "shutdown_error");
      process.exitCode = 1;
    }
    prisma
      .$disconnect()
      .catch((disconnectErr) => {
        logger.error({ err: disconnectErr }, "prisma_disconnect_error");
      })
      .finally(() => {
        logger.info("shutdown_done");
      });
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
