import crypto from "node:crypto";
import express from "express";
import { authMiddleware } from "./auth/middleware";
import { errorMiddleware } from "./http/errors";
import { logger } from "./logger";
import { authRouter } from "./routes/auth";
import { datasetsRouter } from "./routes/datasets";
import { evaluationPlansRouter } from "./routes/evaluationPlans";
import { modelVersionsRouter } from "./routes/modelVersions";
import { modelsRouter } from "./routes/models";
import { metricsRouter } from "./routes/metrics";
import { projectsRouter } from "./routes/projects";
import { promptTemplatesRouter } from "./routes/promptTemplates";
import { samplesRouter } from "./routes/samples";
import { runsRouter } from "./routes/runs";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "10mb" }));

  app.use((req, res, next) => {
    const requestId = crypto.randomUUID();
    const start = process.hrtime.bigint();

    res.setHeader("x-request-id", requestId);

    res.on("finish", () => {
      const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
      logger.info(
        {
          requestId,
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          durationMs: Math.round(durationMs * 100) / 100
        },
        "http"
      );
    });

    next();
  });

  app.use(authMiddleware);

  app.get("/health", (_req, res) => {
    res.json({
      ok: true,
      service: "api",
      time: new Date().toISOString()
    });
  });

  app.use("/auth", authRouter);
  app.use("/projects", projectsRouter);
  app.use(modelsRouter);
  app.use(modelVersionsRouter);
  app.use(datasetsRouter);
  app.use(samplesRouter);
  app.use(promptTemplatesRouter);
  app.use(metricsRouter);
  app.use(evaluationPlansRouter);
  app.use(runsRouter);

  app.use(errorMiddleware);

  return app;
}
