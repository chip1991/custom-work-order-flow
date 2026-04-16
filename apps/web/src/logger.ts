type Level = "debug" | "info" | "warn" | "error";

function write(level: Level, event: string, data?: unknown) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    event,
    data
  };

  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else if (level === "debug") console.debug(line);
  else console.info(line);
}

export const log = {
  debug: (event: string, data?: unknown) => write("debug", event, data),
  info: (event: string, data?: unknown) => write("info", event, data),
  warn: (event: string, data?: unknown) => write("warn", event, data),
  error: (event: string, data?: unknown) => write("error", event, data)
};
