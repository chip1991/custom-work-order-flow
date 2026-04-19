import type { Metric, Prisma, PrismaClient } from "@prisma/client";
import type { Logger } from "pino";
import { Semaphore } from "./semaphore";
import { renderTemplate } from "./template";
import { callChatCompletions } from "./openai";
import { computeMetricResult } from "./metrics";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.length / 4));
}

function computeUsage(args: {
  usage: unknown;
  renderedPrompt: string;
  modelOutput: string;
  costPer1kTokensUsd?: number;
}) {
  const usageRec = asRecord(args.usage) ?? {};
  const promptTokensRaw = usageRec.prompt_tokens ?? usageRec.promptTokens;
  const completionTokensRaw = usageRec.completion_tokens ?? usageRec.completionTokens;
  const totalTokensRaw = usageRec.total_tokens ?? usageRec.totalTokens;

  const promptTokens = Math.round(typeof promptTokensRaw === "number" ? promptTokensRaw : estimateTokens(args.renderedPrompt));
  const completionTokens = Math.round(typeof completionTokensRaw === "number" ? completionTokensRaw : estimateTokens(args.modelOutput));
  const totalTokens = Math.round(typeof totalTokensRaw === "number" ? totalTokensRaw : promptTokens + completionTokens);

  const costPer1k = args.costPer1kTokensUsd ?? null;
  const costUsd = typeof costPer1k === "number" && Number.isFinite(costPer1k) && costPer1k > 0 ? (totalTokens / 1000) * costPer1k : null;

  return { promptTokens, completionTokens, totalTokens, costUsd };
}

function classifyError(err: unknown) {
  if (err instanceof Error) {
    if (err.name === "AbortError") return { errorType: "TIMEOUT" as const, errorMessage: err.message || "AbortError" };
    if (err instanceof SyntaxError) return { errorType: "PARSER_ERROR" as const, errorMessage: err.message };
    if (/Invalid .*model response/i.test(err.message)) return { errorType: "PARSER_ERROR" as const, errorMessage: err.message };
    const m = err.message.match(/\bHTTP\s+(\d{3})\b/i);
    const code = m ? Number(m[1]) : null;
    if (code === 429) return { errorType: "RATE_LIMIT" as const, errorMessage: err.message };
    if (code !== null && code >= 500) return { errorType: "MODEL_ERROR" as const, errorMessage: err.message };
    if (/ECONNRESET|ETIMEDOUT|EAI_AGAIN/i.test(err.message)) return { errorType: "TIMEOUT" as const, errorMessage: err.message };
    return { errorType: "UNKNOWN" as const, errorMessage: err.message };
  }
  return { errorType: "UNKNOWN" as const, errorMessage: String(err) };
}

function getOpenAIConfig(modelVersionConfig: unknown) {
  const c = asRecord(modelVersionConfig) ?? {};
  const headers = (asRecord(c.headers) ?? {}) as Record<string, string>;
  return {
    apiKey: typeof c.apiKey === "string" ? c.apiKey : undefined,
    model: typeof c.model === "string" ? c.model : undefined,
    timeoutMs: typeof c.timeoutMs === "number" ? c.timeoutMs : undefined,
    maxRetries: typeof c.maxRetries === "number" ? c.maxRetries : undefined,
    costPer1kTokensUsd: typeof c.costPer1kTokensUsd === "number" ? c.costPer1kTokensUsd : undefined,
    headers
  };
}

export function startRunWorker(args: {
  prisma: PrismaClient;
  logger: Logger;
  pollIntervalMs: number;
  concurrency: number;
}) {
  let stopped = false;

  async function pollOnce() {
    const run = await args.prisma.evaluationRun.findFirst({
      where: { status: "QUEUED" },
      orderBy: { createdAt: "asc" }
    });
    if (!run) return;

    const claimed = await args.prisma.evaluationRun.updateMany({
      where: { id: run.id, status: "QUEUED" },
      data: { status: "RUNNING", startedAt: new Date() }
    });
    if (claimed.count !== 1) return;

    try {
      await executeRun(run.id);
    } catch (err) {
      args.logger.error({ err, runId: run.id }, "run_execute_failed");
      await args.prisma.evaluationRun.update({
        where: { id: run.id },
        data: { status: "FAILED", finishedAt: new Date(), errorMessage: err instanceof Error ? err.message : String(err) }
      });
    }
  }

  async function executeRun(runId: string) {
    const run = await args.prisma.evaluationRun.findUnique({
      where: { id: runId },
      include: {
        cases: { include: { sample: true } }
      }
    });
    if (!run) return;
    if (run.status === "CANCELED") return;

    const snapshot = asRecord(run.planSnapshot) ?? {};
    const promptTemplate = asRecord(snapshot.promptTemplate) ?? {};
    const template = typeof promptTemplate.template === "string" ? promptTemplate.template : null;
    const modelVersion = asRecord(snapshot.modelVersion) ?? {};
    const baseUrl = typeof modelVersion.baseUrl === "string" ? modelVersion.baseUrl : null;
    const modelVersionConfig = modelVersion.config;

    if (!template) throw new Error("Missing planSnapshot.promptTemplate.template");
    if (!baseUrl) throw new Error("Missing planSnapshot.modelVersion.baseUrl");

    const metricIds = Array.isArray(snapshot.metricIds) ? snapshot.metricIds.map(String) : [];
    const metrics: Metric[] = metricIds.length
      ? await args.prisma.metric.findMany({ where: { id: { in: metricIds } } })
      : [];

    const openaiConfig = getOpenAIConfig(modelVersionConfig);
    const sem = new Semaphore(args.concurrency);

    await Promise.all(
      run.cases.map(async (c) => {
        const release = await sem.acquire();
        try {
          await executeCase({
            runId: run.id,
            runCaseId: c.id,
            sample: c.sample,
            template,
            baseUrl,
            openaiConfig,
            metrics
          });
        } finally {
          release();
        }
      })
    );

    const refreshed = await args.prisma.evaluationRun.findUnique({
      where: { id: run.id },
      include: { cases: { select: { status: true, errorMessage: true } } }
    });
    if (!refreshed) return;
    if (refreshed.status === "CANCELED") return;

    const anyFailed = refreshed.cases.some((c) => c.status === "FAILED");
    const anyCanceled = refreshed.cases.some((c) => c.status === "CANCELED");
    const status = anyCanceled ? "CANCELED" : anyFailed ? "FAILED" : "SUCCEEDED";
    const errorMessage = anyFailed ? refreshed.cases.find((c) => c.status === "FAILED")?.errorMessage ?? null : null;

    await args.prisma.evaluationRun.update({
      where: { id: refreshed.id },
      data: {
        status,
        finishedAt: new Date(),
        errorMessage: errorMessage ?? undefined
      }
    });
  }

  async function executeCase(args2: {
    runId: string;
    runCaseId: string;
    sample: { input: unknown; context: unknown; metadata: unknown };
    template: string;
    baseUrl: string;
    openaiConfig: ReturnType<typeof getOpenAIConfig>;
    metrics: Metric[];
  }) {
    const run = await args.prisma.evaluationRun.findUnique({ where: { id: args2.runId }, select: { status: true } });
    if (!run || run.status === "CANCELED") {
      await args.prisma.runCase.updateMany({
        where: { id: args2.runCaseId, status: { in: ["QUEUED", "RUNNING"] } },
        data: { status: "CANCELED", finishedAt: new Date() }
      });
      return;
    }

    const claimed = await args.prisma.runCase.updateMany({
      where: { id: args2.runCaseId, status: "QUEUED" },
      data: { status: "RUNNING", startedAt: new Date() }
    });
    if (claimed.count !== 1) return;

    const renderedPrompt = renderTemplate(args2.template, {
      input: args2.sample.input,
      context: args2.sample.context ?? undefined,
      metadata: args2.sample.metadata ?? undefined
    });

    try {
      const completion = await callChatCompletions({
        baseUrl: args2.baseUrl,
        prompt: renderedPrompt,
        config: args2.openaiConfig
      });

      const runAfter = await args.prisma.evaluationRun.findUnique({
        where: { id: args2.runId },
        select: { status: true }
      });
      if (!runAfter || runAfter.status === "CANCELED") {
        await args.prisma.runCase.updateMany({
          where: { id: args2.runCaseId, status: "RUNNING" },
          data: { status: "CANCELED", finishedAt: new Date(), renderedPrompt }
        });
        return;
      }

      const metricResults = args2.metrics.map((metric) => {
        const computed = computeMetricResult({
          metric,
          sampleMetadata: args2.sample.metadata,
          renderedPrompt,
          modelOutput: completion.text,
          latencyMs: completion.latencyMs,
          usage: completion.usage,
          defaultCostPer1kTokensUsd: args2.openaiConfig.costPer1kTokensUsd
        });
        return {
          metricId: metric.id,
          score: computed.score,
          valueFloat: computed.valueFloat,
          valueText: computed.valueText,
          valueJson: computed.valueJson == null ? undefined : (computed.valueJson as Prisma.InputJsonValue)
        };
      });

      await args.prisma.$transaction(async (tx) => {
        await tx.runCase.update({
          where: { id: args2.runCaseId },
          data: {
            status: "SUCCEEDED",
            finishedAt: new Date(),
            errorType: "NONE",
            renderedPrompt,
            modelOutput: completion.text,
            errorMessage: null,
            latencyMs: completion.latencyMs,
            ...computeUsage({
              usage: completion.usage,
              renderedPrompt,
              modelOutput: completion.text,
              costPer1kTokensUsd: args2.openaiConfig.costPer1kTokensUsd
            })
          }
        });

        if (metricResults.length > 0) {
          await tx.metricResult.createMany({
            data: metricResults.map((mr) => ({
              ...mr,
              runCaseId: args2.runCaseId
            }))
          });
        }
      });
    } catch (err) {
      const { errorType, errorMessage } = classifyError(err);
      await args.prisma.runCase.update({
        where: { id: args2.runCaseId },
        data: {
          status: "FAILED",
          errorType,
          finishedAt: new Date(),
          renderedPrompt,
          errorMessage
        }
      });
    }
  }

  async function loop() {
    while (!stopped) {
      try {
        await pollOnce();
      } catch (err) {
        args.logger.error({ err }, "worker_poll_error");
      }
      await sleep(args.pollIntervalMs);
    }
  }

  setImmediate(() => void loop());

  return {
    stop() {
      stopped = true;
    }
  };
}
