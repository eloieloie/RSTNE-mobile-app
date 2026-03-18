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

    <!-- Verses — always keep mounted once loaded so versesEl ref stays valid during scrollPending -->
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
          :class="{ highlighted: String(verse.verse_index) === highlightedVerseIndex }"
          :data-verse-index="verse.verse_index"
          @click="selectVerse(verse.verse_id)"
        >
          <div class="verse-body">
            <!-- English on: num + english inline, telugu as block below -->
            <template v-if="settings.showEnglish">
              <span class="verse-num">{{ verse.verse_index }}</span><span class="verse-text" :style="{ fontSize: settings.fontSize + 'px' }" v-html="formatVerseWithPaleoBora(verse.verse, bookAbbreviations)"></span>
              <span
                v-if="settings.showTelugu && verse.telugu_verse"
                class="verse-telugu"
                :style="{ fontSize: settings.fontSize + 'px' }"
                v-html="formatVerseWithPaleoBora(verse.telugu_verse, bookAbbreviations)"
              ></span>
            </template>
            <!-- English off: num immediately adjacent to telugu (no comment nodes between) -->
            <template v-else>
              <span v-if="settings.showTelugu && verse.telugu_verse" class="verse-telugu" :style="{ fontSize: settings.fontSize + 'px' }"><span class="verse-num">{{ verse.verse_index }}</span><span v-html="formatVerseWithPaleoBora(verse.telugu_verse, bookAbbreviations)"></span></span>
              <span v-else class="verse-num">{{ verse.verse_index }}</span>
            </template>

            <div
              v-if="settings.showNotes && verse.notes && verse.notes.length > 0"
              class="verse-notes"
            >
              <div
                v-for="note in verse.notes"
                :key="note.verse_note_id"
                class="note-item"
              >
                <div v-if="note.note_title" class="note-title" v-html="formatVerseWithPaleoBora(note.note_title, bookAbbreviations)"></div>
                <div class="note-content" v-html="formatVerseWithPaleoBora(note.note_content, bookAbbreviations)"></div>
              </div>
            </div>

            <div
              v-if="settings.showCrossReferences && verse.crossReferences && verse.crossReferences.length > 0"
              class="cross-refs"
            >
              <button
                v-for="ref in (expandedCrossRefs.has(verse.verse_id) ? verse.crossReferences : verse.crossReferences.slice(0, 3))"
                :key="ref.cross_ref_id"
                class="cross-ref-chip"
                @click="openCrossRef(ref)"
              >
                {{ ref.to_book_abbr || ref.to_book_name }} {{ ref.to_chapter }}:{{ ref.to_verse }}
              </button>
              <button
                v-if="!expandedCrossRefs.has(verse.verse_id) && verse.crossReferences.length > 3"
                class="cross-ref-chip cross-ref-more"
                @click="expandedCrossRefs = new Set(expandedCrossRefs).add(verse.verse_id)"
              >
                +{{ verse.crossReferences.length - 3 }} more
              </button>
            </div>

            <!-- Share action bar (visible when verse is selected) -->
            <div v-if="selectedVerseId === verse.verse_id" class="verse-actions" @click.stop>
              <div class="verse-actions-bar">
                <button class="verse-action-btn" @click.stop="shareVerse(verse)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                  Share
                </button>
                <span v-if="copiedVerseId === verse.verse_id" class="copied-feedback">Copied!</span>
              </div>
            </div>
          </div>
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

    <!-- Scroll-pending overlay: sits on top of already-rendered content so versesEl ref stays valid -->
    <div v-if="scrollPending" class="scroll-pending-overlay">
      <div class="spinner"></div>
    </div>

    <!-- Cross-reference preview bottom sheet -->
    <Transition name="sheet">
      <div v-if="crossRefSheet.show" class="sheet-backdrop" @click="crossRefSheet.show = false">
        <div class="bottom-sheet cross-ref-sheet" @click.stop>
          <div class="sheet-handle"></div>
          <div class="sheet-header-row">
            <h3 class="sheet-title">{{ crossRefSheet.title }}</h3>
            <button class="sheet-go-btn" @click="goToCrossRef" title="Go to chapter">↗</button>
          </div>
          <div class="cross-ref-body">
            <div v-if="crossRefSheet.loading" class="cross-ref-loading">
              <div class="spinner"></div>
            </div>
            <div v-else>
              <p v-if="!crossRefSheet.verseText" class="cross-ref-empty">Verse not found.</p>
              <p v-else class="cross-ref-verse" :style="{ fontSize: settings.fontSize + 'px' }" v-html="formatVerseWithPaleoBora(crossRefSheet.verseText, bookAbbreviations)"></p>
              <p v-if="crossRefSheet.teluguVerseText && settings.showTelugu" class="cross-ref-verse cross-ref-telugu" :style="{ fontSize: settings.fontSize + 'px' }" v-html="formatVerseWithPaleoBora(crossRefSheet.teluguVerseText, bookAbbreviations)"></p>
            </div>
          </div>
        </div>
      </div>
    </Transition>

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
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getBookById, getAllBooks } from '@/api/books';
import { getChaptersByBookId } from '@/api/chapters';
import { getVersesByChapterId } from '@/api/verses';
import type { Book, Chapter } from '@/utils/collectionReferences';
import type { VerseWithLinks } from '@/api/verses';
import { getCrossReferences } from '@/api/crossReferences';
import type { CrossReferenceData } from '@/api/crossReferences';
import { useSettings } from '@/composables/useSettings';
import { formatVerseWithPaleoBora } from '@/utils/formatVerse';
import { generateVerseCardImage, stripHtmlKeepPaleo } from '@/utils/paleoBora';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

const route = useRoute();
const router = useRouter();
const settings = useSettings();

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
const versesEl = ref<HTMLElement | null>(null);

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

const selectedVerseId = ref<number | null>(null);
const copiedVerseId = ref<number | null>(null);

const pendingScrollToVerse = ref<string | null>(null);
const highlightedVerseIndex = ref<string | null>(null);
const scrollPending = ref(false);
const expandedCrossRefs = ref(new Set<number>());
const bookAbbreviations = ref<Record<string, number>>({});

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

function openCrossRef(crossRef: CrossReferenceData) {
  if (!crossRef.to_book_id) return;
  openVersePreview(
    crossRef.to_book_id,
    crossRef.to_book_name,
    String(crossRef.to_chapter),
    String(crossRef.to_verse),
    crossRef.target_chapter_id,
  );
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

async function loadVerses(chapter: Chapter, deferCrossRefs = false) {
  selectedChapter.value = chapter;
  selectedVerseId.value = null;
  verses.value = [];
  try {
    verses.value = await getVersesByChapterId(chapter.chapter_id);
  } catch {
    // verses stay empty
  }
  versesEl.value?.scrollTo({ top: 0 });
  if (!deferCrossRefs) loadCrossReferences(chapter);
}

async function applyPendingScroll(chapter?: Chapter) {
  console.log('[applyPendingScroll] called, pendingScrollToVerse:', pendingScrollToVerse.value, 'chapter:', chapter?.chapter_id);
  if (!pendingScrollToVerse.value) {
    console.log('[applyPendingScroll] no pending verse — skipping scroll');
    if (chapter) loadCrossReferences(chapter);
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
    if (chapter) loadCrossReferences(chapter);
  }
}

async function loadCrossReferences(chapter: Chapter) {
  if (!currentBook.value) return;
  const bookId = currentBook.value.book_id;
  const chapterNum = chapter.chapter_number;
  const snapshot = verses.value;
  await Promise.all(
    snapshot.map(async (verse, i) => {
      if (!verse.verse_index) return;
      try {
        const refs = await getCrossReferences(bookId, chapterNum, String(verse.verse_index));
        // Mutate reactively only if still on the same chapter
        if (verses.value === snapshot) {
          verses.value[i] = { ...verses.value[i], crossReferences: refs };
        }
      } catch {
        // skip failed verse
      }
    }),
  );
}

function navigateToChapter(id: number) {
  router.replace({ name: 'reading', params: { bookId: bookId.value, chapterId: id } });
}

function selectVerse(verseId: number) {
  selectedVerseId.value = selectedVerseId.value === verseId ? null : verseId;
}

async function shareVerse(verse: VerseWithLinks) {
  if (!selectedChapter.value || !currentBook.value) return;
  const reference = `${currentBook.value.book_name} ${selectedChapter.value.chapter_number}:${verse.verse_index}`;
  const bookSlug = currentBook.value.book_name.toLowerCase().replace(/\s+/g, '-');
  const verseUrl = `https://eat-rstne-26.web.app/${bookSlug}/${selectedChapter.value.chapter_number}/${verse.verse_index}`;
  selectedVerseId.value = null;
  try {
    const cardFile = await generateVerseCardImage({
      reference,
      englishText: verse.verse ? stripHtmlKeepPaleo(verse.verse) : undefined,
      teluguText: settings.showTelugu && verse.telugu_verse ? stripHtmlKeepPaleo(verse.telugu_verse) : undefined,
      verseNotes: settings.showNotes && verse.notes?.length ? verse.notes : undefined,
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

onMounted(async () => {
  if (settings.keepScreenOn) acquireWakeLock();
  document.addEventListener('visibilitychange', onVisibilityChange);
  document.addEventListener('click', handleInlineVerseClick);

  // Build book abbreviation map in background (cached, won't block)
  getAllBooks().then(books => {
    const map: Record<string, number> = {};
    books.forEach(b => { if (b.book_abbr) map[b.book_abbr.toLowerCase()] = b.book_id; });
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
      await loadVerses(target, !!verseParam);
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
        await loadVerses(target, !!(verseParam || pendingScrollToVerse.value));
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
      await loadVerses(ch, !!(verseParam || pendingScrollToVerse.value));
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

.scroll-pending-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.75);
  z-index: 10;
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
  display: block;
  margin-bottom: 14px;
  border-radius: 8px;
  padding: 4px 6px;
  margin-left: -6px;
  transition: background 0.4s ease;
}

.verse-row.highlighted {
  background: #FEF9C3;
  transition: background 0s;
}

.verse-num {
  display: inline;
  font-size: 0.75em;
  font-weight: 700;
  color: #9ca3af;
  margin-right: 4px;
}

.verse-body {
  display: block;
}

.verse-text {
  display: inline;
  color: #1a1a2e;
  line-height: 1.75;
}

:deep(.verse-text p),
:deep(.verse-telugu p) {
  display: inline;
  margin: 0;
  padding: 0;
}

.verse-telugu {
  display: block;
  color: #1a1a2e;
  line-height: 1.75;
  margin-top: 4px;
}

/* Notes */
.verse-notes {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.note-item {
  background: #fefce8;
  border-left: 3px solid #fbbf24;
  border-radius: 0 6px 6px 0;
  padding: 6px 10px;
}

.note-title {
  font-size: 12px;
  font-weight: 700;
  color: #92400e;
  margin-bottom: 2px;
}

.note-content {
  font-size: 13px;
  color: #78350f;
  line-height: 1.6;
}

/* Cross references */
.cross-refs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.cross-refs-label {
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.verse-text :deep(.inline-verse-ref),
.verse-telugu :deep(.inline-verse-ref),
.note-content :deep(.inline-verse-ref),
.cross-ref-verse :deep(.inline-verse-ref) {
  color: #1E40AF;
  text-decoration: underline;
  text-decoration-style: dotted;
  -webkit-tap-highlight-color: transparent;
  font-size: 0.72em;
  vertical-align: super;
  line-height: 0;
}

.cross-ref-chip {
  font-size: 12px;
  color: #1E40AF;
  background: #E6F2FF;
  border-radius: 20px;
  padding: 3px 10px;
  font-weight: 500;
  -webkit-tap-highlight-color: transparent;
}

.cross-ref-more {
  color: #6b7280;
  background: #f3f4f6;
}

/* Cross-ref preview sheet */
.cross-ref-sheet {
  max-height: 60vh;
}

.sheet-header-row {
  display: flex;
  align-items: center;
  padding: 4px 16px 12px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.sheet-header-row .sheet-title {
  flex: 1;
  text-align: left;
  padding: 0;
  border-bottom: none;
  font-size: 15px;
}

.sheet-go-btn {
  font-size: 18px;
  color: #1E40AF;
  padding: 4px 8px;
  -webkit-tap-highlight-color: transparent;
}

.cross-ref-body {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 16px;
}

.cross-ref-loading {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.cross-ref-verse {
  color: #1a1a2e;
  line-height: 1.75;
  margin: 0;
}

.cross-ref-telugu {
  margin-top: 8px;
}

.cross-ref-empty {
  color: #9ca3af;
  font-size: 14px;
  text-align: center;
  margin: 0;
}

.empty-state {
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
  padding: 40px 20px;
}

/* Verse share action bar */
.verse-actions {
  margin-top: 8px;
}

.verse-actions-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.verse-action-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 600;
  color: #1E40AF;
  padding: 6px 14px;
  border-radius: 20px;
  background: #E6F2FF;
  -webkit-tap-highlight-color: transparent;
  min-height: 44px;
}

.copied-feedback {
  font-size: 12px;
  color: #16a34a;
  font-weight: 500;
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
