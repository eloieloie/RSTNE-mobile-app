<template>
  <div class="books-view">
    <header class="page-header">
      <h1>RSTNE</h1>
      <p>Restoration Scriptures True Name Edition</p>
    </header>

    <div v-if="loading" class="state-container">
      <div class="spinner"></div>
    </div>

    <div v-else-if="error" class="state-container error-text">{{ error }}</div>

    <div v-else class="books-scroll">
      <section v-if="firstCovenantBooks.length" class="category-section">
        <h2 class="category-heading first-covenant">First Covenant</h2>
        <div class="books-grid">
          <button
            v-for="book in firstCovenantBooks"
            :key="book.book_id"
            class="book-card first-covenant-card"
            @click="openBook(book.book_id)"
          >
            <span class="book-name">{{ book.book_name }}</span>
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
            @click="openBook(book.book_id)"
          >
            <span class="book-name">{{ book.book_name }}</span>
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
            @click="openBook(book.book_id)"
          >
            <span class="book-name">{{ book.book_name }}</span>
            <span class="chapter-count">{{ book.chapter_count ?? 0 }} ch.</span>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAllBooks } from '@/api/books';
import type { Book } from '@/utils/collectionReferences';

const router = useRouter();
const books = ref<Book[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const sorted = computed(() =>
  [...books.value].sort((a, b) => (a.book_index ?? 9999) - (b.book_index ?? 9999)),
);
const firstCovenantBooks = computed(() => sorted.value.filter(b => b.category_id === 1));
const newCovenantBooks = computed(() => sorted.value.filter(b => b.category_id === 2));
const apocryphalBooks = computed(() => sorted.value.filter(b => b.category_id === 3));

function openBook(bookId: number) {
  router.push({ name: 'reading', params: { bookId } });
}

onMounted(async () => {
  try {
    books.value = await getAllBooks();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load books';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.books-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.page-header {
  padding: 16px 16px 8px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.page-header h1 {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
}

.page-header p {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
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

.error-text {
  color: #dc2626;
  font-size: 14px;
  padding: 16px;
  text-align: center;
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
</style>
