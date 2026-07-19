<template>
  <div class="app-shell">
    <!-- Offline banner -->
    <div v-if="!isOnline" class="offline-banner">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="1" y1="1" x2="23" y2="23"/>
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
        <path d="M10.71 5.05A16 16 0 0 1 22.56 9"/>
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
        <line x1="12" y1="20" x2="12.01" y2="20"/>
      </svg>
      No internet connection
    </div>

    <div class="view-area">
      <RouterView />
    </div>

    <!-- Update required modal -->
    <div v-if="showUpdateModal" class="update-overlay">
      <div class="update-modal">
        <div class="update-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <h2>Update Required</h2>
        <p>A newer version of RSTNE is required to continue. Please update the app to access the latest content.</p>
        <p class="version-info">Your version: <strong>{{ APP_VERSION }}</strong></p>
        <a
          href="https://play.google.com/store/apps/details?id=com.rstne.app"
          target="_blank"
          rel="noopener"
          class="update-btn"
        >Update on Play Store</a>
      </div>
    </div>

    <!-- Connection issue modal: API unreachable while internet is up -->
    <div v-if="showConnectionIssueModal" class="update-overlay" @click.self="showConnectionIssueModal = false">
      <div class="update-modal">
        <div class="update-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2>Unable to Connect</h2>
        <p>RSTNE couldn't reach the server, but your internet connection looks fine. Please make sure you're on the latest version of the app.</p>
        <a
          href="https://play.google.com/store/apps/details?id=com.rstne.app"
          target="_blank"
          rel="noopener"
          class="update-btn"
        >Check for Update</a>
        <button class="dismiss-btn" @click="showConnectionIssueModal = false">Dismiss</button>
      </div>
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
        v-if="settings.lastReadingRoute"
        :to="settings.lastReadingRoute!"
        class="tab-item"
        :class="{ active: route.name === 'reading' }"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
        <span>Reading</span>
      </RouterLink>

      <RouterLink to="/settings" class="tab-item" :class="{ active: route.name === 'settings' }">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        <span>Settings</span>
      </RouterLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { RouterView, RouterLink, useRoute, useRouter } from 'vue-router';
import { getAppVersion, compareSemver } from '@/api/appVersion';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { initPushNotifications } from '@/composables/usePushNotifications';
import { useSettings } from '@/composables/useSettings';

const APP_VERSION = '14.1.0';

const route = useRoute();
const router = useRouter();
const settings = useSettings();
const showUpdateModal = ref(false);
const showConnectionIssueModal = ref(false);
const isOnline = ref(navigator.onLine);

function updateOnlineStatus() {
  isOnline.value = navigator.onLine;
}

watch(
  () => route.fullPath,
  (path) => {
    if (route.name === 'reading') {
      settings.lastReadingRoute = path;
    }
  },
);

onMounted(async () => {
  try {
    const { min_version } = await getAppVersion();
    if (compareSemver(APP_VERSION, min_version) < 0) {
      showUpdateModal.value = true;
    }
  } catch {
    // API unreachable. If the device does have internet, the endpoint itself
    // is likely the problem — most likely fixed by updating the app.
    if (navigator.onLine) {
      showConnectionIssueModal.value = true;
    }
  }

  if (Capacitor.isNativePlatform()) {
    initPushNotifications(router);
    // Style.Light = dark icons, suitable for this app's light background
    StatusBar.setStyle({ style: Style.Light });
    // setBackgroundColor is Android-only; ignored/no-op on iOS
    if (Capacitor.getPlatform() === 'android') {
      StatusBar.setBackgroundColor({ color: '#ffffff' });
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
});

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
});
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: var(--safe-area-top);
}

.offline-banner {
  background: #dc2626;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  padding: 6px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-shrink: 0;
  letter-spacing: 0.01em;
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

.update-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 24px;
}

.update-modal {
  background: #fff;
  border-radius: 16px;
  padding: 32px 24px;
  max-width: 320px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.update-icon {
  color: #1E40AF;
  margin-bottom: 4px;
}

.update-modal h2 {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.update-modal p {
  font-size: 15px;
  color: #4b5563;
  margin: 0;
  line-height: 1.5;
}

.update-modal .version-info {
  font-size: 13px;
  color: #9ca3af;
}

.update-btn {
  display: inline-block;
  margin-top: 4px;
  background: #1E40AF;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  padding: 14px 24px;
  border-radius: 10px;
  width: 100%;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.dismiss-btn {
  display: inline-block;
  background: transparent;
  border: none;
  color: #6b7280;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 24px;
  -webkit-tap-highlight-color: transparent;
}
</style>
