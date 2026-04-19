import { Model } from '@/lib/api';

export interface Agent {
  id: string;
  name: string;
  description: string | null;
  systemPrompt: string | null;
  modelId: string;
  createdAt: string;
  updatedAt: string;
  workflow?: any;
  model?: Model;
}

export type CreateAgentDto = Omit<Agent, 'id' | 'createdAt' | 'updatedAt' | 'model'>;
export type UpdateAgentDto = Partial<CreateAgentDto>;

export const getAgents = async (): Promise<Agent[]> => {
  const res = await fetch('/api/agents');
  if (!res.ok) throw new Error('Failed to fetch agents');
  return res.json();
};

export const getAgent = async (id: string): Promise<Agent> => {
  const res = await fetch(`/api/agents/${id}`);
  if (!res.ok) throw new Error('Failed to fetch agent');
  return res.json();
};

export const createAgent = async (data: CreateAgentDto): Promise<Agent> => {
  const res = await fetch('/api/agents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to create agent');
  }
  return res.json();
};

export const updateAgent = async (id: string, data: UpdateAgentDto): Promise<Agent> => {
  const res = await fetch(`/api/agents/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to update agent');
  }
  return res.json();
};

export const deleteAgent = async (id: string): Promise<void> => {
  const res = await fetch(`/api/agents/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete agent');
};
