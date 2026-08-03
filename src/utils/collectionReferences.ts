// Table Names
export const TABLES = {
  BOOKS: 'books_tbl',
  BOOK_CATEGORIES: 'book_categories_tbl',
  CHAPTERS: 'chapters_tbl',
  VERSES: 'verses_tbl',
  NOTES: 'notes_tbl',
  VERSE_NOTES: 'verse_notes_tbl',
  PERSONAL_NOTES: 'personal_notes_tbl',
  PERSONAL_VERSE_NOTES: 'personal_verse_notes_tbl',
  ADMIN_USERS: 'admin_users_tbl',
  VERSE_LINKS: 'verse_links_tbl',
  TAGS: 'tags_tbl',
  VERSE_TAGS: 'verse_tags_tbl',
  CROSS_REFERENCES: 'cross_references_tbl',
} as const;

export interface Book {
  book_id: number;
  book_name: string;
  book_abbr: string | null;
  hebrew_book_abbr: string | null;
  telugu_book_abbr: string | null;
  hebrew_book_name: string | null;
  telugu_book_name: string | null;
  book_description: string | null;
  book_header: string | null;
  book_footer: string | null;
  book_link: string | null;
  book_index: number | null;
  category_id: number | null;
  chapter_count?: number;
  dt_added: Date;
}

export interface Chapter {
  chapter_id: number;
  book_id: number;
  chapter_number: string;
  chapter_description: string | null;
  chapter_notes: string | null;
  dt_added: Date;
  dt_modified: Date;
}

export interface Verse {
  verse_id: number;
  chapter_id: number;
  verse_index: number | null;
  verse: string;
  telugu_verse: string | null;
  dt_added: Date;
  dt_modified: Date;
}

export interface PersonalNote {
  personal_note_id: number;
  firebase_uid: string;
  note_title: string | null;
  note_content: string;
  dt_added: Date;
  dt_modified: Date;
}

export interface PersonalNoteInsert {
  note_title?: string;
  note_content: string;
}

export interface PersonalNoteUpdate {
  note_title?: string;
  note_content?: string;
}

export interface PersonalVerseNote {
  personal_verse_note_id: number;
  verse_id: number;
  personal_note_id: number;
  firebase_uid: string;
  dt_added: Date;
}

export interface BookCategory {
  category_id: number;
  category_name: string;
  category_order: number;
  dt_added: Date;
}
