import { reactive } from 'vue';
import type { VerseSearchResult } from '@/api/verses';

// Module-level singleton — persists across SearchView unmount/remount (tab switches)
export const searchState = reactive({
  query: '',
  results: [] as VerseSearchResult[],
  searching: false,
  searched: false,
  lastQuery: '',
  error: '',
  // Search navigation bar state (active when reading a search result)
  navResults: [] as VerseSearchResult[],
  navCurrentIndex: -1,
});
