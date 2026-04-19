export interface Process {
  id: string;
  name: string;
  description: string | null;
  nodes: string;
  edges: string;
  formConfig?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateProcessDto = Pick<Process, 'name' | 'description' | 'nodes' | 'edges' | 'formConfig'>;
export type UpdateProcessDto = Partial<CreateProcessDto>;

export const getProcesses = async (): Promise<Process[]> => {
  const res = await fetch('/api/processes');
  if (!res.ok) throw new Error('Failed to fetch processes');
  return res.json();
};

export const getProcess = async (id: string): Promise<Process> => {
  const res = await fetch(`/api/processes/${id}`);
  if (!res.ok) throw new Error('Failed to fetch process');
  return res.json();
};

export const createProcess = async (data: CreateProcessDto): Promise<Process> => {
  const res = await fetch('/api/processes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to create process');
  }
  return res.json();
};

export const updateProcess = async (id: string, data: UpdateProcessDto): Promise<Process> => {
  const res = await fetch(`/api/processes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to update process');
  }
  return res.json();
};

export const deleteProcess = async (id: string): Promise<void> => {
  const res = await fetch(`/api/processes/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete process');
};
