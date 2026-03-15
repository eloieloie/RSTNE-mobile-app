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
});
