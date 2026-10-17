import { API_URL, API_HEADERS } from './client';
import type { VerseAudioLanguage } from '@/utils/collectionReferences';

export interface ChapterAnnouncementRow {
  id: number;
  chapter_id: number;
  language: VerseAudioLanguage;
  audio_url: string | null;
  storage_path: string | null;
  status: 'pending' | 'ready' | 'failed';
  error_message: string | null;
  dt_generated: string | null;
}

// Pre-generated "Chapter N" announcement audio, played before a chapter's
// verses when continuous chapter-to-chapter playback advances — falls back to
// the Web Speech API in ReadingView.vue when none is ready yet.
export async function getChapterAnnouncement(
  chapterId: number,
  lang: VerseAudioLanguage
): Promise<ChapterAnnouncementRow | null> {
  const res = await fetch(
    `${API_URL}/chapter-announcements?chapter_id=${chapterId}&lang=${lang}`,
    { headers: API_HEADERS }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch chapter announcement');
  return res.json();
}
