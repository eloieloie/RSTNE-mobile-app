<template>
  <div class="app-shell">
    <div class="view-area">
      <RouterView />
    </div>

    <nav class="bottom-nav">
      <RouterLink to="/" class="tab-item" :class="{ active: route.name === 'books' }">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
        <span>Books</span>
      </RouterLink>

      <RouterLink to="/search" class="tab-item" :class="{ active: route.name === 'search' }">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <span>Search</span>
      </RouterLink>

      <RouterLink
        v-if="lastReadingRoute"
        :to="lastReadingRoute"
        class="tab-item"
        :class="{ active: route.name === 'reading' }"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
        <span>Reading</span>
      </RouterLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { RouterView, RouterLink, useRoute } from 'vue-router';

const route = useRoute();
const lastReadingRoute = ref<string | null>(null);

watch(
  () => route.fullPath,
  (path) => {
    if (route.name === 'reading') {
      lastReadingRoute.value = path;
    }
  },
);
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: var(--safe-area-top);
}

.view-area {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.bottom-nav {
  display: flex;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  padding-bottom: var(--safe-area-bottom);
  height: calc(var(--nav-height) + var(--safe-area-bottom));
  flex-shrink: 0;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  text-decoration: none;
  color: #9ca3af;
  font-size: 11px;
  font-weight: 500;
  padding: 8px 0;
  transition: color 0.15s;
}

.tab-item.active {
  color: #1E40AF;
}

.tab-item svg {
  flex-shrink: 0;
}
</style>
