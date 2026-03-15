import type { Book } from '@/utils/collectionReferences';

const API_URL = 'https://us-central1-rstne-app-2025.cloudfunctions.net/api/api';

export async function getAllBooks(): Promise<Book[]> {
  const cacheKey = 'rstne_books_cache';
  const cacheTimeKey = 'rstne_books_cache_time';
  const cached = sessionStorage.getItem(cacheKey);
  const cacheTime = sessionStorage.getItem(cacheTimeKey);

  if (cached && cacheTime) {
    const age = Date.now() - parseInt(cacheTime);
    if (age < 3600000) {
      return JSON.parse(cached);
    }
  }

  const response = await fetch(`${API_URL}/books`);
  if (!response.ok) throw new Error('Failed to fetch books');
  const data = await response.json();

  sessionStorage.setItem(cacheKey, JSON.stringify(data));
  sessionStorage.setItem(cacheTimeKey, Date.now().toString());

  return data;
}

export async function getBookById(bookId: number): Promise<Book | null> {
  const response = await fetch(`${API_URL}/books/${bookId}`);
  if (!response.ok) return null;
  return response.json();
}
