export interface ServiceProcess {
  id: string;
  name: string;
  communities?: any;
  nodes?: any;
  edges?: any;
  formConfig?: any;
}

export interface Service {
  id: string;
  processId: string;
  name: string;
  description: string | null;
  config: any;
  enabled: boolean;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  process?: ServiceProcess | null;
}

export type CreateServiceDto = {
  processId: string;
  name: string;
  description?: string | null;
  config?: any;
  enabled?: boolean;
  createdById?: string | null;
};

export type UpdateServiceDto = Partial<CreateServiceDto>;

export const getServices = async (): Promise<Service[]> => {
  const res = await fetch('/api/services');
  if (!res.ok) throw new Error('Failed to fetch services');
  return res.json();
};

export const createService = async (data: CreateServiceDto): Promise<Service> => {
  const res = await fetch('/api/services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to create service');
  }
  return res.json();
};

export const updateService = async (id: string, data: UpdateServiceDto): Promise<Service> => {
  const res = await fetch(`/api/services/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to update service');
  }
  return res.json();
};

export const deleteService = async (id: string): Promise<void> => {
  const res = await fetch(`/api/services/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete service');
};
