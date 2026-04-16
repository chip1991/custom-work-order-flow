import type { Metric } from "@prisma/client";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function extractExpected(metadata: unknown): string | null {
  const rec = asRecord(metadata);
  const candidates = [rec?.expected, rec?.reference, rec?.groundTruth, rec?.output];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c;
  }
  return null;
}

function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.length / 4));
}

export function computeMetricResult(args: {
  metric: Metric;
  sampleMetadata: unknown;
  renderedPrompt: string;
  modelOutput: string;
  latencyMs: number;
  usage: unknown;
  defaultCostPer1kTokensUsd?: number;
}) {
  const kind = args.metric.kind.toUpperCase();
  const expected = extractExpected(args.sampleMetadata);
  const output = args.modelOutput ?? "";

  if (kind === "EXACT_MATCH") {
    if (!expected) return { score: null, valueFloat: null, valueText: null, valueJson: { missingExpected: true } };
    const ok = expected.trim() === output.trim();
    return { score: ok ? 1 : 0, valueFloat: ok ? 1 : 0, valueText: ok ? "1" : "0", valueJson: { expected } };
  }

  if (kind === "CONTAINS") {
    if (!expected) return { score: null, valueFloat: null, valueText: null, valueJson: { missingExpected: true } };
    const ok = output.includes(expected);
    return { score: ok ? 1 : 0, valueFloat: ok ? 1 : 0, valueText: ok ? "1" : "0", valueJson: { expected } };
  }

  if (kind === "LENGTH") {
    return { score: null, valueFloat: output.length, valueText: null, valueJson: null };
  }

  if (kind === "LATENCY_MS") {
    return { score: null, valueFloat: args.latencyMs, valueText: null, valueJson: null };
  }

  if (kind === "COST_ESTIMATE") {
    const usageRec = asRecord(args.usage);
    const usageTokensRaw = usageRec?.total_tokens ?? usageRec?.totalTokens;
    const usageTokens = typeof usageTokensRaw === "number" ? usageTokensRaw : NaN;
    const tokens = Number.isFinite(usageTokens)
      ? usageTokens
      : estimateTokens(args.renderedPrompt) + estimateTokens(output);

    const metricConfig = asRecord(args.metric.config);
    const costPer1kFromMetricRaw = metricConfig?.costPer1kTokensUsd;
    const costPer1kFromMetric = typeof costPer1kFromMetricRaw === "number" ? costPer1kFromMetricRaw : NaN;
    const costPer1k =
      Number.isFinite(costPer1kFromMetric) ? costPer1kFromMetric : (args.defaultCostPer1kTokensUsd ?? 0);
    const costUsd = (tokens / 1000) * costPer1k;

    return {
      score: null,
      valueFloat: costUsd,
      valueText: null,
      valueJson: { tokens, costPer1kTokensUsd: costPer1k }
    };
  }

  return { score: null, valueFloat: null, valueText: null, valueJson: { unsupported: true, kind } };
}
