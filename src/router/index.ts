import { createRouter, createWebHashHistory } from 'vue-router';
import BooksView from '@/views/BooksView.vue';
import ReadingView from '@/views/ReadingView.vue';
import SearchView from '@/views/SearchView.vue';
import SettingsView from '@/views/SettingsView.vue';
import WeeklyReadingView from '@/views/WeeklyReadingView.vue';
import FeastsView from '@/views/FeastsView.vue';

const router = createRouter({
  // Hash history works better in Capacitor (no server-side routing needed)
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'books',
      component: BooksView,
    },
    {
      path: '/reading/:bookId/:chapterId?',
      name: 'reading',
      component: ReadingView,
    },
    {
      path: '/search',
      name: 'search',
      component: SearchView,
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
    },
    {
      path: '/weekly-reading',
      name: 'weekly-reading',
      component: WeeklyReadingView,
    },
    {
      path: '/feasts',
      name: 'feasts',
      component: FeastsView,
    },
  ],
});

export default router;
