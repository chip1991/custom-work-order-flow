export interface Feedback {
  id: string;
  ticketId: string;
  userId: string | null;
  rating: number;
  content: string | null;
  tags: string[];
  callback: string | null;
  createdAt: string;
  updatedAt: string;
  ticket?: {
    ticketNo: string;
    title: string;
    service?: { name: string };
  };
  user?: {
    account: string;
  };
}

export async function getFeedbacks(): Promise<Feedback[]> {
  const res = await fetch("/api/feedback");
  if (!res.ok) throw new Error("Failed to fetch feedbacks");
  return res.json();
}

export async function submitCallback(id: string, callbackNotes: string): Promise<Feedback> {
  const res = await fetch(`/api/feedback/${id}/callback`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback: callbackNotes }),
  });
  if (!res.ok) throw new Error("Failed to submit callback");
  return res.json();
}
