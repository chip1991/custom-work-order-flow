import { API_BASE_URL } from "../lib/api";

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  totalTokensUsed?: number;
  createdAt: string;
  updatedAt: string;
}

export const fetchApiKeys = async (): Promise<ApiKey[]> => {
  const res = await fetch(`${API_BASE_URL}/api-keys`);
  if (!res.ok) throw new Error("Failed to fetch API keys");
  return res.json();
};

export const createApiKey = async (name: string): Promise<ApiKey> => {
  const res = await fetch(`${API_BASE_URL}/api-keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to create API key");
  return res.json();
};

export const deleteApiKey = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/api-keys/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete API key");
};
