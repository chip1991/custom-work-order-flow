export type ApiErrorPayload = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function buildQuery(query?: Record<string, string | number | boolean | undefined | null>) {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue;
    params.set(k, String(v));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

async function readApiError(res: Response) {
  const text = await res.text();
  try {
    const parsed = JSON.parse(text) as ApiErrorPayload;
    if (parsed && typeof parsed === "object" && "error" in parsed) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

export async function apiRequest<T>(
  apiBase: string,
  path: string,
  init?: RequestInit & { query?: Record<string, string | number | boolean | undefined | null> }
) {
  const headers: Record<string, string> = {
    accept: "application/json"
  };

  if (init?.body !== undefined) {
    headers["content-type"] = "application/json";
  }

  const res = await fetch(`${apiBase}${path}${buildQuery(init?.query)}`, {
    ...init,
    headers: {
      ...headers,
      ...(init?.headers ?? {})
    },
    credentials: "include"
  });

  if (!res.ok) {
    const payload = await readApiError(res);
    if (payload) {
      throw new ApiError(res.status, payload.error.code, payload.error.message, payload.error.details);
    }
    const fallback = res.statusText || "Request failed";
    throw new ApiError(res.status, "HTTP_ERROR", fallback);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export type User = { id: string; email: string; role: "ADMIN" | "USER" };

export type Project = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
};

export type Model = {
  id: string;
  name: string;
  provider: string | null;
  createdAt: string;
  updatedAt: string;
  projectId: string;
};

export type ModelVersion = {
  id: string;
  name: string;
  baseUrl: string | null;
  config: unknown;
  createdAt: string;
  updatedAt: string;
  modelId: string;
};

export type Dataset = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  projectId: string;
};

export type Sample = {
  id: string;
  input: unknown;
  context: unknown | null;
  metadata: unknown | null;
  createdAt: string;
  updatedAt: string;
  datasetId: string;
};

export type PromptTemplate = {
  id: string;
  name: string;
  template: string;
  createdAt: string;
  updatedAt: string;
  projectId: string;
};

export type Metric = {
  id: string;
  name: string;
  kind: string;
  config: unknown;
  createdAt: string;
  updatedAt: string;
  projectId: string;
};

export type EvaluationPlanMetric = {
  metricId: string;
  createdAt: string;
  metric: Metric;
};

export type EvaluationPlan = {
  id: string;
  name: string;
  sampleMode: "ALL" | "RANDOM_N";
  sampleCount: number | null;
  config: unknown;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  modelVersionId: string;
  datasetId: string;
  promptTemplateId: string;
  metrics?: EvaluationPlanMetric[];
};

export type EvaluationRun = {
  id: string;
  status: "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELED";
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  errorMessage: string | null;
  planId: string;
  plan?: EvaluationPlan;
  createdById?: string;
  planSnapshot?: unknown;
};

export type MetricResult = {
  id: string;
  metricId: string;
  score: number | null;
  valueFloat: number | null;
  valueText: string | null;
  valueJson: unknown;
  metric: Metric;
};

export type RunCaseErrorType = "NONE" | "TIMEOUT" | "RATE_LIMIT" | "MODEL_ERROR" | "PARSER_ERROR" | "UNKNOWN";

export type RunCase = {
  id: string;
  status: "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELED";
  errorType: RunCaseErrorType;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  latencyMs: number | null;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
  costUsd: number | null;
  renderedPrompt: string | null;
  modelOutput: string | null;
  errorMessage: string | null;
  runId: string;
  sampleId: string;
  sample: Sample;
  metricResults: MetricResult[];
};

export type RunDetail = EvaluationRun & { plan: EvaluationPlan; cases: RunCase[] };

export async function fetchHealth(apiBase: string) {
  return apiRequest<unknown>(apiBase, "/health");
}

export async function login(apiBase: string, input: { email: string; password: string }) {
  return apiRequest<{ user: User; token: string; expiresAt: string }>(apiBase, "/auth/login", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function logout(apiBase: string) {
  return apiRequest<{ ok: true }>(apiBase, "/auth/logout", { method: "POST" });
}

export async function fetchMe(apiBase: string) {
  return apiRequest<{ user: User }>(apiBase, "/auth/me");
}

export async function listProjects(apiBase: string) {
  return apiRequest<{ projects: Project[] }>(apiBase, "/projects");
}

export async function createProject(apiBase: string, input: { name: string; description?: string | null }) {
  return apiRequest<{ project: Project }>(apiBase, "/projects", { method: "POST", body: JSON.stringify(input) });
}

export async function getProject(apiBase: string, projectId: string) {
  return apiRequest<{ project: Project }>(apiBase, `/projects/${projectId}`);
}

export async function updateProject(
  apiBase: string,
  projectId: string,
  input: { name?: string; description?: string | null }
) {
  return apiRequest<{ project: Project }>(apiBase, `/projects/${projectId}`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export async function deleteProject(apiBase: string, projectId: string) {
  return apiRequest<{ ok: true }>(apiBase, `/projects/${projectId}`, { method: "DELETE" });
}

export async function listModels(apiBase: string, projectId: string) {
  return apiRequest<{ models: Model[] }>(apiBase, `/projects/${projectId}/models`);
}

export async function createModel(apiBase: string, projectId: string, input: { name: string; provider?: string }) {
  return apiRequest<{ model: Model }>(apiBase, `/projects/${projectId}/models`, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function getModel(apiBase: string, modelId: string) {
  return apiRequest<{ model: Model }>(apiBase, `/models/${modelId}`);
}

export async function updateModel(apiBase: string, modelId: string, input: { name?: string; provider?: string }) {
  return apiRequest<{ model: Model }>(apiBase, `/models/${modelId}`, { method: "PATCH", body: JSON.stringify(input) });
}

export async function deleteModel(apiBase: string, modelId: string) {
  return apiRequest<{ ok: true }>(apiBase, `/models/${modelId}`, { method: "DELETE" });
}

export async function listModelVersions(apiBase: string, modelId: string) {
  return apiRequest<{ versions: ModelVersion[] }>(apiBase, `/models/${modelId}/versions`);
}

export async function createModelVersion(
  apiBase: string,
  modelId: string,
  input: { name: string; baseUrl?: string; config?: unknown }
) {
  return apiRequest<{ version: ModelVersion }>(apiBase, `/models/${modelId}/versions`, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function getModelVersion(apiBase: string, modelVersionId: string) {
  return apiRequest<{ version: ModelVersion }>(apiBase, `/model-versions/${modelVersionId}`);
}

export async function updateModelVersion(
  apiBase: string,
  modelVersionId: string,
  input: { name?: string; baseUrl?: string | null; config?: unknown }
) {
  return apiRequest<{ version: ModelVersion }>(apiBase, `/model-versions/${modelVersionId}`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export async function deleteModelVersion(apiBase: string, modelVersionId: string) {
  return apiRequest<{ ok: true }>(apiBase, `/model-versions/${modelVersionId}`, { method: "DELETE" });
}

export async function checkModelVersionHealth(apiBase: string, modelVersionId: string) {
  return apiRequest<{ ok: true; result: unknown }>(apiBase, `/model-versions/${modelVersionId}/health`);
}

export async function listDatasets(apiBase: string, projectId: string) {
  return apiRequest<{ datasets: Dataset[] }>(apiBase, `/projects/${projectId}/datasets`);
}

export async function createDataset(apiBase: string, projectId: string, input: { name: string; description?: string | null }) {
  return apiRequest<{ dataset: Dataset }>(apiBase, `/projects/${projectId}/datasets`, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function getDataset(apiBase: string, datasetId: string) {
  return apiRequest<{ dataset: Dataset }>(apiBase, `/datasets/${datasetId}`);
}

export async function updateDataset(
  apiBase: string,
  datasetId: string,
  input: { name?: string; description?: string | null }
) {
  return apiRequest<{ dataset: Dataset }>(apiBase, `/datasets/${datasetId}`, { method: "PATCH", body: JSON.stringify(input) });
}

export async function deleteDataset(apiBase: string, datasetId: string) {
  return apiRequest<{ ok: true }>(apiBase, `/datasets/${datasetId}`, { method: "DELETE" });
}

export async function listSamples(apiBase: string, datasetId: string, query?: { limit?: number; offset?: number }) {
  return apiRequest<{ samples: Sample[]; limit: number; offset: number }>(apiBase, `/datasets/${datasetId}/samples`, { query });
}

export async function createSample(apiBase: string, datasetId: string, input: { input: unknown; context?: unknown; metadata?: unknown }) {
  return apiRequest<{ sample: Sample }>(apiBase, `/datasets/${datasetId}/samples`, { method: "POST", body: JSON.stringify(input) });
}

export async function getSample(apiBase: string, sampleId: string) {
  return apiRequest<{ sample: Sample }>(apiBase, `/samples/${sampleId}`);
}

export async function updateSample(
  apiBase: string,
  sampleId: string,
  input: { input?: unknown; context?: unknown | null; metadata?: unknown | null }
) {
  return apiRequest<{ sample: Sample }>(apiBase, `/samples/${sampleId}`, { method: "PATCH", body: JSON.stringify(input) });
}

export async function deleteSample(apiBase: string, sampleId: string) {
  return apiRequest<{ ok: true }>(apiBase, `/samples/${sampleId}`, { method: "DELETE" });
}

export async function importDatasetJsonl(apiBase: string, datasetId: string, jsonl: string) {
  return apiRequest<{ ok: true; inserted: number }>(apiBase, `/datasets/${datasetId}/import/jsonl`, {
    method: "POST",
    body: JSON.stringify({ jsonl })
  });
}

export async function listPromptTemplates(apiBase: string, projectId: string) {
  return apiRequest<{ promptTemplates: PromptTemplate[] }>(apiBase, `/projects/${projectId}/prompt-templates`);
}

export async function createPromptTemplate(
  apiBase: string,
  projectId: string,
  input: { name: string; template: string }
) {
  return apiRequest<{ promptTemplate: PromptTemplate }>(apiBase, `/projects/${projectId}/prompt-templates`, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function getPromptTemplate(apiBase: string, promptTemplateId: string) {
  return apiRequest<{ promptTemplate: PromptTemplate }>(apiBase, `/prompt-templates/${promptTemplateId}`);
}

export async function updatePromptTemplate(
  apiBase: string,
  promptTemplateId: string,
  input: { name?: string; template?: string }
) {
  return apiRequest<{ promptTemplate: PromptTemplate }>(apiBase, `/prompt-templates/${promptTemplateId}`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export async function deletePromptTemplate(apiBase: string, promptTemplateId: string) {
  return apiRequest<{ ok: true }>(apiBase, `/prompt-templates/${promptTemplateId}`, { method: "DELETE" });
}

export async function listMetrics(apiBase: string, projectId: string) {
  return apiRequest<{ metrics: Metric[] }>(apiBase, `/projects/${projectId}/metrics`);
}

export async function createMetric(apiBase: string, projectId: string, input: { name: string; kind: string; config?: unknown }) {
  return apiRequest<{ metric: Metric }>(apiBase, `/projects/${projectId}/metrics`, { method: "POST", body: JSON.stringify(input) });
}

export async function getMetric(apiBase: string, metricId: string) {
  return apiRequest<{ metric: Metric }>(apiBase, `/metrics/${metricId}`);
}

export async function updateMetric(
  apiBase: string,
  metricId: string,
  input: { name?: string; kind?: string; config?: unknown }
) {
  return apiRequest<{ metric: Metric }>(apiBase, `/metrics/${metricId}`, { method: "PATCH", body: JSON.stringify(input) });
}

export async function deleteMetric(apiBase: string, metricId: string) {
  return apiRequest<{ ok: true }>(apiBase, `/metrics/${metricId}`, { method: "DELETE" });
}

export async function listEvaluationPlans(apiBase: string, projectId: string) {
  return apiRequest<{ plans: EvaluationPlan[] }>(apiBase, `/projects/${projectId}/plans`);
}

export async function createEvaluationPlan(
  apiBase: string,
  projectId: string,
  input: {
    name: string;
    modelVersionId: string;
    datasetId: string;
    promptTemplateId: string;
    sampleMode?: "ALL" | "RANDOM_N";
    sampleCount?: number;
    config?: unknown;
    metricIds?: string[];
  }
) {
  return apiRequest<{ plan: EvaluationPlan }>(apiBase, `/projects/${projectId}/plans`, { method: "POST", body: JSON.stringify(input) });
}

export async function getEvaluationPlan(apiBase: string, planId: string) {
  return apiRequest<{ plan: EvaluationPlan }>(apiBase, `/plans/${planId}`);
}

export async function updateEvaluationPlan(
  apiBase: string,
  planId: string,
  input: {
    name?: string;
    sampleMode?: "ALL" | "RANDOM_N";
    sampleCount?: number;
    config?: unknown;
    metricIds?: string[];
  }
) {
  return apiRequest<{ plan: EvaluationPlan }>(apiBase, `/plans/${planId}`, { method: "PATCH", body: JSON.stringify(input) });
}

export async function deleteEvaluationPlan(apiBase: string, planId: string) {
  return apiRequest<{ ok: true }>(apiBase, `/plans/${planId}`, { method: "DELETE" });
}

export async function triggerRun(apiBase: string, planId: string) {
  return apiRequest<{ run: EvaluationRun }>(apiBase, `/plans/${planId}/runs`, { method: "POST" });
}

export async function listRuns(apiBase: string, query?: { planId?: string; status?: string }) {
  return apiRequest<{ runs: EvaluationRun[] }>(apiBase, "/runs", { query });
}

export async function getRun(apiBase: string, runId: string) {
  return apiRequest<{ run: RunDetail }>(apiBase, `/runs/${runId}`);
}

export async function cancelRun(apiBase: string, runId: string) {
  return apiRequest<{ ok: true; run: EvaluationRun }>(apiBase, `/runs/${runId}/cancel`, { method: "POST" });
}
