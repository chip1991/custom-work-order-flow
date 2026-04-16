export interface Message {
  id?: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface Question {
  id: string;
  name: string;
  description?: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionDto {
  name: string;
  description?: string;
  messages: Omit<Message, 'id'>[];
}

export interface UpdateQuestionDto extends CreateQuestionDto {}

export const getQuestions = async (): Promise<Question[]> => {
  const res = await fetch('/api/questions');
  if (!res.ok) throw new Error('Failed to fetch questions');
  return res.json();
};

export const getQuestion = async (id: string): Promise<Question> => {
  const res = await fetch(`/api/questions/${id}`);
  if (!res.ok) throw new Error('Failed to fetch question');
  return res.json();
};

export const createQuestion = async (data: CreateQuestionDto): Promise<Question> => {
  const res = await fetch('/api/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create question');
  return res.json();
};

export const updateQuestion = async (id: string, data: UpdateQuestionDto): Promise<Question> => {
  const res = await fetch(`/api/questions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update question');
  return res.json();
};

export const deleteQuestion = async (id: string): Promise<void> => {
  const res = await fetch(`/api/questions/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete question');
};
