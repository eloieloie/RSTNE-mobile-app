import type { Chapter } from '@/utils/collectionReferences';
import { API_URL, API_HEADERS } from './client';

export async function getChaptersByBookId(bookId: number): Promise<Chapter[]> {
  const response = await fetch(`${API_URL}/books/${bookId}/chapters`, { headers: API_HEADERS });
  if (!response.ok) throw new Error('Failed to fetch chapters');
  return response.json();
}

export async function getChapterById(chapterId: number): Promise<Chapter | null> {
  const response = await fetch(`${API_URL}/chapters/${chapterId}`, { headers: API_HEADERS });
  if (!response.ok) return null;
  return response.json();
}
