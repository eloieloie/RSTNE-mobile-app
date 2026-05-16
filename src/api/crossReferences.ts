import { API_URL, API_HEADERS } from './client';

export interface CrossReferenceData {
  cross_ref_id: number;
  from_book_name: string;
  from_chapter: string;
  from_verse: string;
  to_book_name: string;
  to_chapter: string;
  to_verse: string;
  votes: number;
  from_book_abbr?: string;
  from_hebrew_book_abbr?: string;
  from_telugu_book_abbr?: string;
  from_book_id?: number;
  to_book_abbr?: string;
  to_hebrew_book_abbr?: string;
  to_telugu_book_abbr?: string;
  to_book_id?: number;
  target_book_id?: number;
  target_chapter_id?: number;
  target_verse_id?: number;
}

export async function getCrossReferences(
  bookId: number,
  chapter: string,
  verse: string,
): Promise<CrossReferenceData[]> {
  const url = `${API_URL}/cross-references?bookId=${bookId}&chapter=${encodeURIComponent(chapter)}&verse=${encodeURIComponent(verse)}`;
  const response = await fetch(url, { headers: API_HEADERS });
  if (!response.ok) throw new Error('Failed to fetch cross references');
  return response.json();
}

export async function getChapterVersesWithCrossRefs(chapterId: number): Promise<any[]> {
  const response = await fetch(`${API_URL}/chapters/${chapterId}/verses-with-cross-refs`, { headers: API_HEADERS });
  if (!response.ok) throw new Error('Failed to fetch verses with cross-references');
  return response.json();
}
