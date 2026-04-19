import { apiRequest } from '../api';

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
  return apiRequest<WorkOrderFlow[]>('/api', '/work-orders');
};

export const getWorkOrder = async (id: string): Promise<WorkOrderFlow> => {
  return apiRequest<WorkOrderFlow>('/api', `/work-orders/${id}`);
};

export const createWorkOrder = async (data: CreateWorkOrderFlowDto): Promise<WorkOrderFlow> => {
  return apiRequest<WorkOrderFlow>('/api', '/work-orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateWorkOrder = async (id: string, data: UpdateWorkOrderFlowDto): Promise<WorkOrderFlow> => {
  return apiRequest<WorkOrderFlow>('/api', `/work-orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteWorkOrder = async (id: string): Promise<void> => {
  await apiRequest<void>('/api', `/work-orders/${id}`, {
    method: 'DELETE',
  });
};
