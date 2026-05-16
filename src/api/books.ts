import type { Book } from '@/utils/collectionReferences';
import { API_URL, API_HEADERS } from './client';

export async function getAllBooks(): Promise<Book[]> {
  const cacheKey = 'rstne_books_cache_v2';
  const cacheTimeKey = 'rstne_books_cache_time_v2';
  const cached = sessionStorage.getItem(cacheKey);
  const cacheTime = sessionStorage.getItem(cacheTimeKey);

  if (cached && cacheTime) {
    const age = Date.now() - parseInt(cacheTime);
    if (age < 3600000) {
      return JSON.parse(cached);
    }
  }

  const response = await fetch(`${API_URL}/books`, { headers: API_HEADERS });
  if (!response.ok) throw new Error('Failed to fetch books');
  const data = await response.json();

  sessionStorage.setItem(cacheKey, JSON.stringify(data));
  sessionStorage.setItem(cacheTimeKey, Date.now().toString());

  return data;
}

export async function getBookById(bookId: number): Promise<Book | null> {
  const response = await fetch(`${API_URL}/books/${bookId}`, { headers: API_HEADERS });
  if (!response.ok) return null;
  return response.json();
}
