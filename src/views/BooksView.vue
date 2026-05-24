<template>
  <div class="books-view">
    <header class="page-header">
      <div class="header-top">
        <div class="header-text">
          <h1>EAT RSTNE 26</h1>
          <p>Restoration Scriptures True Name Edition in English and Telugu</p>
        </div>
        <div class="lang-selector">
          <button
            v-for="opt in langOptions"
            :key="opt.value"
            :class="['lang-btn', { active: bookNameLanguage === opt.value }]"
            @click="bookNameLanguage = opt.value"
          >{{ opt.label }}</button>
        </div>
      </div>
    </header>

    <!-- Quick-access nav -->
    <div class="quick-nav">
      <button class="quick-nav-btn reading-plan-btn" @click="router.push({ name: 'weekly-reading' })">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Reading Plan
      </button>
      <button class="quick-nav-btn feasts-btn" @click="router.push({ name: 'feasts' })">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        Annual Feasts
      </button>
    </div>

    <div v-if="loading" class="state-container">
      <div class="spinner"></div>
    </div>

    <div v-else-if="error" class="state-container error-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p class="error-title">Failed to load books</p>
      <p class="error-desc">Check your network connection and try again.</p>
      <button class="retry-btn" @click="loadBooks">Tap to retry</button>
    </div>

    <div v-else class="books-scroll">
      <section v-if="firstCovenantBooks.length" class="category-section">
        <h2 class="category-heading first-covenant">First Covenant</h2>
        <div class="books-grid">
          <button
            v-for="book in firstCovenantBooks"
            :key="book.book_id"
            class="book-card first-covenant-card"
            @click="selectBook(book)"
          >
            <span class="book-name">{{ getBookName(book) }}</span>
            <span class="chapter-count">{{ book.chapter_count ?? 0 }} ch.</span>
          </button>
        </div>
      </section>

      <section v-if="newCovenantBooks.length" class="category-section">
        <h2 class="category-heading new-covenant">New Covenant</h2>
        <div class="books-grid">
          <button
            v-for="book in newCovenantBooks"
            :key="book.book_id"
            class="book-card new-covenant-card"
            @click="selectBook(book)"
          >
            <span class="book-name">{{ getBookName(book) }}</span>
            <span class="chapter-count">{{ book.chapter_count ?? 0 }} ch.</span>
          </button>
        </div>
      </section>

      <section v-if="apocryphalBooks.length" class="category-section">
        <h2 class="category-heading apocryphal">Restored Apocryphal</h2>
        <div class="books-grid">
          <button
            v-for="book in apocryphalBooks"
            :key="book.book_id"
            class="book-card apocryphal-card"
            @click="selectBook(book)"
          >
            <span class="book-name">{{ getBookName(book) }}</span>
            <span class="chapter-count">{{ book.chapter_count ?? 0 }} ch.</span>
          </button>
        </div>
      </section>
    </div>

    <!-- Chapter picker bottom sheet -->
    <Transition name="sheet">
      <div v-if="showChapterPicker" class="sheet-backdrop" @click="showChapterPicker = false">
        <div class="bottom-sheet" @click.stop>
          <div class="sheet-handle"></div>
          <h3 class="sheet-title">{{ pickerBook ? getBookName(pickerBook) : '' }} — Select Chapter</h3>
          <div v-if="chaptersLoading" class="sheet-loading">
            <div class="spinner"></div>
          </div>
          <div v-else class="chapter-list">
            <button
              v-for="ch in pickerChapters"
              :key="ch.chapter_id"
              class="chapter-item"
              @click="selectChapter(ch)"
            >
              {{ ch.chapter_number }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Verse picker bottom sheet -->
    <Transition name="sheet">
      <div v-if="showVersePicker" class="sheet-backdrop" @click="showVersePicker = false">
        <div class="bottom-sheet" @click.stop>
          <div class="sheet-handle"></div>
          <h3 class="sheet-title">{{ pickerBook ? getBookName(pickerBook) : '' }} {{ pickerChapter?.chapter_number }} — Select Verse</h3>
          <div v-if="versesLoading" class="sheet-loading">
            <div class="spinner"></div>
          </div>
          <div v-else class="chapter-list">
            <button
              v-for="verseIndex in pickerVerseIndices"
              :key="verseIndex"
              class="chapter-item"
              @click="navigateToVerse(verseIndex)"
            >
              {{ verseIndex }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAllBooks } from '@/api/books';
import { getChaptersByBookId } from '@/api/chapters';
import { getVersesByChapterId } from '@/api/verses';
import type { Book, Chapter } from '@/utils/collectionReferences';
import { useBookLanguage, type BookNameLanguage } from '@/composables/useBookLanguage';

const router = useRouter();
const books = ref<Book[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const { bookNameLanguage, getBookName } = useBookLanguage();

const langOptions: { value: BookNameLanguage; label: string }[] = [
  { value: 'english', label: 'EN' },
  { value: 'hebrew', label: 'HE' },
  { value: 'telugu', label: 'TE' },
];

// Pickers state
const showChapterPicker = ref(false);
const showVersePicker = ref(false);
const pickerBook = ref<Book | null>(null);
const pickerChapter = ref<Chapter | null>(null);
const pickerChapters = ref<Chapter[]>([]);
const pickerVerseIndices = ref<string[]>([]);
const chaptersLoading = ref(false);
const versesLoading = ref(false);

// Caches
const chaptersCache = new Map<number, Chapter[]>();
const verseIndicesCache = new Map<number, string[]>();

const sorted = computed(() =>
  [...books.value].sort((a, b) => (a.book_index ?? 9999) - (b.book_index ?? 9999)),
);
const firstCovenantBooks = computed(() => sorted.value.filter(b => b.category_id === 1));
const newCovenantBooks = computed(() => sorted.value.filter(b => b.category_id === 2));
const apocryphalBooks = computed(() => sorted.value.filter(b => b.category_id === 3));

async function selectBook(book: Book) {
  pickerBook.value = book;
  pickerChapter.value = null;
  showChapterPicker.value = true;
  if (chaptersCache.has(book.book_id)) {
    pickerChapters.value = chaptersCache.get(book.book_id)!;
    return;
  }
  chaptersLoading.value = true;
  try {
    const chaps = await getChaptersByBookId(book.book_id);
    const sorted = [...chaps].sort((a, b) => parseInt(a.chapter_number) - parseInt(b.chapter_number));
    chaptersCache.set(book.book_id, sorted);
    pickerChapters.value = sorted;
  } finally {
    chaptersLoading.value = false;
  }
}

async function selectChapter(chapter: Chapter) {
  pickerChapter.value = chapter;
  showChapterPicker.value = false;
  showVersePicker.value = true;
  if (verseIndicesCache.has(chapter.chapter_id)) {
    pickerVerseIndices.value = verseIndicesCache.get(chapter.chapter_id)!;
    return;
  }
  versesLoading.value = true;
  try {
    const verses = await getVersesByChapterId(chapter.chapter_id);
    const indices = verses
      .map(v => String(v.verse_index))
      .filter(Boolean)
      .sort((a, b) => parseInt(a) - parseInt(b));
    verseIndicesCache.set(chapter.chapter_id, indices);
    pickerVerseIndices.value = indices;
  } finally {
    versesLoading.value = false;
  }
}

function navigateToVerse(verseIndex: string) {
  if (!pickerBook.value || !pickerChapter.value) return;
  showVersePicker.value = false;
  router.push({
    name: 'reading',
    params: { bookId: pickerBook.value.book_id, chapterId: pickerChapter.value.chapter_id },
    query: { verse: verseIndex },
  });
}

async function loadBooks() {
  loading.value = true;
  error.value = null;
  try {
    books.value = await getAllBooks();
  } catch {
    error.value = 'failed';
  } finally {
    loading.value = false;
  }
}

onMounted(loadBooks);
</script>

<style scoped>
.books-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.page-header {
  padding: 12px 16px 10px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.header-text {
  flex: 1;
  min-width: 0;
}

.page-header h1 {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
}

.page-header p {
  font-size: 11px;
  color: #6b7280;
  margin-top: 2px;
}

.lang-selector {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.lang-btn {
  padding: 5px 10px;
  border-radius: 6px;
  border: 1.5px solid #d1d5db;
  background: #f5f5f5;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  color: #6b7280;
  -webkit-tap-highlight-color: transparent;
  min-height: 32px;
}

.lang-btn:active {
  opacity: 0.7;
}

.lang-btn.active {
  background: #1a1a2e;
  border-color: #1a1a2e;
  color: #fff;
}

.quick-nav {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.quick-nav-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 8px;
  border-radius: 10px;
  border: 1.5px solid;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  min-height: 40px;
  transition: opacity 0.1s;
}

.quick-nav-btn:active { opacity: 0.7; }

.reading-plan-btn {
  background: #FFF8DC;
  color: #8B4513;
  border-color: #DEB887;
}

.feasts-btn {
  background: #EFF6FF;
  color: #1E40AF;
  border-color: #BFDBFE;
}

.books-scroll {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 12px 12px 16px;
}

.state-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e5e7eb;
  border-top-color: #1E40AF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  flex-direction: column;
  gap: 8px;
  padding: 24px;
  text-align: center;
}

.error-title {
  font-size: 16px;
  font-weight: 600;
  color: #dc2626;
  margin: 4px 0 0;
}

.error-desc {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.retry-btn {
  margin-top: 8px;
  padding: 10px 28px;
  background: #1E40AF;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  min-height: 44px;
  -webkit-tap-highlight-color: transparent;
}

.category-section {
  margin-bottom: 20px;
}

.category-heading {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 10px;
  padding-left: 2px;
}

.category-heading.first-covenant { color: #8B4513; }
.category-heading.new-covenant { color: #1E40AF; }
.category-heading.apocryphal { color: #6B21A8; }

.books-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.book-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 6px;
  border-radius: 10px;
  border: 1.5px solid transparent;
  min-height: 68px;
  text-align: center;
  transition: opacity 0.1s;
  -webkit-tap-highlight-color: transparent;
}

.book-card:active {
  opacity: 0.7;
}

.first-covenant-card {
  background: var(--color-first-covenant-bg);
  color: var(--color-first-covenant-text);
  border-color: var(--color-first-covenant-border);
}

.new-covenant-card {
  background: var(--color-new-covenant-bg);
  color: var(--color-new-covenant-text);
  border-color: var(--color-new-covenant-border);
}

.apocryphal-card {
  background: var(--color-apocryphal-bg);
  color: var(--color-apocryphal-text);
  border-color: var(--color-apocryphal-border);
}

.book-name {
  font-size: 12px;
  font-weight: 700;
  line-height: 1.3;
}

.chapter-count {
  font-size: 10px;
  opacity: 0.75;
  font-weight: 500;
}

@media (min-width: 400px) {
  .books-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Bottom sheet */
.sheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  z-index: 100;
}

.bottom-sheet {
  background: #fff;
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  padding-bottom: var(--safe-area-bottom);
}

.sheet-handle {
  width: 36px;
  height: 4px;
  background: #d1d5db;
  border-radius: 2px;
  margin: 12px auto 8px;
  flex-shrink: 0;
}

.sheet-title {
  font-size: 16px;
  font-weight: 700;
  text-align: center;
  color: #1a1a2e;
  padding: 4px 16px 12px;
  flex-shrink: 0;
  border-bottom: 1px solid #e5e7eb;
}

.sheet-loading {
  display: flex;
  justify-content: center;
  padding: 24px 0;
}

.chapter-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  padding: 16px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.chapter-item {
  aspect-ratio: 1;
  border-radius: 10px;
  background: #f3f4f6;
  color: #374151;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
}

.chapter-item:active {
  opacity: 0.7;
}

/* Transitions */
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.2s;
}
.sheet-enter-active .bottom-sheet,
.sheet-leave-active .bottom-sheet {
  transition: transform 0.25s ease;
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from .bottom-sheet,
.sheet-leave-to .bottom-sheet {
  transform: translateY(100%);
}
</style>
