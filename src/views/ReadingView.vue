<template>
  <div class="reading-view">
    <!-- Top nav -->
    <header class="reading-nav">
      <motion.button class="back-btn" :while-tap="tapScale" @click="router.push('/')">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </motion.button>

      <motion.button class="nav-title-btn" :while-tap="tapScale" @click="showChapterPicker = true">
        <span class="nav-book-name">{{ currentBook ? getBookName(currentBook) : '...' }}</span>
        <span v-if="selectedChapter" class="nav-chapter">Ch. {{ selectedChapter.chapter_number }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </motion.button>

      <motion.button class="search-btn" :while-tap="tapScale" @click="router.push('/search')">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </motion.button>
    </header>

    <!-- Search results navigation bar -->
    <div v-if="hasSearchNav" class="search-nav-bar">
      <button class="search-nav-clear" @click="clearSearchNav">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <span class="search-nav-text">{{ searchNavText }}</span>
      <div class="search-nav-btns">
        <button class="search-nav-btn" @click="navToPrev">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button class="search-nav-btn" @click="navToNext">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="state-overlay">
      <div class="spinner"></div>
    </div>

    <div v-else-if="error" class="state-overlay error-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p class="error-title">Failed to load</p>
      <p class="error-desc">Check your network connection and try again.</p>
      <motion.button class="retry-btn" :while-tap="tapScale" @click="retryLoad">Tap to retry</motion.button>
    </div>

    <!-- Verses — always keep mounted once loaded so versesEl ref stays valid during scrollPending -->
    <main v-else class="verses-scroll" ref="versesEl">
      <div v-if="!selectedChapter" class="empty-state">Select a chapter to start reading.</div>

      <div v-else>
        <div class="chapter-title">
          {{ currentBook ? getBookName(currentBook) : '' }} {{ selectedChapter.chapter_number }}
        </div>

        <motion.div
          v-for="(verse, index) in verses"
          :key="verse.verse_id"
          class="verse-row"
          :class="{ highlighted: String(verse.verse_index) === highlightedVerseIndex }"
          :data-verse-index="verse.verse_index"
          :initial="prefersReducedMotion ? false : { opacity: 0, y: 8 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="verseEnterTransition(index)"
          @click="selectVerse(verse.verse_id)"
        >
          <div class="verse-body">
            <!-- English on: num + english inline, telugu as block below -->
            <template v-if="settings.showEnglish">
              <span class="verse-num">{{ verse.verse_index }}</span><span class="verse-text" :style="{ fontSize: settings.fontSize + 'px' }" v-html="formatVerseWithPaleoBora(verse.verse, bookAbbreviations, getDisplayAbbr)"></span>
              <span
                v-if="settings.showTelugu && verse.telugu_verse"
                class="verse-telugu"
                :style="{ fontSize: settings.fontSize + 'px' }"
                v-html="formatVerseWithPaleoBora(verse.telugu_verse, bookAbbreviations, getDisplayAbbr)"
              ></span>
            </template>
            <!-- English off: num immediately adjacent to telugu (no comment nodes between) -->
            <template v-else>
              <span v-if="settings.showTelugu && verse.telugu_verse" class="verse-telugu" :style="{ fontSize: settings.fontSize + 'px' }"><span class="verse-num">{{ verse.verse_index }}</span><span v-html="formatVerseWithPaleoBora(verse.telugu_verse, bookAbbreviations, getDisplayAbbr)"></span></span>
              <span v-else class="verse-num">{{ verse.verse_index }}</span>
            </template>

            <div
              v-if="settings.showAdminNotes && verse.notes && verse.notes.length > 0"
              class="verse-notes admin-notes"
            >
              <div class="notes-label">Admin Notes</div>
              <div
                v-for="note in verse.notes"
                :key="note.verse_note_id"
                class="note-item"
              >
                <div v-if="note.note_title" class="note-title" v-html="formatVerseWithPaleoBora(note.note_title, bookAbbreviations, getDisplayAbbr)"></div>
                <div class="note-content" v-html="formatVerseWithPaleoBora(note.note_content, bookAbbreviations, getDisplayAbbr)"></div>
              </div>
            </div>

            <div
              v-if="settings.showMyNotes && !isAdmin && ((verse.my_notes && verse.my_notes.length > 0) || user)"
              class="verse-notes my-notes"
            >
              <div class="notes-label">My Notes</div>
              <div v-for="note in verse.my_notes" :key="note.personal_note_id" class="note-item">
                <template v-if="editingPersonalNoteId === note.personal_note_id">
                  <textarea v-model="editPersonalNoteContent" class="note-edit-textarea" rows="3"></textarea>
                  <div class="note-edit-actions">
                    <button class="note-save-btn" @click.stop="saveEditPersonalNote(verse.verse_id, note.personal_note_id)">Save</button>
                    <button class="note-cancel-btn" @click.stop="cancelEditPersonalNote">Cancel</button>
                  </div>
                </template>
                <template v-else>
                  <div class="note-content" v-html="formatVerseWithPaleoBora(note.note_content, bookAbbreviations, getDisplayAbbr)"></div>
                  <div class="note-inline-actions">
                    <button class="note-icon-btn" title="Edit note" @click.stop="startEditPersonalNote(note)">✎</button>
                    <button class="note-icon-btn" title="Delete note" @click.stop="deletePersonalNoteFromVerse(verse.verse_id, note.personal_verse_note_id, note.personal_note_id)">🗑</button>
                  </div>
                </template>
              </div>
              <div v-if="user" class="note-add-row">
                <template v-if="addingPersonalNoteVerseId === verse.verse_id">
                  <textarea v-model="newPersonalNoteContent" class="note-edit-textarea" rows="3" placeholder="New personal note…"></textarea>
                  <div class="note-edit-actions">
                    <button class="note-save-btn" @click.stop="saveNewPersonalNote(verse.verse_id)">Save</button>
                    <button class="note-cancel-btn" @click.stop="cancelAddPersonalNote">Cancel</button>
                  </div>
                </template>
                <button v-else class="note-add-btn" @click.stop="startAddPersonalNote(verse.verse_id)">+ Add my note</button>
              </div>
            </div>

            <div
              v-if="settings.showCrossReferences && verse.crossReferences && verse.crossReferences.length > 0"
              class="cross-refs"
            >
              <motion.button
                v-for="ref in (expandedCrossRefs.has(verse.verse_id) ? verse.crossReferences : verse.crossReferences.slice(0, 3))"
                :key="ref.cross_ref_id"
                class="cross-ref-chip"
                :while-tap="tapScale"
                @click="openCrossRef(ref)"
              >
                {{ getCrossRefLabel(ref) }} {{ ref.to_chapter }}:{{ ref.to_verse }}
              </motion.button>
              <motion.button
                v-if="!expandedCrossRefs.has(verse.verse_id) && verse.crossReferences.length > 3"
                class="cross-ref-chip cross-ref-more"
                :while-tap="tapScale"
                @click="expandedCrossRefs = new Set(expandedCrossRefs).add(verse.verse_id)"
              >
                +{{ verse.crossReferences.length - 3 }} more
              </motion.button>
            </div>

            <!-- Share action bar (visible when verse is selected) -->
            <div v-if="selectedVerseId === verse.verse_id" class="verse-actions" @click.stop>
              <div class="verse-actions-bar">
                <motion.button class="verse-action-btn" :while-tap="tapScale" @click.stop="shareVerse(verse)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                  Share
                </motion.button>
                <span v-if="copiedVerseId === verse.verse_id" class="copied-feedback">Copied!</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div v-if="verses.length === 0" class="empty-state">No verses found for this chapter.</div>

        <!-- Chapter nav -->
        <div class="chapter-nav-row">
          <motion.button
            v-if="prevChapter"
            class="chapter-nav-btn"
            :while-tap="tapScale"
            @click="navigateToChapter(prevChapter!.chapter_id)"
          >
            ← Ch. {{ prevChapter.chapter_number }}
          </motion.button>
          <span class="spacer"></span>
          <motion.button
            v-if="nextChapter"
            class="chapter-nav-btn"
            :while-tap="tapScale"
            @click="navigateToChapter(nextChapter!.chapter_id)"
          >
            Ch. {{ nextChapter.chapter_number }} →
          </motion.button>
        </div>
      </div>
    </main>

    <!-- Scroll-pending overlay: sits on top of already-rendered content so versesEl ref stays valid -->
    <div v-if="scrollPending" class="scroll-pending-overlay">
      <div class="spinner"></div>
    </div>

    <!-- Cross-reference preview bottom sheet -->
    <AnimatePresence>
      <motion.div
        v-if="crossRefSheet.show"
        class="sheet-backdrop"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="{ duration: prefersReducedMotion ? 0 : 0.18 }"
        @click="crossRefSheet.show = false"
      >
        <motion.div
          class="bottom-sheet cross-ref-sheet"
          :initial="{ y: '100%' }"
          :animate="{ y: 0 }"
          :exit="{ y: '100%' }"
          :transition="sheetSpring"
          @click.stop
        >
          <div class="sheet-handle"></div>
          <div class="sheet-header-row">
            <h3 class="sheet-title">{{ crossRefSheet.title }}</h3>
            <motion.button class="sheet-go-btn" :while-tap="tapScale" @click="goToCrossRef" title="Go to chapter">↗</motion.button>
          </div>
          <div class="cross-ref-body" @click="handleCrossRefBodyClick">
            <div v-if="crossRefSheet.loading" class="cross-ref-loading">
              <div class="spinner"></div>
            </div>
            <div v-else>
              <p v-if="!crossRefSheet.verseText" class="cross-ref-empty">Verse not found.</p>
              <p v-else class="cross-ref-verse" :style="{ fontSize: settings.fontSize + 'px' }" v-html="formatVerseWithPaleoBora(crossRefSheet.verseText, bookAbbreviations, getDisplayAbbr)"></p>
              <p v-if="crossRefSheet.teluguVerseText && settings.showTelugu" class="cross-ref-verse cross-ref-telugu" :style="{ fontSize: settings.fontSize + 'px' }" v-html="formatVerseWithPaleoBora(crossRefSheet.teluguVerseText, bookAbbreviations, getDisplayAbbr)"></p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>

    <!-- Chapter picker bottom sheet -->
    <AnimatePresence>
      <motion.div
        v-if="showChapterPicker"
        class="sheet-backdrop"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="{ duration: prefersReducedMotion ? 0 : 0.18 }"
        @click="showChapterPicker = false"
      >
        <motion.div
          class="bottom-sheet"
          :initial="{ y: '100%' }"
          :animate="{ y: 0 }"
          :exit="{ y: '100%' }"
          :transition="sheetSpring"
          @click.stop
        >
          <div class="sheet-handle"></div>
          <h3 class="sheet-title">Select Chapter</h3>
          <div class="chapter-list">
            <motion.button
              v-for="ch in chapters"
              :key="ch.chapter_id"
              class="chapter-item"
              :class="{ selected: ch.chapter_id === selectedChapter?.chapter_id }"
              :while-tap="tapScale"
              @click="openVersePicker(ch)"
            >
              {{ ch.chapter_number }}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>

    <!-- Verse picker bottom sheet -->
    <AnimatePresence>
      <motion.div
        v-if="showVersePicker"
        class="sheet-backdrop"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="{ duration: prefersReducedMotion ? 0 : 0.18 }"
        @click="showVersePicker = false"
      >
        <motion.div
          class="bottom-sheet"
          :initial="{ y: '100%' }"
          :animate="{ y: 0 }"
          :exit="{ y: '100%' }"
          :transition="sheetSpring"
          @click.stop
        >
          <div class="sheet-handle"></div>
          <h3 class="sheet-title">{{ currentBook ? getBookName(currentBook) : '' }} {{ versePickerChapter?.chapter_number }} — Select Verse</h3>
          <div v-if="versePickerLoading" class="sheet-loading">
            <div class="spinner"></div>
          </div>
          <div v-else class="chapter-list">
            <motion.button
              v-for="idx in versePickerIndices"
              :key="idx"
              class="chapter-item"
              :while-tap="tapScale"
              @click="navigateToPickerVerse(idx)"
            >
              {{ idx }}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { motion, AnimatePresence } from 'motion-v';
import { useMotionPresets } from '@/composables/useMotionPresets';
import { getBookById, getAllBooks } from '@/api/books';
import { getChaptersByBookId } from '@/api/chapters';
import { getVersesByChapterId } from '@/api/verses';
import type { Book, Chapter } from '@/utils/collectionReferences';
import type { VerseWithLinks } from '@/api/verses';
import { getChapterVersesWithCrossRefs } from '@/api/crossReferences';
import type { CrossReferenceData } from '@/api/crossReferences';
import { useSettings } from '@/composables/useSettings';
import { useBookLanguage } from '@/composables/useBookLanguage';
import { searchState } from '@/composables/useSearchState';
import { formatVerseWithPaleoBora } from '@/utils/formatVerse';
import { generateVerseCardImage, stripHtmlKeepPaleo } from '@/utils/paleoBora';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { InAppReview } from '@capacitor-community/in-app-review';
import { useAuth } from '@/composables/useAuth';
import {
  createPersonalNote,
  updatePersonalNote,
  deletePersonalNote,
  linkPersonalNoteToVerse,
  unlinkPersonalNoteFromVerse,
} from '@/api/personalNotes';

const route = useRoute();
const router = useRouter();
const settings = useSettings();
const { getBookName, getBookAbbr } = useBookLanguage();

// ── Motion (motion-v) ──────────────────────────────────────────────────────
// Respect the OS-level "reduce motion" preference across every animated element.
const { prefersReducedMotion, sheetSpring, tapScale, overlayFade, staggerTransition: verseEnterTransition } = useMotionPresets();

// Wake lock
let wakeLock: WakeLockSentinel | null = null;

async function acquireWakeLock() {
  if (!('wakeLock' in navigator)) return;
  try {
    wakeLock = await navigator.wakeLock.request('screen');
  } catch {}
}

function releaseWakeLock() {
  wakeLock?.release();
  wakeLock = null;
}

function onVisibilityChange() {
  if (document.visibilityState === 'visible' && settings.keepScreenOn) {
    acquireWakeLock();
  }
}

watch(() => settings.keepScreenOn, (on) => {
  on ? acquireWakeLock() : releaseWakeLock();
});

const currentBook = ref<Book | null>(null);
const chapters = ref<Chapter[]>([]);
const selectedChapter = ref<Chapter | null>(null);
const verses = ref<VerseWithLinks[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const showChapterPicker = ref(false);
const showVersePicker = ref(false);
const versePickerChapter = ref<Chapter | null>(null);
const versePickerIndices = ref<string[]>([]);
const versePickerLoading = ref(false);
const verseIndicesCache = new Map<number, string[]>();
const versesEl = ref<HTMLElement | null>(null);

// ── My Notes (personal, per-user) ────────────────────────────────────────
const { user, isAdmin } = useAuth();

const addingPersonalNoteVerseId = ref<number | null>(null);
const newPersonalNoteContent = ref('');
const editingPersonalNoteId = ref<number | null>(null);
const editPersonalNoteContent = ref('');

function startAddPersonalNote(verseId: number) {
  addingPersonalNoteVerseId.value = verseId;
  newPersonalNoteContent.value = '';
}

function cancelAddPersonalNote() {
  addingPersonalNoteVerseId.value = null;
  newPersonalNoteContent.value = '';
}

async function saveNewPersonalNote(verseId: number) {
  const content = newPersonalNoteContent.value.trim();
  if (!content) return;
  try {
    const { personal_note_id } = await createPersonalNote({ note_content: content });
    const { personal_verse_note_id } = await linkPersonalNoteToVerse(verseId, personal_note_id);
    const verse = verses.value.find(v => v.verse_id === verseId);
    if (verse) {
      verse.my_notes = [...(verse.my_notes || []), { personal_note_id, personal_verse_note_id, verse_id: verseId, note_content: content, note_title: null }];
    }
  } catch (err) {
    console.error('Failed to add personal note:', err);
  } finally {
    cancelAddPersonalNote();
  }
}

function startEditPersonalNote(note: { personal_note_id: number; note_content: string }) {
  editingPersonalNoteId.value = note.personal_note_id;
  editPersonalNoteContent.value = note.note_content;
}

function cancelEditPersonalNote() {
  editingPersonalNoteId.value = null;
  editPersonalNoteContent.value = '';
}

async function saveEditPersonalNote(verseId: number, personalNoteId: number) {
  const content = editPersonalNoteContent.value.trim();
  if (!content) return;
  try {
    await updatePersonalNote(personalNoteId, { note_content: content });
    const verse = verses.value.find(v => v.verse_id === verseId);
    const note = verse?.my_notes?.find(n => n.personal_note_id === personalNoteId);
    if (note) note.note_content = content;
  } catch (err) {
    console.error('Failed to update personal note:', err);
  } finally {
    cancelEditPersonalNote();
  }
}

async function deletePersonalNoteFromVerse(verseId: number, personalVerseNoteId: number, personalNoteId: number) {
  if (!confirm('Delete this note?')) return;
  try {
    await unlinkPersonalNoteFromVerse(personalVerseNoteId);
    await deletePersonalNote(personalNoteId);
    const verse = verses.value.find(v => v.verse_id === verseId);
    if (verse?.my_notes) {
      verse.my_notes = verse.my_notes.filter(n => n.personal_note_id !== personalNoteId);
    }
  } catch (err) {
    console.error('Failed to delete personal note:', err);
  }
}

const crossRefSheet = ref({
  show: false,
  loading: false,
  title: '',
  verseText: '',
  teluguVerseText: '',
  targetBookId: null as number | null,
  targetChapterId: null as number | null,
  targetVerseIndex: null as string | null,
});

const allBooks = ref<Book[]>([]);

function getDisplayAbbr(bookId: number, originalAbbr: string): string {
  const book = allBooks.value.find(b => b.book_id === bookId);
  return book ? getBookAbbr(book) : originalAbbr;
}

const selectedVerseId = ref<number | null>(null);
const copiedVerseId = ref<number | null>(null);

const pendingScrollToVerse = ref<string | null>(null);
const highlightedVerseIndex = ref<string | null>(null);
const scrollPending = ref(false);
const expandedCrossRefs = ref(new Set<number>());
const bookAbbreviations = ref<Record<string, number>>({});

// Search navigation bar
const hasSearchNav = computed(() => searchState.navResults.length > 0);
const searchNavText = computed(() => {
  if (!hasSearchNav.value || searchState.navCurrentIndex < 0) return '';
  return `${searchState.navCurrentIndex + 1} of ${searchState.navResults.length}`;
});

function clearSearchNav() {
  searchState.navResults = [];
  searchState.navCurrentIndex = -1;
}

function navToNext() {
  if (!searchState.navResults.length) return;
  const len = searchState.navResults.length;
  searchState.navCurrentIndex = (searchState.navCurrentIndex + 1) % len;
  const result = searchState.navResults[searchState.navCurrentIndex];
  router.replace({
    name: 'reading',
    params: { bookId: result.book_id, chapterId: result.chapter_id },
    query: { verse: result.verse_index != null ? String(result.verse_index) : undefined },
  });
}

function navToPrev() {
  if (!searchState.navResults.length) return;
  const len = searchState.navResults.length;
  searchState.navCurrentIndex = (searchState.navCurrentIndex - 1 + len) % len;
  const result = searchState.navResults[searchState.navCurrentIndex];
  router.replace({
    name: 'reading',
    params: { bookId: result.book_id, chapterId: result.chapter_id },
    query: { verse: result.verse_index != null ? String(result.verse_index) : undefined },
  });
}

// Shared helper: open the preview sheet for any book/chapter/verse
async function openVersePreview(
  targetBookId: number,
  toBookName: string,
  toChapter: string,
  toVerse: string,
  knownChapterId?: number,
) {
  crossRefSheet.value = {
    show: true,
    loading: true,
    title: `${toBookName} ${toChapter}:${toVerse}`,
    verseText: '',
    teluguVerseText: '',
    targetBookId,
    targetChapterId: knownChapterId ?? null,
    targetVerseIndex: toVerse,
  };
  try {
    let chId = knownChapterId;
    if (!chId) {
      const chaps = await getChaptersByBookId(targetBookId);
      chId = chaps.find(c => c.chapter_number === toChapter)?.chapter_id;
    }
    if (!chId) throw new Error('Chapter not found');
    crossRefSheet.value.targetChapterId = chId;
    const verseList = await getVersesByChapterId(chId);
    const verse = verseList.find(v => String(v.verse_index) === toVerse);
    crossRefSheet.value.verseText = verse?.verse ?? '';
    crossRefSheet.value.teluguVerseText = verse?.telugu_verse ?? '';
  } catch {
    crossRefSheet.value.verseText = '';
  } finally {
    crossRefSheet.value.loading = false;
  }
}

function getCrossRefLabel(crossRef: CrossReferenceData): string {
  if (crossRef.to_book_id) {
    const book = allBooks.value.find(b => b.book_id === crossRef.to_book_id);
    if (book) return getBookAbbr(book);
  }
  return crossRef.to_book_abbr || crossRef.to_book_name;
}

function openCrossRef(crossRef: CrossReferenceData) {
  if (!crossRef.to_book_id) return;
  const book = allBooks.value.find(b => b.book_id === crossRef.to_book_id);
  const bookLabel = book ? getBookName(book) : crossRef.to_book_name;
  openVersePreview(
    crossRef.to_book_id,
    bookLabel,
    String(crossRef.to_chapter),
    String(crossRef.to_verse),
    crossRef.target_chapter_id,
  );
}

function handleCrossRefBodyClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (target.tagName !== 'A' || !target.classList.contains('inline-verse-ref')) return;
  e.preventDefault();
  const targetBookId = parseInt(target.getAttribute('data-book-id') || '0');
  const chapter = target.getAttribute('data-chapter') || '';
  const verse = target.getAttribute('data-verse') || '';
  if (!targetBookId || !chapter || !verse) return;
  const bookName = target.textContent?.replace(/#/, '').replace(/\d.*/, '').trim() ?? '';
  openVersePreview(targetBookId, bookName, chapter, verse);
}

function handleInlineVerseClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (target.tagName !== 'A' || !target.classList.contains('inline-verse-ref')) return;
  e.preventDefault();
  e.stopPropagation();
  const targetBookId = parseInt(target.getAttribute('data-book-id') || '0');
  const chapter = target.getAttribute('data-chapter') || '';
  const verse = target.getAttribute('data-verse') || '';
  if (!targetBookId || !chapter || !verse) return;
  // Find book name from abbreviations map (reverse lookup via getAllBooks cache)
  const bookName = target.textContent?.replace(/#/, '').replace(/\d.*/, '').trim() ?? '';
  openVersePreview(targetBookId, bookName, chapter, verse);
}

async function goToCrossRef() {
  const { targetBookId, targetChapterId, targetVerseIndex } = crossRefSheet.value;
  console.log('[goToCrossRef] targetBookId:', targetBookId, 'targetChapterId:', targetChapterId, 'targetVerseIndex:', targetVerseIndex);
  console.log('[goToCrossRef] selectedChapter.chapter_id:', selectedChapter.value?.chapter_id);
  if (!targetBookId || !targetChapterId) {
    console.warn('[goToCrossRef] missing targetBookId or targetChapterId — aborting');
    return;
  }
  crossRefSheet.value.show = false;

  // Same chapter — no navigation needed, scroll directly
  if (targetChapterId === selectedChapter.value?.chapter_id) {
    console.log('[goToCrossRef] same chapter — scrolling directly to verse', targetVerseIndex);
    pendingScrollToVerse.value = targetVerseIndex;
    await applyPendingScroll();
    return;
  }

  // Different chapter — set pending scroll then navigate; watch will pick it up
  console.log('[goToCrossRef] different chapter — setting pendingScrollToVerse and navigating');
  pendingScrollToVerse.value = targetVerseIndex;
  router.replace({ name: 'reading', params: { bookId: targetBookId, chapterId: targetChapterId } });
}

const bookId = computed(() => Number(route.params.bookId));
const chapterId = computed(() => route.params.chapterId ? Number(route.params.chapterId) : null);

const sortedChapters = computed(() =>
  [...chapters.value].sort((a, b) => parseInt(a.chapter_number) - parseInt(b.chapter_number)),
);

const currentIndex = computed(() =>
  sortedChapters.value.findIndex(c => c.chapter_id === selectedChapter.value?.chapter_id),
);

const prevChapter = computed(() =>
  currentIndex.value > 0 ? sortedChapters.value[currentIndex.value - 1] : null,
);

const nextChapter = computed(() =>
  currentIndex.value < sortedChapters.value.length - 1
    ? sortedChapters.value[currentIndex.value + 1]
    : null,
);

async function loadVerses(chapter: Chapter) {
  selectedChapter.value = chapter;
  selectedVerseId.value = null;
  verses.value = [];
  try {
    verses.value = await getChapterVersesWithCrossRefs(chapter.chapter_id);
    // Track chapters read for the review prompt
    settings.chaptersRead = (settings.chaptersRead ?? 0) + 1;
    if (!settings.hasRequestedReview && settings.chaptersRead >= 5 && Capacitor.isNativePlatform()) {
      settings.hasRequestedReview = true;
      try { await InAppReview.requestReview(); } catch {}
    }
  } catch {
    // verses stay empty
  }
  versesEl.value?.scrollTo({ top: 0 });
}

async function applyPendingScroll(chapter?: Chapter) {
  console.log('[applyPendingScroll] called, pendingScrollToVerse:', pendingScrollToVerse.value, 'chapter:', chapter?.chapter_id);
  if (!pendingScrollToVerse.value) {
    console.log('[applyPendingScroll] no pending verse — skipping scroll');
    return;
  }
  const verseIdx = pendingScrollToVerse.value;
  pendingScrollToVerse.value = null;
  scrollPending.value = true;
  try {
    await nextTick();
    await document.fonts.ready;
    await new Promise<void>(r => requestAnimationFrame(() => r()));
    const el = versesEl.value?.querySelector(`[data-verse-index="${verseIdx}"]`) as HTMLElement | null;
    console.log('[applyPendingScroll] looking for [data-verse-index="' + verseIdx + '"] →', el ? 'FOUND' : 'NOT FOUND');
    console.log('[applyPendingScroll] versesEl:', versesEl.value, 'verses count:', verses.value.length);
    if (el && versesEl.value) {
      const containerTop = versesEl.value.getBoundingClientRect().top;
      const elTop = el.getBoundingClientRect().top;
      const scrollDelta = elTop - containerTop - 16;
      console.log('[applyPendingScroll] scrollTop before:', versesEl.value.scrollTop, 'delta:', scrollDelta);
      versesEl.value.scrollTop += scrollDelta;
      console.log('[applyPendingScroll] scrollTop after:', versesEl.value.scrollTop);
      highlightedVerseIndex.value = verseIdx;
      setTimeout(() => { highlightedVerseIndex.value = null; }, 5000);
    } else {
      console.warn('[applyPendingScroll] could not scroll — el:', el, 'versesEl:', versesEl.value);
    }
  } finally {
    scrollPending.value = false;
    // Start cross-ref loading only after scroll is settled
  }
}

function navigateToChapter(id: number) {
  router.replace({ name: 'reading', params: { bookId: bookId.value, chapterId: id } });
}

async function openVersePicker(ch: Chapter) {
  showChapterPicker.value = false;
  versePickerChapter.value = ch;
  showVersePicker.value = true;
  // Reuse already-loaded verses if it's the current chapter
  if (ch.chapter_id === selectedChapter.value?.chapter_id && verses.value.length) {
    versePickerIndices.value = verses.value
      .map(v => String(v.verse_index))
      .filter(Boolean)
      .sort((a, b) => parseInt(a) - parseInt(b));
    return;
  }
  if (verseIndicesCache.has(ch.chapter_id)) {
    versePickerIndices.value = verseIndicesCache.get(ch.chapter_id)!;
    return;
  }
  versePickerLoading.value = true;
  try {
    const vs = await getVersesByChapterId(ch.chapter_id);
    const indices = vs
      .map(v => String(v.verse_index))
      .filter(Boolean)
      .sort((a, b) => parseInt(a) - parseInt(b));
    verseIndicesCache.set(ch.chapter_id, indices);
    versePickerIndices.value = indices;
  } finally {
    versePickerLoading.value = false;
  }
}

function navigateToPickerVerse(verseIndex: string) {
  if (!versePickerChapter.value) return;
  showVersePicker.value = false;
  router.replace({
    name: 'reading',
    params: { bookId: bookId.value, chapterId: versePickerChapter.value.chapter_id },
    query: { verse: verseIndex },
  });
}

function selectVerse(verseId: number) {
  selectedVerseId.value = selectedVerseId.value === verseId ? null : verseId;
}

async function shareVerse(verse: VerseWithLinks) {
  if (!selectedChapter.value || !currentBook.value) return;
  const reference = `${getBookName(currentBook.value)} ${selectedChapter.value.chapter_number}:${verse.verse_index}`;
  const bookSlug = currentBook.value.book_name.toLowerCase().replace(/\s+/g, '-');
  const verseUrl = `https://eat-rstne-26.web.app/${bookSlug}/${selectedChapter.value.chapter_number}/${verse.verse_index}`;
  selectedVerseId.value = null;
  try {
    const cardFile = await generateVerseCardImage({
      reference,
      englishText: verse.verse ? stripHtmlKeepPaleo(verse.verse) : undefined,
      teluguText: settings.showTelugu && verse.telugu_verse ? stripHtmlKeepPaleo(verse.telugu_verse) : undefined,
      verseNotes: settings.showAdminNotes && verse.notes?.length ? verse.notes : undefined,
      verseUrl,
      fontSizePx: settings.fontSize,
    });
    // Convert to base64 (strip data URL prefix) and write to cache file
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(cardFile);
    });
    const base64 = dataUrl.split(',')[1];
    await Filesystem.writeFile({ path: 'verse-share.png', data: base64, directory: Directory.Cache });
    const { uri } = await Filesystem.getUri({ path: 'verse-share.png', directory: Directory.Cache });
    await Share.share({ title: reference, text: verseUrl, files: [uri], dialogTitle: 'Share verse' });
  } catch {
    // user cancelled or share failed
  }
}

async function retryLoad() {
  loading.value = true;
  error.value = null;
  let loadedChapter: Chapter | undefined;
  try {
    const [book, chaps] = await Promise.all([
      getBookById(bookId.value),
      getChaptersByBookId(bookId.value),
    ]);
    currentBook.value = book;
    chapters.value = chaps;
    const sorted = [...chaps].sort((a, b) => parseInt(a.chapter_number) - parseInt(b.chapter_number));
    const target = chapterId.value ? chaps.find(c => c.chapter_id === chapterId.value) : sorted[0];
    if (target) {
      loadedChapter = target;
      const verseParam = route.query.verse ? String(route.query.verse) : null;
      await loadVerses(target);
      if (verseParam) pendingScrollToVerse.value = verseParam;
    }
  } catch {
    error.value = 'failed';
  } finally {
    loading.value = false;
  }
  await applyPendingScroll(loadedChapter);
}

onMounted(async () => {
  if (settings.keepScreenOn) acquireWakeLock();
  document.addEventListener('visibilitychange', onVisibilityChange);
  document.addEventListener('click', handleInlineVerseClick);

  // Build book abbreviation map in background (cached, won't block)
  getAllBooks().then(books => {
    allBooks.value = books;
    const map: Record<string, number> = {};
    books.forEach(b => {
      if (b.book_abbr) map[b.book_abbr.toLowerCase()] = b.book_id;
      if (b.hebrew_book_abbr) map[b.hebrew_book_abbr.toLowerCase()] = b.book_id;
      if (b.telugu_book_abbr) map[b.telugu_book_abbr.toLowerCase()] = b.book_id;
    });
    bookAbbreviations.value = map;
  }).catch(() => {});

  let loadedChapter: Chapter | undefined;
  try {
    const [book, chaps] = await Promise.all([
      getBookById(bookId.value),
      getChaptersByBookId(bookId.value),
    ]);
    currentBook.value = book;
    chapters.value = chaps;

    const targetId = chapterId.value;
    const sorted = [...chaps].sort((a, b) => parseInt(a.chapter_number) - parseInt(b.chapter_number));
    const target = targetId ? chaps.find(c => c.chapter_id === targetId) : sorted[0];

    if (target) {
      loadedChapter = target;
      const verseParam = route.query.verse ? String(route.query.verse) : null;
      await loadVerses(target);
      if (verseParam) pendingScrollToVerse.value = verseParam;
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load book';
  } finally {
    loading.value = false;
  }
  await applyPendingScroll(loadedChapter);
});

onUnmounted(() => {
  releaseWakeLock();
  document.removeEventListener('visibilitychange', onVisibilityChange);
  document.removeEventListener('click', handleInlineVerseClick);
});

// Handles push-notification deep links that land on the same bookId+chapterId
// but need to scroll to a (possibly identical) verse. _t changes every tap so
// Vue Router always navigates, and this watch always fires.
watch(
  () => [route.query.verse, route.query._t] as const,
  ([newVerse]) => {
    if (!newVerse || !selectedChapter.value) return;
    pendingScrollToVerse.value = String(newVerse);
    applyPendingScroll(selectedChapter.value);
  },
);

watch([bookId, chapterId], async ([newBookId, newChapterId], [oldBookId]) => {
  console.log('[watch bookId/chapterId] newBookId:', newBookId, 'oldBookId:', oldBookId, 'newChapterId:', newChapterId, 'pendingScrollToVerse:', pendingScrollToVerse.value);
  if (newBookId !== oldBookId) {
    // Book changed — reload book, chapters, then target chapter
    loading.value = true;
    error.value = null;
    let loadedChapter: Chapter | undefined;
    try {
      const [book, chaps] = await Promise.all([
        getBookById(newBookId),
        getChaptersByBookId(newBookId),
      ]);
      currentBook.value = book;
      chapters.value = chaps;
      const sorted = [...chaps].sort((a, b) => parseInt(a.chapter_number) - parseInt(b.chapter_number));
      const target = newChapterId ? chaps.find(c => c.chapter_id === newChapterId) : sorted[0];
      if (target) {
        loadedChapter = target;
        const verseParam = route.query.verse ? String(route.query.verse) : null;
        if (verseParam) pendingScrollToVerse.value = verseParam;
        await loadVerses(target);
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load book';
    } finally {
      loading.value = false;
    }
    await applyPendingScroll(loadedChapter);
  } else if (newChapterId) {
    // Same book, different chapter
    const ch = chapters.value.find(c => c.chapter_id === newChapterId);
    if (ch) {
      const verseParam = route.query.verse ? String(route.query.verse) : null;
      if (verseParam) pendingScrollToVerse.value = verseParam;
      await loadVerses(ch);
      await applyPendingScroll(ch);
    }
  }
});
</script>

<style scoped>
.reading-view {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-background);
  overflow: hidden;
}

.reading-nav {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-3);
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.search-nav-bar {
  position: fixed;
  bottom: calc(var(--nav-height) + var(--safe-area-bottom) + 16px);
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 10px 16px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  z-index: 50;
  animation: searchNavSlideUp 0.3s ease-out;
  white-space: nowrap;
}

@keyframes searchNavSlideUp {
  from {
    transform: translateX(-50%) translateY(80px);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

.search-nav-clear {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 6px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
  min-height: 36px;
  min-width: 36px;
  flex-shrink: 0;
}

.search-nav-clear:active {
  background: rgba(255, 255, 255, 0.35);
}

.search-nav-text {
  font-size: 14px;
  font-weight: 600;
  color: white;
  min-width: 60px;
  text-align: center;
}

.search-nav-btns {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.search-nav-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
  min-height: 36px;
  min-width: 36px;
}

.search-nav-btn:active {
  background: rgba(255, 255, 255, 0.35);
  transform: scale(0.95);
}

.back-btn,
.search-btn {
  color: var(--color-primary);
  padding: var(--space-2);
  border-radius: var(--radius-default);
  flex-shrink: 0;
}

.nav-title-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-default);
  background: var(--color-muted);
  color: var(--color-foreground);
}

.nav-book-name {
  font-weight: 700;
  font-size: var(--font-size-base);
}

.nav-chapter {
  font-size: var(--font-size-sm);
  color: var(--color-muted-foreground);
}

.error-state {
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-6);
  text-align: center;
}

.error-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-error);
  margin: 4px 0 0;
}

.error-desc {
  font-size: var(--font-size-sm);
  color: var(--color-muted-foreground);
  margin: 0;
}

.retry-btn {
  margin-top: var(--space-2);
  padding: 10px 28px;
  background: var(--color-primary);
  color: var(--color-primary-foreground);
  border: none;
  border-radius: var(--radius-default);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  min-height: 44px;
  -webkit-tap-highlight-color: transparent;
}

.state-overlay {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scroll-pending-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(255 255 255 / 0.75);
  z-index: 10;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-text {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  padding: var(--space-5);
  text-align: center;
}

.verses-scroll {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: var(--space-4) var(--space-4) var(--space-6);
}

.chapter-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-foreground);
  margin-bottom: var(--space-4);
}

.verse-row {
  display: block;
  margin-bottom: var(--spacing-verse-gap);
  border-radius: var(--radius-default);
  padding: var(--space-1) var(--space-2);
  margin-left: -6px;
  transition: background var(--duration-normal) var(--ease-default);
}

.verse-row.highlighted {
  background: var(--color-highlight-bg);
  transition: background 0s;
}

.verse-num {
  display: inline;
  font-size: 0.75em;
  font-weight: 700;
  color: var(--color-muted-foreground);
  margin-right: 4px;
}

.verse-body {
  display: block;
}

.verse-text {
  display: inline;
  color: var(--color-foreground);
  line-height: var(--leading-reading);
  font-family: var(--font-family-body);
}

:deep(.verse-text p),
:deep(.verse-telugu p) {
  display: inline;
  margin: 0;
  padding: 0;
}

.verse-telugu {
  display: block;
  color: var(--color-foreground);
  line-height: var(--leading-reading);
  margin-top: 4px;
  font-family: var(--font-family-telugu);
}

/* Notes */
.verse-notes {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.note-item {
  background: var(--color-note-bg);
  border-left: 3px solid var(--color-note-border);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  padding: var(--space-2) var(--space-3);
}

.note-title {
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--color-note-title);
  margin-bottom: 2px;
  font-family: var(--font-family-telugu);
}

.note-content {
  font-size: var(--font-size-sm);
  color: var(--color-note-text);
  line-height: 1.6;
  font-family: var(--font-family-telugu);
}

.notes-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  opacity: 0.6;
}

.my-notes .note-item {
  border-left-color: #1E40AF;
}

.note-inline-actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.note-icon-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: rgba(0, 0, 0, 0.06);
  border-radius: var(--radius-sm);
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.note-add-row {
  margin-top: var(--space-1);
}

.note-add-btn {
  min-height: 40px;
  border: 1.5px dashed #b9c3d9;
  background: transparent;
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.note-edit-textarea {
  width: 100%;
  min-height: 64px;
  padding: var(--space-2) var(--space-3);
  border: 1.5px solid #d1d5db;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-family: inherit;
  resize: vertical;
}

.note-edit-textarea:focus {
  outline: none;
  border-color: #1E40AF;
}

.note-edit-actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.note-save-btn,
.note-cancel-btn {
  min-height: 36px;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  border: none;
  -webkit-tap-highlight-color: transparent;
}

.note-save-btn {
  background: #1E40AF;
  color: #fff;
}

.note-cancel-btn {
  background: rgba(0, 0, 0, 0.08);
  color: #333;
}

/* Cross references */
.cross-refs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}

.cross-refs-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-muted-foreground);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.verse-text :deep(.inline-verse-ref),
.verse-telugu :deep(.inline-verse-ref),
.note-content :deep(.inline-verse-ref),
.cross-ref-verse :deep(.inline-verse-ref) {
  color: var(--color-primary);
  text-decoration: underline;
  text-decoration-style: dotted;
  -webkit-tap-highlight-color: transparent;
  font-size: 0.72em;
  vertical-align: super;
  line-height: 0;
}

.cross-ref-chip {
  font-size: var(--font-size-xs);
  color: var(--color-primary);
  background: var(--color-primary-light);
  border-radius: var(--radius-full);
  padding: 3px 10px;
  font-weight: 500;
  -webkit-tap-highlight-color: transparent;
}

.cross-ref-more {
  color: var(--color-muted-foreground);
  background: var(--color-muted);
}

/* Cross-ref preview sheet */
.cross-ref-sheet {
  max-height: 60vh;
}

.sheet-header-row {
  display: flex;
  align-items: center;
  padding: 4px var(--space-4) var(--space-3);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.sheet-header-row .sheet-title {
  flex: 1;
  text-align: left;
  padding: 0;
  border-bottom: none;
  font-size: var(--font-size-base);
}

.sheet-go-btn {
  font-size: var(--font-size-lg);
  color: var(--color-primary);
  padding: 4px var(--space-2);
  -webkit-tap-highlight-color: transparent;
}

.cross-ref-body {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: var(--space-4);
}

.cross-ref-loading {
  display: flex;
  justify-content: center;
  padding: var(--space-5) 0;
}

.cross-ref-verse {
  color: var(--color-foreground);
  line-height: var(--leading-reading);
  margin: 0;
  font-family: var(--font-family-body);
}

.cross-ref-telugu {
  margin-top: var(--space-2);
  font-family: var(--font-family-telugu);
}

.cross-ref-empty {
  color: var(--color-muted-foreground);
  font-size: var(--font-size-sm);
  text-align: center;
  margin: 0;
}

.empty-state {
  text-align: center;
  color: var(--color-muted-foreground);
  font-size: var(--font-size-sm);
  padding: var(--space-8) var(--space-5);
}

/* Verse share action bar */
.verse-actions {
  margin-top: var(--space-2);
}

.verse-actions-bar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.verse-action-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-primary);
  padding: 6px 14px;
  border-radius: var(--radius-full);
  background: var(--color-primary-light);
  -webkit-tap-highlight-color: transparent;
  min-height: 44px;
}

.copied-feedback {
  font-size: 12px;
  color: var(--color-success);
  font-weight: 500;
}

.chapter-nav-row {
  display: flex;
  align-items: center;
  margin-top: var(--space-8);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.spacer { flex: 1; }

.chapter-nav-btn {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-primary);
  padding: 10px var(--space-4);
  border-radius: var(--radius-default);
  background: var(--color-primary-light);
}

/* Bottom sheet — enter/exit animation is driven by motion-v (AnimatePresence + spring) */
.sheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 0.4);
  display: flex;
  align-items: flex-end;
  z-index: 100;
}

.bottom-sheet {
  background: var(--color-card);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  width: 100%;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  padding-bottom: var(--safe-area-bottom);
  box-shadow: var(--shadow-sheet);
}

.sheet-handle {
  width: 36px;
  height: 4px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  margin: var(--space-3) auto var(--space-2);
  flex-shrink: 0;
}

.sheet-title {
  font-size: var(--font-size-md);
  font-weight: 700;
  text-align: center;
  color: var(--color-foreground);
  padding: 4px var(--space-4) var(--space-3);
  flex-shrink: 0;
  border-bottom: 1px solid var(--color-border);
}

.sheet-loading {
  display: flex;
  justify-content: center;
  padding: var(--space-6) 0;
}

.chapter-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-2);
  padding: var(--space-4);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.chapter-item {
  aspect-ratio: 1;
  border-radius: var(--radius-lg);
  background: var(--color-muted);
  color: var(--color-neutral-700);
  font-size: var(--font-size-base);
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chapter-item.selected {
  background: var(--color-primary);
  color: var(--color-primary-foreground);
}
</style>
