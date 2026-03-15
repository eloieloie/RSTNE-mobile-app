<template>
  <div class="reading-view">
    <!-- Top nav -->
    <header class="reading-nav">
      <button class="back-btn" @click="router.push('/')">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>

      <button class="nav-title-btn" @click="showChapterPicker = true">
        <span class="nav-book-name">{{ currentBook?.book_name ?? '...' }}</span>
        <span v-if="selectedChapter" class="nav-chapter">Ch. {{ selectedChapter.chapter_number }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      <button class="search-btn" @click="router.push('/search')">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </button>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="state-overlay">
      <div class="spinner"></div>
    </div>

    <div v-else-if="error" class="state-overlay error-text">{{ error }}</div>

    <!-- Verses -->
    <main v-else class="verses-scroll" ref="versesEl">
      <div v-if="!selectedChapter" class="empty-state">Select a chapter to start reading.</div>

      <div v-else>
        <div class="chapter-title">
          {{ currentBook?.book_name }} {{ selectedChapter.chapter_number }}
        </div>

        <div
          v-for="verse in verses"
          :key="verse.verse_id"
          class="verse-row"
        >
          <span class="verse-num">{{ verse.verse_index }}</span>
          <span class="verse-text" v-html="verse.verse"></span>
        </div>

        <div v-if="verses.length === 0" class="empty-state">No verses found for this chapter.</div>

        <!-- Chapter nav -->
        <div class="chapter-nav-row">
          <button
            v-if="prevChapter"
            class="chapter-nav-btn"
            @click="navigateToChapter(prevChapter!.chapter_id)"
          >
            ← Ch. {{ prevChapter.chapter_number }}
          </button>
          <span class="spacer"></span>
          <button
            v-if="nextChapter"
            class="chapter-nav-btn"
            @click="navigateToChapter(nextChapter!.chapter_id)"
          >
            Ch. {{ nextChapter.chapter_number }} →
          </button>
        </div>
      </div>
    </main>

    <!-- Chapter picker bottom sheet -->
    <Transition name="sheet">
      <div v-if="showChapterPicker" class="sheet-backdrop" @click="showChapterPicker = false">
        <div class="bottom-sheet" @click.stop>
          <div class="sheet-handle"></div>
          <h3 class="sheet-title">Select Chapter</h3>
          <div class="chapter-list">
            <button
              v-for="ch in chapters"
              :key="ch.chapter_id"
              class="chapter-item"
              :class="{ selected: ch.chapter_id === selectedChapter?.chapter_id }"
              @click="navigateToChapter(ch.chapter_id); showChapterPicker = false"
            >
              {{ ch.chapter_number }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getBookById } from '@/api/books';
import { getChaptersByBookId } from '@/api/chapters';
import { getVersesByChapterId } from '@/api/verses';
import type { Book, Chapter } from '@/utils/collectionReferences';
import type { VerseWithLinks } from '@/api/verses';

const route = useRoute();
const router = useRouter();

const currentBook = ref<Book | null>(null);
const chapters = ref<Chapter[]>([]);
const selectedChapter = ref<Chapter | null>(null);
const verses = ref<VerseWithLinks[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const showChapterPicker = ref(false);
const versesEl = ref<HTMLElement | null>(null);

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
  verses.value = [];
  try {
    verses.value = await getVersesByChapterId(chapter.chapter_id);
  } catch {
    // verses stay empty
  }
  versesEl.value?.scrollTo({ top: 0 });
}

function navigateToChapter(id: number) {
  router.replace({ name: 'reading', params: { bookId: bookId.value, chapterId: id } });
}

onMounted(async () => {
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

    if (target) await loadVerses(target);
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load book';
  } finally {
    loading.value = false;
  }
});

watch(chapterId, async (id) => {
  if (!id) return;
  const ch = chapters.value.find(c => c.chapter_id === id);
  if (ch) await loadVerses(ch);
});
</script>

<style scoped>
.reading-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  overflow: hidden;
}

.reading-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.back-btn,
.search-btn {
  color: #1E40AF;
  padding: 6px;
  border-radius: 8px;
  flex-shrink: 0;
}

.nav-title-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 8px;
  background: #f3f4f6;
  color: #1a1a2e;
}

.nav-book-name {
  font-weight: 700;
  font-size: 15px;
}

.nav-chapter {
  font-size: 13px;
  color: #6b7280;
}

.state-overlay {
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

.error-text {
  color: #dc2626;
  font-size: 14px;
  padding: 20px;
  text-align: center;
}

.verses-scroll {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 16px 16px 24px;
}

.chapter-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 16px;
}

.verse-row {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  line-height: 1.7;
}

.verse-num {
  font-size: 11px;
  font-weight: 700;
  color: #9ca3af;
  min-width: 20px;
  padding-top: 4px;
  flex-shrink: 0;
}

.verse-text {
  font-size: 16px;
  color: #1a1a2e;
}

.empty-state {
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
  padding: 40px 20px;
}

.chapter-nav-row {
  display: flex;
  align-items: center;
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.spacer { flex: 1; }

.chapter-nav-btn {
  font-size: 14px;
  font-weight: 600;
  color: #1E40AF;
  padding: 10px 16px;
  border-radius: 8px;
  background: #E6F2FF;
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
  transition: background 0.1s;
}

.chapter-item.selected {
  background: #1E40AF;
  color: #fff;
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
