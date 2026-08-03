<template>
  <div class="settings-view">
    <header class="settings-header">
      <h1 class="settings-title">Settings</h1>
    </header>

    <div class="settings-body">
      <!-- Account -->
      <section class="settings-section">
        <h2 class="section-title">Account</h2>
        <div class="settings-group">
          <div v-if="user" class="account-row">
            <div class="account-info">
              <span class="setting-name">{{ user.email }}</span>
              <span v-if="isAdmin" class="admin-badge">Admin</span>
            </div>
            <motion.button class="account-action-btn" :while-tap="tapScale" @click="() => { tap(); handleSignOut(); }">Sign Out</motion.button>
          </div>
          <motion.button v-else class="settings-row-btn" :while-tap="tapScale" @click="() => { tap(); router.push('/login'); }">
            <div class="row-btn-label">
              <span class="setting-name">Sign In / Register</span>
              <span class="setting-desc">Optional — keep personal notes across devices</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </motion.button>
        </div>
      </section>

      <!-- Book Names Language -->
      <section class="settings-section">
        <h2 class="section-title">Book Names Language</h2>
        <div class="settings-group">
          <div class="lang-options">
            <motion.button
              v-for="opt in langOptions"
              :key="opt.value"
              :class="['lang-option-btn', { active: bookNameLanguage === opt.value }]"
              :while-tap="tapScale"
              @click="bookNameLanguage = opt.value"
            >{{ opt.label }}</motion.button>
          </div>
        </div>
      </section>

      <!-- Display Options -->
      <section class="settings-section">
        <h2 class="section-title">Display Options</h2>
        <div class="settings-group">
          <label class="setting-item">
            <div class="setting-label">
              <span class="setting-name">Show English Verse</span>
              <span class="setting-desc">Display the English verse text while reading</span>
            </div>
            <motion.button
              class="toggle-switch"
              :class="{ active: settings.showEnglish }"
              :while-tap="tapScale"
              @click="() => { tap(); settings.showEnglish = !settings.showEnglish; }"
            >
              <span class="toggle-slider"></span>
            </motion.button>
          </label>

          <label class="setting-item">
            <div class="setting-label">
              <span class="setting-name">Show Telugu Verse</span>
              <span class="setting-desc">Display Telugu translation below each verse</span>
            </div>
            <motion.button
              class="toggle-switch"
              :class="{ active: settings.showTelugu }"
              :while-tap="tapScale"
              @click="() => { tap(); settings.showTelugu = !settings.showTelugu; }"
            >
              <span class="toggle-slider"></span>
            </motion.button>
          </label>

          <label class="setting-item">
            <div class="setting-label">
              <span class="setting-name">Show Admin Notes</span>
              <span class="setting-desc">Display study notes added by RSTNE admins</span>
            </div>
            <motion.button
              class="toggle-switch"
              :class="{ active: settings.showAdminNotes }"
              :while-tap="tapScale"
              @click="() => { tap(); settings.showAdminNotes = !settings.showAdminNotes; }"
            >
              <span class="toggle-slider"></span>
            </motion.button>
          </label>

          <label class="setting-item">
            <div class="setting-label">
              <span class="setting-name">Show My Notes</span>
              <span class="setting-desc">Display your own personal notes on verses</span>
            </div>
            <motion.button
              class="toggle-switch"
              :class="{ active: settings.showMyNotes }"
              :while-tap="tapScale"
              @click="() => { tap(); settings.showMyNotes = !settings.showMyNotes; }"
            >
              <span class="toggle-slider"></span>
            </motion.button>
          </label>

          <label class="setting-item">
            <div class="setting-label">
              <span class="setting-name">Show Cross References</span>
              <span class="setting-desc">Display linked verses below each verse</span>
            </div>
            <motion.button
              class="toggle-switch"
              :class="{ active: settings.showCrossReferences }"
              :while-tap="tapScale"
              @click="() => { tap(); settings.showCrossReferences = !settings.showCrossReferences; }"
            >
              <span class="toggle-slider"></span>
            </motion.button>
          </label>
          <label class="setting-item">
            <div class="setting-label">
              <span class="setting-name">Keep Screen On</span>
              <span class="setting-desc">Prevent the screen from sleeping while reading</span>
            </div>
            <motion.button
              class="toggle-switch"
              :class="{ active: settings.keepScreenOn }"
              :while-tap="tapScale"
              @click="() => { tap(); settings.keepScreenOn = !settings.keepScreenOn; }"
            >
              <span class="toggle-slider"></span>
            </motion.button>
          </label>
        </div>
      </section>

      <!-- Font Size -->
      <section class="settings-section">
        <h2 class="section-title">Font Size</h2>
        <div class="settings-group">
          <div class="font-size-row">
            <span class="font-preview" :style="{ fontSize: settings.fontSize + 'px' }">Aa</span>
            <div class="font-controls">
              <motion.button
                class="font-btn"
                :while-tap="tapScale"
                :disabled="settings.fontSize <= 12"
                @click="() => { tap(); settings.fontSize -= 1; }"
              >A−</motion.button>
              <span class="font-size-label">{{ settings.fontSize }}px</span>
              <motion.button
                class="font-btn"
                :while-tap="tapScale"
                :disabled="settings.fontSize >= 26"
                @click="() => { tap(); settings.fontSize += 1; }"
              >A+</motion.button>
            </div>
          </div>
        </div>
      </section>

      <!-- Support -->
      <section class="settings-section">
        <h2 class="section-title">Support</h2>
        <div class="settings-group">
          <motion.button class="settings-row-btn" :while-tap="tapScale" @click="() => { tap(); showFeedback = true; }">
            <div class="row-btn-label">
              <span class="setting-name">Send Feedback</span>
              <span class="setting-desc">Report bugs or suggest features</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </motion.button>
          <motion.button class="settings-row-btn" :while-tap="tapScale" @click="() => { tap(); requestReview(); }">
            <div class="row-btn-label">
              <span class="setting-name">Rate this App</span>
              <span class="setting-desc">Enjoying RSTNE? Leave a review</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </motion.button>
        </div>
      </section>

      <!-- Legal -->
      <section class="settings-section">
        <h2 class="section-title">Legal</h2>
        <div class="settings-group">
          <motion.button class="settings-row-btn" :while-tap="tapScale" @click="openPrivacyPolicy">
            <div class="row-btn-label">
              <span class="setting-name">Privacy Policy</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </motion.button>
          <motion.button class="settings-row-btn" :while-tap="tapScale" @click="openTerms">
            <div class="row-btn-label">
              <span class="setting-name">Terms &amp; Conditions</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </motion.button>
        </div>
      </section>

      <p class="app-version">Version {{ APP_VERSION }}</p>
    </div>

    <!-- Feedback bottom sheet -->
    <AnimatePresence>
      <motion.div
        v-if="showFeedback"
        class="sheet-backdrop"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="overlayFade"
        @click.self="closeFeedback"
      >
        <motion.div
          class="bottom-sheet"
          :initial="prefersReducedMotion ? false : { y: '100%' }"
          :animate="{ y: 0 }"
          :exit="{ y: '100%' }"
          :transition="sheetSpring"
          @click.stop
        >
          <div class="sheet-handle"></div>
          <h3 class="sheet-title">Send Feedback</h3>

          <div v-if="feedbackSuccess" class="feedback-success-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <p>Thank you for your feedback!</p>
          </div>

          <div v-else class="feedback-form">
            <select v-model="feedbackCategory" class="feedback-select">
              <option value="general">General Feedback</option>
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
            </select>
            <textarea
              v-model="feedbackMessage"
              class="feedback-textarea"
              placeholder="Tell us what you think, report a bug, or suggest a feature..."
              rows="5"
            ></textarea>
            <input
              v-model="feedbackEmail"
              type="email"
              class="feedback-email-input"
              placeholder="Your email (optional, for follow-up)"
            />
            <p v-if="feedbackError" class="feedback-error">{{ feedbackError }}</p>
            <motion.button
              class="feedback-submit-btn"
              :while-tap="tapScale"
              :disabled="feedbackSubmitting || !feedbackMessage.trim()"
              @click="doSubmitFeedback"
            >
              {{ feedbackSubmitting ? 'Sending...' : 'Send Feedback' }}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { motion, AnimatePresence } from 'motion-v';
import { useSettings } from '@/composables/useSettings';
import { useBookLanguage, type BookNameLanguage } from '@/composables/useBookLanguage';
import { useAuth } from '@/composables/useAuth';
import { useMotionPresets } from '@/composables/useMotionPresets';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { InAppReview } from '@capacitor-community/in-app-review';
import { submitFeedback } from '@/api/feedback';

const { prefersReducedMotion, sheetSpring, tapScale, overlayFade } = useMotionPresets();

const APP_VERSION = '14.1.0';

const router = useRouter();
const settings = useSettings();
const { bookNameLanguage } = useBookLanguage();
const { user, isAdmin, signOutUser } = useAuth();

async function handleSignOut() {
  await signOutUser();
}

const langOptions: { value: BookNameLanguage; label: string }[] = [
  { value: 'english', label: 'English' },
  { value: 'hebrew', label: 'Hebrew' },
  { value: 'telugu', label: 'Telugu' },
];

// Haptic feedback
async function tap() {
  if (Capacitor.isNativePlatform()) {
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch {}
  }
}

// Open URLs in system browser
function openPrivacyPolicy() {
  window.open('https://eat-rstne-26.web.app/privacy-policy', '_system');
}

function openTerms() {
  window.open('https://eat-rstne-26.web.app/terms-and-conditions', '_system');
}

// Native app review
async function requestReview() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await InAppReview.requestReview();
  } catch {}
}

// Feedback sheet
const showFeedback = ref(false);
const feedbackCategory = ref<'general' | 'bug' | 'feature'>('general');
const feedbackMessage = ref('');
const feedbackEmail = ref('');
const feedbackSubmitting = ref(false);
const feedbackError = ref('');
const feedbackSuccess = ref(false);

function closeFeedback() {
  showFeedback.value = false;
  feedbackSuccess.value = false;
  feedbackError.value = '';
}

async function doSubmitFeedback() {
  if (!feedbackMessage.value.trim()) return;
  feedbackSubmitting.value = true;
  feedbackError.value = '';
  try {
    let platform = 'web';
    let app_version = APP_VERSION;
    if (Capacitor.isNativePlatform()) {
      platform = Capacitor.getPlatform();
      try { const info = await CapApp.getInfo(); app_version = info.version; } catch {}
    }
    await submitFeedback({
      message: feedbackMessage.value.trim(),
      email: feedbackEmail.value.trim() || undefined,
      category: feedbackCategory.value,
      app_version,
      platform,
    });
    feedbackSuccess.value = true;
    feedbackMessage.value = '';
    feedbackEmail.value = '';
    setTimeout(() => { showFeedback.value = false; feedbackSuccess.value = false; }, 2500);
  } catch {
    feedbackError.value = 'Failed to send. Please try again.';
  } finally {
    feedbackSubmitting.value = false;
  }
}
</script>

<style scoped>
.settings-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: #f3f4f6;
  overflow: hidden;
}

.settings-header {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 20px;
  flex-shrink: 0;
}

.settings-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.settings-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-section {
  flex-shrink: 0;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 14px 16px 8px;
  margin: 0;
}

.settings-group {
  padding: 0 16px 8px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.setting-name {
  font-size: 16px;
  color: #1a1a2e;
  font-weight: 500;
}

.setting-desc {
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.4;
}

/* Account */
.account-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 0;
}

.account-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.account-info .setting-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-badge {
  align-self: flex-start;
  background: #1E40AF;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 999px;
}

.account-action-btn {
  min-height: 44px;
  padding: 8px 16px;
  border-radius: 10px;
  border: 1.5px solid #d1d5db;
  background: #f3f4f6;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;
}

/* Toggle switch */
.toggle-switch {
  position: relative;
  width: 50px;
  height: 28px;
  background: #d1d5db;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  transition: background 0.25s;
  padding: 0;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}

.toggle-switch.active {
  background: #1E40AF;
}

.toggle-slider {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  background: #fff;
  border-radius: 50%;
  transition: left 0.25s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
}

.toggle-switch.active .toggle-slider {
  left: 25px;
}

/* Font size */
.font-size-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
}

.font-preview {
  color: #1a1a2e;
  font-weight: 600;
  transition: font-size 0.2s;
  min-width: 48px;
}

.font-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.font-btn {
  background: #1E40AF;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  min-width: 52px;
  min-height: 44px;
  -webkit-tap-highlight-color: transparent;
}

.font-btn:disabled {
  background: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
}

.font-size-label {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  min-width: 44px;
  text-align: center;
}

.lang-options {
  display: flex;
  gap: 8px;
  padding: 10px 0 6px;
}

.lang-option-btn {
  flex: 1;
  padding: 10px 8px;
  border-radius: 10px;
  border: 1.5px solid #d1d5db;
  background: #f3f4f6;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: #6b7280;
  min-height: 44px;
  -webkit-tap-highlight-color: transparent;
}

.lang-option-btn:active {
  opacity: 0.7;
}

.lang-option-btn.active {
  background: #1E40AF;
  border-color: #1E40AF;
  color: #fff;
}

.app-version {
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
  padding-bottom: 8px;
}

/* Row-style setting button (Legal, Support items) */
.settings-row-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid #f3f4f6;
  background: none;
  border-left: none;
  border-right: none;
  border-top: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  text-align: left;
}

.settings-row-btn:last-child {
  border-bottom: none;
}

.settings-row-btn:active {
  opacity: 0.6;
}

.row-btn-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* Bottom sheet */
.sheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}

.bottom-sheet {
  background: #fff;
  border-radius: 20px 20px 0 0;
  width: 100%;
  padding: 12px 20px calc(20px + var(--safe-area-bottom));
  max-height: 85vh;
  overflow-y: auto;
}

.sheet-handle {
  width: 36px;
  height: 4px;
  background: #d1d5db;
  border-radius: 2px;
  margin: 0 auto 16px;
}

.sheet-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16px;
}

/* Feedback form */
.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feedback-select {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1.5px solid #d1d5db;
  font-size: 15px;
  font-family: inherit;
  background: #f9fafb;
  color: #111827;
  appearance: auto;
}

.feedback-textarea {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1.5px solid #d1d5db;
  font-size: 15px;
  font-family: inherit;
  background: #f9fafb;
  color: #111827;
  resize: none;
  line-height: 1.5;
}

.feedback-textarea:focus,
.feedback-email-input:focus,
.feedback-select:focus {
  outline: none;
  border-color: #1E40AF;
}

.feedback-email-input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1.5px solid #d1d5db;
  font-size: 15px;
  font-family: inherit;
  background: #f9fafb;
  color: #111827;
}

.feedback-error {
  font-size: 13px;
  color: #dc2626;
  margin: 0;
}

.feedback-submit-btn {
  background: #1E40AF;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 15px;
  font-size: 16px;
  font-weight: 600;
  width: 100%;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  font-family: inherit;
}

.feedback-submit-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.feedback-success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 0;
  text-align: center;
  color: #16a34a;
  font-size: 16px;
  font-weight: 500;
}

</style>
