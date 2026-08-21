import { API_URL, getAuthHeaders } from './client';

export interface NoteInsert {
  note_title?: string;
  note_content: string;
}

export interface NoteUpdate {
  note_title?: string;
  note_content?: string;
}

export interface VerseNoteInsert {
  verse_id: number;
  note_id: number;
}

// Admin notes — create/update/delete/link/unlink require an admin-authenticated bearer token.
export async function createNote(note: NoteInsert): Promise<{ note_id: number }> {
  const response = await fetch(`${API_URL}/notes`, {
    method: 'POST',
    headers: { ...(await getAuthHeaders()), 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  });
  if (!response.ok) {
    throw new Error('Failed to create note');
  }
  return response.json();
}

export async function updateNote(noteId: number, note: NoteUpdate): Promise<void> {
  const response = await fetch(`${API_URL}/notes/${noteId}`, {
    method: 'POST',
    headers: { ...(await getAuthHeaders()), 'Content-Type': 'application/json', 'X-HTTP-Method-Override': 'PUT' },
    body: JSON.stringify(note),
  });
  if (!response.ok) {
    throw new Error('Failed to update note');
  }
}

export async function linkNoteToVerse(verseNoteData: VerseNoteInsert): Promise<{ verse_note_id: number }> {
  const response = await fetch(`${API_URL}/verse-notes`, {
    method: 'POST',
    headers: { ...(await getAuthHeaders()), 'Content-Type': 'application/json' },
    body: JSON.stringify(verseNoteData),
  });
  if (!response.ok) {
    throw new Error('Failed to link note to verse');
  }
  return response.json();
}

export async function unlinkNoteFromVerse(verseNoteId: number): Promise<void> {
  const response = await fetch(`${API_URL}/verse-notes/${verseNoteId}`, {
    method: 'POST',
    headers: { ...(await getAuthHeaders()), 'Content-Type': 'application/json', 'X-HTTP-Method-Override': 'DELETE' },
    body: '{}',
  });
  if (!response.ok) {
    throw new Error('Failed to unlink note from verse');
  }
}
