import type { Chapter } from '@/utils/collectionReferences';

const API_URL = 'https://us-central1-rstne-app-2025.cloudfunctions.net/api/api';

export async function getChaptersByBookId(bookId: number): Promise<Chapter[]> {
  const response = await fetch(`${API_URL}/books/${bookId}/chapters`);
  if (!response.ok) throw new Error('Failed to fetch chapters');
  return response.json();
}

export async function getChapterById(chapterId: number): Promise<Chapter | null> {
  const response = await fetch(`${API_URL}/chapters/${chapterId}`);
  if (!response.ok) return null;
  return response.json();
}
