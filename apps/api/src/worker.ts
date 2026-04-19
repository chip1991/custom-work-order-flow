import { env } from "./env";
import { prisma } from "./db";
import { logger } from "./logger";
import { startRunWorker } from "./engine/worker";

const worker = startRunWorker({
  prisma,
  logger,
  pollIntervalMs: env.workerPollIntervalMs,
  concurrency: env.workerConcurrency
});

logger.info(
  {
    pollIntervalMs: env.workerPollIntervalMs,
    concurrency: env.workerConcurrency
  },
  "worker_started"
);

function shutdown(signal: string) {
  logger.info({ signal }, "worker_shutdown_start");
  worker.stop();
  prisma
    .$disconnect()
    .catch((err) => {
      logger.error({ err }, "prisma_disconnect_error");
    })
    .finally(() => {
      logger.info("worker_shutdown_done");
    });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
