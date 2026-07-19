import { API_URL, API_HEADERS } from './client';

export interface FeedbackPayload {
  message: string;
  email?: string;
  category: 'bug' | 'feature' | 'general';
  app_version: string;
  platform: string;
}

export async function submitFeedback(payload: FeedbackPayload): Promise<void> {
  const res = await fetch(`${API_URL}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...API_HEADERS },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}
