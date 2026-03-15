import type { Verse } from '@/utils/collectionReferences';
import type { CrossReferenceData } from '@/api/crossReferences';

const API_URL = 'https://us-central1-rstne-app-2025.cloudfunctions.net/api/api';

export interface VerseNote {
  verse_note_id: number;
  verse_id: number;
  note_id: number;
  note_title: string | null;
  note_content: string;
}

export interface VerseLinkData {
  link_id: number;
  source_verse_id: number;
  target_verse_id: number;
  target_verse_index: number;
  target_chapter_number: string;
  target_book_name: string;
  target_book_id: number;
  target_chapter_id: number;
}

export interface VerseWithLinks extends Verse {
  links?: VerseLinkData[];
  notes?: VerseNote[];
  crossReferences?: CrossReferenceData[];
}

export interface VerseSearchResult extends VerseWithLinks {
  book_name: string;
  book_id: number;
  chapter_id: number;
  chapter_number: string;
}

export async function getVersesByChapterId(chapterId: number): Promise<VerseWithLinks[]> {
  const response = await fetch(`${API_URL}/chapters/${chapterId}/verses`);
  if (!response.ok) throw new Error('Failed to fetch verses');
  return response.json();
}

export async function searchVersesByText(searchText: string): Promise<VerseSearchResult[]> {
  const response = await fetch(`${API_URL}/verses/text-search?q=${encodeURIComponent(searchText)}`);
  if (!response.ok) throw new Error('Failed to search verses');
  const data = await response.json();
  return data.results ?? [];
}
