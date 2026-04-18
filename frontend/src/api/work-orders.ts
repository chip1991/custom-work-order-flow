export interface WorkOrderFlow {
  id: string;
  name: string;
  description: string | null;
  formSchema: any;
  workflowData: any;
  createdAt: string;
  updatedAt?: string;
}

export type CreateWorkOrderFlowDto = Omit<WorkOrderFlow, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateWorkOrderFlowDto = Partial<CreateWorkOrderFlowDto>;

export const getWorkOrders = async (): Promise<WorkOrderFlow[]> => {
  const res = await fetch('/api/work-orders');
  if (!res.ok) throw new Error('Failed to fetch work orders');
  return res.json();
};

export const getWorkOrder = async (id: string): Promise<WorkOrderFlow> => {
  const res = await fetch(`/api/work-orders/${id}`);
  if (!res.ok) throw new Error('Failed to fetch work order');
  return res.json();
};

export const createWorkOrder = async (data: CreateWorkOrderFlowDto): Promise<WorkOrderFlow> => {
  const res = await fetch('/api/work-orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to create work order');
  }
  return res.json();
};

export const updateWorkOrder = async (id: string, data: UpdateWorkOrderFlowDto): Promise<WorkOrderFlow> => {
  const res = await fetch(`/api/work-orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to update work order');
  }
  return res.json();
};

export const deleteWorkOrder = async (id: string): Promise<void> => {
  const res = await fetch(`/api/work-orders/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete work order');
};
