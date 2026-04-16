function getByPath(obj: unknown, path: string) {
  const parts = path.split(".").map((p) => p.trim()).filter(Boolean);
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur === null || cur === undefined) return undefined;
    if (typeof cur !== "object") return undefined;
    const rec = cur as Record<string, unknown>;
    cur = rec[part];
  }
  return cur;
}

export function renderTemplate(
  template: string,
  vars: {
    input: unknown;
    context?: unknown;
    metadata?: unknown;
  }
) {
  return template.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_m, rawPath) => {
    const path = String(rawPath ?? "");
    const value = getByPath(vars, path);
    if (value === undefined || value === null) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  });
}
