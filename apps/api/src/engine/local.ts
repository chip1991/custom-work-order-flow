import path from "node:path";
import fs from "node:fs/promises";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function isLocalBaseUrl(baseUrl: string) {
  return baseUrl.startsWith("local://");
}

export function parseLocalModelId(baseUrl: string) {
  if (!isLocalBaseUrl(baseUrl)) return null;
  const modelId = baseUrl.slice("local://".length).trim();
  return modelId || null;
}

type TextGenerationPipeline = (prompt: string, options?: Record<string, unknown>) => Promise<unknown>;

const textGenerationPipelines = new Map<string, Promise<TextGenerationPipeline>>();

async function loadTextGenerationPipeline(modelId: string): Promise<TextGenerationPipeline> {
  const modUnknown: unknown = await import("@xenova/transformers");
  const mod = asRecord(modUnknown);
  if (!mod) throw new Error("Failed to load transformers module");

  const cacheDir = process.env.TRANSFORMERS_CACHE_DIR ?? path.join(process.cwd(), ".cache", "transformers");
  await fs.mkdir(cacheDir, { recursive: true });

  const env = asRecord(mod.env);
  if (env) {
    env.cacheDir = cacheDir;
    if (typeof env.allowRemoteModels === "boolean") env.allowRemoteModels = true;
  }

  const pipeline = mod.pipeline;
  if (typeof pipeline !== "function") throw new Error("Invalid transformers module: missing pipeline");
  return (await (pipeline as (task: string, modelId: string) => Promise<TextGenerationPipeline>)(
    "text-generation",
    modelId
  )) as TextGenerationPipeline;
}

async function getTextGenerationPipeline(modelId: string) {
  const existing = textGenerationPipelines.get(modelId);
  if (existing) return existing;
  const p = loadTextGenerationPipeline(modelId);
  textGenerationPipelines.set(modelId, p);
  return p;
}

function extractGeneratedText(value: unknown): string | null {
  if (Array.isArray(value)) {
    return value.length > 0 ? extractGeneratedText(value[0]) : null;
  }
  if (typeof value === "string") return value;
  const rec = asRecord(value);
  if (!rec) return null;
  if (typeof rec.generated_text === "string") return rec.generated_text;
  if (typeof rec.text === "string") return rec.text;
  return null;
}

export async function callLocalTextGeneration(args: { baseUrl: string; prompt: string }) {
  const modelId = parseLocalModelId(args.baseUrl);
  if (!modelId) throw new Error("Invalid local:// baseUrl");

  const generator = await getTextGenerationPipeline(modelId);
  const startedAt = Date.now();
  const out = await generator(args.prompt, { max_new_tokens: 128, do_sample: false, temperature: 0 });
  const fullText = extractGeneratedText(out);
  if (typeof fullText !== "string") throw new Error("Invalid local model response");

  let text = fullText;
  if (text.startsWith(args.prompt)) {
    text = text.slice(args.prompt.length);
  }
  text = text.replace(/^\s+/, "");

  const latencyMs = Date.now() - startedAt;
  return { text, usage: null, latencyMs };
}

export async function pingLocalModel(args: { baseUrl: string }) {
  const modelId = parseLocalModelId(args.baseUrl);
  if (!modelId) throw new Error("Invalid local:// baseUrl");
  const generator = await getTextGenerationPipeline(modelId);
  const out = await generator("Hello", { max_new_tokens: 1, do_sample: false, temperature: 0 });
  const text = extractGeneratedText(out);
  if (typeof text !== "string" || !text) throw new Error("Invalid local model response");
  return { ok: true };
}
