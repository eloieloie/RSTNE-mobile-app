<template>
  <div class="search-view">
    <header class="search-header">
      <div class="search-bar">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          ref="inputEl"
          v-model="query"
          type="search"
          placeholder="Search scriptures..."
          @keyup.enter="search"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
        />
        <button v-if="query" class="clear-btn" @click="clear">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <button class="search-go-btn" :disabled="!query.trim() || searching" @click="search">Search</button>
    </header>

    <div v-if="searching" class="state-container">
      <div class="spinner"></div>
    </div>

    <div v-else-if="searched && results.length === 0" class="state-container empty-text">
      No results for "{{ lastQuery }}"
    </div>

    <div v-else-if="results.length" class="results-scroll">
      <div class="results-count">{{ results.length }} result{{ results.length !== 1 ? 's' : '' }}</div>
      <div
        v-for="result in results"
        :key="result.verse_id"
        class="result-card"
        @click="openVerse(result)"
      >
        <div class="result-ref">{{ result.book_name }} {{ result.chapter_number }}:{{ result.verse_index }}</div>
        <div class="result-text" v-html="highlightedText(result.verse)"></div>
      </div>
    </div>

    <div v-else class="state-container hint-text">
      Search by words, phrases, or names
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { searchVersesByText } from '@/api/verses';
import type { VerseSearchResult } from '@/api/verses';

const router = useRouter();
const query = ref('');
const results = ref<VerseSearchResult[]>([]);
const searching = ref(false);
const searched = ref(false);
const lastQuery = ref('');

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightedText(text: string): string {
  if (!lastQuery.value) return text;
  const escaped = escapeRegex(lastQuery.value.trim());
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
}

async function search() {
  const q = query.value.trim();
  if (!q) return;
  searching.value = true;
  searched.value = false;
  lastQuery.value = q;
  try {
    results.value = await searchVersesByText(q);
  } catch {
    results.value = [];
  } finally {
    searching.value = false;
    searched.value = true;
  }
}

function clear() {
  query.value = '';
  results.value = [];
  searched.value = false;
}

function openVerse(result: VerseSearchResult) {
  router.push({ name: 'reading', params: { bookId: result.book_id, chapterId: result.chapter_id } });
}
</script>

<style scoped>
.search-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8f9fa;
  overflow: hidden;
}

.search-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 12px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f3f4f6;
  border-radius: 10px;
  padding: 8px 12px;
}

.search-icon {
  color: #9ca3af;
  flex-shrink: 0;
}

input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 15px;
  color: #1a1a2e;
  min-width: 0;
}

input::placeholder {
  color: #9ca3af;
}

.clear-btn {
  color: #9ca3af;
  flex-shrink: 0;
  padding: 2px;
}

.search-go-btn {
  font-size: 15px;
  font-weight: 600;
  color: #1E40AF;
  padding: 8px 4px;
  flex-shrink: 0;
}

.search-go-btn:disabled {
  color: #9ca3af;
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

.empty-text,
.hint-text {
  color: #9ca3af;
  font-size: 14px;
  padding: 20px;
  text-align: center;
}

.results-scroll {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 12px;
}

.results-count {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 10px;
  padding-left: 4px;
}

.result-card {
  background: #fff;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 8px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  -webkit-tap-highlight-color: transparent;
}

.result-card:active {
  opacity: 0.8;
}

.result-ref {
  font-size: 12px;
  font-weight: 700;
  color: #1E40AF;
  margin-bottom: 4px;
}

.result-text {
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
}

:deep(mark) {
  background: #fef08a;
  color: inherit;
  border-radius: 2px;
  padding: 0 1px;
}
</style>
