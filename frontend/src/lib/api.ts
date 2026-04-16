export const API_BASE_URL = "/api";

export const login = async (identifier: string, password: string) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Login failed");
  }
  return res.json();
};

export interface Model {
  id: string;
  name: string;
  provider: string;
  baseUrl: string | null;
  apiKey: string | null;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export const fetchModels = async (): Promise<Model[]> => {
  const res = await fetch(`${API_BASE_URL}/models`);
  if (!res.ok) throw new Error("Failed to fetch models");
  return res.json();
};

export const createModel = async (data: Partial<Model>): Promise<Model> => {
  const res = await fetch(`${API_BASE_URL}/models`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create model");
  return res.json();
};

export const updateModel = async (id: string, data: Partial<Model>): Promise<Model> => {
  const res = await fetch(`${API_BASE_URL}/models/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update model");
  return res.json();
};

export const toggleModelStatus = async (id: string, enabled: boolean): Promise<Model> => {
  const res = await fetch(`${API_BASE_URL}/models/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled }),
  });
  if (!res.ok) throw new Error("Failed to update model status");
  return res.json();
};

export const deleteModel = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/models/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete model");
};
