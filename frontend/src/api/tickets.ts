export interface TicketService {
  id: string;
  name: string;
  enabled?: boolean;
  processId?: string;
  config?: any;
}

export interface TicketProcess {
  id: string;
  name: string;
  communities?: any;
  nodes?: any;
  edges?: any;
  formConfig?: any;
}

export interface TicketTask {
  id: string;
  ticketId: string;
  name: string;
  nodeKey: string | null;
  status: string;
  input: any;
  output: any;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketLog {
  id: string;
  ticketId: string;
  taskId: string | null;
  userId: string | null;
  level: string;
  action: string;
  message: string;
  meta: any;
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketNo: string;
  title: string;
  description: string | null;
  status: string;
  processId: string;
  serviceId: string;
  createdById: string;
  formData: any;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  service?: TicketService | null;
  process?: TicketProcess | null;
  tasks?: TicketTask[];
  logs?: TicketLog[];
}

export type GetTicketsParams = {
  status?: string;
  q?: string;
  serviceId?: string;
  processId?: string;
};

const toQueryString = (params: Record<string, string | undefined>) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') qs.set(k, v);
  });
  const str = qs.toString();
  return str ? `?${str}` : '';
};

export const getTickets = async (params: GetTicketsParams = {}): Promise<Ticket[]> => {
  const res = await fetch(`/api/tickets${toQueryString(params as any)}`);
  if (!res.ok) throw new Error('Failed to fetch tickets');
  return res.json();
};

export const getTicket = async (id: string): Promise<Ticket> => {
  const res = await fetch(`/api/tickets/${id}`);
  if (!res.ok) throw new Error('Failed to fetch ticket');
  return res.json();
};

export type AdvanceTicketDto = {
  userId?: string;
  output?: any;
  nextNodeId?: string;
};

export const advanceTicket = async (id: string, data: AdvanceTicketDto = {}): Promise<Ticket> => {
  const res = await fetch(`/api/tickets/${id}/advance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to advance ticket');
  }
  return res.json();
};
