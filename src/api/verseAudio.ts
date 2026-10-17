import { API_URL, API_HEADERS } from './client';
import type { VerseAudioLanguage, VerseAudioStatus } from '@/utils/collectionReferences';

export interface ChapterAudioRow {
  verse_id: number;
  verse_index: number | null;
  audio_url: string | null;
  duration_ms: number | null;
  status: VerseAudioStatus | null;
  dt_generated: string | null;
}

export async function getChapterAudio(chapterId: number, lang: VerseAudioLanguage): Promise<ChapterAudioRow[]> {
  const res = await fetch(`${API_URL}/chapters/${chapterId}/audio?lang=${lang}`, {
    headers: API_HEADERS,
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch chapter audio');
  const data = await res.json();
  return data.results ?? [];
}
