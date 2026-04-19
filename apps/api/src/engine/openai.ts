import { callLocalTextGeneration, isLocalBaseUrl, pingLocalModel } from "./local";

type OpenAIConfig = {
  apiKey?: string;
  model?: string;
  timeoutMs?: number;
  maxRetries?: number;
  headers?: Record<string, string>;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asArray(value: unknown): unknown[] | null {
  if (!Array.isArray(value)) return null;
  return value;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function toUrl(baseUrl: string, path: string) {
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(path.replace(/^\//, ""), base);
}

export async function callChatCompletions(args: { baseUrl: string; prompt: string; config: OpenAIConfig }) {
  if (isLocalBaseUrl(args.baseUrl)) {
    return callLocalTextGeneration({ baseUrl: args.baseUrl, prompt: args.prompt });
  }

  const timeoutMs = args.config.timeoutMs ?? 30_000;
  const maxRetries = args.config.maxRetries ?? 2;
  const model = args.config.model ?? "gpt-4o-mini";

  const url = toUrl(args.baseUrl, "/v1/chat/completions");
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...(args.config.headers ?? {})
  };
  if (args.config.apiKey) {
    headers.authorization = `Bearer ${args.config.apiKey}`;
  }

  const body = JSON.stringify({
    model,
    messages: [{ role: "user", content: args.prompt }],
    temperature: 0
  });

  const startedAt = Date.now();
  let attempt = 0;
  while (true) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { method: "POST", headers, body, signal: controller.signal });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        const retryable = res.status >= 500 || res.status === 429;
        if (retryable && attempt < maxRetries) {
          attempt += 1;
          await sleep(200 * 2 ** attempt);
          continue;
        }
        throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
      }

      const json = (await res.json()) as unknown;
      const jsonRec = asRecord(json);
      const choices = asArray(jsonRec?.choices);
      const firstChoice = choices?.[0] ? asRecord(choices[0]) : null;
      const message = asRecord(firstChoice?.message);
      const content =
        (typeof message?.content === "string" ? message.content : null) ??
        (typeof firstChoice?.text === "string" ? firstChoice.text : null) ??
        (typeof jsonRec?.output_text === "string" ? jsonRec.output_text : null) ??
        (typeof jsonRec?.content === "string" ? jsonRec.content : null) ??
        null;
      if (typeof content !== "string") {
        throw new Error("Invalid model response");
      }

      const usage = jsonRec?.usage ?? null;
      const latencyMs = Date.now() - startedAt;
      return { text: content, usage, latencyMs };
    } catch (err) {
      const retryable =
        err instanceof Error && (err.name === "AbortError" || /ECONNRESET|ETIMEDOUT|EAI_AGAIN/i.test(err.message));
      if (retryable && attempt < maxRetries) {
        attempt += 1;
        await sleep(200 * 2 ** attempt);
        continue;
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}

export async function pingOpenAICompatible(args: { baseUrl: string; config: OpenAIConfig }) {
  if (isLocalBaseUrl(args.baseUrl)) {
    return pingLocalModel({ baseUrl: args.baseUrl });
  }

  const timeoutMs = args.config.timeoutMs ?? 10_000;
  const url = toUrl(args.baseUrl, "/v1/models");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const headers: Record<string, string> = { ...(args.config.headers ?? {}) };
    if (args.config.apiKey) headers.authorization = `Bearer ${args.config.apiKey}`;
    const res = await fetch(url, { method: "GET", headers, signal: controller.signal });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    }
    return { ok: true };
  } finally {
    clearTimeout(timer);
  }
}
