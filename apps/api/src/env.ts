import "./loadEnv";

function parsePort(value: string): number {
  const port = Number(value);
  if (!Number.isInteger(port) || port <= 0 || port >= 65536) {
    throw new Error(`Invalid PORT: ${value}`);
  }
  return port;
}

const logLevels = ["fatal", "error", "warn", "info", "debug", "trace", "silent"] as const;

function parseLogLevel(value: string): (typeof logLevels)[number] {
  if (logLevels.includes(value as (typeof logLevels)[number])) {
    return value as (typeof logLevels)[number];
  }
  throw new Error(`Invalid LOG_LEVEL: ${value}`);
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) {
    return defaultValue;
  }
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`Invalid boolean: ${value}`);
}

function parsePositiveInt(value: string | undefined, defaultValue: number): number {
  if (value === undefined) {
    return defaultValue;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid positive int: ${value}`);
  }
  return parsed;
}

export const env = {
  port: parsePort(process.env.API_PORT ?? process.env.PORT ?? "4000"),
  logLevel: parseLogLevel(process.env.LOG_LEVEL ?? "info"),
  allowRegistration: parseBoolean(process.env.ALLOW_REGISTRATION, false),
  sessionTtlDays: parsePositiveInt(process.env.SESSION_TTL_DAYS, 30),
  runWorkerInProcess: parseBoolean(process.env.RUN_WORKER_IN_PROCESS, true),
  workerPollIntervalMs: parsePositiveInt(process.env.WORKER_POLL_INTERVAL_MS, 1000),
  workerConcurrency: parsePositiveInt(process.env.WORKER_CONCURRENCY, 4)
};
