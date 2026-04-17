import { Model } from '@/lib/api';
import { Question } from './questions';

export interface TaskResult {
  id: string;
  taskId: string;
  modelId: string;
  questionId: string;
  response: string | null;
  timeTaken: number | null;
  firstTokenTime: number | null;
  tokensUsed: number | null;
  status: 'success' | 'error' | 'running';
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  models: Model[];
  questions: Question[];
  results?: TaskResult[];
}

export interface CreateTaskDto {
  name: string;
  modelIds: string[];
  questionIds: string[];
}

export const getTasks = async (): Promise<Task[]> => {
  const res = await fetch('/api/tasks');
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
};

export const getTask = async (id: string): Promise<Task> => {
  const res = await fetch(`/api/tasks/${id}`);
  if (!res.ok) throw new Error('Failed to fetch task');
  return res.json();
};

export const createTask = async (data: CreateTaskDto): Promise<Task> => {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
};

export const deleteTask = async (id: string): Promise<void> => {
  const res = await fetch(`/api/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete task');
};
